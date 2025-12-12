import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface StockTransaction {
  id: number;
  transactionNumber: string;
  transactionType: string;
  transactionDate: string;
  referenceNumber?: string;
  notes?: string;
  totalAmount: string;
  isApproved: boolean;
  approvedBy?: string;
  approvedAt?: string;
  warehouse?: {
    name: string;
    code: string;
  };
  supplier?: {
    name: string;
    code: string;
  };
  paymentAccount?: {
    name: string;
  };
  items?: Array<{
    quantity: string;
    unitPrice: string;
    totalPrice: string;
    notes?: string;
    item?: {
      name: string;
      code: string;
    };
  }>;
}

@Component({
  selector: 'app-stock-transaction-details',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <div *ngIf="loading" class="loading">جاري التحميل...</div>
      <div *ngIf="error" class="error">{{ error }}</div>
      
      <div *ngIf="!loading && !error && transaction" class="transaction-details">
        <!-- Header -->
        <div class="details-header no-print">
          <button (click)="goBack()" class="btn-back">← رجوع</button>
          <button (click)="print()" class="btn-print">🖨️ طباعة</button>
        </div>

        <!-- Print Content -->
        <div class="print-content">
          <div class="document-header">
            <h1>نظام SEMOP</h1>
            <h2>أمر توريد مخزني</h2>
          </div>

          <!-- Transaction Info -->
          <div class="info-section">
            <div class="info-row">
              <div class="info-item">
                <label>رقم الأمر:</label>
                <span class="value">{{ transaction.transactionNumber }}</span>
              </div>
              <div class="info-item">
                <label>التاريخ:</label>
                <span class="value">{{ formatDate(transaction.transactionDate) }}</span>
              </div>
            </div>
            <div class="info-row">
              <div class="info-item">
                <label>المخزن:</label>
                <span class="value">{{ transaction.warehouse?.name }}</span>
              </div>
              <div class="info-item">
                <label>رقم المرجع:</label>
                <span class="value">{{ transaction.referenceNumber || '-' }}</span>
              </div>
            </div>
            <div class="info-row" *ngIf="transaction.supplier">
              <div class="info-item">
                <label>المورد:</label>
                <span class="value">{{ transaction.supplier.name }}</span>
              </div>
              <div class="info-item">
                <label>كود المورد:</label>
                <span class="value">{{ transaction.supplier.code }}</span>
              </div>
            </div>
          </div>

          <!-- Items Table -->
          <div class="items-section">
            <h3>الأصناف</h3>
            <table class="items-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>كود الصنف</th>
                  <th>اسم الصنف</th>
                  <th>الكمية</th>
                  <th>سعر الوحدة</th>
                  <th>الإجمالي</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let item of transaction.items; let i = index">
                  <td>{{ i + 1 }}</td>
                  <td>{{ item.item?.code }}</td>
                  <td>{{ item.item?.name }}</td>
                  <td>{{ formatNumber(item.quantity) }}</td>
                  <td>{{ formatAmount(item.unitPrice) }}</td>
                  <td>{{ formatAmount(item.totalPrice) }}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="5" class="total-label">الإجمالي الكلي</td>
                  <td class="total-value">{{ formatAmount(transaction.totalAmount) }}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <!-- Notes -->
          <div class="notes-section" *ngIf="transaction.notes">
            <label>ملاحظات:</label>
            <p>{{ transaction.notes }}</p>
          </div>

          <!-- Approval Info -->
          <div class="approval-section" *ngIf="transaction.isApproved">
            <div class="approval-badge">✓ معتمد</div>
            <p *ngIf="transaction.approvedBy">المعتمد: {{ transaction.approvedBy }}</p>
            <p *ngIf="transaction.approvedAt">تاريخ الاعتماد: {{ formatDate(transaction.approvedAt) }}</p>
          </div>

          <!-- Signatures -->
          <div class="signatures">
            <div class="signature-box">
              <label>المستلم</label>
              <div class="signature-line"></div>
            </div>
            <div class="signature-box">
              <label>المعتمد</label>
              <div class="signature-line"></div>
            </div>
          </div>

          <!-- Footer -->
          <div class="document-footer">
            <p>تاريخ الطباعة: {{ printDate }}</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container { padding: 20px; max-width: 1200px; margin: 0 auto; }
    .loading, .error { text-align: center; padding: 60px; font-size: 18px; }
    .error { color: #c33; background: #fee; border-radius: 8px; }
    .details-header { display: flex; justify-content: space-between; margin-bottom: 20px; }
    .btn-back, .btn-print { padding: 12px 24px; border: none; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer; }
    .btn-back { background: #e2e8f0; color: #334155; }
    .btn-print { background: #667eea; color: white; }
    .print-content { background: white; padding: 40px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .document-header { text-align: center; margin-bottom: 40px; border-bottom: 3px solid #667eea; padding-bottom: 20px; }
    .document-header h1 { margin: 0; font-size: 32px; color: #667eea; }
    .document-header h2 { margin: 10px 0 0 0; font-size: 24px; color: #334155; }
    .info-section { margin-bottom: 30px; }
    .info-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 15px; }
    .info-item { display: flex; gap: 10px; }
    .info-item label { font-weight: 600; color: #64748b; min-width: 100px; }
    .info-item .value { color: #1e293b; font-weight: 500; }
    .items-section { margin-bottom: 30px; }
    .items-section h3 { margin: 0 0 15px 0; color: #334155; font-size: 20px; }
    .items-table { width: 100%; border-collapse: collapse; border: 1px solid #e2e8f0; }
    .items-table th { background: #f8f9fa; padding: 12px; text-align: right; font-weight: 600; border: 1px solid #e2e8f0; }
    .items-table td { padding: 10px 12px; border: 1px solid #e2e8f0; }
    .items-table tfoot td { font-weight: 600; background: #f8f9fa; }
    .total-label { text-align: left !important; }
    .total-value { color: #667eea; font-size: 18px; }
    .notes-section { margin-bottom: 30px; padding: 15px; background: #f8f9fa; border-radius: 8px; }
    .notes-section label { font-weight: 600; color: #334155; display: block; margin-bottom: 8px; }
    .approval-section { margin-bottom: 30px; padding: 15px; background: #d4edda; border-radius: 8px; }
    .approval-badge { font-weight: 600; color: #155724; font-size: 18px; margin-bottom: 10px; }
    .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin: 40px 0; }
    .signature-box { text-align: center; }
    .signature-box label { display: block; font-weight: 600; color: #334155; margin-bottom: 40px; }
    .signature-line { border-top: 2px solid #334155; margin-top: 60px; }
    .document-footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 14px; }
    @media print {
      .page-container { padding: 0; }
      .no-print { display: none !important; }
      .print-content { box-shadow: none; padding: 20px; }
    }
  `]
})
export class StockTransactionDetailsComponent implements OnInit {
  transaction: StockTransaction | null = null;
  loading = true;
  error = '';
  printDate = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {
    this.printDate = new Date().toLocaleDateString('ar-SA');
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadTransaction(parseInt(id));
    } else {
      this.error = 'معرف الأمر غير صحيح';
      this.loading = false;
    }
  }

  loadTransaction(id: number) {
    this.loading = true;
    this.error = '';

    this.http.get<StockTransaction>(`${environment.apiUrl}/stock-transactions/${id}`)
      .subscribe({
        next: (data) => {
          this.transaction = data;
          this.loading = false;
        },
        error: (err) => {
          this.error = 'خطأ في تحميل البيانات';
          this.loading = false;
        }
      });
  }

  goBack() {
    this.router.navigate(['/inventory/stock-in']);
  }

  print() {
    window.print();
  }

  formatDate(dateString: string): string {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('ar-SA');
  }

  formatAmount(amount: string): string {
    return parseFloat(amount).toLocaleString('ar-SA', { minimumFractionDigits: 2 }) + ' ريال';
  }

  formatNumber(num: string): string {
    return parseFloat(num).toLocaleString('ar-SA', { minimumFractionDigits: 3 });
  }
}
