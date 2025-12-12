import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CostCenter } from './cost-center.entity';

@Injectable()
export class CostCentersService {
  constructor(
    @InjectRepository(CostCenter)
    private costCenterRepository: Repository<CostCenter>,
  ) {}

  async findAll(): Promise<CostCenter[]> {
    return await this.costCenterRepository.find({
      relations: ['parent', 'children'],
      order: { code: 'ASC' }
    });
  }

  async findOne(id: number): Promise<CostCenter> {
    const costCenter = await this.costCenterRepository.findOne({
      where: { id },
      relations: ['parent', 'children']
    });

    if (!costCenter) {
      throw new NotFoundException(`Cost Center with ID ${id} not found`);
    }

    return costCenter;
  }

  async create(data: Partial<CostCenter>): Promise<CostCenter> {
    const costCenter = this.costCenterRepository.create(data);
    return await this.costCenterRepository.save(costCenter);
  }

  async update(id: number, data: Partial<CostCenter>): Promise<CostCenter> {
    await this.findOne(id);
    await this.costCenterRepository.update(id, data);
    return await this.findOne(id);
  }

  async delete(id: number): Promise<void> {
    const costCenter = await this.findOne(id);
    await this.costCenterRepository.remove(costCenter);
  }
}
