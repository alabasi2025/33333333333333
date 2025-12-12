-- ===================================================
-- سكريبت إضافة Indexes لتحسين الأداء
-- ===================================================

-- Indexes للجداول المحاسبية الرئيسية

-- 1. journal_entries (قيود اليومية)
CREATE INDEX IF NOT EXISTS idx_journal_entries_date ON journal_entries(date);
CREATE INDEX IF NOT EXISTS idx_journal_entries_status ON journal_entries(status);
CREATE INDEX IF NOT EXISTS idx_journal_entries_reference ON journal_entries(reference_number);
CREATE INDEX IF NOT EXISTS idx_journal_entries_date_status ON journal_entries(date, status);

-- 2. journal_entry_lines (سطور القيود)
CREATE INDEX IF NOT EXISTS idx_journal_entry_lines_entry_id ON journal_entry_lines(journal_entry_id);
CREATE INDEX IF NOT EXISTS idx_journal_entry_lines_account_id ON journal_entry_lines(account_id);
CREATE INDEX IF NOT EXISTS idx_journal_entry_lines_account_entry ON journal_entry_lines(account_id, journal_entry_id);

-- 3. accounts (الدليل المحاسبي)
CREATE INDEX IF NOT EXISTS idx_accounts_code ON accounts(code);
CREATE INDEX IF NOT EXISTS idx_accounts_group_id ON accounts(group_id);
CREATE INDEX IF NOT EXISTS idx_accounts_type ON accounts(type);
CREATE INDEX IF NOT EXISTS idx_accounts_active ON accounts(is_active);

-- 4. account_groups (مجموعات الحسابات)
CREATE INDEX IF NOT EXISTS idx_account_groups_parent_id ON account_groups(parent_id);
CREATE INDEX IF NOT EXISTS idx_account_groups_code ON account_groups(code);

-- 5. vouchers (السندات)
CREATE INDEX IF NOT EXISTS idx_vouchers_date ON vouchers(date);
CREATE INDEX IF NOT EXISTS idx_vouchers_type ON vouchers(type);
CREATE INDEX IF NOT EXISTS idx_vouchers_status ON vouchers(status);
CREATE INDEX IF NOT EXISTS idx_vouchers_reference ON vouchers(reference_number);

-- 6. payment_vouchers (سندات الصرف)
CREATE INDEX IF NOT EXISTS idx_payment_vouchers_date ON payment_vouchers(payment_date);
CREATE INDEX IF NOT EXISTS idx_payment_vouchers_status ON payment_vouchers(status);
CREATE INDEX IF NOT EXISTS idx_payment_vouchers_account ON payment_vouchers(account_id);
CREATE INDEX IF NOT EXISTS idx_payment_vouchers_supplier ON payment_vouchers(supplier_id);

-- 7. receipt_vouchers (سندات القبض)
CREATE INDEX IF NOT EXISTS idx_receipt_vouchers_date ON receipt_vouchers(receipt_date);
CREATE INDEX IF NOT EXISTS idx_receipt_vouchers_status ON receipt_vouchers(status);
CREATE INDEX IF NOT EXISTS idx_receipt_vouchers_account ON receipt_vouchers(account_id);
CREATE INDEX IF NOT EXISTS idx_receipt_vouchers_customer ON receipt_vouchers(customer_id);

-- 8. suppliers (الموردين)
CREATE INDEX IF NOT EXISTS idx_suppliers_name ON suppliers(name);
CREATE INDEX IF NOT EXISTS idx_suppliers_code ON suppliers(code);
CREATE INDEX IF NOT EXISTS idx_suppliers_active ON suppliers(is_active);

-- 9. stock_transactions (معاملات المخزون)
CREATE INDEX IF NOT EXISTS idx_stock_transactions_date ON stock_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_stock_transactions_type ON stock_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_stock_transactions_warehouse ON stock_transactions(warehouse_id);

-- 10. stock_balances (أرصدة المخزون)
CREATE INDEX IF NOT EXISTS idx_stock_balances_item ON stock_balances(item_id);
CREATE INDEX IF NOT EXISTS idx_stock_balances_warehouse ON stock_balances(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_stock_balances_item_warehouse ON stock_balances(item_id, warehouse_id);

-- Indexes مركبة لتحسين الاستعلامات الشائعة

-- استعلامات ميزان المراجعة
CREATE INDEX IF NOT EXISTS idx_trial_balance_query ON journal_entry_lines(account_id, journal_entry_id) 
  INCLUDE (debit, credit);

-- استعلامات الأرصدة
CREATE INDEX IF NOT EXISTS idx_account_balance_query ON journal_entry_lines(account_id) 
  INCLUDE (debit, credit);

-- استعلامات التقارير حسب التاريخ
CREATE INDEX IF NOT EXISTS idx_date_range_query ON journal_entries(date) 
  INCLUDE (status, reference_number);

-- ===================================================
-- تحليل الجداول بعد إضافة الـ Indexes
-- ===================================================

ANALYZE journal_entries;
ANALYZE journal_entry_lines;
ANALYZE accounts;
ANALYZE account_groups;
ANALYZE vouchers;
ANALYZE payment_vouchers;
ANALYZE receipt_vouchers;
ANALYZE suppliers;
ANALYZE stock_transactions;
ANALYZE stock_balances;

-- ===================================================
-- عرض معلومات الـ Indexes المضافة
-- ===================================================

SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN (
    'journal_entries', 
    'journal_entry_lines', 
    'accounts', 
    'account_groups',
    'vouchers',
    'payment_vouchers',
    'receipt_vouchers',
    'suppliers',
    'stock_transactions',
    'stock_balances'
  )
ORDER BY tablename, indexname;
