import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface TrialBalanceItem {
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
  balance: number;
  balanceType: 'debit' | 'credit';
}

interface TrialBalanceReport {
  items: TrialBalanceItem[];
  totalDebit: number;
  totalCredit: number;
  difference: number;
  isBalanced: boolean;
}

@Component({
  selector: 'app-trial-balance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './trial-balance.html',
  styleUrls: ['./trial-balance.css']
})
export class TrialBalanceComponent implements OnInit {
  report: TrialBalanceReport | null = null;
  loading = false;
  startDate: string = '';
  endDate: string = '';
  
  private apiUrl = '/api';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadReport();
  }

  loadReport() {
    this.loading = true;
    
    let url = `${this.apiUrl}/reports/trial-balance`;
    const params: string[] = [];
    
    if (this.startDate) {
      params.push(`startDate=${this.startDate}`);
    }
    if (this.endDate) {
      params.push(`endDate=${this.endDate}`);
    }
    
    if (params.length > 0) {
      url += '?' + params.join('&');
    }

    this.http.get<TrialBalanceReport>(url).subscribe({
      next: (data) => {
        this.report = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading trial balance:', error);
        alert('حدث خطأ أثناء تحميل ميزان المراجعة');
        this.loading = false;
      }
    });
  }

  printReport() {
    window.print();
  }

  exportToExcel() {
    if (!this.report) return;

    // تحويل البيانات إلى CSV
    let csv = 'رقم الحساب,اسم الحساب,مدين,دائن,الرصيد,نوع الرصيد\n';
    
    this.report.items.forEach(item => {
      csv += `${item.accountCode},${item.accountName},${item.debit.toFixed(2)},${item.credit.toFixed(2)},${item.balance.toFixed(2)},${item.balanceType === 'debit' ? 'مدين' : 'دائن'}\n`;
    });
    
    csv += `\nالإجمالي,,${this.report.totalDebit.toFixed(2)},${this.report.totalCredit.toFixed(2)},,\n`;
    csv += `الفرق,,,${this.report.difference.toFixed(2)},,\n`;
    csv += `متوازن,,,${this.report.isBalanced ? 'نعم' : 'لا'},,\n`;

    // تنزيل الملف
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `trial-balance-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  resetFilters() {
    this.startDate = '';
    this.endDate = '';
    this.loadReport();
  }
}
