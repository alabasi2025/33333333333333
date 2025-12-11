import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StockTransaction } from './stock-transaction.entity';
import { StockTransactionItem } from './stock-transaction-item.entity';
import { StockBalance } from './stock-balance.entity';
import { CreateStockTransactionDto } from './dto/create-stock-transaction.dto';
import { JournalEntry } from '../journal-entries/journal-entry.entity';
import { JournalEntryLine } from '../journal-entries/journal-entry-line.entity';
import { WarehouseGroup } from './warehouse-group.entity';

@Injectable()
export class StockTransactionsService {
  constructor(
    @InjectRepository(StockTransaction)
    private stockTransactionRepository: Repository<StockTransaction>,
    @InjectRepository(StockTransactionItem)
    private stockTransactionItemRepository: Repository<StockTransactionItem>,
    @InjectRepository(StockBalance)
    private stockBalanceRepository: Repository<StockBalance>,
    @InjectRepository(JournalEntry)
    private journalEntryRepository: Repository<JournalEntry>,
    @InjectRepository(JournalEntryLine)
    private journalEntryLineRepository: Repository<JournalEntryLine>,
    @InjectRepository(WarehouseGroup)
    private warehouseGroupRepository: Repository<WarehouseGroup>,
  ) {}

  async findAll(type?: 'in' | 'out'): Promise<StockTransaction[]> {
    const query = this.stockTransactionRepository.createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.warehouse', 'warehouse')
      .leftJoinAndSelect('transaction.items', 'items')
      .leftJoinAndSelect('items.item', 'item')
      .leftJoinAndSelect('transaction.supplier', 'supplier')
      .leftJoinAndSelect('transaction.paymentAccount', 'paymentAccount')
      .orderBy('transaction.transactionDate', 'DESC');

    if (type) {
      query.where('transaction.transactionType = :type', { type });
    }

    return query.getMany();
  }

  async findOne(id: number): Promise<StockTransaction> {
    const transaction = await this.stockTransactionRepository.findOne({
      where: { id },
      relations: ['warehouse', 'items', 'items.item', 'supplier', 'paymentAccount'],
    });

    if (!transaction) {
      throw new NotFoundException(`Stock transaction with ID ${id} not found`);
    }

    return transaction;
  }

  async create(createDto: CreateStockTransactionDto): Promise<StockTransaction> {
    // توليد رقم الأمر
    const prefix = createDto.transactionType === 'in' ? 'IN' : 'OUT';
    const count = await this.stockTransactionRepository.count({
      where: { transactionType: createDto.transactionType }
    });
    const transactionNumber = `${prefix}-${String(count + 1).padStart(6, '0')}`;

    // حساب الإجمالي
    const totalAmount = createDto.items.reduce((sum, item) => {
      return sum + (item.quantity * item.unitPrice);
    }, 0);

    // إنشاء الأمر
    const transaction = this.stockTransactionRepository.create({
      transactionNumber,
      transactionType: createDto.transactionType,
      warehouseId: createDto.warehouseId,
      transactionDate: createDto.transactionDate || new Date(),
      referenceNumber: createDto.referenceNumber,
      notes: createDto.notes,
      totalAmount,
      createdBy: createDto.createdBy,
      supplierId: createDto.supplierId,
      paymentAccountId: createDto.paymentAccountId,
    });

    const savedTransaction = await this.stockTransactionRepository.save(transaction);

    // إنشاء التفاصيل
    const items = createDto.items.map(itemDto => {
      return this.stockTransactionItemRepository.create({
        transactionId: savedTransaction.id,
        itemId: itemDto.itemId,
        quantity: itemDto.quantity,
        unitPrice: itemDto.unitPrice,
        totalPrice: itemDto.quantity * itemDto.unitPrice,
        notes: itemDto.notes,
      });
    });

    await this.stockTransactionItemRepository.save(items);

    // تحديث أرصدة المخزون
    await this.updateStockBalances(savedTransaction.id, createDto.transactionType);

    // إنشاء القيد المحاسبي
    await this.createJournalEntry(savedTransaction.id);

    return this.findOne(savedTransaction.id);
  }

  async approve(id: number, approvedBy: string): Promise<StockTransaction> {
    const transaction = await this.findOne(id);
    
    transaction.isApproved = true;
    transaction.approvedBy = approvedBy;
    transaction.approvedAt = new Date();

    return this.stockTransactionRepository.save(transaction);
  }

  async delete(id: number): Promise<void> {
    const transaction = await this.findOne(id);
    
    // حذف القيد المحاسبي
    if (transaction.journalEntryId) {
      await this.deleteJournalEntry(transaction.journalEntryId);
    }
    
    // حذف تأثير الأمر على الأرصدة
    await this.reverseStockBalances(id, transaction.transactionType);
    
    await this.stockTransactionRepository.remove(transaction);
  }

