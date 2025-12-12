import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

interface StockTransaction {
  id: number;
  transactionNumber: string;
  transactionDate: string;
  referenceNumber?: string;
  totalAmount: string;
  isApproved: boolean;
  warehouse?: { name: string };
  supplier?: { name: string };
  paymentAccount?: { name: string };
}

@Component({
  selector: 'app-stock-in',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>📥 أوامر التوريد المخزني</h1>
        <p>إدارة عمليات إدخال البضائع للمخازن</p>
      </div>

      <div class="page-content">
        <div *ngIf="loading" class="loading">جاري التحميل...</div>
        <div *ngIf="error" class="error">{{ error }}</div>
        
        <div *ngIf="!loading && !error">
          <table class="data-table">
            <thead>
              <tr>
                <th>رقم الأمر</th>
                <th>المخزن</th>
                <th>التاريخ</th>
                <th>رقم المرجع</th>
                <th>المورد</th>
                <th>الإجمالي</th>
                <th>الحالة</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let transaction of transactions" 
                  (click)="viewDetails(transaction.id)"
                  style="cursor: pointer;">
                <td><strong>{{ transaction.transactionNumber }}</strong></td>
                <td>{{ transaction.warehouse?.name || '-' }}</td>
                <td>{{ formatDate(transaction.transactionDate) }}</td>
                <td>{{ transaction.referenceNumber || '-' }}</td>
                <td>{{ transaction.supplier?.name || '-' }}</td>
                <td class="amount">{{ formatAmount(transaction.totalAmount) }}</td>
                <td>
                  <span [class]="transaction.isApproved ? 'badge-success' : 'badge-warning'">
                    {{ transaction.isApproved ? 'معتمد' : 'قيد الانتظار' }}
                  </span>
                </td>
              </tr>
              <tr *ngIf="transactions.length === 0">
                <td colspan="7" class="empty">لا توجد أوامر توريد</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      padding: 20px;
    }
    .page-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      border-radius: 12px;
      margin-bottom: 20px;
    }
    .page-header h1 {
      margin: 0 0 8px 0;
      font-size: 28px;
    }
    .page-header p {
      margin: 0;
      opacity: 0.9;
    }
    .page-content {
      background: white;
      padding: 20px;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .loading, .error, .empty {
      text-align: center;
      padding: 40px;
      color: #666;
    }
    .error {
      color: #c33;
      background: #fee;
      border-radius: 8px;
    }
    .data-table {
      width: 100%;
      border-collapse: collapse;
    }
    .data-table th {
      background: #f8f9fa;
      padding: 12px;
      text-align: right;
      font-weight: 600;
      border-bottom: 2px solid #dee2e6;
    }
    .data-table td {
      padding: 12px;
      border-bottom: 1px solid #e9ecef;
    }
    .data-table tbody tr:hover {
      background: #f8f9fa;
    }
    .amount {
      font-weight: 600;
      color: #667eea;
    }
    .badge-success {
      background: #d4edda;
      color: #155724;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
    }
    .badge-warning {
      background: #fff3cd;
      color: #856404;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
    }
  `]
})
export class StockInComponent implements OnInit {
  transactions: StockTransaction[] = [];
  loading = true;
  error = '';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadTransactions();
  }

  loadTransactions() {
    this.loading = true;
    this.error = '';
    
    this.http.get<StockTransaction[]>(`${environment.apiUrl}/stock-transactions?transactionType=in`)
      .subscribe({
        next: (data) => {
          this.transactions = data;
          this.loading = false;
          console.log('Loaded transactions:', data.length);
        },
        error: (err) => {
          this.error = 'خطأ في تحميل البيانات: ' + err.message;
          this.loading = false;
          console.error('Error loading transactions:', err);
        }
      });
  }

  viewDetails(id: number) {
    this.router.navigate(['/inventory/stock-transaction', id]);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA');
  }

  formatAmount(amount: string): string {
    const num = parseFloat(amount);
    return num.toLocaleString('ar-SA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ريال';
  }
}
