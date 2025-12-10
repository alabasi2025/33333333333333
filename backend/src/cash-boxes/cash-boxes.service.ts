import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CashBox } from './cash-box.entity';
import { CashTransaction } from './cash-transaction.entity';
import { CreateCashBoxDto } from './dto/create-cash-box.dto';
import { UpdateCashBoxDto } from './dto/update-cash-box.dto';
import { CreateCashTransactionDto } from './dto/create-cash-transaction.dto';

@Injectable()
export class CashBoxesService {
  constructor(
    @InjectRepository(CashBox)
    private cashBoxRepository: Repository<CashBox>,
    @InjectRepository(CashTransaction)
    private transactionRepository: Repository<CashTransaction>,
  ) {}

  // Cash Boxes
  async findAll(): Promise<CashBox[]> {
    return this.cashBoxRepository.find({ 
      relations: ['account', 'intermediateAccount'],
      order: { id: 'DESC' }
    });
  }

  async findOne(id: number): Promise<CashBox> {
    const cashBox = await this.cashBoxRepository.findOne({
      where: { id },
      relations: ['account', 'intermediateAccount', 'transactions']
    });
    if (!cashBox) {
      throw new NotFoundException(`Cash box with ID ${id} not found`);
    }
    return cashBox;
  }

  async create(createDto: CreateCashBoxDto): Promise<CashBox> {
    // Check if intermediate account is already used
    if (createDto.intermediateAccountId) {
      const existingCashBox = await this.cashBoxRepository.findOne({
        where: { intermediateAccountId: createDto.intermediateAccountId }
      });
      if (existingCashBox) {
        throw new BadRequestException('هذا الحساب الوسيط مرتبط بالفعل بصندوق آخر');
      }
    }
    
    const cashBox = this.cashBoxRepository.create({
      ...createDto,
      currentBalance: createDto.openingBalance || 0
    });
    return this.cashBoxRepository.save(cashBox);
  }

  async update(id: number, updateDto: UpdateCashBoxDto): Promise<CashBox> {
    // Check if intermediate account is already used by another cash box
    if (updateDto.intermediateAccountId) {
      const existingCashBox = await this.cashBoxRepository.findOne({
        where: { intermediateAccountId: updateDto.intermediateAccountId }
      });
      if (existingCashBox && existingCashBox.id !== id) {
        throw new BadRequestException('هذا الحساب الوسيط مرتبط بالفعل بصندوق آخر');
      }
    }
    
    await this.cashBoxRepository.update(id, updateDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const result = await this.cashBoxRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Cash box with ID ${id} not found`);
    }
  }

  // Transactions
  async findTransactions(cashBoxId?: number): Promise<CashTransaction[]> {
    const queryBuilder = this.transactionRepository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.cashBox', 'cashBox');

    if (cashBoxId) {
      queryBuilder.andWhere('transaction.cashBoxId = :cashBoxId', { cashBoxId });
    }

    return queryBuilder
      .orderBy('transaction.transactionDate', 'DESC')
      .addOrderBy('transaction.id', 'DESC')
      .getMany();
  }

  async createTransaction(createDto: CreateCashTransactionDto): Promise<CashTransaction> {
    const cashBox = await this.findOne(createDto.cashBoxId);
    
    // Update cash box balance
    const amount = Number(createDto.amount);
    if (createDto.transactionType === 'deposit' || createDto.transactionType === 'transfer_in') {
      cashBox.currentBalance = Number(cashBox.currentBalance) + amount;
    } else {
      cashBox.currentBalance = Number(cashBox.currentBalance) - amount;
    }
    
    await this.cashBoxRepository.save(cashBox);
    
    const transaction = this.transactionRepository.create(createDto);
    return this.transactionRepository.save(transaction);
  }

  async getBalance(id: number): Promise<{ balance: number }> {
    const cashBox = await this.findOne(id);
    return { balance: Number(cashBox.currentBalance) };
  }
}
