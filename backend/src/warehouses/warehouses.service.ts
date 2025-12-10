import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Warehouse } from './warehouse.entity';

@Injectable()
export class WarehousesService {
  constructor(
    @InjectRepository(Warehouse)
    private warehouseRepository: Repository<Warehouse>,
  ) {}

  async findAll(): Promise<Warehouse[]> {
    return await this.warehouseRepository.find({
      relations: ['account', 'group'],
      order: { code: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Warehouse> {
    const warehouse = await this.warehouseRepository.findOne({
      where: { id },
      relations: ['account', 'group'],
    });
    
    if (!warehouse) {
      throw new NotFoundException(`Warehouse with ID ${id} not found`);
    }
    
    return warehouse;
  }

  async create(warehouseData: Partial<Warehouse>): Promise<Warehouse> {
    const warehouse = this.warehouseRepository.create(warehouseData);
    return await this.warehouseRepository.save(warehouse);
  }

  async update(id: number, warehouseData: Partial<Warehouse>): Promise<Warehouse> {
    await this.warehouseRepository.update(id, warehouseData);
    return await this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const result = await this.warehouseRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Warehouse with ID ${id} not found`);
    }
  }

  async toggleStatus(id: number): Promise<Warehouse> {
    const warehouse = await this.findOne(id);
    warehouse.isActive = !warehouse.isActive;
    return await this.warehouseRepository.save(warehouse);
  }
}
