import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';

interface StockBalanceItem {
  warehouseCode: string;
  warehouseName: string;
  itemCode: string;
  itemName: string;
  unit: string;
  quantity: number;
  averageCost: number;
  totalValue: number;
}

interface StockMovementItem {
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

interface Warehouse {
  id: number;
  code: string;
  name: string;
}

interface Item {
  id: number;
  code: string;
  name: string;
}

@Component({
  selector: 'app-inventory-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inventory-reports.component.html',
  styleUrls: ['./inventory-reports.component.css']
})
export class InventoryReportsComponent implements OnInit {
  activeTab: 'balance' | 'movement' | 'slow-moving' = 'balance';
  loading = false;
  
  // Stock Balance Report
  stockBalanceItems: StockBalanceItem[] = [];
  stockBalanceSummary: any = null;
  
  // Stock Movement Report
  stockMovementItems: StockMovementItem[] = [];
  stockMovementSummary: any = null;
  
  // Slow Moving Items Report
  slowMovingItems: any[] = [];
  slowMovingSummary: any = null;
  
  // Filters
  warehouses: Warehouse[] = [];
  items: Item[] = [];
  
  balanceFilters = {
    warehouseId: '',
    itemId: '',
    minQuantity: ''
  };
  
  movementFilters = {
    startDate: '',
    endDate: '',
    warehouseId: '',
    itemId: '',
    movementType: ''
  };
  
  slowMovingFilters = {
    days: 90
  };

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadWarehouses();
    this.loadItems();
    this.loadStockBalanceReport();
  }

  async loadWarehouses() {
    try {
      const response: any = await firstValueFrom(this.http.get(`${environment.apiUrl}/warehouses`));
      this.warehouses = response;
    } catch (error) {
      console.error('خطأ في تحميل المخازن:', error);
    }
  }

  async loadItems() {
    try {
      const response: any = await firstValueFrom(this.http.get(`${environment.apiUrl}/items`));
      this.items = response;
    } catch (error) {
      console.error('خطأ في تحميل الأصناف:', error);
    }
  }

  switchTab(tab: 'balance' | 'movement' | 'slow-moving') {
    this.activeTab = tab;
    
    if (tab === 'balance' && this.stockBalanceItems.length === 0) {
      this.loadStockBalanceReport();
    } else if (tab === 'movement' && this.stockMovementItems.length === 0) {
      this.loadStockMovementReport();
    } else if (tab === 'slow-moving' && this.slowMovingItems.length === 0) {
      this.loadSlowMovingReport();
    }
  }

  async loadStockBalanceReport() {
    this.loading = true;
    try {
      let params = new HttpParams();
      
      if (this.balanceFilters.warehouseId) {
        params = params.set('warehouseId', this.balanceFilters.warehouseId);
      }
      if (this.balanceFilters.itemId) {
        params = params.set('itemId', this.balanceFilters.itemId);
      }
      if (this.balanceFilters.minQuantity) {
        params = params.set('minQuantity', this.balanceFilters.minQuantity);
      }

      const response: any = await firstValueFrom(this.http.get(
        `${environment.apiUrl}/reports/inventory/stock-balance`,
        { params }
      ));

      this.stockBalanceItems = response.items;
      this.stockBalanceSummary = {
        totalQuantity: response.totalQuantity,
        totalValue: response.totalValue,
        warehouseCount: response.warehouseCount,
        itemCount: response.itemCount
      };
    } catch (error) {
      console.error('خطأ في تحميل تقرير أرصدة المخزون:', error);
      alert('حدث خطأ في تحميل التقرير');
    } finally {
      this.loading = false;
    }
  }

  async loadStockMovementReport() {
    this.loading = true;
    try {
      let params = new HttpParams();
      
      if (this.movementFilters.startDate) {
        params = params.set('startDate', this.movementFilters.startDate);
      }
      if (this.movementFilters.endDate) {
        params = params.set('endDate', this.movementFilters.endDate);
      }
      if (this.movementFilters.warehouseId) {
        params = params.set('warehouseId', this.movementFilters.warehouseId);
      }
      if (this.movementFilters.itemId) {
        params = params.set('itemId', this.movementFilters.itemId);
      }
      if (this.movementFilters.movementType) {
        params = params.set('movementType', this.movementFilters.movementType);
      }

      const response: any = await firstValueFrom(this.http.get(
        `${environment.apiUrl}/reports/inventory/stock-movement`,
        { params }
      ));

      this.stockMovementItems = response.items;
      this.stockMovementSummary = {
        totalQuantityIn: response.totalQuantityIn,
        totalQuantityOut: response.totalQuantityOut,
        totalValueIn: response.totalValueIn,
        totalValueOut: response.totalValueOut,
        movementCount: response.movementCount
      };
    } catch (error) {
      console.error('خطأ في تحميل تقرير حركة المخزون:', error);
      alert('حدث خطأ في تحميل التقرير');
    } finally {
      this.loading = false;
    }
  }

  async loadSlowMovingReport() {
    this.loading = true;
    try {
      let params = new HttpParams();
      params = params.set('days', this.slowMovingFilters.days.toString());

      const response: any = await firstValueFrom(this.http.get(
        `${environment.apiUrl}/reports/inventory/slow-moving`,
        { params }
      ));

      this.slowMovingItems = response.items;
      this.slowMovingSummary = {
        totalItems: response.totalItems,
        totalValue: response.totalValue,
        cutoffDays: response.cutoffDays
      };
    } catch (error) {
      console.error('خطأ في تحميل تقرير الأصناف الراكدة:', error);
      alert('حدث خطأ في تحميل التقرير');
    } finally {
      this.loading = false;
    }
  }

  resetBalanceFilters() {
    this.balanceFilters = {
      warehouseId: '',
      itemId: '',
      minQuantity: ''
    };
    this.loadStockBalanceReport();
  }

  resetMovementFilters() {
    this.movementFilters = {
      startDate: '',
      endDate: '',
      warehouseId: '',
      itemId: '',
      movementType: ''
    };
    this.loadStockMovementReport();
  }

  printReport() {
    window.print();
  }

  exportToExcel() {
    alert('ميزة التصدير إلى Excel قيد التطوير');
  }
}
