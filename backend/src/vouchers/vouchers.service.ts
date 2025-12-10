import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Voucher, VoucherType, PaymentMethod } from './voucher.entity';
import { CashBoxesService } from '../cash-boxes/cash-boxes.service';
import { BanksService } from '../banks/banks.service';
import { JournalEntriesService } from '../journal-entries/journal-entries.service';

@Injectable()
export class VouchersService {
  constructor(
    @InjectRepository(Voucher)
    private voucherRepository: Repository<Voucher>,
    private cashBoxesService: CashBoxesService,
    private banksService: BanksService,
    private journalEntriesService: JournalEntriesService,
  ) {}

  async findAll(type?: VoucherType): Promise<Voucher[]> {
    const query = this.voucherRepository.createQueryBuilder('voucher')
      .leftJoinAndSelect('voucher.cashBox', 'cashBox')
      .leftJoinAndSelect('voucher.bank', 'bank')
      .leftJoinAndSelect('voucher.account', 'account')
      .orderBy('voucher.date', 'DESC')
      .addOrderBy('voucher.voucherNumber', 'DESC');

    if (type) {
      query.where('voucher.type = :type', { type });
    }

    return await query.getMany();
  }

  async findOne(id: number): Promise<Voucher> {
    const voucher = await this.voucherRepository.findOne({
      where: { id },
      relations: ['cashBox', 'bank', 'account'],
    });
    
    if (!voucher) {
      throw new NotFoundException(`Voucher with ID ${id} not found`);
    }
    
    return voucher;
  }

  async getNextVoucherNumber(paymentMethod: PaymentMethod, cashBoxId?: number, bankId?: number): Promise<string> {
    let prefix = '';
    let query = this.voucherRepository.createQueryBuilder('voucher')
      .where('voucher.paymentMethod = :paymentMethod', { paymentMethod });

    if (paymentMethod === PaymentMethod.CASH && cashBoxId) {
      query = query.andWhere('voucher.cashBoxId = :cashBoxId', { cashBoxId });
      const cashBox = await this.cashBoxesService.findOne(cashBoxId);
      prefix = `${cashBox.code}-`;
    } else if (paymentMethod === PaymentMethod.BANK && bankId) {
      query = query.andWhere('voucher.bankId = :bankId', { bankId });
      const bank = await this.banksService.findOne(bankId);
      prefix = `${bank.code}-`;
    }

    const lastVoucher = await query
      .orderBy('voucher.id', 'DESC')
      .getOne();

    let nextNumber = 1;
    if (lastVoucher) {
      const lastNumber = lastVoucher.voucherNumber.split('-').pop();
      nextNumber = parseInt(lastNumber || '0') + 1;
    }

    return `${prefix}${nextNumber.toString().padStart(6, '0')}`;
  }

  async create(voucherData: Partial<Voucher>): Promise<Voucher> {
    // التحقق من وجود صندوق أو بنك
    if (voucherData.paymentMethod === PaymentMethod.CASH && !voucherData.cashBoxId) {
      throw new BadRequestException('Cash box is required for cash vouchers');
    }
    if (voucherData.paymentMethod === PaymentMethod.BANK && !voucherData.bankId) {
      throw new BadRequestException('Bank is required for bank vouchers');
    }

    // توليد رقم السند
    voucherData.voucherNumber = await this.getNextVoucherNumber(
      voucherData.paymentMethod!,
      voucherData.cashBoxId,
      voucherData.bankId
    );

    const voucher = this.voucherRepository.create(voucherData);
    const savedVoucher = await this.voucherRepository.save(voucher);

    // تحديث رصيد الصندوق أو البنك
    await this.updateBalance(savedVoucher);

    // إنشاء قيد محاسبي
    await this.createJournalEntry(savedVoucher);

    return await this.findOne(savedVoucher.id);
  }

  async update(id: number, voucherData: Partial<Voucher>): Promise<Voucher> {
    const oldVoucher = await this.findOne(id);
    
    // إلغاء التأثير القديم
    await this.reverseBalance(oldVoucher);
    await this.journalEntriesService.deleteByReference('voucher', id);

    await this.voucherRepository.update(id, voucherData);
    const updatedVoucher = await this.findOne(id);

    // تطبيق التأثير الجديد
    await this.updateBalance(updatedVoucher);
    await this.createJournalEntry(updatedVoucher);

    return updatedVoucher;
  }

