import { Routes } from '@angular/router';
import { SuppliersComponent } from './pages/suppliers/suppliers.component';
import { Dashboard } from './dashboard/dashboard';
import { ChartOfAccountsComponent } from './pages/chart-of-accounts/chart-of-accounts';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: Dashboard },
  { path: 'suppliers', component: SuppliersComponent },
  { path: 'financial', component: Dashboard },
  { path: 'financial/chart-of-accounts', component: ChartOfAccountsComponent },
  { path: 'inventory', component: Dashboard },
  { path: 'purchases', component: Dashboard },
];
