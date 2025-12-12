import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface CashFlowItem {
  date: string;
  description: string;
  accountCode: string;
  accountName: string;
  amount: number;
}

interface CashFlowReport {
  period: {
    startDate: string;
    endDate: string;
  };
  openingBalance: number;
  cashFlowItems: CashFlowItem[];
  totalCashFlow: number;
  closingBalance: number;
}

@Component({
  selector: 'app-cash-flow',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cash-flow.html',
  styleUrls: ['./cash-flow.css']
})
export class CashFlowComponent implements OnInit {
  report: CashFlowReport | null = null;
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

    this.http.get<CashFlowReport>(`${this.apiUrl}/reports/cash-flow?${params}`)
      .subscribe({
        next: (data) => {
          this.report = data;
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.error = 'حدث خطأ أثناء تحميل التقرير';
          this.loading = false;
          console.error('Error loading cash flow:', err);
          this.cdr.detectChanges();
        }
      });
  }

  printReport() {
    window.print();
  }
}
