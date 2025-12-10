import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface CashBox {
  id: number;
  unitId: number;
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
    isActive: true,
    unitId: 1
  };

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadCashBoxes();
  }

  loadCashBoxes() {
    this.http.get<CashBox[]>(`${environment.apiUrl}/cash-boxes`)
      .subscribe({
        next: (data) => {
          this.cashBoxes = data;
          this.filteredCashBoxes = data;
        },
        error: (err) => console.error('Error loading cash boxes:', err)
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
        isActive: true,
        unitId: 1
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
      isActive: true,
      unitId: 1
    };
  }

  saveCashBox() {
    if (this.isEditMode && this.currentCashBox.id) {
      this.http.put(`${environment.apiUrl}/cash-boxes/${this.currentCashBox.id}`, this.currentCashBox)
        .subscribe({
          next: () => {
            this.loadCashBoxes();
            this.closeModal();
          },
          error: (err) => console.error('Error updating cash box:', err)
        });
    } else {
      this.http.post(`${environment.apiUrl}/cash-boxes`, this.currentCashBox)
        .subscribe({
          next: () => {
            this.loadCashBoxes();
            this.closeModal();
          },
          error: (err) => console.error('Error creating cash box:', err)
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
