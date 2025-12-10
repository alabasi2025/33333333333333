import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface Account {
  id: number;
  code: string;
  name: string;
}

interface WarehouseGroup {
  id?: number;
  name: string;
  code: string;
  accountId?: number;
  account?: Account;
  description?: string;
  isActive: boolean;
  warehouses?: any[];
}

@Component({
  selector: 'app-warehouse-groups',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './warehouse-groups.html',
  styleUrls: ['./warehouse-groups.css']
})
export class WarehouseGroupsComponent implements OnInit {
  warehouseGroups: WarehouseGroup[] = [];
  filteredWarehouseGroups: WarehouseGroup[] = [];
  accounts: Account[] = [];
  searchTerm: string = '';
  showModal: boolean = false;
  isEditMode: boolean = false;
  
  currentWarehouseGroup: WarehouseGroup = {
    name: '',
    code: '',
    accountId: undefined,
    description: '',
    isActive: true
  };

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadWarehouseGroups();
    this.loadAccounts();
  }

  loadWarehouseGroups() {
    console.log('Loading warehouse groups from:', `${environment.apiUrl}/warehouse-groups`);
    this.http.get<WarehouseGroup[]>(`${environment.apiUrl}/warehouse-groups`)
      .subscribe({
        next: (data) => {
          console.log('Warehouse groups loaded:', data);
          this.warehouseGroups = data;
          this.filteredWarehouseGroups = data;
          console.log('filteredWarehouseGroups:', this.filteredWarehouseGroups);
        },
        error: (error) => {
          console.error('خطأ في تحميل مجموعات المخازن:', error);
          console.error('Error details:', error);
        }
      });
  }

  loadAccounts() {
    this.http.get<Account[]>(`${environment.apiUrl}/accounts`)
      .subscribe({
        next: (data) => {
          this.accounts = data;
        },
        error: (error) => console.error('خطأ في تحميل الحسابات:', error)
      });
  }

  filterWarehouseGroups() {
    const term = this.searchTerm.toLowerCase();
    this.filteredWarehouseGroups = this.warehouseGroups.filter(group =>
      group.name.toLowerCase().includes(term) ||
      group.code.toLowerCase().includes(term) ||
      (group.account?.name || '').toLowerCase().includes(term)
    );
  }

  openModal(warehouseGroup?: WarehouseGroup) {
    this.isEditMode = !!warehouseGroup;
    if (warehouseGroup) {
      this.currentWarehouseGroup = { ...warehouseGroup };
    } else {
      this.currentWarehouseGroup = {
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

  saveWarehouseGroup() {
    const url = this.isEditMode
      ? `${environment.apiUrl}/warehouse-groups/${this.currentWarehouseGroup.id}`
      : `${environment.apiUrl}/warehouse-groups`;
    
    const method = this.isEditMode ? 'put' : 'post';
    
    this.http.request(method, url, { body: this.currentWarehouseGroup })
      .subscribe({
        next: () => {
          this.loadWarehouseGroups();
          this.closeModal();
          alert(this.isEditMode ? 'تم تحديث المجموعة بنجاح' : 'تم إضافة المجموعة بنجاح');
        },
        error: (error) => {
          console.error('خطأ في حفظ المجموعة:', error);
          alert(error.error?.message || 'حدث خطأ أثناء حفظ المجموعة');
        }
      });
  }

  deleteWarehouseGroup(id: number) {
    if (confirm('هل أنت متأكد من حذف هذه المجموعة؟')) {
      this.http.delete(`${environment.apiUrl}/warehouse-groups/${id}`)
        .subscribe({
          next: () => {
            this.loadWarehouseGroups();
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
