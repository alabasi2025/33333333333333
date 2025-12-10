import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { UnitContextService } from '../services/unit-context.service';
import { Unit } from '../services/company.service';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, CommonModule, FormsModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar implements OnInit {
  isFinancialOpen = false;
  units: Unit[] = [];
  selectedUnitId: number | null = null;

  constructor(
    private http: HttpClient,
    private unitContext: UnitContextService
  ) {}

  ngOnInit() {
    console.log('🚀 Sidebar ngOnInit called');
    // Load units
    console.log('📦 Loading units from API...');
    this.http.get<Unit[]>('http://72.61.111.217/api/units').subscribe({
      next: (data) => {
        console.log('✅ Units loaded successfully:', data);
        console.log('📊 Number of units:', data.length);
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
        console.error('❌ Error loading units:', err);
        console.error('🔴 Error details:', JSON.stringify(err));
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
    if (this.selectedUnitId) {
      const selectedUnit = this.units.find(u => u.id === Number(this.selectedUnitId));
      if (selectedUnit) {
        this.unitContext.setSelectedUnit(selectedUnit);
      }
    }
  }

  toggleFinancial() {
    this.isFinancialOpen = !this.isFinancialOpen;
  }
}
