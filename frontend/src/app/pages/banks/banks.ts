import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface Bank {
  id: number;
  name: string;
  code: string;
  accountId?: number;
  accountNumber?: string;
  iban?: string;
  swiftCode?: string;
  branchName?: string;
  description?: string;
  openingBalance: number;
  currentBalance: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

@Component({
  selector: 'app-banks',
  imports: [CommonModule, FormsModule],
  templateUrl: './banks.html',
  styleUrl: './banks.css'
})
export class BanksComponent implements OnInit {
  banks: Bank[] = [];
  filteredBanks: Bank[] = [];
  bankAccounts: any[] = [];
  searchTerm: string = '';
  showModal: boolean = false;
  isEditMode: boolean = false;
  
  currentBank: Partial<Bank> = {
    name: '',
    code: '',
    accountNumber: '',
    iban: '',
    swiftCode: '',
    branchName: '',
    description: '',
    openingBalance: 0,
    isActive: true
  };

  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);

  constructor() {
    console.log('🚀 BanksComponent constructor called');
  }

  ngOnInit() {
    this.loadBanks();
    this.loadBankAccounts();
  }

  loadBanks() {
    console.log('🏦 Loading banks from API...');
    this.http.get<Bank[]>(`${environment.apiUrl}/banks`)
      .subscribe({
        next: (data) => {
          console.log('✅ Banks received:', data);
          console.log('📏 Data length:', data.length);
          this.banks = data;
          this.filteredBanks = data;
          
          this.cdr.detectChanges();
          console.log('✅ Change detection triggered!');
        },
        error: (err) => {
          console.error('❌ Error loading banks:', err);
        }
      });
  }

  loadBankAccounts() {
    console.log('🏦 Loading bank accounts from API...');
    this.http.get<any[]>(`${environment.apiUrl}/accounts?subType=bank`)
      .subscribe({
        next: (data) => {
          console.log('✅ Bank accounts received:', data);
          this.bankAccounts = data;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('❌ Error loading bank accounts:', err);
        }
      });
  }

  searchBanks() {
    if (!this.searchTerm) {
      this.filteredBanks = this.banks;
      return;
    }
    
    const term = this.searchTerm.toLowerCase();
    this.filteredBanks = this.banks.filter(bank =>
      bank.name.toLowerCase().includes(term) ||
      bank.code.toLowerCase().includes(term) ||
      (bank.accountNumber && bank.accountNumber.toLowerCase().includes(term)) ||
      (bank.iban && bank.iban.toLowerCase().includes(term)) ||
      (bank.description && bank.description.toLowerCase().includes(term))
    );
  }

  openModal(bank?: Bank) {
    this.showModal = true;
    if (bank) {
      this.isEditMode = true;
      this.currentBank = { ...bank };
    } else {
      this.isEditMode = false;
      this.currentBank = {
        name: '',
        code: '',
        accountNumber: '',
        iban: '',
        swiftCode: '',
        branchName: '',
        description: '',
        openingBalance: 0,
        isActive: true
      };
    }
  }

  closeModal() {
    this.showModal = false;
    this.currentBank = {
      name: '',
      code: '',
      accountNumber: '',
      iban: '',
      swiftCode: '',
      branchName: '',
      description: '',
      openingBalance: 0,
      isActive: true
    };
  }

  saveBank() {
    console.log('💾 saveBank called!');
    console.log('📋 Dialog mode:', this.isEditMode ? 'edit' : 'add');
    console.log('📄 Current bank:', this.currentBank);

    if (this.isEditMode) {
      // تحديث بنك موجود
      console.log('🔄 Updating bank ID:', this.currentBank.id);
      const url = `${environment.apiUrl}/banks/${this.currentBank.id}`;
      console.log('📤 PUT URL:', url);
      
      this.http.put<Bank>(url, this.currentBank)
        .subscribe({
          next: (response) => {
            console.log('✅ Response received:', response);
            alert('✅ تم تحديث البنك بنجاح');
            this.loadBanks();
            this.closeModal();
          },
          error: (err) => {
            console.error('❌ Error updating bank:', err);
            alert(`❌ خطأ في تحديث البنك: ${err.error?.message || 'Internal server error'}`);
          }
        });
    } else {
      // إضافة بنك جديد
      console.log('➕ Adding new bank');
      const url = `${environment.apiUrl}/banks`;
      console.log('📤 POST URL:', url);
      
      this.http.post<Bank>(url, this.currentBank)
        .subscribe({
          next: (response) => {
            console.log('✅ Response received:', response);
            alert('✅ تمت إضافة البنك بنجاح');
            this.loadBanks();
            this.closeModal();
          },
          error: (err) => {
            console.error('❌ Error adding bank:', err);
            alert(`❌ خطأ في إضافة البنك: ${err.error?.message || 'Internal server error'}`);
          }
        });
    }
  }

  deleteBank(id: number) {
    if (confirm('هل أنت متأكد من حذف هذا البنك؟')) {
      this.http.delete(`${environment.apiUrl}/banks/${id}`)
        .subscribe({
          next: () => {
            alert('✅ تم حذف البنك بنجاح');
            this.loadBanks();
          },
          error: (err) => {
            console.error('❌ Error deleting bank:', err);
            alert(`❌ خطأ في حذف البنك: ${err.error?.message || 'Internal server error'}`);
          }
        });
    }
  }

  toggleStatus(bank: Bank) {
    this.http.put<Bank>(`${environment.apiUrl}/banks/${bank.id}/toggle-status`, {})
      .subscribe({
        next: () => {
          this.loadBanks();
        },
        error: (err) => {
          console.error('❌ Error toggling status:', err);
          alert(`❌ خطأ في تغيير الحالة: ${err.error?.message || 'Internal server error'}`);
        }
      });
  }
}
