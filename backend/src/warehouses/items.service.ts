import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Item } from './item.entity';

@Injectable()
export class ItemsService {
  constructor(
    @InjectRepository(Item)
    private itemRepository: Repository<Item>,
  ) {}

  async findAll(category?: string): Promise<Item[]> {
    const where: any = {};
    
    if (category) {
      where.category = category;
    }
    
    return await this.itemRepository.find({
      where,
      relations: ['unit', 'account'],
      order: { code: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Item> {
    const item = await this.itemRepository.findOne({
      where: { id },
      relations: ['unit', 'account'],
    });
    
    if (!item) {
      throw new NotFoundException(`Item with ID ${id} not found`);
    }
    
    return item;
  }

  async create(itemData: Partial<Item>): Promise<Item> {
    const item = this.itemRepository.create(itemData);
    return await this.itemRepository.save(item);
  }

  async update(id: number, itemData: Partial<Item>): Promise<Item> {
    await this.itemRepository.update(id, itemData);
    return await this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const result = await this.itemRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Item with ID ${id} not found`);
    }
  }

  async toggleStatus(id: number): Promise<Item> {
    const item = await this.findOne(id);
    item.isActive = !item.isActive;
    return await this.itemRepository.save(item);
  }
}
