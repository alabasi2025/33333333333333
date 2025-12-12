import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { StockBalance } from '../warehouses/stock-balance.entity';
import { StockMovement } from '../warehouses/stock-movement.entity';
import { Warehouse } from '../warehouses/warehouse.entity';
import { Item } from '../warehouses/item.entity';

export interface StockBalanceReportItem {
  warehouseCode: string;
  warehouseName: string;
  itemCode: string;
  itemName: string;
  unit: string;
  quantity: number;
  averageCost: number;
  totalValue: number;
}

export interface StockBalanceReport {
  items: StockBalanceReportItem[];
  totalQuantity: number;
  totalValue: number;
  warehouseCount: number;
  itemCount: number;
}

export interface StockMovementReportItem {
  date: Date;
  referenceNumber: string;
  movementType: string;
  movementTypeAr: string;
  warehouseCode: string;
  warehouseName: string;
  toWarehouseCode?: string;
  toWarehouseName?: string;
  itemCode: string;
  itemName: string;
  unit: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  notes?: string;
}

export interface StockMovementReport {
  items: StockMovementReportItem[];
  totalQuantityIn: number;
  totalQuantityOut: number;
  totalValueIn: number;
  totalValueOut: number;
  movementCount: number;
}

export interface InventoryByWarehouseItem {
  itemCode: string;
  itemName: string;
  unit: string;
  quantity: number;
  averageCost: number;
  totalValue: number;
}

export interface InventoryByWarehouse {
  warehouse: {
    code: string;
    name: string;
  };
  items: InventoryByWarehouseItem[];
  totalItems: number;
  totalQuantity: number;
  totalValue: number;
}

