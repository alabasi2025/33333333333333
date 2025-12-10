import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from './company.entity';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
  ) {}

  findAll(): Promise<Company[]> {
    return this.companyRepository.find({ relations: ['units'] });
  }

  findOne(id: number): Promise<Company> {
    return this.companyRepository.findOne({ where: { id }, relations: ['units'] });
  }

  create(company: Partial<Company>): Promise<Company> {
    const newCompany = this.companyRepository.create(company);
    return this.companyRepository.save(newCompany);
  }

  async update(id: number, company: Partial<Company>): Promise<Company> {
    await this.companyRepository.update(id, company);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.companyRepository.delete(id);
  }
}
