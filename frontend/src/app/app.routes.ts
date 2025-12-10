import { Routes } from '@angular/router';
import { SuppliersComponent } from './pages/suppliers/suppliers.component';
import { Dashboard } from './dashboard/dashboard';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: Dashboard },
  { path: 'suppliers', component: SuppliersComponent },
  { path: 'financial', component: Dashboard },
  { path: 'inventory', component: Dashboard },
  { path: 'purchases', component: Dashboard },
];
