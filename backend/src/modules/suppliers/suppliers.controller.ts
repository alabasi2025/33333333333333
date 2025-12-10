import { Controller, Get, Post, Put, Delete, Body, Param, HttpException, HttpStatus } from '@nestjs/common';
import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto, UpdateSupplierDto } from '../../shared/dtos/supplier.dto';

@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Get()
  findAll() {
    return this.suppliersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    const supplier = this.suppliersService.findOne(+id);
    if (!supplier) {
      throw new HttpException('Supplier not found', HttpStatus.NOT_FOUND);
    }
    return supplier;
  }

  @Post()
  create(@Body() dto: CreateSupplierDto) {
    return this.suppliersService.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSupplierDto) {
    const supplier = this.suppliersService.update(+id, dto);
    if (!supplier) {
      throw new HttpException('Supplier not found', HttpStatus.NOT_FOUND);
    }
    return supplier;
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    const success = this.suppliersService.delete(+id);
    if (!success) {
      throw new HttpException('Supplier not found', HttpStatus.NOT_FOUND);
    }
    return { message: 'Supplier deleted successfully' };
  }
}
