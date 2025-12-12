import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';

interface DashboardStats {
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  cashBalance: number;
  accountsCount: number;
  suppliersCount: number;
  itemsCount: number;
  warehousesCount: number;
}

interface RecentTransaction {
  id: number;
  date: string;
  description: string;
  amount: number;
  type: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  stats: DashboardStats = {
    totalRevenue: 0,
    totalExpenses: 0,
    netIncome: 0,
    cashBalance: 0,
    accountsCount: 0,
    suppliersCount: 0,
    itemsCount: 0,
    warehousesCount: 0
  };

  recentTransactions: RecentTransaction[] = [];
  loading = true;

  private http = inject(HttpClient);
  private apiUrl = '/api';

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.loading = true;

    // Load stats
    Promise.all([
      this.http.get<any>(`${this.apiUrl}/reports/income-statement?startDate=2024-01-01&endDate=2024-12-31`).toPromise(),
      this.http.get<any>(`${this.apiUrl}/reports/cash-flow?startDate=2024-01-01&endDate=2024-12-31`).toPromise(),
      this.http.get<any[]>(`${this.apiUrl}/accounts`).toPromise(),
      this.http.get<any[]>(`${this.apiUrl}/suppliers`).toPromise(),
      this.http.get<any[]>(`${this.apiUrl}/items`).toPromise(),
      this.http.get<any[]>(`${this.apiUrl}/warehouses`).toPromise(),
    ]).then(([incomeStatement, cashFlow, accounts, suppliers, items, warehouses]) => {
      this.stats.totalRevenue = incomeStatement?.revenue?.total || 0;
      this.stats.totalExpenses = incomeStatement?.expenses?.total || 0;
      this.stats.netIncome = incomeStatement?.netIncome || 0;
      this.stats.cashBalance = cashFlow?.closingBalance || 0;
      this.stats.accountsCount = accounts?.length || 0;
      this.stats.suppliersCount = suppliers?.length || 0;
      this.stats.itemsCount = items?.length || 0;
      this.stats.warehousesCount = warehouses?.length || 0;

      // Extract recent transactions from cash flow
      if (cashFlow?.cashFlowItems) {
        this.recentTransactions = cashFlow.cashFlowItems
          .slice(-5)
          .reverse()
          .map((item: any, index: number) => ({
            id: index + 1,
            date: item.date,
            description: item.description,
            amount: item.amount,
            type: item.amount > 0 ? 'income' : 'expense'
          }));
      }

      this.loading = false;
    }).catch(error => {
      console.error('Error loading dashboard data:', error);
      this.loading = false;
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('ar-YE', {
      style: 'currency',
      currency: 'YER',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  formatNumber(num: number): string {
    return new Intl.NumberFormat('ar-YE').format(num);
  }
}
