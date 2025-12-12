import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpParams } from '@angular/common/http';
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
  
  // Stock Balance Data
  stockBalanceItems: StockBalanceItem[] = [];
  stockBalanceSummary = {
    totalQuantity: 0,
    totalValue: 0,
    warehouseCount: 0,
    itemCount: 0
  };
  
  // Stock Movement Data
  stockMovementItems: StockMovementItem[] = [];
  stockMovementSummary = {
    totalQuantityIn: 0,
    totalQuantityOut: 0,
    totalQuantityTransfer: 0
  };
  
  // Slow Moving Data
  slowMovingItems: any[] = [];
  slowMovingSummary = {
    totalItems: 0,
    totalValue: 0
  };
  
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

  loadWarehouses() {
    this.http.get(`${environment.apiUrl}/warehouses`).subscribe({
      next: (response: any) => {
        this.warehouses = response;
      },
      error: (error) => {
        console.error('خطأ في تحميل المخازن:', error);
      }
    });
  }

  loadItems() {
    this.http.get(`${environment.apiUrl}/items`).subscribe({
      next: (response: any) => {
        this.items = response;
      },
      error: (error) => {
        console.error('خطأ في تحميل الأصناف:', error);
      }
    });
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

  loadStockBalanceReport() {
    this.loading = true;
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

    this.http.get(`${environment.apiUrl}/reports/inventory/stock-balance`, { params }).subscribe({
      next: (response: any) => {
        this.stockBalanceItems = response.items;
        this.stockBalanceSummary = {
          totalQuantity: response.totalQuantity,
          totalValue: response.totalValue,
          warehouseCount: response.warehouseCount,
          itemCount: response.itemCount
        };
        this.loading = false;
      },
      error: (error) => {
        console.error('خطأ في تحميل تقرير أرصدة المخزون:', error);
        alert('حدث خطأ في تحميل التقرير');
        this.loading = false;
      }
    });
  }

  loadStockMovementReport() {
    this.loading = true;
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

    this.http.get(`${environment.apiUrl}/reports/inventory/stock-movement`, { params }).subscribe({
      next: (response: any) => {
        this.stockMovementItems = response.items;
        this.stockMovementSummary = {
          totalQuantityIn: response.totalQuantityIn,
          totalQuantityOut: response.totalQuantityOut,
          totalQuantityTransfer: response.totalQuantityTransfer
        };
        this.loading = false;
      },
      error: (error) => {
        console.error('خطأ في تحميل تقرير حركة المخزون:', error);
        alert('حدث خطأ في تحميل التقرير');
        this.loading = false;
      }
    });
  }

  loadSlowMovingReport() {
    this.loading = true;
    let params = new HttpParams();
    params = params.set('days', this.slowMovingFilters.days.toString());

    this.http.get(`${environment.apiUrl}/reports/inventory/slow-moving`, { params }).subscribe({
      next: (response: any) => {
        this.slowMovingItems = response.items;
        this.slowMovingSummary = {
          totalItems: response.totalItems,
          totalValue: response.totalValue
        };
        this.loading = false;
      },
      error: (error) => {
        console.error('خطأ في تحميل تقرير الأصناف الراكدة:', error);
        alert('حدث خطأ في تحميل التقرير');
        this.loading = false;
      }
    });
  }

  searchBalance() {
    this.loadStockBalanceReport();
  }

  searchMovement() {
    this.loadStockMovementReport();
  }

  searchSlowMoving() {
    this.loadSlowMovingReport();
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

  resetSlowMovingFilters() {
    this.slowMovingFilters = {
      days: 90
    };
    this.loadSlowMovingReport();
  }

  print() {
    window.print();
  }

  exportExcel() {
    alert('ميزة التصدير إلى Excel قيد التطوير');
  }
}