@Injectable()
export class InventoryReportsService {
  constructor(
    @InjectRepository(StockBalance)
    private stockBalanceRepository: Repository<StockBalance>,
    @InjectRepository(StockMovement)
    private stockMovementRepository: Repository<StockMovement>,
    @InjectRepository(Warehouse)
    private warehouseRepository: Repository<Warehouse>,
    @InjectRepository(Item)
    private itemRepository: Repository<Item>,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {}

  /**
   * تقرير أرصدة المخزون
   * يعرض الأرصدة الحالية لجميع الأصناف في جميع المخازن
   */
  async getStockBalanceReport(
    warehouseId?: number,
    itemId?: number,
    minQuantity?: number,
  ): Promise<StockBalanceReport> {
    const cacheKey = `stock_balance_report_${warehouseId || 'all'}_${itemId || 'all'}_${minQuantity || 'all'}`;
    
    const cachedResult = await this.cacheManager.get<StockBalanceReport>(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }

    let query = this.stockBalanceRepository
      .createQueryBuilder('balance')
      .leftJoinAndSelect('balance.warehouse', 'warehouse')
      .leftJoinAndSelect('balance.item', 'item');

    if (warehouseId) {
      query = query.where('balance.warehouseId = :warehouseId', { warehouseId });
    }

    if (itemId) {
      query = query.andWhere('balance.itemId = :itemId', { itemId });
    }

    if (minQuantity !== undefined) {
      query = query.andWhere('balance.quantity >= :minQuantity', { minQuantity });
    }

    const balances = await query.getMany();

    const items: StockBalanceReportItem[] = balances.map(balance => ({
      warehouseCode: balance.warehouse.code,
      warehouseName: balance.warehouse.name,
      itemCode: balance.item.code,
      itemName: balance.item.name,
      unit: balance.item.unit?.name || 'N/A',
      quantity: parseFloat(balance.quantity.toString()),
      averageCost: parseFloat(balance.averageCost.toString()),
      totalValue: parseFloat(balance.totalValue.toString()),
    }));

    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalValue = items.reduce((sum, item) => sum + item.totalValue, 0);
    const uniqueWarehouses = new Set(items.map(item => item.warehouseCode));
    const uniqueItems = new Set(items.map(item => item.itemCode));

    const result = {
      items: items.sort((a, b) => 
        a.warehouseCode.localeCompare(b.warehouseCode) || 
        a.itemCode.localeCompare(b.itemCode)
      ),
      totalQuantity,
      totalValue,
      warehouseCount: uniqueWarehouses.size,
      itemCount: uniqueItems.size,
    };

    await this.cacheManager.set(cacheKey, result, 300000); // 5 minutes
    return result;
  }

  /**
   * تقرير حركة المخزون
   * يعرض جميع حركات المخزون خلال فترة زمنية محددة
   */
  async getStockMovementReport(
    startDate?: string,
    endDate?: string,
    warehouseId?: number,
    itemId?: number,
    movementType?: string,
  ): Promise<StockMovementReport> {
    const cacheKey = `stock_movement_report_${startDate || 'all'}_${endDate || 'all'}_${warehouseId || 'all'}_${itemId || 'all'}_${movementType || 'all'}`;
    
    const cachedResult = await this.cacheManager.get<StockMovementReport>(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }

    let query = this.stockMovementRepository
      .createQueryBuilder('movement')
      .leftJoinAndSelect('movement.warehouse', 'warehouse')
      .leftJoinAndSelect('movement.item', 'item')
      .leftJoinAndSelect('movement.toWarehouse', 'toWarehouse');

    if (startDate && endDate) {
      query = query.where('movement.movementDate BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    } else if (startDate) {
      query = query.where('movement.movementDate >= :startDate', { startDate });
    } else if (endDate) {
      query = query.where('movement.movementDate <= :endDate', { endDate });
    }

    if (warehouseId) {
      query = query.andWhere(
        '(movement.warehouseId = :warehouseId OR movement.toWarehouseId = :warehouseId)',
        { warehouseId }
      );
    }

    if (itemId) {
      query = query.andWhere('movement.itemId = :itemId', { itemId });
    }

    if (movementType) {
      query = query.andWhere('movement.movementType = :movementType', { movementType });
    }

    query = query.orderBy('movement.movementDate', 'DESC')
      .addOrderBy('movement.id', 'DESC');

    const movements = await query.getMany();

    const movementTypeMap = {
      'in': 'إدخال',
      'out': 'إخراج',
      'transfer': 'نقل',
      'adjustment': 'تسوية',
    };

    const items: StockMovementReportItem[] = movements.map(movement => ({
      date: movement.movementDate,
      referenceNumber: movement.referenceNumber,
      movementType: movement.movementType,
      movementTypeAr: movementTypeMap[movement.movementType] || movement.movementType,
      warehouseCode: movement.warehouse.code,
      warehouseName: movement.warehouse.name,
      toWarehouseCode: movement.toWarehouse?.code,
      toWarehouseName: movement.toWarehouse?.name,
      itemCode: movement.item.code,
      itemName: movement.item.name,
      unit: movement.item.unit?.name || 'N/A',
      quantity: parseFloat(movement.quantity.toString()),
      unitCost: parseFloat(movement.unitCost?.toString() || '0'),
      totalCost: parseFloat(movement.totalCost?.toString() || '0'),
      notes: movement.notes,
    }));

    const totalQuantityIn = items
      .filter(item => item.movementType === 'in')
      .reduce((sum, item) => sum + item.quantity, 0);

    const totalQuantityOut = items
      .filter(item => item.movementType === 'out')
      .reduce((sum, item) => sum + item.quantity, 0);

    const totalValueIn = items
      .filter(item => item.movementType === 'in')
      .reduce((sum, item) => sum + item.totalCost, 0);

    const totalValueOut = items
      .filter(item => item.movementType === 'out')
      .reduce((sum, item) => sum + item.totalCost, 0);

    const result = {
      items,
      totalQuantityIn,
      totalQuantityOut,
      totalValueIn,
      totalValueOut,
      movementCount: items.length,
    };

    await this.cacheManager.set(cacheKey, result, 300000); // 5 minutes
    return result;
  }

  /**
   * تقرير المخزون حسب المخزن
   * يعرض جميع الأصناف الموجودة في مخزن محدد مع تفاصيلها
   */
  async getInventoryByWarehouse(warehouseId: number): Promise<InventoryByWarehouse> {
    const cacheKey = `inventory_by_warehouse_${warehouseId}`;
    
    const cachedResult = await this.cacheManager.get<InventoryByWarehouse>(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }

    const warehouse = await this.warehouseRepository.findOne({
      where: { id: warehouseId },
    });

    if (!warehouse) {
      throw new Error('المخزن غير موجود');
    }

    const balances = await this.stockBalanceRepository
      .createQueryBuilder('balance')
      .leftJoinAndSelect('balance.item', 'item')
      .where('balance.warehouseId = :warehouseId', { warehouseId })
      .andWhere('balance.quantity > 0')
      .getMany();

    const items: InventoryByWarehouseItem[] = balances.map(balance => ({
      itemCode: balance.item.code,
      itemName: balance.item.name,
      unit: balance.item.unit?.name || 'N/A',
      quantity: parseFloat(balance.quantity.toString()),
      averageCost: parseFloat(balance.averageCost.toString()),
      totalValue: parseFloat(balance.totalValue.toString()),
    }));

    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalValue = items.reduce((sum, item) => sum + item.totalValue, 0);

    const result = {
      warehouse: {
        code: warehouse.code,
        name: warehouse.name,
      },
      items: items.sort((a, b) => a.itemCode.localeCompare(b.itemCode)),
      totalItems: items.length,
      totalQuantity,
      totalValue,
    };

    await this.cacheManager.set(cacheKey, result, 300000); // 5 minutes
    return result;
  }

  /**
   * تقرير الأصناف الراكدة
   * يعرض الأصناف التي لم تتحرك خلال فترة زمنية محددة
   */
  async getSlowMovingItemsReport(days: number = 90): Promise<any> {
    const cacheKey = `slow_moving_items_${days}`;
    
    const cachedResult = await this.cacheManager.get(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    // الحصول على جميع الأصناف التي لديها رصيد
    const balances = await this.stockBalanceRepository
      .createQueryBuilder('balance')
      .leftJoinAndSelect('balance.item', 'item')
      .leftJoinAndSelect('balance.warehouse', 'warehouse')
      .where('balance.quantity > 0')
      .getMany();

    const slowMovingItems = [];

    for (const balance of balances) {
      // البحث عن آخر حركة لهذا الصنف في هذا المخزن
      const lastMovement = await this.stockMovementRepository
        .createQueryBuilder('movement')
        .where('movement.itemId = :itemId', { itemId: balance.itemId })
        .andWhere('movement.warehouseId = :warehouseId', { warehouseId: balance.warehouseId })
        .orderBy('movement.movementDate', 'DESC')
        .getOne();

      if (!lastMovement || lastMovement.movementDate < cutoffDate) {
        slowMovingItems.push({
          warehouseCode: balance.warehouse.code,
          warehouseName: balance.warehouse.name,
          itemCode: balance.item.code,
          itemName: balance.item.name,
          unit: balance.item.unit?.name || 'N/A',
          quantity: parseFloat(balance.quantity.toString()),
          averageCost: parseFloat(balance.averageCost.toString()),
          totalValue: parseFloat(balance.totalValue.toString()),
          lastMovementDate: lastMovement?.movementDate || null,
          daysSinceLastMovement: lastMovement 
            ? Math.floor((new Date().getTime() - new Date(lastMovement.movementDate).getTime()) / (1000 * 60 * 60 * 24))
            : null,
        });
      }
    }

    const result = {
      items: slowMovingItems.sort((a, b) => 
        (b.daysSinceLastMovement || Infinity) - (a.daysSinceLastMovement || Infinity)
      ),
      totalItems: slowMovingItems.length,
      totalValue: slowMovingItems.reduce((sum, item) => sum + item.totalValue, 0),
      cutoffDays: days,
    };

    await this.cacheManager.set(cacheKey, result, 600000); // 10 minutes
    return result;
  }
}
