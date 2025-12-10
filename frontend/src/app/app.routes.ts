import { Routes } from '@angular/router';
import { SuppliersComponent } from './pages/suppliers/suppliers.component';
import { Dashboard } from './dashboard/dashboard';
import { ChartOfAccountsComponent } from './pages/chart-of-accounts/chart-of-accounts';
import { FinancialSettingsComponent } from './pages/financial-settings/financial-settings';
import { CashBoxesComponent } from './pages/cash-boxes/cash-boxes';
import { BanksComponent } from './pages/banks/banks';
import { PaymentVoucherComponent } from './pages/payment-voucher/payment-voucher';
import { ReceiptVoucherComponent } from './pages/receipt-voucher/receipt-voucher';
import { TrialBalanceComponent } from './pages/trial-balance/trial-balance';
import { WarehousesComponent } from './pages/warehouses/warehouses';
import { ItemsComponent } from './pages/items/items';
import { WarehouseGroupsComponent } from './pages/warehouse-groups/warehouse-groups';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: Dashboard },
  { path: 'suppliers', component: SuppliersComponent },
  { path: 'financial', component: Dashboard },
  { path: 'financial/settings', component: FinancialSettingsComponent },
  { path: 'financial/chart-of-accounts', component: ChartOfAccountsComponent },
  { path: 'financial/cash-boxes', component: CashBoxesComponent },
  { path: 'financial/banks', component: BanksComponent },
  { path: 'financial/payment-voucher', component: PaymentVoucherComponent },
  { path: 'financial/receipt-voucher', component: ReceiptVoucherComponent },
  { path: 'financial/trial-balance', component: TrialBalanceComponent },
  { path: 'inventory', component: Dashboard },
  { path: 'inventory/warehouse-groups', component: WarehouseGroupsComponent },
  { path: 'inventory/warehouses', component: WarehousesComponent },
  { path: 'inventory/items', component: ItemsComponent },
  { path: 'purchases', component: Dashboard },
];
