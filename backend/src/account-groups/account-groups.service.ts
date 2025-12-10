import { Injectable } from '@nestjs/common';

export interface AccountGroup {
  id: number;
  code: string;
  name: string;
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
      name: 'العمليات النقدية',
      description: 'الصناديق والبنوك',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 2,
      code: 'G2',
      name: 'الموردين الرئيسيين',
      description: 'الموردين الأساسيين للشركة',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 3,
      code: 'G3',
      name: 'العملاء المميزين',
      description: 'العملاء ذوي الأولوية',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];
  private nextId = 4;

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
