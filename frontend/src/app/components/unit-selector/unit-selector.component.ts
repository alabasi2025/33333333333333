import { Component, OnInit } from '@angular/core';
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
export class UnitSelectorComponent implements OnInit {
  units: Unit[] = [];
  selectedUnit: Unit | null = null;
  isDropdownOpen = false;
  isLoading = true;

  constructor() {}

  ngOnInit() {
    this.loadUnits();
  }

  async loadUnits() {
    const apiUrl = 'http://72.61.111.217/api/units';
    console.log('🔄 جاري تحميل الوحدات من API:', apiUrl);
    
    try {
      const response = await fetch(apiUrl);
      console.log('📡 Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const units = await response.json();
      console.log('✅ تم تحميل الوحدات:', units);
      
      // تحويل البيانات من API إلى الصيغة المطلوبة
      this.units = units.map((unit: any) => ({
        id: unit.id,
        name: unit.name,
        code: unit.code || `UNIT-${unit.id}`,
        activeModules: unit.enabledModules || unit.activeModules || []
      }));

      // تحميل الوحدة المحفوظة أو اختيار الأولى
      const savedUnitId = localStorage.getItem('selectedUnitId');
      if (savedUnitId) {
        const savedUnit = this.units.find(u => u.id === parseInt(savedUnitId));
        this.selectedUnit = savedUnit || this.units[0];
      } else {
        this.selectedUnit = this.units[0];
      }

      this.isLoading = false;
      
      // حفظ الوحدة المختارة
      if (this.selectedUnit) {
        this.saveSelectedUnit(this.selectedUnit);
      }
      
      console.log('✅ تم اختيار الوحدة:', this.selectedUnit);
    } catch (error) {
      console.error('❌ خطأ في تحميل الوحدات:', error);
      this.isLoading = false;
      
      // استخدام بيانات وهمية في حالة الخطأ
      this.useFallbackData();
    }
  }

  useFallbackData() {
    console.log('⚠️ استخدام البيانات الوهمية...');
    this.units = [
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
    this.selectedUnit = this.units[0];
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  selectUnit(unit: Unit) {
    console.log('✅ تم اختيار الوحدة:', unit.name);
    this.selectedUnit = unit;
    this.isDropdownOpen = false;
    
    // حفظ في localStorage
    this.saveSelectedUnit(unit);
    
    // إطلاق حدث لإعلام باقي المكونات
    window.dispatchEvent(new CustomEvent('unitChanged', { 
      detail: { unitId: unit.id, unitName: unit.name } 
    }));
    
    // إعادة تحميل الصفحة لتحديث البيانات
    window.location.reload();
  }

  saveSelectedUnit(unit: Unit) {
    localStorage.setItem('selectedUnitId', unit.id.toString());
    localStorage.setItem('selectedUnitName', unit.name);
    localStorage.setItem('selectedUnitCode', unit.code);
  }

  getModuleCount(unit: Unit): number {
    return unit.activeModules?.length || 0;
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
