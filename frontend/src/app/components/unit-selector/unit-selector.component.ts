import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Unit {
  id: number;
  name: string;
  code: string;
  activeModules: string[];
}

@Component({
  selector: 'app-unit-selector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './unit-selector.component.html',
  styleUrls: ['./unit-selector.component.css']
})
export class UnitSelectorComponent {
  // بيانات وهمية للاختبار فقط
  units: Unit[] = [
    {
      id: 1,
      name: 'وحدة أعمال الحديدة',
      code: 'HODEIDAH',
      activeModules: ['financial', 'inventory', 'suppliers', 'purchases', 'sales']
    },
    {
      id: 2,
      name: 'وحدة أعمال العباسي',
      code: 'ALABASI',
      activeModules: ['financial', 'inventory', 'suppliers', 'purchases', 'sales', 'hr']
    },
    {
      id: 3,
      name: 'وحدة محطة أعمال محطة معبر',
      code: 'MABAR',
      activeModules: ['financial', 'inventory', 'suppliers', 'purchases']
    }
  ];

  selectedUnit: Unit = this.units[0];
  isDropdownOpen = false;

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  selectUnit(unit: Unit) {
    this.selectedUnit = unit;
    this.isDropdownOpen = false;
    console.log('✅ تم اختيار الوحدة:', unit.name);
    
    // حفظ في localStorage
    localStorage.setItem('selectedUnitId', unit.id.toString());
    localStorage.setItem('selectedUnitName', unit.name);
  }

  getModuleCount(unit: Unit): number {
    return unit.activeModules.length;
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
      'inventory': 'المخازن',
      'suppliers': 'الموردين',
      'purchases': 'المشتريات',
      'sales': 'المبيعات',
      'hr': 'الموارد البشرية'
    };
    return names[module] || module;
  }
}
