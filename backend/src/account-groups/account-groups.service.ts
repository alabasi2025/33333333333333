import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccountGroup } from './account-group.entity';

@Injectable()
export class AccountGroupsService {
  constructor(
    @InjectRepository(AccountGroup)
    private accountGroupRepository: Repository<AccountGroup>,
  ) {
    this.seedInitialData();
  }

  private async seedInitialData() {
    const count = await this.accountGroupRepository.count();
    if (count === 0) {
      const initialGroups = [
        {
          code: 'G1',
          name: 'العمليات النقدية',
          description: 'مجموعة الصناديق والبنوك',
        },
        {
          code: 'G2',
          name: 'الموردين الرئيسيين',
          description: 'مجموعة الموردين الأساسيين',
        },
      ];

      await this.accountGroupRepository.save(initialGroups);
    }
  }

  async findAll(unitId?: number): Promise<AccountGroup[]> {
    const where = unitId ? { unitId } : {};
    return await this.accountGroupRepository.find({
      where,
      order: { code: 'ASC' },
    });
  }

  async findOne(id: number): Promise<AccountGroup> {
    const group = await this.accountGroupRepository.findOne({
      where: { id },
    });
    
    if (!group) {
      throw new NotFoundException(`Account group with ID ${id} not found`);
    }
    
    return group;
  }

  async create(groupData: Partial<AccountGroup>): Promise<AccountGroup> {
    const group = this.accountGroupRepository.create(groupData);
    return await this.accountGroupRepository.save(group);
  }

  async update(id: number, groupData: Partial<AccountGroup>): Promise<AccountGroup> {
    await this.accountGroupRepository.update(id, groupData);
    return await this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const result = await this.accountGroupRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Account group with ID ${id} not found`);
    }
  }
}
