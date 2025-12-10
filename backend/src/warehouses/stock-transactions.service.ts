import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StockTransaction } from './stock-transaction.entity';
import { StockTransactionItem } from './stock-transaction-item.entity';
import { StockBalance } from './stock-balance.entity';
import { CreateStockTransactionDto } from './dto/create-stock-transaction.dto';

@Injectable()
export class StockTransactionsService {
  constructor(
    @InjectRepository(StockTransaction)
    private stockTransactionRepository: Repository<StockTransaction>,
    @InjectRepository(StockTransactionItem)
    private stockTransactionItemRepository: Repository<StockTransactionItem>,
    @InjectRepository(StockBalance)
    private stockBalanceRepository: Repository<StockBalance>,
  ) {}

  async findAll(type?: 'in' | 'out'): Promise<StockTransaction[]> {
    const query = this.stockTransactionRepository.createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.warehouse', 'warehouse')
      .leftJoinAndSelect('transaction.items', 'items')
      .leftJoinAndSelect('items.item', 'item')
      .orderBy('transaction.transactionDate', 'DESC');

    if (type) {
      query.where('transaction.transactionType = :type', { type });
    }

    return query.getMany();
  }

  async findOne(id: number): Promise<StockTransaction> {
    const transaction = await this.stockTransactionRepository.findOne({
      where: { id },
      relations: ['warehouse', 'items', 'items.item'],
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
}
