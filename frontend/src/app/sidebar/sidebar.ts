import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { UnitContextService } from '../services/unit-context.service';

interface Unit {
  id: number;
  companyId: number;
  name: string;
  description?: string;
  enabledModules: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

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
    private http: HttpClient,
    private unitContext: UnitContextService
  ) {}

  ngOnInit() {
    // Try to load from API first
    this.http.get<any[]>('http://72.61.111.217/api/units').subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          this.units = data;
          this.initializeSelectedUnit();
        } else {
          this.useFallbackData();
        }
      },
      error: () => {
        this.useFallbackData();
      }
    });

    // Subscribe to unit changes
    this.unitContext.selectedUnit$.subscribe(unit => {
      if (unit) {
        this.selectedUnitId = unit.id;
      }
    });
  }

  private useFallbackData() {
    this.units = [
      { 
        id: 1, 
        name: 'وحدة أعمال الحديدة', 
        companyId: 1, 
        enabledModules: ['financial', 'inventory', 'suppliers', 'purchases', 'sales'], 
        isActive: true, 
        createdAt: new Date(), 
        updatedAt: new Date() 
      },
      { 
        id: 2, 
        name: 'وحدة أعمال العباسي', 
        companyId: 1, 
        enabledModules: ['financial', 'inventory', 'suppliers', 'purchases', 'sales', 'hr'], 
        isActive: true, 
        createdAt: new Date(), 
        updatedAt: new Date() 
      },
      { 
        id: 3, 
        name: 'وحدة محطة أعمال محطة معبر', 
        companyId: 1, 
        enabledModules: ['financial', 'inventory', 'suppliers', 'purchases'], 
        isActive: true, 
        createdAt: new Date(), 
        updatedAt: new Date() 
      }
    ];
    this.initializeSelectedUnit();
  }

  private initializeSelectedUnit() {
    const savedUnit = this.unitContext.getSelectedUnit();
    if (savedUnit) {
      this.selectedUnitId = savedUnit.id;
    } else if (this.units.length > 0) {
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
