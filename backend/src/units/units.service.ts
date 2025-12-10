import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Unit } from './unit.entity';

@Injectable()
export class UnitsService {
  constructor(
    @InjectRepository(Unit)
    private unitRepository: Repository<Unit>,
  ) {}

  findAll(): Promise<Unit[]> {
    return this.unitRepository.find({ relations: ['company', 'branches'] });
  }

  findOne(id: number): Promise<Unit> {
    return this.unitRepository.findOne({ where: { id }, relations: ['company', 'branches'] });
  }

  findByCompany(companyId: number): Promise<Unit[]> {
    return this.unitRepository.find({ where: { companyId }, relations: ['branches'] });
  }

  create(unit: Partial<Unit>): Promise<Unit> {
    const newUnit = this.unitRepository.create(unit);
    return this.unitRepository.save(newUnit);
  }

  async update(id: number, unit: Partial<Unit>): Promise<Unit> {
    await this.unitRepository.update(id, unit);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.unitRepository.delete(id);
  }
}
