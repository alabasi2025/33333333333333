import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { UnitContextService } from '../../services/unit-context.service';

interface Account {
  id?: number;
  code: string;
  name: string;
  sortOrder?: number;
  type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  accountLevel: 'main' | 'sub';
  subType?: 'general' | 'cash' | 'bank' | 'supplier' | 'customer' | 'inventory';
  parentId?: number;
  groupIds?: number[];
  children?: Account[];
  expanded?: boolean;
  level?: number;
}

interface AccountGroup {
  id: number;
  code: string;
  name: string;
  description?: string;
}

@Component({
  selector: 'app-chart-of-accounts',
  imports: [CommonModule, FormsModule],
  templateUrl: './chart-of-accounts.html',
  styleUrl: './chart-of-accounts.css',
})
export class ChartOfAccountsComponent implements OnInit {
  accounts: Account[] = [];
  filteredAccounts: Account[] = [];
  searchTerm: string = '';
  accountGroups: AccountGroup[] = [];
  
  showDialog = false;
  dialogMode: 'add' | 'edit' = 'add';
  currentAccount: Account = { 
    code: '', 
    name: '', 
    sortOrder: 1,
    type: 'asset',
    accountLevel: 'main'
  };
  parentAccount: Account | null = null;

  private apiUrl = '/api/accounts';
  private groupsApiUrl = '/api/account-groups';
  private http = inject(HttpClient);
  private unitContext = inject(UnitContextService);

  constructor() {
    console.log('🚀 ChartOfAccountsComponent constructor called');
  }

  ngOnInit() {
    console.log('🎯 ngOnInit called - loading data...');
    this.loadAccounts();
    this.loadAccountGroups();
    
    // Reload when unit changes
    this.unitContext.selectedUnit$.subscribe(() => {
      this.loadAccounts();
      this.loadAccountGroups();
    });
  }

  loadAccountGroups() {
    const unitId = this.unitContext.getSelectedUnitId();
    const url = unitId ? `${this.groupsApiUrl}?unitId=${unitId}` : this.groupsApiUrl;
    this.http.get<AccountGroup[]>(url).subscribe({
      next: (data) => {
        this.accountGroups = data;
      },
      error: (err) => console.error('Error loading account groups:', err)
    });
  }

  loadAccounts() {
    const unitId = this.unitContext.getSelectedUnitId();
    const url = unitId ? `${this.apiUrl}?unitId=${unitId}` : this.apiUrl;
    console.log('📊 Loading accounts from:', url);
    this.http.get<Account[]>(url).subscribe({
      next: (data) => {
        console.log('✅ Accounts loaded:', data.length, 'accounts');
        this.accounts = this.buildTree(data);
        this.filteredAccounts = [...this.accounts];
        console.log('🌳 Tree built:', this.accounts);
      },
      error: (err) => console.error('❌ Error loading accounts:', err)
    });
  }

  buildTree(accounts: Account[]): Account[] {
    const map = new Map<number, Account>();
    const roots: Account[] = [];

    accounts.forEach(acc => {
      map.set(acc.id!, { ...acc, children: [], expanded: false });
    });

    accounts.forEach(acc => {
      const account = map.get(acc.id!)!;
      if (acc.parentId) {
        const parent = map.get(acc.parentId);
        if (parent) {
          parent.children!.push(account);
        }
      } else {
        roots.push(account);
      }
    });

    return roots;
  }

