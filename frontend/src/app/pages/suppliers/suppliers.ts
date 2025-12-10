import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface SupplierGroup {
  id: number;
  name: string;
  code: string;
  isActive?: boolean;
}

interface Supplier {
  id: number;
  name: string;
  code: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  taxNumber?: string;
  groupId?: number;
  group?: SupplierGroup;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

@Component({
  selector: 'app-suppliers',
  imports: [CommonModule, FormsModule],
  templateUrl: './suppliers.html',
  styleUrl: './suppliers.css'
})
export class SuppliersComponentNew implements OnInit {
  suppliers: Supplier[] = [];
  filteredSuppliers: Supplier[] = [];

  supplierGroups: SupplierGroup[] = [];
  searchTerm: string = '';
  showModal: boolean = false;
  isEditMode: boolean = false;
  
  currentSupplier: Partial<Supplier> = {
    name: '',
    code: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    taxNumber: '',
    description: '',
    isActive: true
  };

  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit() {
    this.loadSuppliers();
    this.loadSupplierGroups();
  }

  loadSuppliers() {
    this.http.get<Supplier[]>(`${environment.apiUrl}/suppliers`)
      .subscribe({
        next: (data) => {
          this.suppliers = data;
          this.filteredSuppliers = data;
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Error loading suppliers:', err)
      });
  }

  loadSupplierGroups() {
    this.http.get<SupplierGroup[]>(`${environment.apiUrl}/supplier-groups`)
      .subscribe({
        next: (data) => {
          this.supplierGroups = data.filter(g => g.isActive);
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Error loading supplier groups:', err)
      });
  }

  filterSuppliers() {
    if (!this.searchTerm) {
      this.filteredSuppliers = this.suppliers;
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredSuppliers = this.suppliers.filter(s =>
        s.name.toLowerCase().includes(term) ||
        s.code.toLowerCase().includes(term) ||
        (s.contactPerson && s.contactPerson.toLowerCase().includes(term)) ||
        (s.phone && s.phone.toLowerCase().includes(term))
      );
    }
  }

  openModal(supplier?: Supplier) {
    if (supplier) {
      this.isEditMode = true;
      this.currentSupplier = { ...supplier };
    } else {
      this.isEditMode = false;
      this.currentSupplier = {
        name: '',
        code: '',
        contactPerson: '',
        phone: '',
        email: '',
        address: '',
        taxNumber: '',
        description: '',
        isActive: true
      };
    }
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.currentSupplier = {
      name: '',
      code: '',
      contactPerson: '',
      phone: '',
      email: '',
      address: '',
      taxNumber: '',
      description: '',
      isActive: true
    };
  }

  saveSupplier() {
    if (!this.currentSupplier.name || !this.currentSupplier.code) {
      alert('الرجاء إدخال الاسم والكود');
      return;
    }

    const request = this.isEditMode
      ? this.http.put(`${environment.apiUrl}/suppliers/${this.currentSupplier.id}`, this.currentSupplier)
      : this.http.post(`${environment.apiUrl}/suppliers`, this.currentSupplier);

    request.subscribe({
      next: () => {
        this.loadSuppliers();
        this.closeModal();
      },
      error: (err) => {
        console.error('Error saving supplier:', err);
        alert('حدث خطأ أثناء الحفظ');
      }
    });
  }

  deleteSupplier(id: number) {
    if (confirm('هل أنت متأكد من حذف هذا المورد؟')) {
      this.http.delete(`${environment.apiUrl}/suppliers/${id}`)
        .subscribe({
          next: () => this.loadSuppliers(),
          error: (err) => {
            console.error('Error deleting supplier:', err);
            alert('حدث خطأ أثناء الحذف');
          }
        });
    }
  }

  toggleStatus(supplier: Supplier) {
    this.http.put(`${environment.apiUrl}/suppliers/${supplier.id}/toggle-status`, {})
      .subscribe({
        next: () => this.loadSuppliers(),
        error: (err) => console.error('Error toggling status:', err)
      });
  }


}
