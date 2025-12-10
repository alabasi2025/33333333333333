import { Component, OnInit } from '@angular/core';
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
    private unitContext: UnitContextService
  ) {
    console.log('🏗️ Header constructor called');
  }

  ngOnInit() {
    console.log('🚀 Header ngOnInit called');
    this.loadUnits();
    
    // Subscribe to unit changes
    this.unitContext.selectedUnit$.subscribe(unit => {
      console.log('📡 Unit changed:', unit?.name);
      if (unit) {
        this.selectedUnitId = unit.id;
      }
    });
  }

  loadUnits() {
    console.log('📦 Loading units...');
    this.companyService.getUnits().subscribe({
      next: (data) => {
        console.log('✅ Units loaded:', data);
        this.units = data;
        
        // Auto-select first unit if none selected
        const currentUnit = this.unitContext.getSelectedUnit();
        if (!currentUnit && data.length > 0) {
          console.log('🎯 Auto-selecting first unit:', data[0].name);
          this.selectedUnitId = data[0].id;
          this.unitContext.setSelectedUnit(data[0]);
        } else if (currentUnit) {
          this.selectedUnitId = currentUnit.id;
        }
      },
      error: (err) => {
        console.error('❌ Error loading units:', err);
      }
    });
  }

  onUnitChange() {
    console.log('🔄 Unit changed to ID:', this.selectedUnitId);
    if (this.selectedUnitId) {
      const selectedUnit = this.units.find(u => u.id === Number(this.selectedUnitId));
      if (selectedUnit) {
        console.log('✅ Setting unit:', selectedUnit.name);
        this.unitContext.setSelectedUnit(selectedUnit);
      }
    }
  }
}
