import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { SupplierGroupsService } from './supplier-groups.service';
import { SupplierGroup } from './supplier-group.entity';

@Controller('api/supplier-groups')
export class SupplierGroupsController {
  constructor(private readonly supplierGroupsService: SupplierGroupsService) {}

  @Get()
  findAll(): Promise<SupplierGroup[]> {
    return this.supplierGroupsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<SupplierGroup> {
    return this.supplierGroupsService.findOne(id);
  }

  @Post()
  create(@Body() createDto: Partial<SupplierGroup>): Promise<SupplierGroup> {
    return this.supplierGroupsService.create(createDto);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() updateDto: Partial<SupplierGroup>): Promise<SupplierGroup> {
    return this.supplierGroupsService.update(id, updateDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: number): Promise<void> {
    return this.supplierGroupsService.delete(id);
  }
}
