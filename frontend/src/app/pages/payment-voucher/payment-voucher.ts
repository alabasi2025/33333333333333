import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface Voucher {
  id: number;
  voucherNumber: string;
  type: 'payment' | 'receipt';
  paymentMethod: 'cash' | 'bank';
  date: string;
  cashBoxId?: number;
  bankId?: number;
  accountId: number;
  amount: number;
  beneficiary: string;
  description?: string;
  cashBox?: any;
  bank?: any;
  account?: any;
}

@Component({
  selector: 'app-payment-voucher',
  imports: [CommonModule, FormsModule],
  templateUrl: './payment-voucher.html',
  styleUrl: './payment-voucher.css'
})
export class PaymentVoucherComponent implements OnInit {
  vouchers: Voucher[] = [];
  filteredVouchers: Voucher[] = [];
  cashBoxes: any[] = [];
  banks: any[] = [];
  accounts: any[] = [];
  searchTerm: string = '';
  showModal: boolean = false;
  isEditMode: boolean = false;
  
  currentVoucher: Partial<Voucher> = {
    type: 'payment',
    paymentMethod: 'cash',
    date: new Date().toISOString().split('T')[0],
    amount: 0,
    beneficiary: '',
    description: ''
  };

  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);

  constructor() {
    console.log('🚀 PaymentVoucherComponent constructor called');
  }

  ngOnInit() {
    this.loadVouchers();
    this.loadCashBoxes();
    this.loadBanks();
    this.loadAccounts();
  }

  loadVouchers() {
    console.log('📄 Loading payment vouchers from API...');
    this.http.get<Voucher[]>(`${environment.apiUrl}/vouchers?type=payment`)
      .subscribe({
        next: (data) => {
          console.log('✅ Vouchers received:', data);
          this.vouchers = data;
          this.filteredVouchers = data;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('❌ Error loading vouchers:', err);
        }
      });
  }

  loadCashBoxes() {
    this.http.get<any[]>(`${environment.apiUrl}/cash-boxes`)
      .subscribe({
        next: (data) => {
          this.cashBoxes = data.filter(box => box.isActive);
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('❌ Error loading cash boxes:', err);
        }
      });
  }

  loadBanks() {
    this.http.get<any[]>(`${environment.apiUrl}/banks`)
      .subscribe({
        next: (data) => {
          this.banks = data.filter(bank => bank.isActive);
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('❌ Error loading banks:', err);
        }
      });
  }

  loadAccounts() {
    this.http.get<any[]>(`${environment.apiUrl}/accounts`)
      .subscribe({
        next: (data) => {
          this.accounts = data;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('❌ Error loading accounts:', err);
        }
      });
  }

  onPaymentMethodChange() {
    // إعادة تعيين الصندوق/البنك عند تغيير طريقة الدفع
    this.currentVoucher.cashBoxId = undefined;
    this.currentVoucher.bankId = undefined;
    this.currentVoucher.voucherNumber = '';
  }

  onSourceChange() {
    // تحديث رقم السند عند اختيار صندوق/بنك
    if (this.currentVoucher.paymentMethod === 'cash' && this.currentVoucher.cashBoxId) {
      this.getNextVoucherNumber('cash', this.currentVoucher.cashBoxId);
    } else if (this.currentVoucher.paymentMethod === 'bank' && this.currentVoucher.bankId) {
      this.getNextVoucherNumber('bank', undefined, this.currentVoucher.bankId);
    }
  }

  getNextVoucherNumber(paymentMethod: string, cashBoxId?: number, bankId?: number) {
    let url = `${environment.apiUrl}/vouchers/next-number?paymentMethod=${paymentMethod}`;
    if (cashBoxId) url += `&cashBoxId=${cashBoxId}`;
    if (bankId) url += `&bankId=${bankId}`;

    this.http.get<{ voucherNumber: string }>(url)
      .subscribe({
        next: (response) => {
          this.currentVoucher.voucherNumber = response.voucherNumber;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('❌ Error getting next voucher number:', err);
        }
      });
  }

  searchVouchers() {
    if (!this.searchTerm) {
      this.filteredVouchers = this.vouchers;
      return;
    }
    
    const term = this.searchTerm.toLowerCase();
    this.filteredVouchers = this.vouchers.filter(voucher =>
      voucher.voucherNumber.toLowerCase().includes(term) ||
      voucher.beneficiary.toLowerCase().includes(term) ||
      (voucher.description && voucher.description.toLowerCase().includes(term))
    );
  }

  openModal(voucher?: Voucher) {
    this.showModal = true;
    if (voucher) {
      this.isEditMode = true;
      this.currentVoucher = { ...voucher };
    } else {
      this.isEditMode = false;
      this.currentVoucher = {
        type: 'payment',
        paymentMethod: 'cash',
        date: new Date().toISOString().split('T')[0],
        amount: 0,
        beneficiary: '',
        description: ''
      };
    }
  }

  closeModal() {
    this.showModal = false;
    this.currentVoucher = {
      type: 'payment',
      paymentMethod: 'cash',
      date: new Date().toISOString().split('T')[0],
      amount: 0,
      beneficiary: '',
      description: ''
    };
  }

  saveVoucher() {
    console.log('💾 saveVoucher called!');
    console.log('📄 Current voucher:', this.currentVoucher);

    // التحقق من البيانات المطلوبة
    if (!this.currentVoucher.accountId) {
      alert('❌ يجب اختيار الحساب');
      return;
    }

    if (this.currentVoucher.paymentMethod === 'cash' && !this.currentVoucher.cashBoxId) {
      alert('❌ يجب اختيار الصندوق');
      return;
    }

    if (this.currentVoucher.paymentMethod === 'bank' && !this.currentVoucher.bankId) {
      alert('❌ يجب اختيار البنك');
      return;
    }

    if (!this.currentVoucher.amount || this.currentVoucher.amount <= 0) {
      alert('❌ يجب إدخال مبلغ صحيح');
      return;
    }

    if (!this.currentVoucher.beneficiary) {
      alert('❌ يجب إدخال اسم المستفيد');
      return;
    }

    if (this.isEditMode) {
      // تحديث سند موجود
      const url = `${environment.apiUrl}/vouchers/${this.currentVoucher.id}`;
      this.http.put<Voucher>(url, this.currentVoucher)
        .subscribe({
          next: (response) => {
            alert('✅ تم تحديث سند الصرف بنجاح');
            this.loadVouchers();
            this.closeModal();
          },
          error: (err) => {
            console.error('❌ Error updating voucher:', err);
            alert(`❌ خطأ في تحديث سند الصرف: ${err.error?.message || 'Internal server error'}`);
          }
        });
    } else {
      // إضافة سند جديد
      const url = `${environment.apiUrl}/vouchers`;
      this.http.post<Voucher>(url, this.currentVoucher)
        .subscribe({
          next: (response) => {
            alert('✅ تمت إضافة سند الصرف بنجاح');
            this.loadVouchers();
            this.closeModal();
          },
          error: (err) => {
            console.error('❌ Error adding voucher:', err);
            alert(`❌ خطأ في إضافة سند الصرف: ${err.error?.message || 'Internal server error'}`);
          }
        });
    }
  }

  deleteVoucher(id: number) {
    if (confirm('هل أنت متأكد من حذف هذا السند؟ سيتم إلغاء تأثيره على الرصيد.')) {
      this.http.delete(`${environment.apiUrl}/vouchers/${id}`)
        .subscribe({
          next: () => {
            alert('✅ تم حذف سند الصرف بنجاح');
            this.loadVouchers();
          },
          error: (err) => {
            console.error('❌ Error deleting voucher:', err);
            alert(`❌ خطأ في حذف سند الصرف: ${err.error?.message || 'Internal server error'}`);
          }
        });
    }
  }

  getSourceName(voucher: Voucher): string {
    if (voucher.paymentMethod === 'cash' && voucher.cashBox) {
      return voucher.cashBox.name;
    } else if (voucher.paymentMethod === 'bank' && voucher.bank) {
      return voucher.bank.name;
    }
    return '-';
  }
}
