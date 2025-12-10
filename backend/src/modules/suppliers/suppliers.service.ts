import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Supplier } from '../../suppliers/supplier.entity';
import { CreateSupplierDto, UpdateSupplierDto } from '../../shared/dtos/supplier.dto';

@Injectable()
export class SuppliersService {
  constructor(
    @InjectRepository(Supplier)
    private supplierRepository: Repository<Supplier>,
  ) {}

  async findAll(unitId?: number): Promise<Supplier[]> {
    const where = unitId ? { unitId } : {};
    return await this.supplierRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Supplier> {
    const supplier = await this.supplierRepository.findOne({
      where: { id },
    });
    
    if (!supplier) {
      throw new NotFoundException(`Supplier with ID ${id} not found`);
    }
    
    return supplier;
  }

  async create(supplierData: CreateSupplierDto): Promise<Supplier> {
    const supplier = this.supplierRepository.create(supplierData);
    return await this.supplierRepository.save(supplier);
  }

  async update(id: number, supplierData: UpdateSupplierDto): Promise<Supplier> {
    await this.supplierRepository.update(id, supplierData);
    return await this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const result = await this.supplierRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Supplier with ID ${id} not found`);
    }
  }
}
