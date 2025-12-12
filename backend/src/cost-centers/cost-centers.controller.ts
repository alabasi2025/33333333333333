import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { CostCentersService } from './cost-centers.service';
import { CostCenter } from './cost-center.entity';

@Controller('cost-centers')
export class CostCentersController {
  constructor(private readonly costCentersService: CostCentersService) {}

  @Get()
  async findAll(): Promise<CostCenter[]> {
    return await this.costCentersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<CostCenter> {
    return await this.costCentersService.findOne(id);
  }

  @Post()
  async create(@Body() data: Partial<CostCenter>): Promise<CostCenter> {
    return await this.costCentersService.create(data);
  }

  @Put(':id')
  async update(@Param('id') id: number, @Body() data: Partial<CostCenter>): Promise<CostCenter> {
    return await this.costCentersService.update(id, data);
  }

  @Delete(':id')
  async delete(@Param('id') id: number): Promise<void> {
    return await this.costCentersService.delete(id);
  }
}
