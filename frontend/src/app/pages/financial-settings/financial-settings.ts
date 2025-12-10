import { Component, OnInit } from '@angular/core';
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

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadAccountGroups();
  }

  loadAccountGroups() {
    this.http.get<AccountGroup[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.accountGroups = data;
      },
      error: (err) => console.error('Error loading account groups:', err)
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
