import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { WarehousesService } from './warehouses.service';
import { Warehouse } from './warehouse.entity';

@Controller('warehouses')
export class WarehousesController {
  constructor(private readonly warehousesService: WarehousesService) {}

  @Get()
  async findAll(): Promise<Warehouse[]> {
    return await this.warehousesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Warehouse> {
    return await this.warehousesService.findOne(id);
  }

  @Post()
  async create(@Body() warehouseData: Partial<Warehouse>): Promise<Warehouse> {
    return await this.warehousesService.create(warehouseData);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() warehouseData: Partial<Warehouse>,
  ): Promise<Warehouse> {
    return await this.warehousesService.update(id, warehouseData);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<{ success: boolean }> {
    await this.warehousesService.remove(id);
    return { success: true };
  }

  @Put(':id/toggle-status')
  async toggleStatus(@Param('id', ParseIntPipe) id: number): Promise<Warehouse> {
    return await this.warehousesService.toggleStatus(id);
  }
}
