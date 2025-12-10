import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SupplierGroup } from './supplier-group.entity';

@Injectable()
export class SupplierGroupsService {
  constructor(
    @InjectRepository(SupplierGroup)
    private supplierGroupRepository: Repository<SupplierGroup>,
  ) {}

  async findAll(): Promise<SupplierGroup[]> {
    return this.supplierGroupRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
  }

  async findOne(id: number): Promise<SupplierGroup> {
    const group = await this.supplierGroupRepository.findOne({ where: { id } });
    if (!group) {
      throw new NotFoundException(`Supplier group with ID ${id} not found`);
    }
    return group;
  }

  async create(createDto: Partial<SupplierGroup>): Promise<SupplierGroup> {
    const count = await this.supplierGroupRepository.count();
    const code = `SUPG-${String(count + 1).padStart(4, '0')}`;

    const group = this.supplierGroupRepository.create({
      ...createDto,
      code,
    });

    return this.supplierGroupRepository.save(group);
  }

  async update(id: number, updateDto: Partial<SupplierGroup>): Promise<SupplierGroup> {
    await this.findOne(id);
    await this.supplierGroupRepository.update(id, updateDto);
    return this.findOne(id);
  }

  async delete(id: number): Promise<void> {
    const group = await this.findOne(id);
    await this.supplierGroupRepository.remove(group);
  }
}
