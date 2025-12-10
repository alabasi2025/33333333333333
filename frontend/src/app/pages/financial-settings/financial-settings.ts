import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface AccountGroup {
  id?: number;
  code: string;
  name: string;
  description?: string;
}

@Component({
  selector: 'app-financial-settings',
  imports: [CommonModule, FormsModule],
  templateUrl: './financial-settings.html',
  styleUrl: './financial-settings.css',
})
export class FinancialSettingsComponent implements OnInit {
  expandedSections: Record<string, boolean> = {
    chartSettings: true,
    otherSettings: false
  };

  accountGroups: AccountGroup[] = [];
  showGroupDialog = false;
  groupDialogMode: 'add' | 'edit' = 'add';
  currentGroup: AccountGroup = { code: '', name: '' };

  private apiUrl = '/api/account-groups';
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);

  constructor() {
    console.log('🚀 FinancialSettingsComponent constructor called');
  }

  ngOnInit() {
    console.log('🎯 ngOnInit called - loading account groups...');
    this.loadAccountGroups();
  }

  loadAccountGroups() {
    console.log('📊 Loading account groups from:', this.apiUrl);
    this.http.get<AccountGroup[]>(this.apiUrl).subscribe({
      next: (data) => {
        console.log('✅ Account groups received:', data);
        console.log('📏 Data length:', data.length);
        this.accountGroups = data;
        console.log('📋 accountGroups assigned:', this.accountGroups);
        
        // إجبار Angular على تحديث الواجهة
        this.cdr.detectChanges();
        console.log('✅ Change detection triggered!');
      },
      error: (err) => {
        console.error('❌ Error loading account groups:', err);
        console.error('❌ Error details:', JSON.stringify(err, null, 2));
      }
    });
  }

  toggleSection(section: string) {
    this.expandedSections[section] = !this.expandedSections[section];
  }

  openAddGroupDialog() {
    this.groupDialogMode = 'add';
    this.currentGroup = { code: '', name: '' };
    this.showGroupDialog = true;
  }

  editGroup(group: AccountGroup) {
    this.groupDialogMode = 'edit';
    this.currentGroup = { ...group };
    this.showGroupDialog = true;
  }

  deleteGroup(group: AccountGroup) {
    if (confirm(`هل أنت متأكد من حذف المجموعة "${group.name}"؟`)) {
      this.http.delete(`${this.apiUrl}/${group.id}`).subscribe({
        next: () => this.loadAccountGroups(),
        error: (err) => console.error('Error deleting group:', err)
      });
    }
  }

  saveGroup() {
    if (!this.currentGroup.code || !this.currentGroup.name) {
      alert('يرجى ملء جميع الحقول المطلوبة');
      return;
    }
    
    if (this.groupDialogMode === 'add') {
      this.http.post<AccountGroup>(this.apiUrl, this.currentGroup).subscribe({
        next: () => {
          this.loadAccountGroups();
          this.closeGroupDialog();
        },
        error: (err) => console.error('Error adding group:', err)
      });
    } else {
      this.http.put<AccountGroup>(`${this.apiUrl}/${this.currentGroup.id}`, this.currentGroup).subscribe({
        next: () => {
          this.loadAccountGroups();
          this.closeGroupDialog();
        },
        error: (err) => console.error('Error updating group:', err)
      });
    }
  }

  closeGroupDialog() {
    this.showGroupDialog = false;
    this.currentGroup = { code: '', name: '' };
  }
}
