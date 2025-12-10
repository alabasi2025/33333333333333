import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WarehouseGroup } from './warehouse-group.entity';
import { CreateWarehouseGroupDto } from './dto/create-warehouse-group.dto';
import { UpdateWarehouseGroupDto } from './dto/update-warehouse-group.dto';

@Injectable()
export class WarehouseGroupsService {
  constructor(
    @InjectRepository(WarehouseGroup)
    private warehouseGroupRepository: Repository<WarehouseGroup>,
  ) {}

  async create(createWarehouseGroupDto: CreateWarehouseGroupDto): Promise<WarehouseGroup> {
    // Check if code already exists
    const existing = await this.warehouseGroupRepository.findOne({
      where: { code: createWarehouseGroupDto.code },
    });

    if (existing) {
      throw new BadRequestException('كود المجموعة موجود بالفعل');
    }

    const warehouseGroup = this.warehouseGroupRepository.create(createWarehouseGroupDto);
    return await this.warehouseGroupRepository.save(warehouseGroup);
  }

  async findAll(): Promise<WarehouseGroup[]> {
    return await this.warehouseGroupRepository.find({
      relations: ['account', 'warehouses'],
      order: { id: 'ASC' },
    });
  }

  async findOne(id: number): Promise<WarehouseGroup> {
    const warehouseGroup = await this.warehouseGroupRepository.findOne({
      where: { id },
      relations: ['account', 'warehouses'],
    });

    if (!warehouseGroup) {
      throw new NotFoundException('مجموعة المخازن غير موجودة');
    }

    return warehouseGroup;
  }

  async update(id: number, updateWarehouseGroupDto: UpdateWarehouseGroupDto): Promise<WarehouseGroup> {
    const warehouseGroup = await this.findOne(id);

    // Check if code is being changed and if it already exists
    if (updateWarehouseGroupDto.code && updateWarehouseGroupDto.code !== warehouseGroup.code) {
      const existing = await this.warehouseGroupRepository.findOne({
        where: { code: updateWarehouseGroupDto.code },
      });

      if (existing) {
        throw new BadRequestException('كود المجموعة موجود بالفعل');
      }
    }

    Object.assign(warehouseGroup, updateWarehouseGroupDto);
    return await this.warehouseGroupRepository.save(warehouseGroup);
  }

  async remove(id: number): Promise<{ success: boolean }> {
    const warehouseGroup = await this.findOne(id);

    // Check if there are warehouses linked to this group
    if (warehouseGroup.warehouses && warehouseGroup.warehouses.length > 0) {
      throw new BadRequestException('لا يمكن حذف المجموعة لأنها مرتبطة بمخازن');
    }

    await this.warehouseGroupRepository.remove(warehouseGroup);
    return { success: true };
  }

  async toggleStatus(id: number): Promise<WarehouseGroup> {
    const warehouseGroup = await this.findOne(id);
    warehouseGroup.isActive = !warehouseGroup.isActive;
    return await this.warehouseGroupRepository.save(warehouseGroup);
  }
}
