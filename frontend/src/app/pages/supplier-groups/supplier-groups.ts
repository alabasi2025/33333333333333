import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface Account {
  id: number;
  code: string;
  name: string;
  type?: string;
}

interface SupplierGroup {
  id?: number;
  name: string;
  code: string;
  accountId?: number;
  account?: Account;
  description?: string;
  isActive: boolean;
  suppliers?: any[];
}

@Component({
  selector: 'app-supplier-groups',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './supplier-groups.html',
  styleUrls: ['./supplier-groups.css']
})
export class SupplierGroupsComponent implements OnInit {
  supplierGroups: SupplierGroup[] = [];
  filteredSupplierGroups: SupplierGroup[] = [];
  accounts: Account[] = [];
  searchTerm: string = '';
  showModal: boolean = false;
  isEditMode: boolean = false;
  
  currentSupplierGroup: SupplierGroup = {
    name: '',
    code: '',
    accountId: undefined,
    description: '',
    isActive: true
  };

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadSupplierGroups();
    this.loadAccounts();
  }

  loadSupplierGroups() {
    console.log('Loading supplier groups from:', `${environment.apiUrl}/supplier-groups`);
    this.http.get<SupplierGroup[]>(`${environment.apiUrl}/supplier-groups`)
      .subscribe({
        next: (data) => {
          console.log('Supplier groups loaded:', data);
          this.supplierGroups = data;
          this.filteredSupplierGroups = data;
          console.log('filteredSupplierGroups:', this.filteredSupplierGroups);
        },
        error: (error) => {
          console.error('خطأ في تحميل مجموعات الموردين:', error);
          console.error('Error details:', error);
        }
      });
  }

  loadAccounts() {
    this.http.get<Account[]>(`${environment.apiUrl}/accounts`)
      .subscribe({
        next: (data) => {
          // فلترة الحسابات لعرض حسابات الخصوم فقط (الموردين يعتبرون خصوم)
          this.accounts = data.filter(account => account.type === 'liability');
        },
        error: (error) => console.error('خطأ في تحميل الحسابات:', error)
      });
  }

  filterSupplierGroups() {
    const term = this.searchTerm.toLowerCase();
    this.filteredSupplierGroups = this.supplierGroups.filter(group =>
      group.name.toLowerCase().includes(term) ||
      group.code.toLowerCase().includes(term) ||
      (group.account?.name || '').toLowerCase().includes(term)
    );
  }

  openModal(supplierGroup?: SupplierGroup) {
    this.isEditMode = !!supplierGroup;
    if (supplierGroup) {
      this.currentSupplierGroup = { ...supplierGroup };
    } else {
      this.currentSupplierGroup = {
        name: '',
        code: '',
        accountId: undefined,
        description: '',
        isActive: true
      };
    }
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  saveSupplierGroup() {
    const url = this.isEditMode
      ? `${environment.apiUrl}/supplier-groups/${this.currentSupplierGroup.id}`
      : `${environment.apiUrl}/supplier-groups`;
    
    const method = this.isEditMode ? 'put' : 'post';
    
    this.http.request(method, url, { body: this.currentSupplierGroup })
      .subscribe({
        next: () => {
          this.loadSupplierGroups();
          this.closeModal();
          alert(this.isEditMode ? 'تم تحديث المجموعة بنجاح' : 'تم إضافة المجموعة بنجاح');
        },
        error: (error) => {
          console.error('خطأ في حفظ المجموعة:', error);
          alert(error.error?.message || 'حدث خطأ أثناء حفظ المجموعة');
        }
      });
  }

  deleteSupplierGroup(id: number) {
    if (confirm('هل أنت متأكد من حذف هذه المجموعة؟')) {
      this.http.delete(`${environment.apiUrl}/supplier-groups/${id}`)
        .subscribe({
          next: () => {
            this.loadSupplierGroups();
            alert('تم حذف المجموعة بنجاح');
          },
          error: (error) => {
            console.error('خطأ في حذف المجموعة:', error);
            alert(error.error?.message || 'حدث خطأ أثناء حذف المجموعة');
          }
        });
    }
  }
}
