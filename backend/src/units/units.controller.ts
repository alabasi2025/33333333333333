import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { UnitsService } from './units.service';
import { Unit } from './unit.entity';

@Controller('api/units')
export class UnitsController {
  constructor(private readonly unitsService: UnitsService) {}

  @Get()
  findAll(@Query('companyId') companyId?: string): Promise<Unit[]> {
    if (companyId) {
      return this.unitsService.findByCompany(+companyId);
    }
    return this.unitsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Unit> {
    return this.unitsService.findOne(+id);
  }

  @Post()
  create(@Body() unit: Partial<Unit>): Promise<Unit> {
    return this.unitsService.create(unit);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() unit: Partial<Unit>): Promise<Unit> {
    return this.unitsService.update(+id, unit);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.unitsService.remove(+id);
  }
}
