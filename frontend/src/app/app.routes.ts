import { Routes } from '@angular/router';
import { SuppliersComponent } from './pages/suppliers/suppliers.component';
import { Dashboard } from './dashboard/dashboard';
import { ChartOfAccountsComponent } from './pages/chart-of-accounts/chart-of-accounts';
import { FinancialSettingsComponent } from './pages/financial-settings/financial-settings';
import { CashBoxesComponent } from './pages/cash-boxes/cash-boxes';
import { BanksComponent } from './pages/banks/banks';
import { PaymentVoucherComponent } from './pages/payment-voucher/payment-voucher';
import { ReceiptVoucherComponent } from './pages/receipt-voucher/receipt-voucher';

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
  { path: 'inventory', component: Dashboard },
  { path: 'purchases', component: Dashboard },
];
