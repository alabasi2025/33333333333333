import { Injectable } from '@nestjs/common';

export interface AccountGroup {
  id: number;
  code: string;
  name: string;
  type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class AccountGroupsService {
  private groups: AccountGroup[] = [
    {
      id: 1,
      code: 'G1',
      name: 'مجموعة الأصول',
      type: 'asset',
      description: 'مجموعة حسابات الأصول',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 2,
      code: 'G2',
      name: 'مجموعة الخصوم',
      type: 'liability',
      description: 'مجموعة حسابات الخصوم',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];
  private nextId = 3;

  findAll(): AccountGroup[] {
    return this.groups;
  }

  findOne(id: number): AccountGroup {
    return this.groups.find((group) => group.id === id);
  }

  create(groupData: Partial<AccountGroup>): AccountGroup {
    const newGroup: AccountGroup = {
      id: this.nextId++,
      code: groupData.code,
      name: groupData.name,
      type: groupData.type,
      description: groupData.description,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.groups.push(newGroup);
    return newGroup;
  }

  update(id: number, groupData: Partial<AccountGroup>): AccountGroup {
    const index = this.groups.findIndex((group) => group.id === id);
    if (index !== -1) {
      this.groups[index] = {
        ...this.groups[index],
        ...groupData,
        updatedAt: new Date(),
      };
      return this.groups[index];
    }
    return null;
  }

  remove(id: number): boolean {
    const index = this.groups.findIndex((group) => group.id === id);
    if (index !== -1) {
      this.groups.splice(index, 1);
      return true;
    }
    return false;
  }
}
