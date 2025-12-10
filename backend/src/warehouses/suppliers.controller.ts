import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { SuppliersService } from './suppliers.service';
import { Supplier } from './supplier.entity';

@Controller('api/suppliers')
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Get()
  findAll(): Promise<Supplier[]> {
    return this.suppliersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<Supplier> {
    return this.suppliersService.findOne(id);
  }

  @Post()
  create(@Body() createDto: Partial<Supplier>): Promise<Supplier> {
    return this.suppliersService.create(createDto);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() updateDto: Partial<Supplier>): Promise<Supplier> {
    return this.suppliersService.update(id, updateDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: number): Promise<void> {
    return this.suppliersService.delete(id);
  }
}
