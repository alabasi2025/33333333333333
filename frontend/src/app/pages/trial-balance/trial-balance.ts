import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
  error: string | null = null;
  startDate: string = '';
  endDate: string = '';
  
  private apiUrl = '/api';

  ngOnInit() {
    console.log('TrialBalanceComponent initialized');
    this.loadReport();
  }

  async loadReport() {
    console.log('Loading trial balance report...');
    this.loading = true;
    this.error = null;
    
    try {
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

      console.log('Fetching from URL:', url);

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: TrialBalanceReport = await response.json();
      console.log('Data received:', data);
      
      this.report = data;
      this.loading = false;
    } catch (error: any) {
      console.error('Error loading trial balance:', error);
      this.error = 'حدث خطأ أثناء تحميل ميزان المراجعة: ' + (error.message || 'خطأ غير معروف');
      this.loading = false;
    }
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
