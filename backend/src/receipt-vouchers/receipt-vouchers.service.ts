import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReceiptVoucher } from './receipt-voucher.entity';
import { CreateReceiptVoucherDto, UpdateReceiptVoucherDto, ApproveReceiptVoucherDto } from './dto/create-receipt-voucher.dto';
import { JournalEntry } from '../journal-entries/journal-entry.entity';
import { JournalEntryLine } from '../journal-entries/journal-entry-line.entity';

@Injectable()
export class ReceiptVouchersService {
  constructor(
    @InjectRepository(ReceiptVoucher)
    private receiptVoucherRepository: Repository<ReceiptVoucher>,
    @InjectRepository(JournalEntry)
    private journalEntryRepository: Repository<JournalEntry>,
    @InjectRepository(JournalEntryLine)
    private journalEntryLineRepository: Repository<JournalEntryLine>,
  ) {}

  async create(createDto: CreateReceiptVoucherDto): Promise<ReceiptVoucher> {
    // التحقق من عدم تكرار رقم السند
    const existing = await this.receiptVoucherRepository.findOne({
      where: { voucherNumber: createDto.voucherNumber }
    });
    
    if (existing) {
      throw new BadRequestException('رقم السند موجود مسبقاً');
    }

    const voucher = this.receiptVoucherRepository.create(createDto);
    return await this.receiptVoucherRepository.save(voucher);
  }

  async findAll(filters?: any): Promise<ReceiptVoucher[]> {
    const query = this.receiptVoucherRepository.createQueryBuilder('rv')
      .leftJoinAndSelect('rv.account', 'account')
      .leftJoinAndSelect('rv.journalEntry', 'journalEntry')
      .orderBy('rv.date', 'DESC')
      .addOrderBy('rv.voucherNumber', 'DESC');

    if (filters?.status) {
      query.andWhere('rv.status = :status', { status: filters.status });
    }

    if (filters?.posted !== undefined) {
      query.andWhere('rv.posted = :posted', { posted: filters.posted });
    }

    if (filters?.dateFrom) {
      query.andWhere('rv.date >= :dateFrom', { dateFrom: filters.dateFrom });
    }

    if (filters?.dateTo) {
      query.andWhere('rv.date <= :dateTo', { dateTo: filters.dateTo });
    }

    return await query.getMany();
  }

  async findOne(id: number): Promise<ReceiptVoucher> {
    const voucher = await this.receiptVoucherRepository.findOne({
      where: { id },
      relations: ['account', 'journalEntry', 'journalEntry.lines']
    });

    if (!voucher) {
      throw new NotFoundException('سند القبض غير موجود');
    }

    return voucher;
  }

  async update(id: number, updateDto: UpdateReceiptVoucherDto): Promise<ReceiptVoucher> {
    const voucher = await this.findOne(id);

    if (voucher.posted) {
      throw new BadRequestException('لا يمكن تعديل سند مرحّل');
    }

    Object.assign(voucher, updateDto);
    return await this.receiptVoucherRepository.save(voucher);
  }

  async approve(id: number, approveDto: ApproveReceiptVoucherDto): Promise<ReceiptVoucher> {
    const voucher = await this.findOne(id);

    if (voucher.status === 'approved') {
      throw new BadRequestException('السند معتمد مسبقاً');
    }

    voucher.status = 'approved';
    voucher.approvedBy = approveDto.approvedBy;
    voucher.approvedAt = new Date();

    return await this.receiptVoucherRepository.save(voucher);
  }

  async post(id: number): Promise<ReceiptVoucher> {
    const voucher = await this.findOne(id);

    if (voucher.posted) {
      throw new BadRequestException('السند مرحّل مسبقاً');
    }

    if (voucher.status !== 'approved') {
      throw new BadRequestException('يجب اعتماد السند قبل الترحيل');
    }

    // إنشاء قيد محاسبي
    const journalEntry = this.journalEntryRepository.create({
      entryNumber: `RV-${voucher.voucherNumber}`,
      date: voucher.date,
      description: `سند قبض رقم ${voucher.voucherNumber} - ${voucher.description || ''}`,
      referenceType: 'receipt_voucher',
      referenceId: voucher.id,
      totalDebit: voucher.amount,
      totalCredit: voucher.amount,
      isPosted: true
    });

    const savedEntry = await this.journalEntryRepository.save(journalEntry);

    // إنشاء سطور القيد (مدين: الحساب، دائن: الإيراد)
    const lines = [
      // سطر الحساب (مدين) - يجب تحديد حساب الصندوق أو البنك
      this.journalEntryLineRepository.create({
        journalEntryId: savedEntry.id,
        accountId: voucher.accountId, // TODO: يجب استخدام حساب الصندوق/البنك
        debit: voucher.amount,
        credit: 0,
        description: voucher.payerName || ''
      }),
      // سطر الإيراد (دائن)
      this.journalEntryLineRepository.create({
        journalEntryId: savedEntry.id,
        accountId: voucher.accountId,
        debit: 0,
        credit: voucher.amount,
        description: voucher.payerName || ''
      })
    ];

    await this.journalEntryLineRepository.save(lines);

    // تحديث السند
    voucher.posted = true;
    voucher.journalEntryId = savedEntry.id;

    return await this.receiptVoucherRepository.save(voucher);
  }

  async cancel(id: number): Promise<ReceiptVoucher> {
    const voucher = await this.findOne(id);

    if (voucher.posted) {
      throw new BadRequestException('لا يمكن إلغاء سند مرحّل');
    }

    voucher.status = 'cancelled';
    return await this.receiptVoucherRepository.save(voucher);
  }

  async delete(id: number): Promise<void> {
    const voucher = await this.findOne(id);

    if (voucher.posted) {
      throw new BadRequestException('لا يمكن حذف سند مرحّل');
    }

    await this.receiptVoucherRepository.remove(voucher);
  }
}
