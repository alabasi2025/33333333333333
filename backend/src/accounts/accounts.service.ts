import { Injectable } from '@nestjs/common';

export interface Account {
  id: number;
  code: string;
  name: string;
  sortOrder?: number;
  type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  accountLevel: 'main' | 'sub';
  subType?: 'general' | 'cash' | 'bank' | 'supplier' | 'customer' | 'inventory';
  parentId?: number;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class AccountsService {
  private accounts: Account[] = [
    {
      id: 1,
      code: '1000',
      name: 'الأصول',
      sortOrder: 1,
      type: 'asset',
      accountLevel: 'main',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 2,
      code: '1100',
      name: 'الأصول المتداولة',
      sortOrder: 1,
      type: 'asset',
      accountLevel: 'sub',
      subType: 'general',
      parentId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 3,
      code: '1110',
      name: 'صندوق الرئيسي',
      sortOrder: 1,
      type: 'asset',
      accountLevel: 'sub',
      subType: 'cash',
      parentId: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 4,
      code: '1120',
      name: 'البنك الأهلي',
      sortOrder: 2,
      type: 'asset',
      accountLevel: 'sub',
      subType: 'bank',
      parentId: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 5,
      code: '2000',
      name: 'الخصوم',
      sortOrder: 2,
      type: 'liability',
      accountLevel: 'main',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 6,
      code: '3000',
      name: 'حقوق الملكية',
      sortOrder: 3,
      type: 'equity',
      accountLevel: 'main',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 7,
      code: '4000',
      name: 'الإيرادات',
      sortOrder: 4,
      type: 'revenue',
      accountLevel: 'main',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 8,
      code: '5000',
      name: 'المصروفات',
      sortOrder: 5,
      type: 'expense',
      accountLevel: 'main',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];
  private nextId = 9;

  findAll(): Account[] {
    return this.accounts.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  }

  findOne(id: number): Account {
    return this.accounts.find((account) => account.id === id);
  }

  create(accountData: Partial<Account>): Account {
    const newAccount: Account = {
      id: this.nextId++,
      code: accountData.code,
      name: accountData.name,
      sortOrder: accountData.sortOrder || 1,
      type: accountData.type,
      accountLevel: accountData.accountLevel || 'main',
      subType: accountData.subType,
      parentId: accountData.parentId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.accounts.push(newAccount);
    return newAccount;
  }

  update(id: number, accountData: Partial<Account>): Account {
    const index = this.accounts.findIndex((account) => account.id === id);
    if (index !== -1) {
      this.accounts[index] = {
        ...this.accounts[index],
        ...accountData,
        updatedAt: new Date(),
      };
      return this.accounts[index];
    }
    return null;
  }

  remove(id: number): boolean {
    const index = this.accounts.findIndex((account) => account.id === id);
    if (index !== -1) {
      this.accounts.splice(index, 1);
      return true;
    }
    return false;
  }
}
