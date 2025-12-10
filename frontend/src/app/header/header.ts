import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CompanyService, Unit } from '../services/company.service';
import { UnitContextService } from '../services/unit-context.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header implements OnInit {
  units: Unit[] = [];
  selectedUnitId: number | null = null;

  constructor(
    private companyService: CompanyService,
    private unitContext: UnitContextService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Subscribe to unit changes first
    this.unitContext.selectedUnit$.subscribe(unit => {
      console.log('📡 Unit changed in context:', unit);
      this.selectedUnitId = unit?.id || null;
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
          this.unitContext.setSelectedUnit(data[0]);
        }
      },
      error: (err) => console.error('❌ خطأ في تحميل الوحدات:', err)
    });
  }

  onUnitChange() {
    console.log('🔄 Unit changed to ID:', this.selectedUnitId);
    const selectedUnit = this.units.find(u => u.id === Number(this.selectedUnitId));
    if (selectedUnit) {
      console.log('✅ Setting unit:', selectedUnit.name);
      this.unitContext.setSelectedUnit(selectedUnit);
    }
  }
}
