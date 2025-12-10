import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface WarehouseGroup {
  id: number;
  name: string;
  code: string;
}

interface Warehouse {
  id: number;
  name: string;
  code: string;
  accountId?: number;
  account?: any;
  groupId?: number;
  group?: WarehouseGroup;
  description?: string;
  location?: string;
  managerName?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

@Component({
  selector: 'app-warehouses',
  imports: [CommonModule, FormsModule],
  templateUrl: './warehouses.html',
  styleUrl: './warehouses.css'
})
export class WarehousesComponent implements OnInit {
  warehouses: Warehouse[] = [];
  filteredWarehouses: Warehouse[] = [];
  accounts: any[] = [];
  warehouseGroups: WarehouseGroup[] = [];
  searchTerm: string = '';
  showModal: boolean = false;
  isEditMode: boolean = false;
  
  currentWarehouse: Partial<Warehouse> = {
    name: '',
    code: '',
    description: '',
    location: '',
    managerName: '',
    isActive: true
  };

  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit() {
    this.loadWarehouses();
    this.loadAccounts();
    this.loadWarehouseGroups();
  }

  loadWarehouses() {
    this.http.get<Warehouse[]>(`${environment.apiUrl}/warehouses`)
      .subscribe({
        next: (data) => {
          this.warehouses = data;
          this.filteredWarehouses = data;
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Error loading warehouses:', err)
      });
  }

  loadAccounts() {
    this.http.get<any[]>(`${environment.apiUrl}/accounts`)
      .subscribe({
        next: (data) => {
          this.accounts = data.filter(acc => acc.isActive);
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Error loading accounts:', err)
      });
  }

  loadWarehouseGroups() {
    this.http.get<WarehouseGroup[]>(`${environment.apiUrl}/warehouse-groups`)
      .subscribe({
        next: (data) => {
          this.warehouseGroups = data.filter(g => g.isActive);
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Error loading warehouse groups:', err)
      });
  }

  filterWarehouses() {
    if (!this.searchTerm) {
      this.filteredWarehouses = this.warehouses;
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredWarehouses = this.warehouses.filter(w =>
        w.name.toLowerCase().includes(term) ||
        w.code.toLowerCase().includes(term) ||
        (w.location && w.location.toLowerCase().includes(term))
      );
    }
  }

  openModal(warehouse?: Warehouse) {
    if (warehouse) {
      this.isEditMode = true;
      this.currentWarehouse = { ...warehouse };
    } else {
      this.isEditMode = false;
      this.currentWarehouse = {
        name: '',
        code: '',
        description: '',
        location: '',
        managerName: '',
        isActive: true
      };
    }
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.currentWarehouse = {
      name: '',
      code: '',
      description: '',
      location: '',
      managerName: '',
      isActive: true
    };
  }

  saveWarehouse() {
    if (!this.currentWarehouse.name || !this.currentWarehouse.code) {
      alert('الرجاء إدخال الاسم والكود');
      return;
    }

    const request = this.isEditMode
      ? this.http.put(`${environment.apiUrl}/warehouses/${this.currentWarehouse.id}`, this.currentWarehouse)
      : this.http.post(`${environment.apiUrl}/warehouses`, this.currentWarehouse);

    request.subscribe({
      next: () => {
        this.loadWarehouses();
        this.closeModal();
      },
      error: (err) => {
        console.error('Error saving warehouse:', err);
        alert('حدث خطأ أثناء الحفظ');
      }
    });
  }

  deleteWarehouse(id: number) {
    if (confirm('هل أنت متأكد من حذف هذا المخزن؟')) {
      this.http.delete(`${environment.apiUrl}/warehouses/${id}`)
        .subscribe({
          next: () => this.loadWarehouses(),
          error: (err) => {
            console.error('Error deleting warehouse:', err);
            alert('حدث خطأ أثناء الحذف');
          }
        });
    }
  }

  toggleStatus(warehouse: Warehouse) {
    this.http.put(`${environment.apiUrl}/warehouses/${warehouse.id}/toggle-status`, {})
      .subscribe({
        next: () => this.loadWarehouses(),
        error: (err) => console.error('Error toggling status:', err)
      });
  }

  getAccountName(accountId?: number): string {
    if (!accountId) return '-';
    const account = this.accounts.find(a => a.id === accountId);
    return account ? `${account.code} - ${account.name}` : '-';
  }
}
