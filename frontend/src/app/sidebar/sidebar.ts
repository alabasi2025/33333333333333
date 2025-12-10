import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CompanyService, Unit } from '../services/company.service';
import { UnitContextService } from '../services/unit-context.service';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, CommonModule, FormsModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar implements OnInit {
  isFinancialOpen = false;
  units: Unit[] = [];
  selectedUnitId: number = 1;

  constructor(
    private companyService: CompanyService,
    private unitContext: UnitContextService
  ) {}

  ngOnInit() {
    // Load units from API
    this.companyService.getUnits().subscribe({
      next: (data) => {
        this.units = data;
        
        // Check if there's a saved unit
        const savedUnit = this.unitContext.getSelectedUnit();
        if (savedUnit) {
          this.selectedUnitId = savedUnit.id;
        } else if (data.length > 0) {
          // Auto-select first unit
          this.selectedUnitId = data[0].id;
          this.unitContext.setSelectedUnit(data[0]);
        }
      },
      error: (err) => {
        console.error('Error loading units:', err);
        // Fallback to hardcoded units if API fails
        this.units = [
          { id: 1, name: 'وحدة أعمال الحديدة', companyId: 1, enabledModules: ['financial'], isActive: true, createdAt: new Date(), updatedAt: new Date() },
          { id: 2, name: 'وحدة أعمال العباسي', companyId: 1, enabledModules: ['financial'], isActive: true, createdAt: new Date(), updatedAt: new Date() },
          { id: 3, name: 'وحدة محطة أعمال محطة معبر', companyId: 1, enabledModules: ['financial'], isActive: true, createdAt: new Date(), updatedAt: new Date() }
        ];
        this.selectedUnitId = this.units[0].id;
        this.unitContext.setSelectedUnit(this.units[0]);
      }
    });

    // Subscribe to unit changes
    this.unitContext.selectedUnit$.subscribe(unit => {
      if (unit) {
        this.selectedUnitId = unit.id;
      }
    });
  }

  onUnitChange() {
    const selectedUnit = this.units.find(u => u.id === Number(this.selectedUnitId));
    if (selectedUnit) {
      this.unitContext.setSelectedUnit(selectedUnit);
    }
  }

  toggleFinancial() {
    this.isFinancialOpen = !this.isFinancialOpen;
  }
}
