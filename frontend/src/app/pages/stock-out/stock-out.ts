import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface Warehouse {
  id: number;
  name: string;
  code: string;
}

interface Item {
  id: number;
  name: string;
  code: string;
  unit: string;
}

interface TransactionItem {
  itemId: number;
  itemName?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes?: string;
}

interface StockTransaction {
  id?: number;
  transactionNumber?: string;
  transactionType: 'out' | 'out';
  warehouseId: number;
  warehouse?: { id: number; name: string };
  warehouseName?: string;
  transactionDate: string;
  referenceNumber?: string;
  notes?: string;
  totalAmount?: number;
  isApproved?: boolean;
  journalEntryId?: number;
  items: (TransactionItem & { item?: { id: number; name: string } })[];
}

@Component({
  selector: 'app-stock-out',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './stock-out.html',
  styleUrls: ['./stock-out.css']
})
export class StockOutComponent implements OnInit {
  transactions: StockTransaction[] = [];
  warehouses: Warehouse[] = [];
  items: Item[] = [];
  showModal: boolean = false;
  
  currentTransaction: StockTransaction = {
    transactionType: 'out',
    warehouseId: 0,
    transactionDate: new Date().toISOString().split('T')[0],
    items: []
  };

  newItem: TransactionItem = {
    itemId: 0,
    quantity: 0,
    unitPrice: 0,
    totalPrice: 0
  };

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadTransactions();
    this.loadWarehouses();
    this.loadItems();
  }

  loadTransactions() {
    this.http.get<StockTransaction[]>(`${environment.apiUrl}/stock-transactions?type=out`)
      .subscribe({
        next: (data) => {
          this.transactions = data.map(t => ({
            ...t,
            warehouseName: t.warehouse?.name,
            items: t.items?.map(i => ({
              ...i,
              itemName: i.item?.name
            })) || []
          }));
        },
        error: (error) => console.error('خطأ في تحميل أوامر الصرف:', error)
      });
  }

  loadWarehouses() {
    this.http.get<Warehouse[]>(`${environment.apiUrl}/warehouses`)
      .subscribe({
        next: (data) => {
          this.warehouses = data;
        },
        error: (error) => console.error('خطأ في تحميل المخازن:', error)
      });
  }

  loadItems() {
    this.http.get<Item[]>(`${environment.apiUrl}/items`)
      .subscribe({
        next: (data) => {
          this.items = data;
        },
        error: (error) => console.error('خطأ في تحميل الأصناف:', error)
      });
  }

  openModal() {
    this.currentTransaction = {
      transactionType: 'out',
      warehouseId: 0,
      transactionDate: new Date().toISOString().split('T')[0],
      items: []
    };
    this.newItem = {
      itemId: 0,
      quantity: 0,
      unitPrice: 0,
      totalPrice: 0
    };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  addItem() {
    if (this.newItem.itemId && this.newItem.quantity > 0 && this.newItem.unitPrice > 0) {
      const item = this.items.find(i => i.id === this.newItem.itemId);
      this.currentTransaction.items.push({
        ...this.newItem,
        itemName: item?.name,
        totalPrice: this.newItem.quantity * this.newItem.unitPrice
      });
      
      this.newItem = {
        itemId: 0,
        quantity: 0,
        unitPrice: 0,
        totalPrice: 0
      };
    }
  }

  removeItem(index: number) {
    this.currentTransaction.items.splice(index, 1);
  }

  calculateItemTotal() {
    this.newItem.totalPrice = this.newItem.quantity * this.newItem.unitPrice;
  }

  getTotalAmount(): number {
    return this.currentTransaction.items.reduce((sum, item) => sum + item.totalPrice, 0);
  }

  saveTransaction() {
    if (!this.currentTransaction.warehouseId || this.currentTransaction.items.length === 0) {
      alert('يرجى اختيار المخزن وإضافة صنف واحد على الأقل');
      return;
    }

    const payload = {
      ...this.currentTransaction,
      totalAmount: this.getTotalAmount()
    };

    this.http.post(`${environment.apiUrl}/stock-transactions`, payload)
      .subscribe({
        next: () => {
          this.loadTransactions();
          this.closeModal();
          alert('تم إضافة أمر الصرف بنجاح');
        },
        error: (error) => {
          console.error('خطأ في حفظ أمر الصرف:', error);
          alert(error.error?.message || 'حدث خطأ أثناء حفظ أمر الصرف');
        }
      });
  }

  deleteTransaction(id: number) {
    if (confirm('هل أنت متأكد من حذف أمر الصرف؟')) {
      this.http.delete(`${environment.apiUrl}/stock-transactions/${id}`)
        .subscribe({
          next: () => {
            this.loadTransactions();
            alert('تم حذف أمر الصرف بنجاح');
          },
          error: (error) => {
            console.error('خطأ في حذف أمر الصرف:', error);
            alert(error.error?.message || 'حدث خطأ أثناء حذف أمر الصرف');
          }
        });
    }
  }
}
