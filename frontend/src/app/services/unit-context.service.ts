import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Unit } from './company.service';

@Injectable({
  providedIn: 'root'
})
export class UnitContextService {
  private selectedUnitSubject = new BehaviorSubject<Unit | null>(null);
  public selectedUnit$: Observable<Unit | null> = this.selectedUnitSubject.asObservable();

  constructor() {
    // Load from localStorage if available
    const savedUnit = localStorage.getItem('selectedUnit');
    if (savedUnit) {
      try {
        this.selectedUnitSubject.next(JSON.parse(savedUnit));
      } catch (e) {
        console.error('Error loading saved unit:', e);
      }
    }
  }

  getSelectedUnit(): Unit | null {
    return this.selectedUnitSubject.value;
  }

  getSelectedUnitId(): number | null {
    return this.selectedUnitSubject.value?.id || null;
  }

  setSelectedUnit(unit: Unit | null): void {
    this.selectedUnitSubject.next(unit);
    if (unit) {
      localStorage.setItem('selectedUnit', JSON.stringify(unit));
    } else {
      localStorage.removeItem('selectedUnit');
    }
  }

  isModuleEnabled(moduleId: string): boolean {
    const unit = this.getSelectedUnit();
    return unit?.enabledModules?.includes(moduleId) || false;
  }
}
