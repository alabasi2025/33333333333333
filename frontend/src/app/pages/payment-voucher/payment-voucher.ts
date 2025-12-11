import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface PaymentVoucher {
  id: number;
  voucherNumber: string;
  date: string;
  amount: number;
  accountId: number;
  beneficiaryName?: string;
  paymentMethod: string;
  referenceNumber?: string;
  description?: string;
  status: string;
  posted: boolean;
  journalEntryId?: number;
  createdBy?: string;
  approvedBy?: string;
  approvedAt?: string;
  account?: any;
  journalEntry?: any;
}

@Component({
  selector: 'app-payment-voucher',
  imports: [CommonModule, FormsModule],
  templateUrl: './payment-voucher.html',
  styleUrl: './payment-voucher.css'
})
export class PaymentVoucherComponent implements OnInit {
  vouchers: PaymentVoucher[] = [];
  filteredVouchers: PaymentVoucher[] = [];
  accounts: any[] = [];
  searchTerm: string = '';
  showModal: boolean = false;
  isEditMode: boolean = false;
  statusFilter: string = 'all';
  
  currentVoucher: Partial<PaymentVoucher> = {
    date: new Date().toISOString().split('T')[0],
    amount: 0,
    beneficiaryName: '',
    paymentMethod: 'cash',
    description: '',
    voucherNumber: ''
  };

  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);

  constructor() {
    console.log('🚀 PaymentVoucherComponent constructor called');
  }

  ngOnInit() {
    this.loadVouchers();
    this.loadAccounts();
    this.generateVoucherNumber();
  }

  loadVouchers() {
    console.log('📄 Loading payment vouchers from API...');
    this.http.get<PaymentVoucher[]>(`${environment.apiUrl}/payment-vouchers`)
      .subscribe({
        next: (data) => {
          console.log('✅ Vouchers received:', data);
          this.vouchers = data;
          this.applyFilters();
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('❌ Error loading vouchers:', err);
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

  generateVoucherNumber() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.currentVoucher.voucherNumber = `PV-${year}${month}-${random}`;
  }

  applyFilters() {
    let filtered = [...this.vouchers];

    // فلتر الحالة
    if (this.statusFilter !== 'all') {
      filtered = filtered.filter(v => v.status === this.statusFilter);
    }

    // فلتر البحث
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(voucher =>
        voucher.voucherNumber.toLowerCase().includes(term) ||
        (voucher.beneficiaryName && voucher.beneficiaryName.toLowerCase().includes(term)) ||
        (voucher.description && voucher.description.toLowerCase().includes(term))
      );
    }

    this.filteredVouchers = filtered;
  }

  onStatusFilterChange() {
    this.applyFilters();
  }

  searchVouchers() {
    this.applyFilters();
  }

  openModal(voucher?: PaymentVoucher) {
    this.showModal = true;
    if (voucher) {
      this.isEditMode = true;
      this.currentVoucher = { ...voucher };
    } else {
      this.isEditMode = false;
      this.generateVoucherNumber();
      this.currentVoucher = {
        date: new Date().toISOString().split('T')[0],
        amount: 0,
        beneficiaryName: '',
        paymentMethod: 'cash',
        description: '',
        voucherNumber: this.currentVoucher.voucherNumber
      };
    }
  }

  closeModal() {
    this.showModal = false;
    this.currentVoucher = {
      date: new Date().toISOString().split('T')[0],
      amount: 0,
      beneficiaryName: '',
      paymentMethod: 'cash',
      description: '',
      voucherNumber: ''
    };
  }

  saveVoucher() {
    console.log('💾 saveVoucher called!');
    console.log('📄 Current voucher:', this.currentVoucher);

    // التحقق من البيانات المطلوبة
    if (!this.currentVoucher.voucherNumber) {
      alert('❌ يجب إدخال رقم السند');
      return;
    }

    if (!this.currentVoucher.accountId) {
      alert('❌ يجب اختيار الحساب');
      return;
    }

    if (!this.currentVoucher.amount || this.currentVoucher.amount <= 0) {
      alert('❌ يجب إدخال مبلغ صحيح');
      return;
    }

    if (!this.currentVoucher.beneficiaryName) {
      alert('❌ يجب إدخال اسم المستفيد');
      return;
    }

    const payload = {
      voucherNumber: this.currentVoucher.voucherNumber,
      date: this.currentVoucher.date,
      amount: this.currentVoucher.amount,
      accountId: this.currentVoucher.accountId,
      beneficiaryName: this.currentVoucher.beneficiaryName,
      paymentMethod: this.currentVoucher.paymentMethod,
      referenceNumber: this.currentVoucher.referenceNumber,
      description: this.currentVoucher.description,
      createdBy: 'Admin' // TODO: استخدام المستخدم الحالي
    };

    if (this.isEditMode) {
      // تحديث سند موجود
      const url = `${environment.apiUrl}/payment-vouchers/${this.currentVoucher.id}`;
      this.http.put<PaymentVoucher>(url, payload)
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
      const url = `${environment.apiUrl}/payment-vouchers`;
      this.http.post<PaymentVoucher>(url, payload)
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

  approveVoucher(id: number) {
    if (confirm('هل أنت متأكد من اعتماد هذا السند؟')) {
      this.http.post(`${environment.apiUrl}/payment-vouchers/${id}/approve`, {
        approvedBy: 'Admin' // TODO: استخدام المستخدم الحالي
      })
        .subscribe({
          next: () => {
            alert('✅ تم اعتماد سند الصرف بنجاح');
            this.loadVouchers();
          },
          error: (err) => {
            console.error('❌ Error approving voucher:', err);
            alert(`❌ خطأ في اعتماد سند الصرف: ${err.error?.message || 'Internal server error'}`);
          }
        });
    }
  }

  postVoucher(id: number) {
    if (confirm('هل أنت متأكد من ترحيل هذا السند؟ لن يمكن التعديل عليه بعد الترحيل.')) {
      this.http.post(`${environment.apiUrl}/payment-vouchers/${id}/post`, {})
        .subscribe({
          next: () => {
            alert('✅ تم ترحيل سند الصرف بنجاح');
            this.loadVouchers();
          },
          error: (err) => {
            console.error('❌ Error posting voucher:', err);
            alert(`❌ خطأ في ترحيل سند الصرف: ${err.error?.message || 'Internal server error'}`);
          }
        });
    }
  }

  cancelVoucher(id: number) {
    if (confirm('هل أنت متأكد من إلغاء هذا السند؟')) {
      this.http.post(`${environment.apiUrl}/payment-vouchers/${id}/cancel`, {})
        .subscribe({
          next: () => {
            alert('✅ تم إلغاء سند الصرف بنجاح');
            this.loadVouchers();
          },
          error: (err) => {
            console.error('❌ Error cancelling voucher:', err);
            alert(`❌ خطأ في إلغاء سند الصرف: ${err.error?.message || 'Internal server error'}`);
          }
        });
    }
  }

  deleteVoucher(id: number) {
    if (confirm('هل أنت متأكد من حذف هذا السند؟')) {
      this.http.delete(`${environment.apiUrl}/payment-vouchers/${id}`)
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

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'draft': return 'badge-secondary';
      case 'approved': return 'badge-success';
      case 'cancelled': return 'badge-danger';
      default: return 'badge-secondary';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'draft': return 'مسودة';
      case 'approved': return 'معتمد';
      case 'cancelled': return 'ملغى';
      default: return status;
    }
  }
}
