import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CompanyService, Company, Unit, Branch } from '../services/company.service';

@Component({
  selector: 'app-system-config',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './system-config.component.html',
  styleUrls: ['./system-config.component.css']
})
export class SystemConfigComponent implements OnInit {
  companies: Company[] = [];
  units: Unit[] = [];
  branches: Branch[] = [];
  
  selectedCompany: Company | null = null;
  selectedUnit: Unit | null = null;
  
  // Modals
  showCompanyModal = false;
  showUnitModal = false;
  showBranchModal = false;
  
  // Forms
  companyForm: Partial<Company> = {};
  unitForm: Partial<Unit> = {};
  branchForm: Partial<Branch> = {};
  
  // Available modules
  availableModules = [
    { id: 'financial', name: 'النظام المالي' },
    { id: 'inventory', name: 'المخزون' },
    { id: 'suppliers', name: 'الموردين' },
    { id: 'purchases', name: 'المشتريات' },
    { id: 'sales', name: 'المبيعات' },
    { id: 'hr', name: 'الموارد البشرية' }
  ];
  
  constructor(private companyService: CompanyService) {}
  
  ngOnInit() {
    this.loadCompanies();
  }
  
  loadCompanies() {
    this.companyService.getCompanies().subscribe({
      next: (data) => {
        this.companies = data;
        if (data.length > 0) {
          this.selectCompany(data[0]);
        }
      },
      error: (err) => console.error('خطأ في تحميل الشركات:', err)
    });
  }
  
  selectCompany(company: Company) {
    this.selectedCompany = company;
    this.loadUnits(company.id);
  }
  
  loadUnits(companyId: number) {
    this.companyService.getUnits(companyId).subscribe({
      next: (data) => {
        this.units = data;
        this.selectedUnit = null;
        this.branches = [];
      },
      error: (err) => console.error('خطأ في تحميل الوحدات:', err)
    });
  }
  
  selectUnit(unit: Unit) {
    this.selectedUnit = unit;
    this.loadBranches(unit.id);
  }
  
  loadBranches(unitId: number) {
    this.companyService.getBranches(unitId).subscribe({
      next: (data) => {
        this.branches = data;
      },
      error: (err) => console.error('خطأ في تحميل الفروع:', err)
    });
  }
  
  // Company CRUD
  openCompanyModal(company?: Company) {
    this.companyForm = company ? { ...company } : { isActive: true };
    this.showCompanyModal = true;
  }
  
  saveCompany() {
    if (this.companyForm.id) {
      this.companyService.updateCompany(this.companyForm.id, this.companyForm).subscribe({
        next: () => {
          this.loadCompanies();
          this.closeCompanyModal();
        },
        error: (err) => console.error('خطأ في تحديث الشركة:', err)
      });
    } else {
      this.companyService.createCompany(this.companyForm).subscribe({
        next: () => {
          this.loadCompanies();
          this.closeCompanyModal();
        },
        error: (err) => console.error('خطأ في إضافة الشركة:', err)
      });
    }
  }
  
  deleteCompany(id: number) {
    if (confirm('هل أنت متأكد من حذف هذه الشركة؟')) {
      this.companyService.deleteCompany(id).subscribe({
        next: () => this.loadCompanies(),
        error: (err) => console.error('خطأ في حذف الشركة:', err)
      });
    }
  }
  
  closeCompanyModal() {
    this.showCompanyModal = false;
    this.companyForm = {};
  }
  
  // Unit CRUD
  openUnitModal(unit?: Unit) {
    this.unitForm = unit 
      ? { ...unit, enabledModules: [...unit.enabledModules] }
      : { companyId: this.selectedCompany?.id, enabledModules: [], isActive: true };
    this.showUnitModal = true;
  }
  
  toggleModule(moduleId: string) {
    if (!this.unitForm.enabledModules) {
      this.unitForm.enabledModules = [];
    }
    
    const index = this.unitForm.enabledModules.indexOf(moduleId);
    if (index > -1) {
      this.unitForm.enabledModules.splice(index, 1);
    } else {
      this.unitForm.enabledModules.push(moduleId);
    }
  }
  
  isModuleEnabled(moduleId: string): boolean {
    return this.unitForm.enabledModules?.includes(moduleId) || false;
  }
  
  saveUnit() {
    if (this.unitForm.id) {
      this.companyService.updateUnit(this.unitForm.id, this.unitForm).subscribe({
        next: () => {
          if (this.selectedCompany) {
            this.loadUnits(this.selectedCompany.id);
          }
          this.closeUnitModal();
        },
        error: (err) => console.error('خطأ في تحديث الوحدة:', err)
      });
    } else {
      this.companyService.createUnit(this.unitForm).subscribe({
        next: () => {
          if (this.selectedCompany) {
            this.loadUnits(this.selectedCompany.id);
          }
          this.closeUnitModal();
        },
        error: (err) => console.error('خطأ في إضافة الوحدة:', err)
      });
    }
  }
  
  deleteUnit(id: number) {
    if (confirm('هل أنت متأكد من حذف هذه الوحدة؟')) {
      this.companyService.deleteUnit(id).subscribe({
        next: () => {
          if (this.selectedCompany) {
            this.loadUnits(this.selectedCompany.id);
          }
        },
        error: (err) => console.error('خطأ في حذف الوحدة:', err)
      });
    }
  }
  
  closeUnitModal() {
    this.showUnitModal = false;
    this.unitForm = {};
  }
  
  // Branch CRUD
  openBranchModal(branch?: Branch) {
    this.branchForm = branch 
      ? { ...branch }
      : { unitId: this.selectedUnit?.id, isActive: true };
    this.showBranchModal = true;
  }
  
  saveBranch() {
    if (this.branchForm.id) {
      this.companyService.updateBranch(this.branchForm.id, this.branchForm).subscribe({
        next: () => {
          if (this.selectedUnit) {
            this.loadBranches(this.selectedUnit.id);
          }
          this.closeBranchModal();
        },
        error: (err) => console.error('خطأ في تحديث الفرع:', err)
      });
    } else {
      this.companyService.createBranch(this.branchForm).subscribe({
        next: () => {
          if (this.selectedUnit) {
            this.loadBranches(this.selectedUnit.id);
          }
          this.closeBranchModal();
        },
        error: (err) => console.error('خطأ في إضافة الفرع:', err)
      });
    }
  }
  
  deleteBranch(id: number) {
    if (confirm('هل أنت متأكد من حذف هذا الفرع؟')) {
      this.companyService.deleteBranch(id).subscribe({
        next: () => {
          if (this.selectedUnit) {
            this.loadBranches(this.selectedUnit.id);
          }
        },
        error: (err) => console.error('خطأ في حذف الفرع:', err)
      });
    }
  }
  
  closeBranchModal() {
    this.showBranchModal = false;
    this.branchForm = {};
  }
  
  getModuleName(moduleId: string): string {
    const module = this.availableModules.find(m => m.id === moduleId);
    return module ? module.name : moduleId;
  }
}
