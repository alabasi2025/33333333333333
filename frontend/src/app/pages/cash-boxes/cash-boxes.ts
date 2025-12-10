import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface CashBox {
  id: number;
  name: string;
  code: string;
  accountId?: number;
  description?: string;
  openingBalance: number;
  currentBalance: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

@Component({
  selector: 'app-cash-boxes',
  imports: [CommonModule, FormsModule],
  templateUrl: './cash-boxes.html',
  styleUrl: './cash-boxes.css'
})
export class CashBoxesComponent implements OnInit {
  cashBoxes: CashBox[] = [];
  filteredCashBoxes: CashBox[] = [];
  searchTerm: string = '';
  showModal: boolean = false;
  isEditMode: boolean = false;
  
  currentCashBox: Partial<CashBox> = {
    name: '',
    code: '',
    description: '',
    openingBalance: 0,
    isActive: true
  };

  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);

  constructor() {
    console.log('🚀 CashBoxesComponent constructor called');
  }

  ngOnInit() {
    this.loadCashBoxes();
  }

  loadCashBoxes() {
    console.log('📦 Loading cash boxes from API...');
    this.http.get<CashBox[]>(`${environment.apiUrl}/cash-boxes`)
      .subscribe({
        next: (data) => {
          console.log('✅ Cash boxes received:', data);
          console.log('📏 Data length:', data.length);
          this.cashBoxes = data;
          this.filteredCashBoxes = data;
          
          // إجبار Angular على تحديث الواجهة
          this.cdr.detectChanges();
          console.log('✅ Change detection triggered!');
        },
        error: (err) => {
          console.error('❌ Error loading cash boxes:', err);
        }
      });
  }

  searchCashBoxes() {
    if (!this.searchTerm) {
      this.filteredCashBoxes = this.cashBoxes;
      return;
    }
    
    const term = this.searchTerm.toLowerCase();
    this.filteredCashBoxes = this.cashBoxes.filter(box =>
      box.name.toLowerCase().includes(term) ||
      box.code.toLowerCase().includes(term) ||
      (box.description && box.description.toLowerCase().includes(term))
    );
  }

  openModal(cashBox?: CashBox) {
    this.showModal = true;
    if (cashBox) {
      this.isEditMode = true;
      this.currentCashBox = { ...cashBox };
    } else {
      this.isEditMode = false;
      this.currentCashBox = {
        name: '',
        code: '',
        description: '',
        openingBalance: 0,
        isActive: true
      };
    }
  }

  closeModal() {
    this.showModal = false;
    this.currentCashBox = {
      name: '',
      code: '',
      description: '',
      openingBalance: 0,
      isActive: true
    };
  }

  saveCashBox() {
    console.log('💾 saveCashBox called');
    console.log('📋 isEditMode:', this.isEditMode);
    console.log('📦 currentCashBox:', this.currentCashBox);
    
    if (this.isEditMode && this.currentCashBox.id) {
      console.log('🔄 Updating cash box ID:', this.currentCashBox.id);
      this.http.put(`${environment.apiUrl}/cash-boxes/${this.currentCashBox.id}`, this.currentCashBox)
        .subscribe({
          next: () => {
            console.log('✅ Cash box updated successfully');
            alert('✅ تم تحديث الصندوق بنجاح');
            this.loadCashBoxes();
            this.closeModal();
          },
          error: (err) => {
            console.error('❌ Error updating cash box:', err);
            alert('❌ خطأ في تحديث الصندوق: ' + (err.error?.message || err.message));
          }
        });
    } else {
      console.log('➕ Creating new cash box');
      console.log('📤 POST URL:', `${environment.apiUrl}/cash-boxes`);
      console.log('📦 Data to send:', this.currentCashBox);
      
      this.http.post(`${environment.apiUrl}/cash-boxes`, this.currentCashBox)
        .subscribe({
          next: (response) => {
            console.log('✅ Cash box created successfully:', response);
            alert('✅ تمت إضافة الصندوق بنجاح');
            this.loadCashBoxes();
            this.closeModal();
          },
          error: (err) => {
            console.error('❌ Error creating cash box:', err);
            console.error('❌ Error details:', err.error);
            alert('❌ خطأ في إضافة الصندوق: ' + (err.error?.message || err.message));
          }
        });
    }
  }

  deleteCashBox(id: number) {
    if (confirm('هل أنت متأكد من حذف هذا الصندوق؟')) {
      this.http.delete(`${environment.apiUrl}/cash-boxes/${id}`)
        .subscribe({
          next: () => this.loadCashBoxes(),
          error: (err) => console.error('Error deleting cash box:', err)
        });
    }
  }

  toggleStatus(cashBox: CashBox) {
    this.http.put(`${environment.apiUrl}/cash-boxes/${cashBox.id}`, {
      ...cashBox,
      isActive: !cashBox.isActive
    }).subscribe({
      next: () => this.loadCashBoxes(),
      error: (err) => console.error('Error updating status:', err)
    });
  }
}
