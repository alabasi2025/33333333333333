import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Voucher, VoucherType, PaymentMethod } from './voucher.entity';
import { CashBoxesService } from '../cash-boxes/cash-boxes.service';
import { BanksService } from '../banks/banks.service';

@Injectable()
export class VouchersService {
  constructor(
    @InjectRepository(Voucher)
    private voucherRepository: Repository<Voucher>,
    private cashBoxesService: CashBoxesService,
    private banksService: BanksService,
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

    return await this.findOne(savedVoucher.id);
  }

  async update(id: number, voucherData: Partial<Voucher>): Promise<Voucher> {
    const oldVoucher = await this.findOne(id);
    
    // إلغاء التأثير القديم
    await this.reverseBalance(oldVoucher);

    await this.voucherRepository.update(id, voucherData);
    const updatedVoucher = await this.findOne(id);

    // تطبيق التأثير الجديد
    await this.updateBalance(updatedVoucher);

    return updatedVoucher;
  }

  async remove(id: number): Promise<void> {
    const voucher = await this.findOne(id);
    
    // إلغاء التأثير على الرصيد
    await this.reverseBalance(voucher);

    const result = await this.voucherRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Voucher with ID ${id} not found`);
    }
  }

  private async updateBalance(voucher: Voucher): Promise<void> {
    const amount = parseFloat(voucher.amount);
    
    if (voucher.paymentMethod === PaymentMethod.CASH && voucher.cashBoxId) {
      const cashBox = await this.cashBoxesService.findOne(voucher.cashBoxId);
      const currentBalance = parseFloat(cashBox.currentBalance);
      
      if (voucher.type === VoucherType.PAYMENT) {
        cashBox.currentBalance = (currentBalance - amount).toString();
      } else {
        cashBox.currentBalance = (currentBalance + amount).toString();
      }
      
      await this.cashBoxesService.update(voucher.cashBoxId, { currentBalance: cashBox.currentBalance });
    } else if (voucher.paymentMethod === PaymentMethod.BANK && voucher.bankId) {
      const bank = await this.banksService.findOne(voucher.bankId);
      const currentBalance = parseFloat(bank.currentBalance);
      
      if (voucher.type === VoucherType.PAYMENT) {
        bank.currentBalance = (currentBalance - amount).toString();
      } else {
        bank.currentBalance = (currentBalance + amount).toString();
      }
      
      await this.banksService.update(voucher.bankId, { currentBalance: bank.currentBalance });
    }
  }

  private async reverseBalance(voucher: Voucher): Promise<void> {
    const amount = parseFloat(voucher.amount);
    
    if (voucher.paymentMethod === PaymentMethod.CASH && voucher.cashBoxId) {
      const cashBox = await this.cashBoxesService.findOne(voucher.cashBoxId);
      const currentBalance = parseFloat(cashBox.currentBalance);
      
      if (voucher.type === VoucherType.PAYMENT) {
        cashBox.currentBalance = (currentBalance + amount).toString();
      } else {
        cashBox.currentBalance = (currentBalance - amount).toString();
      }
      
      await this.cashBoxesService.update(voucher.cashBoxId, { currentBalance: cashBox.currentBalance });
    } else if (voucher.paymentMethod === PaymentMethod.BANK && voucher.bankId) {
      const bank = await this.banksService.findOne(voucher.bankId);
      const currentBalance = parseFloat(bank.currentBalance);
      
      if (voucher.type === VoucherType.PAYMENT) {
        bank.currentBalance = (currentBalance + amount).toString();
      } else {
        bank.currentBalance = (currentBalance - amount).toString();
      }
      
      await this.banksService.update(voucher.bankId, { currentBalance: bank.currentBalance });
    }
  }
}
