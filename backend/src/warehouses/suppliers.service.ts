import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Supplier } from './supplier.entity';

@Injectable()
export class SuppliersService {
  constructor(
    @InjectRepository(Supplier)
    private supplierRepository: Repository<Supplier>,
  ) {}

  async findAll(): Promise<Supplier[]> {
    return this.supplierRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Supplier> {
    const supplier = await this.supplierRepository.findOne({ where: { id } });
    if (!supplier) {
      throw new NotFoundException(`Supplier with ID ${id} not found`);
    }
    return supplier;
  }

  async create(createDto: Partial<Supplier>): Promise<Supplier> {
    // توليد كود المورد
    const count = await this.supplierRepository.count();
    const code = `SUP-${String(count + 1).padStart(4, '0')}`;

    const supplier = this.supplierRepository.create({
      ...createDto,
      code,
    });

    return this.supplierRepository.save(supplier);
  }

  async update(id: number, updateDto: Partial<Supplier>): Promise<Supplier> {
    await this.findOne(id);
    await this.supplierRepository.update(id, updateDto);
    return this.findOne(id);
  }

  async delete(id: number): Promise<void> {
    const supplier = await this.findOne(id);
    await this.supplierRepository.remove(supplier);
  }
}
