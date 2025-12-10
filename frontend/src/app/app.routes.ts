import { Routes } from '@angular/router';
import { SuppliersComponent } from './pages/suppliers/suppliers.component';

export const routes: Routes = [
  { path: '', redirectTo: '/suppliers', pathMatch: 'full' },
  { path: 'suppliers', component: SuppliersComponent },
];
