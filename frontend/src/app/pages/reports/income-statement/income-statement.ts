import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface AccountItem {
  accountCode: string;
  accountName: string;
  amount: number;
}

interface IncomeStatementReport {
  period: {
    startDate: string;
    endDate: string;
  };
  revenue: {
    items: AccountItem[];
    total: number;
  };
  expenses: {
    items: AccountItem[];
    total: number;
  };
  netIncome: number;
}

@Component({
  selector: 'app-income-statement',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './income-statement.html',
  styleUrls: ['./income-statement.css']
})
export class IncomeStatementComponent implements OnInit {
  report: IncomeStatementReport | null = null;
  loading = false;
  error: string | null = null;
  startDate: string = '';
  endDate: string = '';
  
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);
  private apiUrl = '/api';

  constructor() {
    const today = new Date();
    const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
    this.startDate = firstDayOfYear.toISOString().split('T')[0];
    this.endDate = today.toISOString().split('T')[0];
  }

  ngOnInit() {
    this.loadReport();
  }

  loadReport() {
    if (!this.startDate || !this.endDate) {
      this.error = 'يرجى تحديد تاريخ البداية والنهاية';
      return;
    }

    this.loading = true;
    this.error = null;

    const params = new URLSearchParams({
      startDate: this.startDate,
      endDate: this.endDate
    });

    this.http.get<IncomeStatementReport>(`${this.apiUrl}/reports/income-statement?${params}`)
      .subscribe({
        next: (data) => {
          this.report = data;
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.error = 'حدث خطأ أثناء تحميل التقرير';
          this.loading = false;
          console.error('Error loading income statement:', err);
          this.cdr.detectChanges();
        }
      });
  }

  printReport() {
    window.print();
  }
}
