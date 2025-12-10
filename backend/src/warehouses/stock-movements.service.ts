import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StockMovement } from './stock-movement.entity';
import { StockBalance } from './stock-balance.entity';

@Injectable()
export class StockMovementsService {
  constructor(
    @InjectRepository(StockMovement)
    private movementRepository: Repository<StockMovement>,
    @InjectRepository(StockBalance)
    private balanceRepository: Repository<StockBalance>,
  ) {}

  async findAll(warehouseId?: number, itemId?: number): Promise<StockMovement[]> {
    const queryBuilder = this.movementRepository
      .createQueryBuilder('movement')
      .leftJoinAndSelect('movement.warehouse', 'warehouse')
      .leftJoinAndSelect('movement.item', 'item')
      .leftJoinAndSelect('movement.toWarehouse', 'toWarehouse')
      .leftJoinAndSelect('item.unit', 'unit');

    if (warehouseId) {
      queryBuilder.andWhere('movement.warehouseId = :warehouseId', { warehouseId });
    }

    if (itemId) {
      queryBuilder.andWhere('movement.itemId = :itemId', { itemId });
    }

    return queryBuilder
      .orderBy('movement.movementDate', 'DESC')
      .addOrderBy('movement.id', 'DESC')
      .getMany();
  }

  async findOne(id: number): Promise<StockMovement> {
    const movement = await this.movementRepository.findOne({
      where: { id },
      relations: ['warehouse', 'item', 'toWarehouse', 'item.unit'],
    });
    
    if (!movement) {
      throw new NotFoundException(`Stock movement with ID ${id} not found`);
    }
    
    return movement;
  }

  async create(movementData: Partial<StockMovement>): Promise<StockMovement> {
    // Generate reference number if not provided
    if (!movementData.referenceNumber) {
      movementData.referenceNumber = await this.generateReferenceNumber(movementData.movementType);
    }

    // Calculate total cost
    if (movementData.quantity && movementData.unitCost) {
      movementData.totalCost = Number(movementData.quantity) * Number(movementData.unitCost);
    }

    const movement = this.movementRepository.create(movementData);
    const savedMovement = await this.movementRepository.save(movement);

    // Update stock balances
    await this.updateStockBalances(savedMovement);

    return this.findOne(savedMovement.id);
  }

  private async generateReferenceNumber(movementType: string): Promise<string> {
    const prefix = this.getMovementPrefix(movementType);
    const count = await this.movementRepository.count({ where: { movementType } });
    return `${prefix}-${String(count + 1).padStart(6, '0')}`;
  }

  private getMovementPrefix(movementType: string): string {
    const prefixes = {
      'in': 'IN',
      'out': 'OUT',
      'transfer': 'TRF',
      'adjustment': 'ADJ',
    };
    return prefixes[movementType] || 'MOV';
  }

  private async updateStockBalances(movement: StockMovement): Promise<void> {
    const { warehouseId, itemId, quantity, unitCost, movementType, toWarehouseId } = movement;

    if (movementType === 'in') {
      await this.updateBalance(warehouseId, itemId, Number(quantity), Number(unitCost || 0));
    } else if (movementType === 'out') {
      await this.updateBalance(warehouseId, itemId, -Number(quantity), 0);
    } else if (movementType === 'transfer' && toWarehouseId) {
      await this.updateBalance(warehouseId, itemId, -Number(quantity), 0);
      await this.updateBalance(toWarehouseId, itemId, Number(quantity), Number(unitCost || 0));
    } else if (movementType === 'adjustment') {
      await this.updateBalance(warehouseId, itemId, Number(quantity), Number(unitCost || 0));
    }
  }

  private async updateBalance(warehouseId: number, itemId: number, quantityChange: number, unitCost: number): Promise<void> {
    let balance = await this.balanceRepository.findOne({
      where: { warehouseId, itemId },
    });

    if (!balance) {
      balance = this.balanceRepository.create({
        warehouseId,
        itemId,
        quantity: 0,
        averageCost: 0,
        totalValue: 0,
      });
    }

    const oldQuantity = Number(balance.quantity);
    const oldTotalValue = Number(balance.totalValue);
    const newQuantity = oldQuantity + quantityChange;

    if (quantityChange > 0 && unitCost > 0) {
      // Adding stock with cost
      const addedValue = quantityChange * unitCost;
      const newTotalValue = oldTotalValue + addedValue;
      balance.quantity = newQuantity;
      balance.totalValue = newTotalValue;
      balance.averageCost = newQuantity > 0 ? newTotalValue / newQuantity : 0;
    } else {
      // Removing stock or adjustment without cost
      balance.quantity = newQuantity;
      if (newQuantity > 0) {
        balance.totalValue = newQuantity * Number(balance.averageCost);
      } else {
        balance.totalValue = 0;
        balance.averageCost = 0;
      }
    }

    await this.balanceRepository.save(balance);
  }

  async getStockBalances(warehouseId?: number, itemId?: number): Promise<StockBalance[]> {
    const queryBuilder = this.balanceRepository
      .createQueryBuilder('balance')
      .leftJoinAndSelect('balance.warehouse', 'warehouse')
      .leftJoinAndSelect('balance.item', 'item')
      .leftJoinAndSelect('item.unit', 'unit');

    if (warehouseId) {
      queryBuilder.andWhere('balance.warehouseId = :warehouseId', { warehouseId });
    }

    if (itemId) {
      queryBuilder.andWhere('balance.itemId = :itemId', { itemId });
    }

    queryBuilder.andWhere('balance.quantity > 0');

    return queryBuilder
      .orderBy('warehouse.code', 'ASC')
      .addOrderBy('item.code', 'ASC')
      .getMany();
  }
}
