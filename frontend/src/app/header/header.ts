import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CompanyService, Unit } from '../services/company.service';
import { UnitContextService } from '../services/unit-context.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header implements OnInit {
  units: Unit[] = [];
  selectedUnit: Unit | null = null;
  showUnitDropdown = false;

  constructor(
    private companyService: CompanyService,
    private unitContext: UnitContextService
  ) {}

  ngOnInit() {
    this.loadUnits();
    
    // Subscribe to unit changes
    this.unitContext.selectedUnit$.subscribe(unit => {
      this.selectedUnit = unit;
    });
  }

  loadUnits() {
    this.companyService.getUnits().subscribe({
      next: (data) => {
        this.units = data;
        
        // If no unit selected, select the first one
        if (!this.selectedUnit && data.length > 0) {
          this.selectUnit(data[0]);
        }
      },
      error: (err) => console.error('خطأ في تحميل الوحدات:', err)
    });
  }

  selectUnit(unit: Unit) {
    this.selectedUnit = unit;
    this.unitContext.setSelectedUnit(unit);
    this.showUnitDropdown = false;
  }

  toggleUnitDropdown() {
    this.showUnitDropdown = !this.showUnitDropdown;
  }

  closeDropdown() {
    this.showUnitDropdown = false;
  }
}
