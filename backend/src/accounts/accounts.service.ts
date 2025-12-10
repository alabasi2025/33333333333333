import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from './account.entity';

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
  ) {
    this.seedInitialData();
  }

  private async seedInitialData() {
    const count = await this.accountRepository.count();
    if (count === 0) {
      // Seed initial accounts
      const initialAccounts = [
        {
          code: '1000',
          name: 'الأصول',
          type: 'asset',
          accountLevel: 'main',
          order: 1,
        },
        {
          code: '2000',
          name: 'الخصوم',
          type: 'liability',
          accountLevel: 'main',
          order: 2,
        },
        {
          code: '3000',
          name: 'حقوق الملكية',
          type: 'equity',
          accountLevel: 'main',
          order: 3,
        },
        {
          code: '4000',
          name: 'الإيرادات',
          type: 'revenue',
          accountLevel: 'main',
          order: 4,
        },
        {
          code: '5000',
          name: 'المصروفات',
          type: 'expense',
          accountLevel: 'main',
          order: 5,
        },
      ];

      await this.accountRepository.save(initialAccounts);
    }
  }

  async findAll(unitId?: number): Promise<Account[]> {
    // إذا تم تحديد unitId، أرجع حسابات هذه الوحدة فقط
    // إذا لم يتم تحديد unitId، أرجع الحسابات بدون unit_id (NULL) أو جميع الحسابات
    let accounts: Account[];
    
    if (unitId) {
      // حسابات الوحدة المحددة
      accounts = await this.accountRepository.find({
        where: { unitId },
        relations: ['children'],
        order: { order: 'ASC', code: 'ASC' },
      });
    } else {
      // جميع الحسابات (بما فيها التي بدون unit_id)
      accounts = await this.accountRepository.find({
        relations: ['children'],
        order: { order: 'ASC', code: 'ASC' },
      });
    }
    
    return accounts;
  }

  async findOne(id: number): Promise<Account> {
    const account = await this.accountRepository.findOne({
      where: { id },
      relations: ['parent', 'children'],
    });
    
    if (!account) {
      throw new NotFoundException(`Account with ID ${id} not found`);
    }
    
    return account;
  }

  async create(accountData: Partial<Account>): Promise<Account> {
    const account = this.accountRepository.create(accountData);
    return await this.accountRepository.save(account);
  }

  async update(id: number, accountData: Partial<Account>): Promise<Account> {
    await this.accountRepository.update(id, accountData);
    return await this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const result = await this.accountRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Account with ID ${id} not found`);
    }
  }
}
