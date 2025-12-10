import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common';
import { WarehouseGroupsService } from './warehouse-groups.service';
import { CreateWarehouseGroupDto } from './dto/create-warehouse-group.dto';
import { UpdateWarehouseGroupDto } from './dto/update-warehouse-group.dto';

@Controller('warehouse-groups')
export class WarehouseGroupsController {
  constructor(private readonly warehouseGroupsService: WarehouseGroupsService) {}

  @Post()
  create(@Body() createWarehouseGroupDto: CreateWarehouseGroupDto) {
    return this.warehouseGroupsService.create(createWarehouseGroupDto);
  }

  @Get()
  findAll() {
    return this.warehouseGroupsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.warehouseGroupsService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateWarehouseGroupDto: UpdateWarehouseGroupDto) {
    return this.warehouseGroupsService.update(+id, updateWarehouseGroupDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.warehouseGroupsService.remove(+id);
  }

  @Put(':id/toggle-status')
  toggleStatus(@Param('id') id: string) {
    return this.warehouseGroupsService.toggleStatus(+id);
  }
}
