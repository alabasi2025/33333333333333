import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
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
}

@Component({
  selector: 'app-stock-in-final',
  standalone: true,
  imports: [CommonModule, HttpClientModule, RouterModule],
  template: `
    <div class="page">
      <div class="header">
        <h1>📥 أوامر التوريد المخزني</h1>
        <p>إدارة عمليات إدخال البضائع للمخازن</p>
      </div>

      <div class="content">
        <div *ngIf="loading" class="loading">
          <div class="spinner"></div>
          <p>جاري تحميل البيانات...</p>
        </div>

        <div *ngIf="error" class="error-box">
          <strong>❌ خطأ:</strong> {{ error }}
        </div>

        <div *ngIf="!loading && !error" class="data-section">
          <div class="summary">
            <div class="stat-card">
              <div class="stat-value">{{ transactions.length }}</div>
              <div class="stat-label">إجمالي الأوامر</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">{{ getTotalAmount() }}</div>
              <div class="stat-label">الإجمالي الكلي</div>
            </div>
          </div>

          <table class="transactions-table">
            <thead>
              <tr>
                <th>رقم الأمر</th>
                <th>المخزن</th>
                <th>التاريخ</th>
                <th>رقم المرجع</th>
                <th>المورد</th>
                <th>المبلغ</th>
                <th>الحالة</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let t of transactions" class="transaction-row">
                <td><strong>{{ t.transactionNumber }}</strong></td>
                <td>{{ t.warehouse?.name || '-' }}</td>
                <td>{{ formatDate(t.transactionDate) }}</td>
                <td>{{ t.referenceNumber || '-' }}</td>
                <td>{{ t.supplier?.name || '-' }}</td>
                <td class="amount">{{ formatAmount(t.totalAmount) }}</td>
                <td>
                  <span [class]="t.isApproved ? 'badge success' : 'badge warning'">
                    {{ t.isApproved ? 'معتمد' : 'قيد الانتظار' }}
                  </span>
                </td>
                <td>
                  <button (click)="viewDetails(t.id)" class="btn-view">
                    👁️ عرض
                  </button>
                </td>
              </tr>
              <tr *ngIf="transactions.length === 0">
                <td colspan="8" class="empty">لا توجد أوامر توريد</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page { min-height: 100vh; background: #f5f7fa; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; border-radius: 16px; margin-bottom: 24px; box-shadow: 0 4px 12px rgba(102,126,234,0.3); }
    .header h1 { margin: 0 0 8px 0; font-size: 32px; font-weight: 700; }
    .header p { margin: 0; opacity: 0.95; font-size: 16px; }
    .content { background: white; border-radius: 16px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .loading { text-align: center; padding: 80px 20px; }
    .spinner { width: 50px; height: 50px; border: 4px solid #f3f3f3; border-top: 4px solid #667eea; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 16px; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    .loading p { color: #666; font-size: 16px; }
    .error-box { background: #fee; border: 1px solid #fcc; color: #c33; padding: 16px; border-radius: 8px; margin-bottom: 20px; }
    .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 32px; }
    .stat-card { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 24px; border-radius: 12px; text-align: center; }
    .stat-value { font-size: 32px; font-weight: 700; margin-bottom: 8px; }
    .stat-label { font-size: 14px; opacity: 0.9; }
    .transactions-table { width: 100%; border-collapse: collapse; }
    .transactions-table th { background: #f8f9fa; padding: 16px 12px; text-align: right; font-weight: 600; border-bottom: 2px solid #e2e8f0; font-size: 14px; color: #334155; }
    .transactions-table td { padding: 16px 12px; border-bottom: 1px solid #e9ecef; font-size: 14px; }
    .transaction-row:hover { background: #f8f9fa; }
    .amount { font-weight: 600; color: #667eea; font-size: 15px; }
    .badge { padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; display: inline-block; }
    .badge.success { background: #d4edda; color: #155724; }
    .badge.warning { background: #fff3cd; color: #856404; }
    .btn-view { background: #667eea; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 500; transition: all 0.2s; }
    .btn-view:hover { background: #5568d3; transform: translateY(-1px); }
    .empty { text-align: center; padding: 60px; color: #999; font-size: 16px; }
  `]
})
export class StockInFinalComponent implements OnInit {
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
    const url = `${environment.apiUrl}/stock-transactions?transactionType=in`;
    
    this.http.get<StockTransaction[]>(url).subscribe({
      next: (data) => {
        this.transactions = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'فشل تحميل البيانات. تأكد من اتصال الإنترنت.';
        this.loading = false;
        console.error('Error:', err);
      }
    });
  }

  viewDetails(id: number) {
    this.router.navigate(['/inventory/stock-transaction', id]);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('ar-SA');
  }

  formatAmount(amount: string): string {
    const num = parseFloat(amount);
    return num.toLocaleString('ar-SA', { minimumFractionDigits: 2 }) + ' ريال';
  }

  getTotalAmount(): string {
    const total = this.transactions.reduce((sum, t) => sum + parseFloat(t.totalAmount), 0);
    return this.formatAmount(total.toString());
  }
}
