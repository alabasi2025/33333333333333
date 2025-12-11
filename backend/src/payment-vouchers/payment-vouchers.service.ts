import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentVoucher } from './payment-voucher.entity';
import { CreatePaymentVoucherDto, UpdatePaymentVoucherDto, ApprovePaymentVoucherDto } from './dto/create-payment-voucher.dto';
import { JournalEntry } from '../journal-entries/journal-entry.entity';
import { JournalEntryLine } from '../journal-entries/journal-entry-line.entity';

@Injectable()
export class PaymentVouchersService {
  constructor(
    @InjectRepository(PaymentVoucher)
    private paymentVoucherRepository: Repository<PaymentVoucher>,
    @InjectRepository(JournalEntry)
    private journalEntryRepository: Repository<JournalEntry>,
    @InjectRepository(JournalEntryLine)
    private journalEntryLineRepository: Repository<JournalEntryLine>,
  ) {}

  async create(createDto: CreatePaymentVoucherDto): Promise<PaymentVoucher> {
    // التحقق من عدم تكرار رقم السند
    const existing = await this.paymentVoucherRepository.findOne({
      where: { voucherNumber: createDto.voucherNumber }
    });
    
    if (existing) {
      throw new BadRequestException('رقم السند موجود مسبقاً');
    }

    const voucher = this.paymentVoucherRepository.create(createDto);
    return await this.paymentVoucherRepository.save(voucher);
  }

  async findAll(filters?: any): Promise<PaymentVoucher[]> {
    const query = this.paymentVoucherRepository.createQueryBuilder('pv')
      .leftJoinAndSelect('pv.account', 'account')
      .leftJoinAndSelect('pv.journalEntry', 'journalEntry')
      .orderBy('pv.date', 'DESC')
      .addOrderBy('pv.voucherNumber', 'DESC');

    if (filters?.status) {
      query.andWhere('pv.status = :status', { status: filters.status });
    }

    if (filters?.posted !== undefined) {
      query.andWhere('pv.posted = :posted', { posted: filters.posted });
    }

    if (filters?.dateFrom) {
      query.andWhere('pv.date >= :dateFrom', { dateFrom: filters.dateFrom });
    }

    if (filters?.dateTo) {
      query.andWhere('pv.date <= :dateTo', { dateTo: filters.dateTo });
    }

    return await query.getMany();
  }

  async findOne(id: number): Promise<PaymentVoucher> {
    const voucher = await this.paymentVoucherRepository.findOne({
      where: { id },
      relations: ['account', 'journalEntry', 'journalEntry.lines']
    });

    if (!voucher) {
      throw new NotFoundException('سند الصرف غير موجود');
    }

    return voucher;
  }

  async update(id: number, updateDto: UpdatePaymentVoucherDto): Promise<PaymentVoucher> {
    const voucher = await this.findOne(id);

    if (voucher.posted) {
      throw new BadRequestException('لا يمكن تعديل سند مرحّل');
    }

    Object.assign(voucher, updateDto);
    return await this.paymentVoucherRepository.save(voucher);
  }

  async approve(id: number, approveDto: ApprovePaymentVoucherDto): Promise<PaymentVoucher> {
    const voucher = await this.findOne(id);

    if (voucher.status === 'approved') {
      throw new BadRequestException('السند معتمد مسبقاً');
    }

    voucher.status = 'approved';
    voucher.approvedBy = approveDto.approvedBy;
    voucher.approvedAt = new Date();

    return await this.paymentVoucherRepository.save(voucher);
  }

  async post(id: number): Promise<PaymentVoucher> {
    const voucher = await this.findOne(id);

    if (voucher.posted) {
      throw new BadRequestException('السند مرحّل مسبقاً');
    }

    if (voucher.status !== 'approved') {
      throw new BadRequestException('يجب اعتماد السند قبل الترحيل');
    }

    // إنشاء قيد محاسبي
    const journalEntry = this.journalEntryRepository.create({
      entryNumber: `PV-${voucher.voucherNumber}`,
      date: voucher.date,
      description: `سند صرف رقم ${voucher.voucherNumber} - ${voucher.description || ''}`,
      referenceType: 'payment_voucher',
      referenceId: voucher.id,
      totalDebit: voucher.amount,
      totalCredit: voucher.amount,
      isPosted: true
    });

    const savedEntry = await this.journalEntryRepository.save(journalEntry);

    // إنشاء سطور القيد (مدين: المصروف، دائن: الحساب)
    const lines = [
      // سطر المصروف (مدين)
      this.journalEntryLineRepository.create({
        journalEntryId: savedEntry.id,
        accountId: voucher.accountId,
        debit: voucher.amount,
        credit: 0,
        description: voucher.beneficiaryName || ''
      }),
      // سطر الحساب (دائن) - يجب تحديد حساب الصندوق أو البنك
      // هنا نفترض حساب نقدية افتراضي، يمكن تحسينه لاحقاً
      this.journalEntryLineRepository.create({
        journalEntryId: savedEntry.id,
        accountId: voucher.accountId, // TODO: يجب استخدام حساب الصندوق/البنك
        debit: 0,
        credit: voucher.amount,
        description: voucher.beneficiaryName || ''
      })
    ];

    await this.journalEntryLineRepository.save(lines);

    // تحديث السند
    voucher.posted = true;
    voucher.journalEntryId = savedEntry.id;

    return await this.paymentVoucherRepository.save(voucher);
  }

  async cancel(id: number): Promise<PaymentVoucher> {
    const voucher = await this.findOne(id);

    if (voucher.posted) {
      throw new BadRequestException('لا يمكن إلغاء سند مرحّل');
    }

    voucher.status = 'cancelled';
    return await this.paymentVoucherRepository.save(voucher);
  }

  async delete(id: number): Promise<void> {
    const voucher = await this.findOne(id);

    if (voucher.posted) {
      throw new BadRequestException('لا يمكن حذف سند مرحّل');
    }

    await this.paymentVoucherRepository.remove(voucher);
  }
}
