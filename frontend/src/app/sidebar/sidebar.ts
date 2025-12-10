import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UnitContextService } from '../services/unit-context.service';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, CommonModule, FormsModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar implements OnInit {
  isFinancialOpen = false;
  
  // Hardcoded units - simple and guaranteed to work
  units = [
    { id: 1, name: 'وحدة أعمال الحديدة', companyId: 1, enabledModules: ['financial'], isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 2, name: 'وحدة أعمال العباسي', companyId: 1, enabledModules: ['financial'], isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 3, name: 'وحدة محطة أعمال محطة معبر', companyId: 1, enabledModules: ['financial'], isActive: true, createdAt: new Date(), updatedAt: new Date() }
  ];
  
  selectedUnitId: number = 1;

  constructor(private unitContext: UnitContextService) {}

  ngOnInit() {
    // Auto-select first unit
    const savedUnit = this.unitContext.getSelectedUnit();
    if (savedUnit) {
      this.selectedUnitId = savedUnit.id;
    } else {
      this.selectedUnitId = this.units[0].id;
      this.unitContext.setSelectedUnit(this.units[0]);
    }
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