  filterAccounts() {
    if (!this.searchTerm.trim()) {
      this.filteredAccounts = [...this.accounts];
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.filteredAccounts = this.accounts.filter(acc =>
      acc.code.toLowerCase().includes(term) ||
      acc.name.toLowerCase().includes(term) ||
      (acc.children && acc.children.some(child =>
        child.code.toLowerCase().includes(term) ||
        child.name.toLowerCase().includes(term)
      ))
    );
  }

  toggleAccount(account: Account) {
    account.expanded = !account.expanded;
  }

  openAddDialog() {
    this.dialogMode = 'add';
    this.currentAccount = { 
      code: '', 
      name: '', 
      sortOrder: 1,
      type: 'asset',
      accountLevel: 'main'
    };
    this.parentAccount = null;
    this.showDialog = true;
  }

  openAddSubDialog(parent: Account, event: Event) {
    event.stopPropagation();
    this.dialogMode = 'add';
    this.currentAccount = { 
      code: '', 
      name: '', 
      sortOrder: 1,
      type: parent.type, 
      accountLevel: 'sub',
      subType: 'general',
      parentId: parent.id 
    };
    this.parentAccount = parent;
    this.showDialog = true;
  }

  editAccount(account: Account, event: Event) {
    event.stopPropagation();
    this.dialogMode = 'edit';
    this.currentAccount = { ...account };
    this.parentAccount = null;
    this.showDialog = true;
  }

  deleteAccount(account: Account, event: Event) {
    event.stopPropagation();
    if (confirm(`هل أنت متأكد من حذف الحساب "${account.name}"؟`)) {
      this.http.delete(`${this.apiUrl}/${account.id}`).subscribe({
        next: () => this.loadAccounts(),
        error: (err) => console.error('Error deleting account:', err)
      });
    }
  }

  onAccountLevelChange() {
    if (this.currentAccount.accountLevel === 'main') {
      delete this.currentAccount.subType;
      delete this.currentAccount.parentId;
    } else {
      this.currentAccount.subType = 'general';
    }
  }

  getMainAccounts(): Account[] {
    return this.accounts.filter(acc => acc.accountLevel === 'main');
  }

  getAllAccountsFlat(): Account[] {
    const flat: Account[] = [];
    const addToFlat = (accounts: Account[], level: number = 0) => {
      accounts.forEach(acc => {
        flat.push({ ...acc, level });
        if (acc.children && acc.children.length > 0) {
          addToFlat(acc.children, level + 1);
        }
      });
    };
    addToFlat(this.accounts);
    return flat;
  }

  saveAccount() {
    if (!this.currentAccount.code || !this.currentAccount.name) {
      alert('يرجى ملء جميع الحقول المطلوبة');
      return;
    }
    
    const unitId = this.unitContext.getSelectedUnitId();
    if (!unitId) {
      alert('يرجى اختيار وحدة أولاً');
      return;
    }

    if (this.dialogMode === 'add') {
      const accountData = { ...this.currentAccount, unitId };
      this.http.post<Account>(this.apiUrl, accountData).subscribe({
        next: () => {
          this.loadAccounts();
          this.closeDialog();
        },
        error: (err) => console.error('Error adding account:', err)
      });
    } else {
      this.http.put<Account>(`${this.apiUrl}/${this.currentAccount.id}`, this.currentAccount).subscribe({
        next: () => {
          this.loadAccounts();
          this.closeDialog();
        },
        error: (err) => console.error('Error updating account:', err)
      });
    }
  }

  closeDialog() {
    this.showDialog = false;
    this.currentAccount = { 
      code: '', 
      name: '', 
      sortOrder: 1,
      type: 'asset',
      accountLevel: 'main'
    };
    this.parentAccount = null;
  }

  getTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      asset: 'أصول',
      liability: 'خصوم',
      equity: 'حقوق ملكية',
      revenue: 'إيرادات',
      expense: 'مصروفات'
    };
    return labels[type] || type;
  }

  getSubTypeLabel(subType?: string): string {
    if (!subType) return '';
    const labels: Record<string, string> = {
      general: 'عام',
      cash: 'صندوق',
      bank: 'بنك',
      supplier: 'مورد',
      customer: 'عميل',
      inventory: 'مخزن'
    };
    return labels[subType] || subType;
  }

  isGroupSelected(groupId: number): boolean {
    return this.currentAccount.groupIds?.includes(groupId) || false;
  }

  toggleGroup(groupId: number) {
    if (!this.currentAccount.groupIds) {
      this.currentAccount.groupIds = [];
    }
    
    const index = this.currentAccount.groupIds.indexOf(groupId);
    if (index > -1) {
      this.currentAccount.groupIds.splice(index, 1);
    } else {
      this.currentAccount.groupIds.push(groupId);
    }
  }

  getGroupNames(groupIds?: number[]): string {
    if (!groupIds || groupIds.length === 0) return '';
    return groupIds
      .map(id => {
        const group = this.accountGroups.find(g => g.id === id);
        return group ? group.name : '';
      })
      .filter(name => name)
      .join(', ');
  }
}
