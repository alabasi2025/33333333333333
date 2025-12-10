import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface Unit {
  id: number;
  name: string;
  code?: string;
  enabledModules?: string[];
}

@Component({
  selector: 'app-unit-selector',
  standalone: true,
  imports: [CommonModule],
  template: `<ng-container *ngIf="!isLoading && selectedUnit">
  <div class="unit-selector" (click)="toggleDropdown()">
    <span class="unit-label">🏢 الوحدة الحالية:</span>
    <span class="unit-name">{{ selectedUnit.name }}</span>
    <span class="dropdown-arrow">▼</span>
  </div>

  <div class="dropdown-menu" *ngIf="isDropdownOpen">
    <div class="dropdown-header">
      <span>اختر الوحدة</span>
      <button class="close-btn" (click)="toggleDropdown(); $event.stopPropagation()">✕</button>
    </div>
    <div class="units-list">
      <div *ngFor="let unit of units" 
           class="unit-item"
           [class.active]="unit.id === selectedUnit?.id"
           (click)="selectUnit(unit); $event.stopPropagation()">
        <div class="unit-info">
          <span class="unit-name-item">{{ unit.name }}</span>
          <span class="unit-code" *ngIf="unit.code">({{ unit.code }})</span>
          <span class="check-mark" *ngIf="unit.id === selectedUnit?.id">✓</span>
        </div>
        <div class="unit-modules" *ngIf="unit.enabledModules && unit.enabledModules.length > 0">
          <span *ngFor="let module of unit.enabledModules" 
                class="module-badge"
                [title]="getModuleName(module)">
            {{ getModuleIcon(module) }}
          </span>
          <span class="modules-count">{{ unit.enabledModules.length }} وحدات نشطة</span>
        </div>
      </div>
    </div>
  </div>
</ng-container>

<div *ngIf="isLoading" class="unit-selector loading">
  <span>جاري التحميل...</span>
</div>`,
  styles: [`
    .unit-selector {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      background: white;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .unit-selector:hover {
      box-shadow: 0 4px 8px rgba(0,0,0,0.15);
    }

    .unit-selector.loading {
      cursor: wait;
      opacity: 0.7;
    }

    .unit-label {
      font-size: 14px;
      color: #666;
    }

    .unit-name {
      font-weight: 600;
      color: #333;
    }

    .dropdown-arrow {
      margin-left: auto;
      color: #666;
      transition: transform 0.3s;
    }

    .dropdown-menu {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      margin-top: 8px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 1000;
      max-height: 400px;
      overflow-y: auto;
    }

    .dropdown-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      border-bottom: 1px solid #eee;
      font-weight: 600;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 20px;
      cursor: pointer;
      color: #999;
    }

    .close-btn:hover {
      color: #333;
    }

    .units-list {
      padding: 8px;
    }

    .unit-item {
      padding: 12px;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
      margin-bottom: 4px;
    }

    .unit-item:hover {
      background: #f5f5f5;
    }

    .unit-item.active {
      background: #e3f2fd;
    }

    .unit-info {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
    }

    .unit-name-item {
      font-weight: 600;
    }

    .unit-code {
      color: #666;
      font-size: 12px;
    }

    .check-mark {
      margin-left: auto;
      color: #4CAF50;
      font-weight: bold;
    }

    .unit-modules {
      display: flex;
      align-items: center;
      gap: 4px;
      flex-wrap: wrap;
    }

    .module-badge {
      font-size: 16px;
    }

    .modules-count {
      font-size: 12px;
      color: #666;
      margin-left: 8px;
    }
  `]
})
export class UnitSelectorComponent implements OnInit {
  units: Unit[] = [];
  selectedUnit: Unit | null = null;
  isDropdownOpen = false;
  isLoading = true;

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {
    console.log('🚀 UnitSelectorComponent - Constructor called');
  }

  ngOnInit() {
    console.log('🚀 UnitSelectorComponent - ngOnInit called');
    this.loadUnits();
  }

  loadUnits() {
    console.log('🔄 جاري تحميل الوحدات من API');
    
    const apiUrl = `${environment.apiUrl}/units`;
    console.log('🌐 API URL:', apiUrl);

    this.http.get<Unit[]>(apiUrl).subscribe({
      next: (data) => {
        console.log('✅ تم تحميل الوحدات:', data);
        this.units = data;
        
        // تحميل الوحدة المحفوظة أو اختيار الأولى
        const savedUnitId = localStorage.getItem('selectedUnitId');
        if (savedUnitId) {
          this.selectedUnit = this.units.find(u => u.id === parseInt(savedUnitId)) || this.units[0];
        } else {
          this.selectedUnit = this.units[0];
        }
        
        this.isLoading = false;
        console.log('✅ تم اختيار الوحدة:', this.selectedUnit);
        
        // إجبار Angular على التحديث
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('❌ خطأ في تحميل الوحدات:', error);
        
        // استخدام بيانات وهمية كـ fallback
        this.units = [
          {
            id: 1,
            name: 'وحدة أعمال الحديدة',
            code: 'HODEIDAH',
            enabledModules: ['financial', 'inventory', 'suppliers', 'purchases', 'sales']
          },
          {
            id: 2,
            name: 'وحدة أعمال العباسي',
            code: 'ALABASI',
            enabledModules: ['financial', 'inventory', 'suppliers', 'purchases', 'sales', 'hr']
          },
          {
            id: 3,
            name: 'وحدة محطة أعمال محطة معبر',
            code: 'MABAR',
            enabledModules: ['financial', 'inventory', 'suppliers', 'purchases']
          }
        ];
        
        this.selectedUnit = this.units[0];
        this.isLoading = false;
        console.log('⚠️ استخدام بيانات وهمية');
        
        // إجبار Angular على التحديث
        this.cdr.detectChanges();
      }
    });
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
    console.log('🔽 Dropdown:', this.isDropdownOpen);
  }

  selectUnit(unit: Unit) {
    console.log('✅ اختيار وحدة:', unit);
    this.selectedUnit = unit;
    this.isDropdownOpen = false;
    
    // حفظ في localStorage
    localStorage.setItem('selectedUnitId', unit.id.toString());
    
    // إعادة تحميل الصفحة لتحديث البيانات
    window.location.reload();
  }

  getModuleIcon(module: string): string {
    const icons: { [key: string]: string } = {
      'financial': '💰',
      'inventory': '📦',
      'suppliers': '🏢',
      'purchases': '🛒',
      'sales': '💵',
      'hr': '👥'
    };
    return icons[module] || '📋';
  }

  getModuleName(module: string): string {
    const names: { [key: string]: string } = {
      'financial': 'المالية',
      'inventory': 'المخزون',
      'suppliers': 'الموردين',
      'purchases': 'المشتريات',
      'sales': 'المبيعات',
      'hr': 'الموارد البشرية'
    };
    return names[module] || module;
  }
}
