import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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
    private unitContext: UnitContextService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Subscribe to unit changes first
    this.unitContext.selectedUnit$.subscribe(unit => {
      console.log('📡 Unit changed in context:', unit);
      this.selectedUnit = unit;
      this.cdr.detectChanges();
    });
    
    // Then load units
    this.loadUnits();
  }

  loadUnits() {
    this.companyService.getUnits().subscribe({
      next: (data) => {
        console.log('📦 Units loaded:', data.length);
        this.units = data;
        
        // If no unit selected, select the first one
        const currentUnit = this.unitContext.getSelectedUnit();
        if (!currentUnit && data.length > 0) {
          console.log('🎯 Auto-selecting first unit');
          this.selectUnit(data[0]);
        }
      },
      error: (err) => console.error('❌ خطأ في تحميل الوحدات:', err)
    });
  }

  selectUnit(unit: Unit) {
    console.log('👆 User clicked on unit:', unit.name);
    this.unitContext.setSelectedUnit(unit);
    this.showUnitDropdown = false;
  }

  toggleUnitDropdown(event: Event) {
    event.stopPropagation();
    this.showUnitDropdown = !this.showUnitDropdown;
    console.log('🔽 Dropdown toggled:', this.showUnitDropdown);
  }

  closeDropdown() {
    this.showUnitDropdown = false;
  }
}
