import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
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
}

@Component({
  selector: 'app-stock-in-merged',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  template: `
    <div class="page-container">
      <!-- Page Header -->
      <div class="page-header">
        <h1>📥 أوامر التوريد المخزني</h1>
        <p>إدارة عمليات إدخال البضائع للمخازن</p>
      </div>

      <div class="content-wrapper">
        <!-- Filter Section -->
        <div class="filter-section">
          <input 
            type="text" 
            class="search-input" 
            placeholder="البحث في أوامر التوريد..."
            [(ngModel)]="searchTerm"
            (input)="filterTransactions()">
          
          <button class="btn" (click)="resetSearch()">
            🔄 إعادة تعيين
          </button>
          
          <button class="btn btn-primary" (click)="createNew()">
            ➕ إنشاء أمر جديد
          </button>
        </div>

        <!-- Loading State -->
        <div *ngIf="loading" class="loading">
          <div class="spinner"></div>
          <p>جاري تحميل البيانات...</p>
        </div>

        <!-- Error State -->
        <div *ngIf="error" class="error-box">
          <strong>❌ خطأ:</strong> {{ error }}
        </div>

        <!-- Table -->
        <table *ngIf="!loading && !error" class="stock-table">
          <thead>
            <tr>
              <th>رقم الأمر</th>
              <th>المخزن</th>
              <th>التاريخ</th>
              <th>رقم المرجع</th>
              <th>المورد</th>
              <th>الإجمالي</th>
              <th>الحالة</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let t of paginatedTransactions" class="editable-row">
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
                <button class="action-btn view" (click)="viewTransaction(t.id)" title="عرض">
                  👁️
                </button>
                <button class="action-btn edit" (click)="editTransaction(t.id)" title="تعديل">
                  ✏️
                </button>
                <button class="action-btn delete" (click)="deleteTransaction(t.id)" title="حذف">
                  🗑️
                </button>
              </td>
            </tr>
            <tr *ngIf="filteredTransactions.length === 0">
              <td colspan="8" class="empty">لا توجد أوامر توريد</td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination -->
        <div *ngIf="!loading && filteredTransactions.length > 0" class="pagination">
          <button (click)="changePage(-1)" [disabled]="currentPage === 1">السابق</button>
          <button class="active">{{ currentPage }}</button>
          <button (click)="changePage(1)" [disabled]="currentPage === totalPages">التالي</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container { min-height: 100vh; background: #f0f2f5; padding: 20px; }
    .page-header { background: white; padding: 24px; margin-bottom: 24px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .page-header h1 { font-size: 24px; font-weight: 600; color: #262626; margin: 0 0 8px 0; }
    .page-header p { color: #8c8c8c; font-size: 14px; margin: 0; }
    .content-wrapper { background: white; border-radius: 8px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .filter-section { display: flex; gap: 12px; margin-bottom: 24px; align-items: center; }
    .search-input { flex: 1; padding: 8px 12px; border: 1px solid #d9d9d9; border-radius: 4px; font-size: 14px; }
    .search-input:focus { outline: none; border-color: #1890ff; box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2); }
    .btn { padding: 8px 16px; border: 1px solid #d9d9d9; background: white; border-radius: 4px; cursor: pointer; font-size: 14px; transition: all 0.3s; }
    .btn:hover { color: #1890ff; border-color: #1890ff; }
    .btn-primary { background: #1890ff; color: white; border-color: #1890ff; }
    .btn-primary:hover { background: #40a9ff; border-color: #40a9ff; }
    .loading { text-align: center; padding: 60px; }
    .spinner { width: 40px; height: 40px; border: 3px solid #f3f3f3; border-top: 3px solid #1890ff; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 16px; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    .error-box { background: #fff2f0; border: 1px solid #ffccc7; color: #ff4d4f; padding: 16px; border-radius: 8px; margin-bottom: 20px; }
    .stock-table { width: 100%; border-collapse: collapse; border: 1px solid #f0f0f0; }
    .stock-table thead { background: #fafafa; }
    .stock-table th { padding: 16px; text-align: right; font-weight: 600; font-size: 14px; color: rgba(0, 0, 0, 0.85); border-bottom: 1px solid #f0f0f0; }
    .stock-table td { padding: 16px; border-bottom: 1px solid #f0f0f0; font-size: 14px; color: rgba(0, 0, 0, 0.85); }
    .stock-table tbody tr:hover { background: #fafafa; }
    .editable-row { transition: background 0.3s; }
    .amount { font-weight: 600; color: #1890ff; }
    .badge { padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500; }
    .badge.success { background: #f6ffed; color: #52c41a; border: 1px solid #b7eb8f; }
    .badge.warning { background: #fffbe6; color: #faad14; border: 1px solid #ffe58f; }
    .action-btn { margin-left: 8px; padding: 4px 8px; border: none; background: transparent; cursor: pointer; font-size: 16px; transition: all 0.3s; }
    .action-btn.view { color: #1890ff; }
    .action-btn.view:hover { color: #40a9ff; }
    .action-btn.edit { color: #faad14; }
    .action-btn.edit:hover { color: #ffc53d; }
    .action-btn.delete { color: #ff4d4f; }
    .action-btn.delete:hover { color: #ff7875; }
    .pagination { margin-top: 24px; display: flex; justify-content: center; gap: 8px; }
    .pagination button { padding: 6px 12px; border: 1px solid #d9d9d9; background: white; border-radius: 4px; cursor: pointer; font-size: 14px; }
    .pagination button:hover:not(:disabled) { color: #1890ff; border-color: #1890ff; }
    .pagination button.active { background: #1890ff; color: white; border-color: #1890ff; }
    .pagination button:disabled { cursor: not-allowed; opacity: 0.4; }
    .empty { text-align: center; padding: 60px; color: #999; }
  `]
})
export class StockInMergedComponent implements OnInit {
  transactions: StockTransaction[] = [];
  filteredTransactions: StockTransaction[] = [];
  paginatedTransactions: StockTransaction[] = [];
  loading = true;
  error = '';
  searchTerm = '';
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;

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
        this.filteredTransactions = data;
        this.updatePagination();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'فشل تحميل البيانات';
        this.loading = false;
        console.error('Error:', err);
      }
    });
  }

  filterTransactions() {
    const term = this.searchTerm.toLowerCase();
    this.filteredTransactions = this.transactions.filter(t =>
      t.transactionNumber.toLowerCase().includes(term) ||
      (t.warehouse?.name || '').toLowerCase().includes(term) ||
      (t.supplier?.name || '').toLowerCase().includes(term) ||
      (t.referenceNumber || '').toLowerCase().includes(term)
    );
    this.currentPage = 1;
    this.updatePagination();
  }

  resetSearch() {
    this.searchTerm = '';
    this.filteredTransactions = this.transactions;
    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination() {
    this.totalPages = Math.ceil(this.filteredTransactions.length / this.pageSize);
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedTransactions = this.filteredTransactions.slice(start, end);
  }

  changePage(direction: number) {
    this.currentPage += direction;
    if (this.currentPage < 1) this.currentPage = 1;
    if (this.currentPage > this.totalPages) this.currentPage = this.totalPages;
    this.updatePagination();
  }

  viewTransaction(id: number) {
    this.router.navigate(['/inventory/stock-transaction', id]);
  }

  editTransaction(id: number) {
    alert(`تعديل الأمر رقم: ${id}`);
  }

  deleteTransaction(id: number) {
    if (confirm('هل أنت متأكد من حذف هذا الأمر؟')) {
      alert(`حذف الأمر رقم: ${id}`);
    }
  }

  createNew() {
    alert('إنشاء أمر توريد جديد');
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('ar-SA');
  }

  formatAmount(amount: string): string {
    const num = parseFloat(amount);
    return num.toLocaleString('ar-SA', { minimumFractionDigits: 2 }) + ' ريال';
  }
}
