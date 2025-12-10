import { Injectable } from '@nestjs/common';

export interface Account {
  id: number;
  code: string;
  name: string;
  type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
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
      type: 'asset',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 2,
      code: '1100',
      name: 'الأصول المتداولة',
      type: 'asset',
      parentId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 3,
      code: '1110',
      name: 'النقدية',
      type: 'asset',
      parentId: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 4,
      code: '2000',
      name: 'الخصوم',
      type: 'liability',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 5,
      code: '3000',
      name: 'حقوق الملكية',
      type: 'equity',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 6,
      code: '4000',
      name: 'الإيرادات',
      type: 'revenue',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 7,
      code: '5000',
      name: 'المصروفات',
      type: 'expense',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];
  private nextId = 8;

  findAll(): Account[] {
    return this.accounts;
  }

  findOne(id: number): Account {
    return this.accounts.find((account) => account.id === id);
  }

  create(accountData: Partial<Account>): Account {
    const newAccount: Account = {
      id: this.nextId++,
      code: accountData.code,
      name: accountData.name,
      type: accountData.type,
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
