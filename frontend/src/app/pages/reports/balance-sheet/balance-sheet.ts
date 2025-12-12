import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface AccountItem {
  accountCode: string;
  accountName: string;
  amount: number;
}

interface BalanceSheetReport {
  asOfDate: string;
  assets: {
    items: AccountItem[];
    total: number;
  };
  liabilities: {
    items: AccountItem[];
    total: number;
  };
  equity: {
    items: AccountItem[];
    total: number;
  };
  totalLiabilitiesAndEquity: number;
  difference: number;
  isBalanced: boolean;
}

@Component({
  selector: 'app-balance-sheet',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './balance-sheet.html',
  styleUrls: ['./balance-sheet.css']
})
export class BalanceSheetComponent implements OnInit {
  report: BalanceSheetReport | null = null;
  loading = false;
  error: string | null = null;
  asOfDate: string = '';
  
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);
  private apiUrl = '/api';

  constructor() {
    const today = new Date();
    this.asOfDate = today.toISOString().split('T')[0];
  }

  ngOnInit() {
    this.loadReport();
  }

  loadReport() {
    if (!this.asOfDate) {
      this.error = 'يرجى تحديد التاريخ';
      return;
    }

    this.loading = true;
    this.error = null;

    const params = new URLSearchParams({
      asOfDate: this.asOfDate
    });

    this.http.get<BalanceSheetReport>(`${this.apiUrl}/reports/balance-sheet?${params}`)
      .subscribe({
        next: (data) => {
          this.report = data;
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.error = 'حدث خطأ أثناء تحميل التقرير';
          this.loading = false;
          console.error('Error loading balance sheet:', err);
          this.cdr.detectChanges();
        }
      });
  }

  printReport() {
    window.print();
  }
}
