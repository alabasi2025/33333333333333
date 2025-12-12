import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { StockBalance } from '../warehouses/stock-balance.entity';
import { StockTransaction } from '../warehouses/stock-transaction.entity';
import { StockTransactionItem } from '../warehouses/stock-transaction-item.entity';
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

@Injectable()
export class InventoryReportsService {
  constructor(
    @InjectRepository(StockBalance)
    private readonly stockBalanceRepository: Repository<StockBalance>,
    @InjectRepository(StockTransaction)
    private readonly stockTransactionRepository: Repository<StockTransaction>,
    @InjectRepository(Warehouse)
    private readonly warehouseRepository: Repository<Warehouse>,
    @InjectRepository(Item)
    private readonly itemRepository: Repository<Item>,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  /**
   * تقرير أرصدة المخزون
   * يعرض الأرصدة الحالية لجميع الأصناف في المخازن
   */
  async getStockBalanceReport(
    warehouseId?: number,
    itemId?: number,
    minQuantity?: number,
  ): Promise<StockBalanceReport> {
    const cacheKey = `stock_balance_report_${warehouseId || 'all'}_${itemId || 'all'}_${minQuantity || 0}`;
    
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

    if (minQuantity) {
      query = query.andWhere('balance.quantity >= :minQuantity', { minQuantity });
    }

    query = query.orderBy('warehouse.name', 'ASC')
      .addOrderBy('item.name', 'ASC');

    const balances = await query.getMany();

    const items: StockBalanceReportItem[] = balances.map(balance => ({
      warehouseCode: balance.warehouse.code,
      warehouseName: balance.warehouse.name,
      itemCode: balance.item.code,
      itemName: balance.item.name,
      unit: balance.item.unit?.name || 'N/A',
      quantity: parseFloat(balance.quantity.toString()),
      averageCost: parseFloat(balance.averageCost?.toString() || '0'),
      totalValue: parseFloat(balance.quantity.toString()) * parseFloat(balance.averageCost?.toString() || '0'),
    }));

    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalValue = items.reduce((sum, item) => sum + item.totalValue, 0);
    
    const uniqueWarehouses = new Set(items.map(item => item.warehouseCode));
    const uniqueItems = new Set(items.map(item => item.itemCode));

    const result = {
      items,
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
   * يعرض جميع حركات المخزون (أوامر التوريد والصرف) خلال فترة زمنية محددة
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

    let query = this.stockTransactionRepository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.warehouse', 'warehouse')
      .leftJoinAndSelect('transaction.items', 'transactionItems')
      .leftJoinAndSelect('transactionItems.item', 'item');

    if (startDate && endDate) {
      query = query.where('transaction.transactionDate BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    } else if (startDate) {
      query = query.where('transaction.transactionDate >= :startDate', { startDate });
    } else if (endDate) {
      query = query.where('transaction.transactionDate <= :endDate', { endDate });
    }

    if (warehouseId) {
      query = query.andWhere('transaction.warehouseId = :warehouseId', { warehouseId });
    }

    if (movementType) {
      query = query.andWhere('transaction.transactionType = :movementType', { movementType });
    }

    query = query.orderBy('transaction.transactionDate', 'DESC')
      .addOrderBy('transaction.id', 'DESC');

    const transactions = await query.getMany();

    const movementTypeMap = {
      'in': 'إدخال',
      'out': 'إخراج',
    };

    const items: StockMovementReportItem[] = [];
    
    for (const transaction of transactions) {
      for (const transactionItem of transaction.items) {
        // تصفية حسب itemId إذا تم تحديده
        if (itemId && transactionItem.itemId !== itemId) {
          continue;
        }

        items.push({
          date: transaction.transactionDate,
          referenceNumber: transaction.referenceNumber || transaction.transactionNumber,
          movementType: transaction.transactionType,
          movementTypeAr: movementTypeMap[transaction.transactionType] || transaction.transactionType,
          warehouseCode: transaction.warehouse.code,
          warehouseName: transaction.warehouse.name,
          itemCode: transactionItem.item.code,
          itemName: transactionItem.item.name,
          unit: transactionItem.item.unit?.name || 'N/A',
          quantity: parseFloat(transactionItem.quantity.toString()),
          unitCost: parseFloat(transactionItem.unitPrice?.toString() || '0'),
          totalCost: parseFloat(transactionItem.totalPrice?.toString() || '0'),
          notes: transaction.notes,
        });
      }
    }

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
   * تقرير الأصناف الراكدة
   * يعرض الأصناف التي لم تتحرك لفترة محددة
   */
  async getSlowMovingReport(days: number = 90): Promise<any> {
    const cacheKey = `slow_moving_report_${days}`;
    
    const cachedResult = await this.cacheManager.get(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    // جلب جميع الأرصدة
    const balances = await this.stockBalanceRepository
      .createQueryBuilder('balance')
      .leftJoinAndSelect('balance.warehouse', 'warehouse')
      .leftJoinAndSelect('balance.item', 'item')
      .where('balance.quantity > 0')
      .getMany();

    const slowMovingItems = [];

    for (const balance of balances) {
      // البحث عن آخر حركة لهذا الصنف في هذا المخزن
      const lastTransaction = await this.stockTransactionRepository
        .createQueryBuilder('transaction')
        .leftJoinAndSelect('transaction.items', 'transactionItems')
        .where('transaction.warehouseId = :warehouseId', { warehouseId: balance.warehouseId })
        .andWhere('transactionItems.itemId = :itemId', { itemId: balance.itemId })
        .orderBy('transaction.transactionDate', 'DESC')
        .getOne();

      const lastMovementDate = lastTransaction?.transactionDate || new Date();
      const daysSinceLastMovement = Math.floor(
        (new Date().getTime() - new Date(lastMovementDate).getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysSinceLastMovement >= days) {
        slowMovingItems.push({
          warehouseCode: balance.warehouse.code,
          warehouseName: balance.warehouse.name,
          itemCode: balance.item.code,
          itemName: balance.item.name,
          unit: balance.item.unit?.name || 'N/A',
          quantity: parseFloat(balance.quantity.toString()),
          averageCost: parseFloat(balance.averageCost?.toString() || '0'),
          totalValue: parseFloat(balance.quantity.toString()) * parseFloat(balance.averageCost?.toString() || '0'),
          lastMovementDate,
          daysSinceLastMovement,
        });
      }
    }

    const totalValue = slowMovingItems.reduce((sum, item) => sum + item.totalValue, 0);

    const result = {
      items: slowMovingItems,
      totalItems: slowMovingItems.length,
      totalValue,
      cutoffDays: days,
    };

    await this.cacheManager.set(cacheKey, result, 300000); // 5 minutes
    return result;
  }
}
