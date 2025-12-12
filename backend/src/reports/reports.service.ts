import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JournalEntry } from '../journal-entries/journal-entry.entity';
import { JournalEntryLine } from '../journal-entries/journal-entry-line.entity';
import { Account } from '../accounts/account.entity';

export interface TrialBalanceItem {
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
  balance: number;
  balanceType: 'debit' | 'credit';
}

export interface TrialBalanceReport {
  items: TrialBalanceItem[];
  totalDebit: number;
  totalCredit: number;
  difference: number;
  isBalanced: boolean;
}

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(JournalEntryLine)
    private journalEntryLineRepository: Repository<JournalEntryLine>,
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async getTrialBalance(startDate?: string, endDate?: string, postingStatus?: 'all' | 'posted' | 'unposted'): Promise<TrialBalanceReport> {
    // إنشاء مفتاح cache فريد بناءً على المعاملات
    const cacheKey = `trial_balance_${startDate || 'all'}_${endDate || 'all'}_${postingStatus || 'all'}`;
    
    // محاولة الحصول على البيانات من الـ cache
    const cachedResult = await this.cacheManager.get<TrialBalanceReport>(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }

    // بناء الاستعلام
    let query = this.journalEntryLineRepository
      .createQueryBuilder('line')
      .leftJoinAndSelect('line.account', 'account')
      .leftJoinAndSelect('line.journalEntry', 'entry');

    // تطبيق فلتر حالة الترحيل
    if (postingStatus === 'posted') {
      query = query.where('entry.isPosted = :isPosted', { isPosted: true });
    } else if (postingStatus === 'unposted') {
      query = query.where('entry.isPosted = :isPosted', { isPosted: false });
    }
    // إذا كان 'all' أو غير محدد، لا نضيف فلتر

    // تطبيق فلتر التاريخ
    if (startDate) {
      query = query.andWhere('entry.date >= :startDate', { startDate });
    }
    if (endDate) {
      query = query.andWhere('entry.date <= :endDate', { endDate });
    }

    const lines = await query.getMany();

    // حساب المجاميع لكل حساب
    const accountTotals = new Map<number, { code: string; name: string; debit: number; credit: number }>();

    for (const line of lines) {
      const accountId = line.accountId;
      if (!accountTotals.has(accountId)) {
        accountTotals.set(accountId, {
          code: line.account.code,
          name: line.account.name,
          debit: 0,
          credit: 0,
        });
      }

      const totals = accountTotals.get(accountId)!;
      totals.debit += parseFloat(line.debit.toString());
      totals.credit += parseFloat(line.credit.toString());
    }

    // تحويل إلى مصفوفة وحساب الأرصدة
    const items: TrialBalanceItem[] = [];
    let totalDebit = 0;
    let totalCredit = 0;

    for (const [accountId, totals] of accountTotals.entries()) {
      const balance = totals.debit - totals.credit;
      const balanceType = balance >= 0 ? 'debit' : 'credit';

      items.push({
        accountCode: totals.code,
        accountName: totals.name,
        debit: totals.debit,
        credit: totals.credit,
        balance: Math.abs(balance),
        balanceType,
      });

      totalDebit += totals.debit;
      totalCredit += totals.credit;
    }

    // ترتيب حسب رقم الحساب
    items.sort((a, b) => a.accountCode.localeCompare(b.accountCode));

    const difference = Math.abs(totalDebit - totalCredit);
    const isBalanced = difference < 0.01;

    const result = {
      items,
      totalDebit,
      totalCredit,
      difference,
      isBalanced,
    };

    // حفظ النتيجة في الـ cache لمدة 5 دقائق
    await this.cacheManager.set(cacheKey, result, 300000);

    return result;
  }

  async getAccountStatement(accountId: number, startDate?: string, endDate?: string) {
    // إنشاء مفتاح cache فريد
    const cacheKey = `account_statement_${accountId}_${startDate || 'all'}_${endDate || 'all'}`;
    
    // محاولة الحصول على البيانات من الـ cache
    const cachedResult = await this.cacheManager.get(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }

    let query = this.journalEntryLineRepository
      .createQueryBuilder('line')
      .leftJoinAndSelect('line.journalEntry', 'entry')
      .leftJoinAndSelect('line.account', 'account')
      .where('line.accountId = :accountId', { accountId })
      .andWhere('entry.isPosted = :isPosted', { isPosted: true });

    if (startDate) {
      query = query.andWhere('entry.date >= :startDate', { startDate });
    }
    if (endDate) {
      query = query.andWhere('entry.date <= :endDate', { endDate });
    }

    query = query.orderBy('entry.date', 'ASC').addOrderBy('entry.id', 'ASC');

    const lines = await query.getMany();

    let balance = 0;
    const transactions = lines.map(line => {
      const debit = parseFloat(line.debit.toString());
      const credit = parseFloat(line.credit.toString());
      balance += debit - credit;

      return {
        date: line.journalEntry.date,
        entryNumber: line.journalEntry.entryNumber,
        description: line.description || line.journalEntry.description,
        debit,
        credit,
        balance,
      };
    });

    const account = await this.accountRepository.findOne({ where: { id: accountId } });

    const result = {
      account: {
        code: account?.code,
        name: account?.name,
      },
      transactions,
      totalDebit: lines.reduce((sum, line) => sum + parseFloat(line.debit.toString()), 0),
      totalCredit: lines.reduce((sum, line) => sum + parseFloat(line.credit.toString()), 0),
      finalBalance: balance,
    };

    // حفظ النتيجة في الـ cache لمدة 5 دقائق
    await this.cacheManager.set(cacheKey, result, 300000);

    return result;
  }
}
