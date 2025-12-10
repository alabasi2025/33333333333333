import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpException, HttpStatus } from '@nestjs/common';
import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto, UpdateSupplierDto } from '../../shared/dtos/supplier.dto';

@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Get()
  async findAll(@Query('unitId') unitId?: string) {
    return await this.suppliersService.findAll(unitId ? +unitId : undefined);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.suppliersService.findOne(+id);
  }

  @Post()
  async create(@Body() dto: CreateSupplierDto) {
    return await this.suppliersService.create(dto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateSupplierDto) {
    return await this.suppliersService.update(+id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.suppliersService.remove(+id);
    return { success: true };
  }
}
