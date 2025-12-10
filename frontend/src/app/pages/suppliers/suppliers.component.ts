import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SuppliersService, Supplier } from '../../services/suppliers.service';

@Component({
  selector: 'app-suppliers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './suppliers.component.html',
  styleUrls: ['./suppliers.component.css']
})
export class SuppliersComponent implements OnInit {
  suppliers: Supplier[] = [];
  selectedSupplier: Supplier | null = null;
  isEditing = false;
  
  newSupplier: Supplier = {
    name: '',
    email: '',
    phone: '',
    address: '',
    taxNumber: '',
    contactPerson: ''
  };

  constructor(private suppliersService: SuppliersService) {}

  ngOnInit() {
    this.loadSuppliers();
  }

  loadSuppliers() {
    this.suppliersService.getAll().subscribe({
      next: (data) => this.suppliers = data,
      error: (err) => console.error('Error loading suppliers:', err)
    });
  }

  onSubmit() {
    if (this.isEditing && this.selectedSupplier?.id) {
      this.suppliersService.update(this.selectedSupplier.id, this.newSupplier).subscribe({
        next: () => {
          this.loadSuppliers();
          this.resetForm();
        },
        error: (err) => console.error('Error updating supplier:', err)
      });
    } else {
      this.suppliersService.create(this.newSupplier).subscribe({
        next: () => {
          this.loadSuppliers();
          this.resetForm();
        },
        error: (err) => console.error('Error creating supplier:', err)
      });
    }
  }

  editSupplier(supplier: Supplier) {
    this.selectedSupplier = supplier;
    this.newSupplier = { ...supplier };
    this.isEditing = true;
  }

  deleteSupplier(id: number | undefined) {
    if (!id) return;
    if (confirm('هل أنت متأكد من حذف هذا المورد؟')) {
      this.suppliersService.delete(id).subscribe({
        next: () => this.loadSuppliers(),
        error: (err) => console.error('Error deleting supplier:', err)
      });
    }
  }

  resetForm() {
    this.newSupplier = {
      name: '',
      email: '',
      phone: '',
      address: '',
      taxNumber: '',
      contactPerson: ''
    };
    this.selectedSupplier = null;
    this.isEditing = false;
  }
}
