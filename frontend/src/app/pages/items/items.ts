import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface Item {
  id: number;
  name: string;
  code: string;
  category?: string;
  unitId?: number;
  unit?: any;
  accountId?: number;
  account?: any;
  unitPrice?: number;
  minStockLevel?: number;
  maxStockLevel?: number;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

@Component({
  selector: 'app-items',
  imports: [CommonModule, FormsModule],
  templateUrl: './items.html',
  styleUrl: './items.css'
})
export class ItemsComponent implements OnInit {
  items: Item[] = [];
  filteredItems: Item[] = [];
  units: any[] = [];
  accounts: any[] = [];
  categories: string[] = ['مواد خام', 'منتجات تامة', 'قطع غيار', 'مستلزمات', 'أخرى'];
  searchTerm: string = '';
  selectedCategory: string = '';
  showModal: boolean = false;
  isEditMode: boolean = false;
  
  currentItem: Partial<Item> = {
    name: '',
    code: '',
    category: '',
    unitPrice: 0,
    minStockLevel: 0,
    maxStockLevel: 0,
    isActive: true
  };

  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit() {
    this.loadItems();
    this.loadUnits();
    this.loadAccounts();
  }

  loadItems() {
    const url = this.selectedCategory 
      ? `${environment.apiUrl}/items?category=${this.selectedCategory}`
      : `${environment.apiUrl}/items`;
      
    this.http.get<Item[]>(url)
      .subscribe({
        next: (data) => {
          this.items = data;
          this.filteredItems = data;
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Error loading items:', err)
      });
  }

  loadUnits() {
    this.http.get<any[]>(`${environment.apiUrl}/units`)
      .subscribe({
        next: (data) => {
          this.units = data.filter(u => u.isActive);
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Error loading units:', err)
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

  filterItems() {
    if (!this.searchTerm) {
      this.filteredItems = this.items;
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredItems = this.items.filter(item =>
        item.name.toLowerCase().includes(term) ||
        item.code.toLowerCase().includes(term) ||
        (item.category && item.category.toLowerCase().includes(term))
      );
    }
  }

  filterByCategory() {
    this.loadItems();
  }

  openModal(item?: Item) {
    if (item) {
      this.isEditMode = true;
      this.currentItem = { ...item };
    } else {
      this.isEditMode = false;
      this.currentItem = {
        name: '',
        code: '',
        category: '',
        unitPrice: 0,
        minStockLevel: 0,
        maxStockLevel: 0,
        isActive: true
      };
    }
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.currentItem = {
      name: '',
      code: '',
      category: '',
      unitPrice: 0,
      minStockLevel: 0,
      maxStockLevel: 0,
      isActive: true
    };
  }

  saveItem() {
    if (!this.currentItem.name || !this.currentItem.code) {
      alert('الرجاء إدخال الاسم والكود');
      return;
    }

    const request = this.isEditMode
      ? this.http.put(`${environment.apiUrl}/items/${this.currentItem.id}`, this.currentItem)
      : this.http.post(`${environment.apiUrl}/items`, this.currentItem);

    request.subscribe({
      next: () => {
        this.loadItems();
        this.closeModal();
      },
      error: (err) => {
        console.error('Error saving item:', err);
        alert('حدث خطأ أثناء الحفظ');
      }
    });
  }

  deleteItem(id: number) {
    if (confirm('هل أنت متأكد من حذف هذا الصنف؟')) {
      this.http.delete(`${environment.apiUrl}/items/${id}`)
        .subscribe({
          next: () => this.loadItems(),
          error: (err) => {
            console.error('Error deleting item:', err);
            alert('حدث خطأ أثناء الحذف');
          }
        });
    }
  }

  toggleStatus(item: Item) {
    this.http.put(`${environment.apiUrl}/items/${item.id}/toggle-status`, {})
      .subscribe({
        next: () => this.loadItems(),
        error: (err) => console.error('Error toggling status:', err)
      });
  }

  getUnitName(unitId?: number): string {
    if (!unitId) return '-';
    const unit = this.units.find(u => u.id === unitId);
    return unit ? unit.name : '-';
  }

  getAccountName(accountId?: number): string {
    if (!accountId) return '-';
    const account = this.accounts.find(a => a.id === accountId);
    return account ? `${account.code} - ${account.name}` : '-';
  }
}
