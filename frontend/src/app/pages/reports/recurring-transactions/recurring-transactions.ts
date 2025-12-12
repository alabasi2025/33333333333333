import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface RecurringTransaction {
  id: number;
  name: string;
  description: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: string;
  endDate: string | null;
  nextRunDate: string;
  isActive: boolean;
  templateData: any;
  createdAt: string;
  updatedAt: string;
}

@Component({
  selector: 'app-recurring-transactions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './recurring-transactions.html',
  styleUrls: ['./recurring-transactions.css']
})
export class RecurringTransactionsComponent implements OnInit {
  transactions: RecurringTransaction[] = [];
  loading = false;
  error: string | null = null;
  
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);
  private apiUrl = '/api';

  ngOnInit() {
    this.loadTransactions();
  }

  loadTransactions() {
    this.loading = true;
    this.error = null;

    this.http.get<RecurringTransaction[]>(`${this.apiUrl}/recurring-transactions`)
      .subscribe({
        next: (data) => {
          this.transactions = data;
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.error = 'حدث خطأ أثناء تحميل القيود المتكررة';
          this.loading = false;
          console.error('Error loading recurring transactions:', err);
          this.cdr.detectChanges();
        }
      });
  }

  execute(id: number) {
    if (!confirm('هل أنت متأكد من تنفيذ هذا القيد الآن؟')) {
      return;
    }

    this.http.post(`${this.apiUrl}/recurring-transactions/${id}/execute`, {})
      .subscribe({
        next: () => {
          alert('تم تنفيذ القيد بنجاح!');
          this.loadTransactions();
        },
        error: (err) => {
          alert('حدث خطأ أثناء تنفيذ القيد');
          console.error('Error executing recurring transaction:', err);
        }
      });
  }

  toggleActive(transaction: RecurringTransaction) {
    this.http.put(`${this.apiUrl}/recurring-transactions/${transaction.id}`, {
      isActive: !transaction.isActive
    }).subscribe({
      next: () => {
        transaction.isActive = !transaction.isActive;
        this.cdr.detectChanges();
      },
      error: (err) => {
        alert('حدث خطأ أثناء تحديث الحالة');
        console.error('Error updating status:', err);
      }
    });
  }

  delete(id: number) {
    if (!confirm('هل أنت متأكد من حذف هذا القيد المتكرر؟')) {
      return;
    }

    this.http.delete(`${this.apiUrl}/recurring-transactions/${id}`)
      .subscribe({
        next: () => {
          alert('تم حذف القيد بنجاح!');
          this.loadTransactions();
        },
        error: (err) => {
          alert('حدث خطأ أثناء حذف القيد');
          console.error('Error deleting recurring transaction:', err);
        }
      });
  }

  getFrequencyLabel(frequency: string): string {
    const labels: any = {
      'daily': 'يومي',
      'weekly': 'أسبوعي',
      'monthly': 'شهري',
      'yearly': 'سنوي'
    };
    return labels[frequency] || frequency;
  }
}