  async remove(id: number): Promise<void> {
    const voucher = await this.findOne(id);
    
    // إلغاء التأثير على الرصيد
    await this.reverseBalance(voucher);
    await this.journalEntriesService.deleteByReference('voucher', id);

    const result = await this.voucherRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Voucher with ID ${id} not found`);
    }
  }

  private async updateBalance(voucher: Voucher): Promise<void> {
    const amount = parseFloat(voucher.amount);
    
    if (voucher.paymentMethod === PaymentMethod.CASH && voucher.cashBoxId) {
      const cashBox = await this.cashBoxesService.findOne(voucher.cashBoxId);
      const currentBalance = typeof cashBox.currentBalance === 'string' ? parseFloat(cashBox.currentBalance) : cashBox.currentBalance;
      
      if (voucher.type === VoucherType.PAYMENT) {
        const newBalance = currentBalance - amount;
        cashBox.currentBalance = newBalance as any;
      } else {
        const newBalance = currentBalance + amount;
        cashBox.currentBalance = newBalance as any;
      }
      
      await this.cashBoxesService['cashBoxRepository'].update(voucher.cashBoxId, { currentBalance: cashBox.currentBalance });
    } else if (voucher.paymentMethod === PaymentMethod.BANK && voucher.bankId) {
      const bank = await this.banksService.findOne(voucher.bankId);
      const currentBalance = typeof bank.currentBalance === 'string' ? parseFloat(bank.currentBalance) : bank.currentBalance;
      
      if (voucher.type === VoucherType.PAYMENT) {
        const newBalance = currentBalance - amount;
        bank.currentBalance = newBalance as any;
      } else {
        const newBalance = currentBalance + amount;
        bank.currentBalance = newBalance as any;
      }
      
      await this.banksService['bankRepository'].update(voucher.bankId, { currentBalance: bank.currentBalance });
    }
  }

  private async reverseBalance(voucher: Voucher): Promise<void> {
    const amount = parseFloat(voucher.amount);
    
    if (voucher.paymentMethod === PaymentMethod.CASH && voucher.cashBoxId) {
      const cashBox = await this.cashBoxesService.findOne(voucher.cashBoxId);
      const currentBalance = typeof cashBox.currentBalance === 'string' ? parseFloat(cashBox.currentBalance) : cashBox.currentBalance;
      
      if (voucher.type === VoucherType.PAYMENT) {
        const newBalance = currentBalance + amount;
        cashBox.currentBalance = newBalance as any;
      } else {
        const newBalance = currentBalance - amount;
        cashBox.currentBalance = newBalance as any;
      }
      
      await this.cashBoxesService['cashBoxRepository'].update(voucher.cashBoxId, { currentBalance: cashBox.currentBalance });
    } else if (voucher.paymentMethod === PaymentMethod.BANK && voucher.bankId) {
      const bank = await this.banksService.findOne(voucher.bankId);
      const currentBalance = typeof bank.currentBalance === 'string' ? parseFloat(bank.currentBalance) : bank.currentBalance;
      
      if (voucher.type === VoucherType.PAYMENT) {
        const newBalance = currentBalance + amount;
        bank.currentBalance = newBalance as any;
      } else {
        const newBalance = currentBalance - amount;
        bank.currentBalance = newBalance as any;
      }
      
      await this.banksService['bankRepository'].update(voucher.bankId, { currentBalance: bank.currentBalance });
    }
  }
}

  private async createJournalEntry(voucher: Voucher): Promise<void> {
    const amount = parseFloat(voucher.amount);
    const lines: any[] = [];

    if (voucher.paymentMethod === PaymentMethod.CASH && voucher.cashBoxId) {
      const cashBox = await this.cashBoxesService.findOne(voucher.cashBoxId);
      
      // التحقق من وجود حساب وسيط
      if (cashBox.intermediateAccountId) {
        // القيد يمر عبر الحساب الوسيط
        if (voucher.type === VoucherType.PAYMENT) {
          // سند صرف: من حـ/ الحساب الوسيط إلى حـ/ الصندوق
          lines.push({
            accountId: cashBox.intermediateAccountId,
            debit: amount,
            credit: 0,
            description: `${voucher.description} - ${voucher.beneficiary}`,
          });
          lines.push({
            accountId: cashBox.accountId,
            debit: 0,
            credit: amount,
            description: `${voucher.description} - ${voucher.beneficiary}`,
          });
        } else {
          // سند قبض: من حـ/ الصندوق إلى حـ/ الحساب الوسيط
          lines.push({
            accountId: cashBox.accountId,
            debit: amount,
            credit: 0,
            description: `${voucher.description} - ${voucher.beneficiary}`,
          });
          lines.push({
            accountId: cashBox.intermediateAccountId,
            debit: 0,
            credit: amount,
            description: `${voucher.description} - ${voucher.beneficiary}`,
          });
        }
      } else {
        // لا يوجد حساب وسيط - القيد المباشر
        if (voucher.type === VoucherType.PAYMENT) {
          // سند صرف: من حـ/ الحساب المحدد إلى حـ/ الصندوق
          lines.push({
            accountId: voucher.accountId,
            debit: amount,
            credit: 0,
            description: `${voucher.description} - ${voucher.beneficiary}`,
          });
          lines.push({
            accountId: cashBox.accountId,
            debit: 0,
            credit: amount,
            description: `${voucher.description} - ${voucher.beneficiary}`,
          });
        } else {
          // سند قبض: من حـ/ الصندوق إلى حـ/ الحساب المحدد
          lines.push({
            accountId: cashBox.accountId,
            debit: amount,
            credit: 0,
            description: `${voucher.description} - ${voucher.beneficiary}`,
          });
          lines.push({
            accountId: voucher.accountId,
            debit: 0,
            credit: amount,
            description: `${voucher.description} - ${voucher.beneficiary}`,
          });
        }
      }
    } else if (voucher.paymentMethod === PaymentMethod.BANK && voucher.bankId) {
      const bank = await this.banksService.findOne(voucher.bankId);
      
      // التحقق من وجود حساب وسيط
      if (bank.intermediateAccountId) {
        // القيد يمر عبر الحساب الوسيط
        if (voucher.type === VoucherType.PAYMENT) {
          // سند صرف: من حـ/ الحساب الوسيط إلى حـ/ البنك
          lines.push({
            accountId: bank.intermediateAccountId,
            debit: amount,
            credit: 0,
            description: `${voucher.description} - ${voucher.beneficiary}`,
          });
          lines.push({
            accountId: bank.accountId,
            debit: 0,
            credit: amount,
            description: `${voucher.description} - ${voucher.beneficiary}`,
          });
        } else {
          // سند قبض: من حـ/ البنك إلى حـ/ الحساب الوسيط
          lines.push({
            accountId: bank.accountId,
            debit: amount,
            credit: 0,
            description: `${voucher.description} - ${voucher.beneficiary}`,
          });
          lines.push({
            accountId: bank.intermediateAccountId,
            debit: 0,
            credit: amount,
            description: `${voucher.description} - ${voucher.beneficiary}`,
          });
        }
      } else {
        // لا يوجد حساب وسيط - القيد المباشر
        if (voucher.type === VoucherType.PAYMENT) {
          // سند صرف: من حـ/ الحساب المحدد إلى حـ/ البنك
          lines.push({
            accountId: voucher.accountId,
            debit: amount,
            credit: 0,
            description: `${voucher.description} - ${voucher.beneficiary}`,
          });
          lines.push({
            accountId: bank.accountId,
            debit: 0,
            credit: amount,
            description: `${voucher.description} - ${voucher.beneficiary}`,
          });
        } else {
          // سند قبض: من حـ/ البنك إلى حـ/ الحساب المحدد
          lines.push({
            accountId: bank.accountId,
            debit: amount,
            credit: 0,
            description: `${voucher.description} - ${voucher.beneficiary}`,
          });
          lines.push({
            accountId: voucher.accountId,
            debit: 0,
            credit: amount,
            description: `${voucher.description} - ${voucher.beneficiary}`,
          });
        }
      }
    }

    // إنشاء القيد المحاسبي
    if (lines.length > 0) {
      await this.journalEntriesService.create({
        date: voucher.date,
        description: `${voucher.type === VoucherType.PAYMENT ? 'سند صرف' : 'سند قبض'} - ${voucher.voucherNumber}`,
        referenceType: 'voucher',
        referenceId: voucher.id,
        lines,
      });
    }
  }
}
