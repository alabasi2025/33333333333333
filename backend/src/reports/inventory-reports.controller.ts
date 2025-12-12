import { Controller, Get, Query, Param, ParseIntPipe } from '@nestjs/common';
import { InventoryReportsService } from './inventory-reports.service';

@Controller('reports/inventory')
export class InventoryReportsController {
  constructor(private readonly inventoryReportsService: InventoryReportsService) {}

  /**
   * GET /reports/inventory/stock-balance
   * تقرير أرصدة المخزون
   * 
   * Query Parameters:
   * - warehouseId?: number - تصفية حسب المخزن
   * - itemId?: number - تصفية حسب الصنف
   * - minQuantity?: number - الحد الأدنى للكمية
   */
  @Get('stock-balance')
  async getStockBalanceReport(
    @Query('warehouseId') warehouseId?: string,
    @Query('itemId') itemId?: string,
    @Query('minQuantity') minQuantity?: string,
  ) {
    return this.inventoryReportsService.getStockBalanceReport(
      warehouseId ? parseInt(warehouseId) : undefined,
      itemId ? parseInt(itemId) : undefined,
      minQuantity ? parseFloat(minQuantity) : undefined,
    );
  }

  /**
   * GET /reports/inventory/stock-movement
   * تقرير حركة المخزون
   * 
   * Query Parameters:
   * - startDate?: string - تاريخ البداية (YYYY-MM-DD)
   * - endDate?: string - تاريخ النهاية (YYYY-MM-DD)
   * - warehouseId?: number - تصفية حسب المخزن
   * - itemId?: number - تصفية حسب الصنف
   * - movementType?: string - نوع الحركة (in, out, transfer, adjustment)
   */
  @Get('stock-movement')
  async getStockMovementReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('warehouseId') warehouseId?: string,
    @Query('itemId') itemId?: string,
    @Query('movementType') movementType?: string,
  ) {
    return this.inventoryReportsService.getStockMovementReport(
      startDate,
      endDate,
      warehouseId ? parseInt(warehouseId) : undefined,
      itemId ? parseInt(itemId) : undefined,
      movementType,
    );
  }

  /**
   * GET /reports/inventory/by-warehouse/:warehouseId
   * تقرير المخزون حسب المخزن
   * 
   * Path Parameters:
   * - warehouseId: number - معرف المخزن
   */
  @Get('by-warehouse/:warehouseId')
  async getInventoryByWarehouse(
    @Param('warehouseId', ParseIntPipe) warehouseId: number,
  ) {
    return this.inventoryReportsService.getStockBalanceReport(warehouseId);
  }

  /**
   * GET /reports/inventory/slow-moving
   * تقرير الأصناف الراكدة
   * 
   * Query Parameters:
   * - days?: number - عدد الأيام (افتراضي: 90)
   */
  @Get('slow-moving')
  async getSlowMovingItemsReport(
    @Query('days') days?: string,
  ) {
    return this.inventoryReportsService.getSlowMovingReport(
      days ? parseInt(days) : 90,
    );
  }
}