  private async updateStockBalances(transactionId: number, type: 'in' | 'out'): Promise<void> {
    const transaction = await this.findOne(transactionId);

    for (const item of transaction.items) {
      let balance = await this.stockBalanceRepository.findOne({
        where: {
          warehouseId: transaction.warehouseId,
          itemId: item.itemId,
        },
      });

      if (!balance) {
        balance = this.stockBalanceRepository.create({
          warehouseId: transaction.warehouseId,
          itemId: item.itemId,
          quantity: 0,
          averageCost: 0,
        });
      }

      const quantityChange = type === 'in' ? Number(item.quantity) : -Number(item.quantity);
      const newQuantity = Number(balance.quantity) + quantityChange;

      if (type === 'in') {
        // حساب متوسط التكلفة
        const totalCost = (Number(balance.quantity) * Number(balance.averageCost)) + 
                         (Number(item.quantity) * Number(item.unitPrice));
        balance.averageCost = newQuantity > 0 ? totalCost / newQuantity : 0;
      }

      balance.quantity = newQuantity;
      await this.stockBalanceRepository.save(balance);
    }
  }

  private async reverseStockBalances(transactionId: number, type: 'in' | 'out'): Promise<void> {
    const transaction = await this.findOne(transactionId);

    for (const item of transaction.items) {
      const balance = await this.stockBalanceRepository.findOne({
        where: {
          warehouseId: transaction.warehouseId,
          itemId: item.itemId,
        },
      });

      if (balance) {
        const quantityChange = type === 'in' ? -Number(item.quantity) : Number(item.quantity);
        balance.quantity = Number(balance.quantity) + quantityChange;
        await this.stockBalanceRepository.save(balance);
      }
    }
  }

  private async createJournalEntry(transactionId: number): Promise<void> {
    const transaction = await this.stockTransactionRepository.findOne({
      where: { id: transactionId },
      relations: ['warehouse', 'warehouse.group', 'items'],
    });

    if (!transaction || !transaction.warehouse?.groupId) {
      return; // لا يمكن إنشاء قيد بدون مجموعة مخازن
    }

    const warehouseGroup = await this.warehouseGroupRepository.findOne({
      where: { id: transaction.warehouse.groupId },
      relations: ['account'],
    });

    if (!warehouseGroup || !warehouseGroup.accountId) {
      return; // لا يمكن إنشاء قيد بدون حساب مرتبط
    }

    const inventoryAccountId = warehouseGroup.accountId;
    const costOfGoodsSoldAccountId = 24; // حساب تكلفة البضاعة المباعة (5100)
    
    // توليد رقم القيد
    const count = await this.journalEntryRepository.count();
    const entryNumber = `JE-${String(count + 1).padStart(6, '0')}`;

    const description = transaction.transactionType === 'in' 
      ? `قيد توريد مخزني - ${transaction.transactionNumber}`
      : `قيد صرف مخزني - ${transaction.transactionNumber}`;

    // إنشاء القيد
    const journalEntry = this.journalEntryRepository.create({
      entryNumber,
      date: transaction.transactionDate,
      description,
      referenceType: 'stock_transaction',
      referenceId: transaction.id,
      totalDebit: Number(transaction.totalAmount),
      totalCredit: Number(transaction.totalAmount),
    });

    const savedEntry = await this.journalEntryRepository.save(journalEntry);

    // إنشاء سطور القيد
    const lines = [];

    if (transaction.transactionType === 'in') {
      // قيد التوريد: من حـ/ المخزون - إلى حـ/ الموردين/النقدية
      lines.push(
        this.journalEntryLineRepository.create({
          journalEntryId: savedEntry.id,
          accountId: inventoryAccountId,
          debit: Number(transaction.totalAmount),
          credit: 0,
          description: `توريد بضاعة للمخزن - ${transaction.warehouse.name}`,
        }),
        this.journalEntryLineRepository.create({
          journalEntryId: savedEntry.id,
          accountId: inventoryAccountId, // مؤقتاً - يجب ربطه بحساب المورد
          debit: 0,
          credit: Number(transaction.totalAmount),
          description: `قيمة البضاعة الموردة`,
        })
      );
    } else {
      // قيد الصرف: من حـ/ تكلفة البضاعة المباعة - إلى حـ/ المخزون
      lines.push(
        this.journalEntryLineRepository.create({
          journalEntryId: savedEntry.id,
          accountId: costOfGoodsSoldAccountId,
          debit: Number(transaction.totalAmount),
          credit: 0,
          description: `تكلفة بضاعة مصروفة من المخزن - ${transaction.warehouse.name}`,
        }),
        this.journalEntryLineRepository.create({
          journalEntryId: savedEntry.id,
          accountId: inventoryAccountId,
          debit: 0,
          credit: Number(transaction.totalAmount),
          description: `صرف بضاعة من المخزن`,
        })
      );
    }

    await this.journalEntryLineRepository.save(lines);

    // تحديث رقم القيد في الأمر
    transaction.journalEntryId = savedEntry.id;
    await this.stockTransactionRepository.save(transaction);
  }

  private async deleteJournalEntry(journalEntryId: number): Promise<void> {
    const journalEntry = await this.journalEntryRepository.findOne({
      where: { id: journalEntryId },
      relations: ['lines'],
    });

    if (journalEntry) {
      await this.journalEntryLineRepository.remove(journalEntry.lines);
      await this.journalEntryRepository.remove(journalEntry);
    }
  }
}
