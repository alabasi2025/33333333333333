import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bank } from './bank.entity';

@Injectable()
export class BanksService {
  constructor(
    @InjectRepository(Bank)
    private bankRepository: Repository<Bank>,
  ) {}

  async findAll(): Promise<Bank[]> {
    return await this.bankRepository.find({
      relations: ['account', 'intermediateAccount'],
      order: { code: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Bank> {
    const bank = await this.bankRepository.findOne({
      where: { id },
      relations: ['account', 'intermediateAccount'],
    });
    
    if (!bank) {
      throw new NotFoundException(`Bank with ID ${id} not found`);
    }
    
    return bank;
  }

  async create(bankData: Partial<Bank>): Promise<Bank> {
    // Check if intermediate account is already used
    if (bankData.intermediateAccountId) {
      const existingBank = await this.bankRepository.findOne({
        where: { intermediateAccountId: bankData.intermediateAccountId }
      });
      if (existingBank) {
        throw new BadRequestException('هذا الحساب الوسيط مرتبط بالفعل ببنك آخر');
      }
    }
    
    const bank = this.bankRepository.create(bankData);
    return await this.bankRepository.save(bank);
  }

  async update(id: number, bankData: Partial<Bank>): Promise<Bank> {
    // Check if intermediate account is already used by another bank
    if (bankData.intermediateAccountId) {
      const existingBank = await this.bankRepository.findOne({
        where: { intermediateAccountId: bankData.intermediateAccountId }
      });
      if (existingBank && existingBank.id !== id) {
        throw new BadRequestException('هذا الحساب الوسيط مرتبط بالفعل ببنك آخر');
      }
    }
    
    await this.bankRepository.update(id, bankData);
    return await this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const result = await this.bankRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Bank with ID ${id} not found`);
    }
  }

  async toggleStatus(id: number): Promise<Bank> {
    const bank = await this.findOne(id);
    bank.isActive = !bank.isActive;
    return await this.bankRepository.save(bank);
  }
}
