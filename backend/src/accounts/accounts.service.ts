import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Not, IsNull } from 'typeorm';
import { Account } from './account.entity';

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
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

  async findAll(unitId?: number, subType?: string): Promise<Account[]> {
    // إنشاء مفتاح cache فريد
    const cacheKey = `accounts_list_${unitId || 'all'}_${subType || 'all'}`;
    
    // محاولة الحصول على البيانات من الـ cache
    const cachedResult = await this.cacheManager.get<Account[]>(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }

    const where: any = {};
    
    if (unitId) {
      where.unitId = unitId;
    }
    
    if (subType) {
      where.subType = subType;
    }
    
    const accounts = await this.accountRepository.find({
      where,
      relations: ['children'],
      order: { order: 'ASC', code: 'ASC' },
    });
    
    // حفظ النتيجة في الـ cache لمدة 10 دقائق
    await this.cacheManager.set(cacheKey, accounts, 600000);
    
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
    const result = await this.accountRepository.save(account);
    
    // مسح الـ cache عند إضافة حساب جديد
    await this.clearAccountsCache();
    
    return result;
  }

  async update(id: number, accountData: Partial<Account>): Promise<Account> {
    await this.accountRepository.update(id, accountData);
    
    // مسح الـ cache عند تحديث حساب
    await this.clearAccountsCache();
    
    return await this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const result = await this.accountRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Account with ID ${id} not found`);
    }
    
    // مسح الـ cache عند حذف حساب
    await this.clearAccountsCache();
  }

  async findAvailableIntermediateAccounts(excludeId?: number): Promise<Account[]> {
    // Get all intermediate accounts (type = 'other' and parent is 6000)
    const intermediateParent = await this.accountRepository.findOne({
      where: { code: '6000' }
    });

    if (!intermediateParent) {
      return [];
    }

    // Get all intermediate accounts
    const allIntermediateAccounts = await this.accountRepository.find({
      where: { parentId: intermediateParent.id },
      order: { code: 'ASC' }
    });

    // Get used intermediate account IDs from both cash_boxes and banks
    const { CashBox } = await import('../cash-boxes/cash-box.entity');
    const { Bank } = await import('../banks/bank.entity');
    
    const cashBoxRepo = this.accountRepository.manager.getRepository(CashBox);
    const bankRepo = this.accountRepository.manager.getRepository(Bank);

    const usedInCashBoxes = await cashBoxRepo.find({
      where: { intermediateAccountId: Not(IsNull()) },
      select: ['intermediateAccountId', 'id']
    });

    const usedInBanks = await bankRepo.find({
      where: { intermediateAccountId: Not(IsNull()) },
      select: ['intermediateAccountId', 'id']
    });

    // Collect used intermediate account IDs, excluding the current entity if editing
    const usedIds = new Set<number>();
    usedInCashBoxes.forEach(cb => {
      if (cb.intermediateAccountId && (!excludeId || cb.id !== excludeId)) {
        usedIds.add(cb.intermediateAccountId);
      }
    });
    usedInBanks.forEach(bank => {
      if (bank.intermediateAccountId && (!excludeId || bank.id !== excludeId)) {
        usedIds.add(bank.intermediateAccountId);
      }
    });

    // Filter out used accounts
    return allIntermediateAccounts.filter(account => !usedIds.has(account.id));
  }

  private async clearAccountsCache(): Promise<void> {
    // مسح جميع مفاتيح الـ cache المتعلقة بالحسابات
    const keys = ['accounts_list_all_all'];
    for (const key of keys) {
      await this.cacheManager.del(key);
    }
  }
}
