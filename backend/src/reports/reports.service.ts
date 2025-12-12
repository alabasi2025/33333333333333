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

  async getIncomeStatement(startDate: string, endDate: string) {
    // إنشاء مفتاح cache فريد
    const cacheKey = `income_statement_${startDate}_${endDate}`;
    
    // محاولة الحصول على البيانات من الـ cache
    const cachedResult = await this.cacheManager.get(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }

    // الحصول على حسابات الإيرادات (type = 'revenue')
    const revenueAccounts = await this.accountRepository.find({
      where: { type: 'revenue' }
    });

    // الحصول على حسابات المصروفات (type = 'expense')
    const expenseAccounts = await this.accountRepository.find({
      where: { type: 'expense' }
    });

    // حساب أرصدة الإيرادات
    const revenueItems = [];
    let totalRevenue = 0;

    for (const account of revenueAccounts) {
      const balance = await this.getAccountBalance(account.id, startDate, endDate);
      if (balance.credit > 0 || balance.debit > 0) {
        const netBalance = balance.credit - balance.debit;
        revenueItems.push({
          accountCode: account.code,
          accountName: account.name,
          amount: netBalance
        });
        totalRevenue += netBalance;
      }
    }

    // حساب أرصدة المصروفات
    const expenseItems = [];
    let totalExpenses = 0;

    for (const account of expenseAccounts) {
      const balance = await this.getAccountBalance(account.id, startDate, endDate);
      if (balance.debit > 0 || balance.credit > 0) {
        const netBalance = balance.debit - balance.credit;
        expenseItems.push({
          accountCode: account.code,
          accountName: account.name,
          amount: netBalance
        });
        totalExpenses += netBalance;
      }
    }

    // حساب صافي الدخل
    const netIncome = totalRevenue - totalExpenses;

    const result = {
      period: {
        startDate,
        endDate
      },
      revenue: {
        items: revenueItems.sort((a, b) => a.accountCode.localeCompare(b.accountCode)),
        total: totalRevenue
      },
      expenses: {
        items: expenseItems.sort((a, b) => a.accountCode.localeCompare(b.accountCode)),
        total: totalExpenses
      },
      netIncome
    };

    // حفظ النتيجة في الـ cache لمدة 5 دقائق
    await this.cacheManager.set(cacheKey, result, 300000);

    return result;
  }

  async getBalanceSheet(asOfDate: string) {
    // إنشاء مفتاح cache فريد
    const cacheKey = `balance_sheet_${asOfDate}`;
    
    // محاولة الحصول على البيانات من الـ cache
    const cachedResult = await this.cacheManager.get(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }

    // الحصول على حسابات الأصول
    const assetAccounts = await this.accountRepository.find({
      where: { type: 'asset' }
    });

    // الحصول على حسابات الخصوم
    const liabilityAccounts = await this.accountRepository.find({
      where: { type: 'liability' }
    });

    // الحصول على حسابات حقوق الملكية
    const equityAccounts = await this.accountRepository.find({
      where: { type: 'equity' }
    });

    // حساب أرصدة الأصول
    const assetItems = [];
    let totalAssets = 0;

    for (const account of assetAccounts) {
      const balance = await this.getAccountBalance(account.id, null, asOfDate);
      if (balance.debit > 0 || balance.credit > 0) {
        const netBalance = balance.debit - balance.credit;
        assetItems.push({
          accountCode: account.code,
          accountName: account.name,
          amount: netBalance
        });
        totalAssets += netBalance;
      }
    }

    // حساب أرصدة الخصوم
    const liabilityItems = [];
    let totalLiabilities = 0;

    for (const account of liabilityAccounts) {
      const balance = await this.getAccountBalance(account.id, null, asOfDate);
      if (balance.credit > 0 || balance.debit > 0) {
        const netBalance = balance.credit - balance.debit;
        liabilityItems.push({
          accountCode: account.code,
          accountName: account.name,
          amount: netBalance
        });
        totalLiabilities += netBalance;
      }
    }

    // حساب أرصدة حقوق الملكية
    const equityItems = [];
    let totalEquity = 0;

    for (const account of equityAccounts) {
      const balance = await this.getAccountBalance(account.id, null, asOfDate);
      if (balance.credit > 0 || balance.debit > 0) {
        const netBalance = balance.credit - balance.debit;
        equityItems.push({
          accountCode: account.code,
          accountName: account.name,
          amount: netBalance
        });
        totalEquity += netBalance;
      }
    }

    // التحقق من توازن المعادلة المحاسبية
    const totalLiabilitiesAndEquity = totalLiabilities + totalEquity;
    const difference = Math.abs(totalAssets - totalLiabilitiesAndEquity);
    const isBalanced = difference < 0.01;

    const result = {
      asOfDate,
      assets: {
        items: assetItems.sort((a, b) => a.accountCode.localeCompare(b.accountCode)),
        total: totalAssets
      },
      liabilities: {
        items: liabilityItems.sort((a, b) => a.accountCode.localeCompare(b.accountCode)),
        total: totalLiabilities
      },
      equity: {
        items: equityItems.sort((a, b) => a.accountCode.localeCompare(b.accountCode)),
        total: totalEquity
      },
      totalLiabilitiesAndEquity,
      difference,
      isBalanced
    };

    // حفظ النتيجة في الـ cache لمدة 5 دقائق
    await this.cacheManager.set(cacheKey, result, 300000);

    return result;
  }

  private async getAccountBalance(accountId: number, startDate?: string, endDate?: string) {
    let query = this.journalEntryLineRepository
      .createQueryBuilder('line')
      .leftJoinAndSelect('line.journalEntry', 'entry')
      .where('line.accountId = :accountId', { accountId })
      .andWhere('entry.isPosted = :isPosted', { isPosted: true });

    if (startDate) {
      query = query.andWhere('entry.date >= :startDate', { startDate });
    }
    if (endDate) {
      query = query.andWhere('entry.date <= :endDate', { endDate });
    }

    const lines = await query.getMany();

    const debit = lines.reduce((sum, line) => sum + parseFloat(line.debit.toString()), 0);
    const credit = lines.reduce((sum, line) => sum + parseFloat(line.credit.toString()), 0);

    return { debit, credit };
  }

  async getCashFlowStatement(startDate: string, endDate: string) {
    // إنشاء مفتاح cache فريد
    const cacheKey = `cash_flow_${startDate}_${endDate}`;
    
    // محاولة الحصول على البيانات من الـ cache
    const cachedResult = await this.cacheManager.get(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }

    // الحصول على حسابات النقدية والبنوك
    const cashAccounts = await this.accountRepository.find({
      where: [
        { subType: 'cash' },
        { subType: 'bank' }
      ]
    });

    // حساب الرصيد الافتتاحي (قبل تاريخ البداية)
    let openingBalance = 0;
    for (const account of cashAccounts) {
      const balance = await this.getAccountBalance(account.id, null, startDate);
      openingBalance += balance.debit - balance.credit;
    }

    // حساب الحركات خلال الفترة
    const cashFlowItems = [];
    let totalCashFlow = 0;

    for (const account of cashAccounts) {
      // الحصول على جميع القيود للحساب
      const query = this.journalEntryLineRepository
        .createQueryBuilder('line')
        .leftJoinAndSelect('line.journalEntry', 'entry')
        .where('line.accountId = :accountId', { accountId: account.id })
        .andWhere('entry.isPosted = :isPosted', { isPosted: true })
        .andWhere('entry.date >= :startDate', { startDate })
        .andWhere('entry.date <= :endDate', { endDate })
        .orderBy('entry.date', 'ASC');

      const lines = await query.getMany();

      for (const line of lines) {
        const debit = parseFloat(line.debit.toString());
        const credit = parseFloat(line.credit.toString());
        const netAmount = debit - credit;

        if (netAmount !== 0) {
          cashFlowItems.push({
            date: line.journalEntry.date,
            description: line.description || line.journalEntry.description,
            accountCode: account.code,
            accountName: account.name,
            amount: netAmount
          });
          totalCashFlow += netAmount;
        }
      }
    }

    // حساب الرصيد الختامي
    const closingBalance = openingBalance + totalCashFlow;

    const result = {
      period: {
        startDate,
        endDate
      },
      openingBalance,
      cashFlowItems: cashFlowItems.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
      totalCashFlow,
      closingBalance
    };

    // حفظ النتيجة في الـ cache لمدة 5 دقائق
    await this.cacheManager.set(cacheKey, result, 300000);

    return result;
  }
}
