import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Branch } from './branch.entity';

@Injectable()
export class BranchesService {
  constructor(
    @InjectRepository(Branch)
    private branchRepository: Repository<Branch>,
  ) {}

  findAll(): Promise<Branch[]> {
    return this.branchRepository.find({ relations: ['unit'] });
  }

  findOne(id: number): Promise<Branch> {
    return this.branchRepository.findOne({ where: { id }, relations: ['unit'] });
  }

  findByUnit(unitId: number): Promise<Branch[]> {
    return this.branchRepository.find({ where: { unitId } });
  }

  create(branch: Partial<Branch>): Promise<Branch> {
    const newBranch = this.branchRepository.create(branch);
    return this.branchRepository.save(newBranch);
  }

  async update(id: number, branch: Partial<Branch>): Promise<Branch> {
    await this.branchRepository.update(id, branch);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.branchRepository.delete(id);
  }
}
