import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ItemsService } from './items.service';
import { Item } from './item.entity';

@Controller('items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Get()
  async findAll(@Query('category') category?: string): Promise<Item[]> {
    return await this.itemsService.findAll(category);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Item> {
    return await this.itemsService.findOne(id);
  }

  @Post()
  async create(@Body() itemData: Partial<Item>): Promise<Item> {
    return await this.itemsService.create(itemData);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() itemData: Partial<Item>,
  ): Promise<Item> {
    return await this.itemsService.update(id, itemData);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<{ success: boolean }> {
    await this.itemsService.remove(id);
    return { success: true };
  }

  @Put(':id/toggle-status')
  async toggleStatus(@Param('id', ParseIntPipe) id: number): Promise<Item> {
    return await this.itemsService.toggleStatus(id);
  }
}
