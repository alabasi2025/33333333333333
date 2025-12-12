import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface StockTransactionDetail {
  id: number;
  transactionNumber: string;
  transactionType: string;
  transactionDate: Date;
  referenceNumber: string;
  warehouse: {
    code: string;
    name: string;
  };
  supplier?: {
    code: string;
    name: string;
  };
  items: Array<{
    itemCode: string;
    itemName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    notes?: string;
  }>;
  totalAmount: number;
  notes?: string;
  createdBy?: string;
  isApproved: boolean;
  approvedBy?: string;
  approvedAt?: Date;
}

@Component({
  selector: 'app-stock-transaction-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stock-transaction-details.component.html',
  styleUrls: ['./stock-transaction-details.component.css']
})
export class StockTransactionDetailsComponent implements OnInit {
  transaction: StockTransactionDetail | null = null;
  loading = true;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadTransactionDetails(parseInt(id));
    }
  }

  loadTransactionDetails(id: number) {
    this.loading = true;
    this.http.get(`${environment.apiUrl}/stock-transactions/${id}`).subscribe({
      next: (response: any) => {
        this.transaction = response;
        this.loading = false;
      },
      error: (error) => {
        console.error('خطأ في تحميل تفاصيل الأمر:', error);
        this.error = 'حدث خطأ في تحميل تفاصيل الأمر';
        this.loading = false;
      }
    });
  }

  print() {
    window.print();
  }

  goBack() {
    this.router.navigate(['/warehouses/stock-in']);
  }

  getTransactionTypeText(): string {
    if (!this.transaction) return '';
    return this.transaction.transactionType === 'in' ? 'أمر توريد' : 'أمر صرف';
  }
}
