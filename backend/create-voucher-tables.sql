-- سكريبت إنشاء جداول سندات الصرف والقبض
-- تاريخ الإنشاء: 11 ديسمبر 2025

-- جدول سندات الصرف (Payment Vouchers)
CREATE TABLE IF NOT EXISTS payment_vouchers (
    id SERIAL PRIMARY KEY,
    voucher_number VARCHAR(50) UNIQUE NOT NULL,
    date DATE NOT NULL,
    amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
    account_id INTEGER REFERENCES accounts(id) ON DELETE RESTRICT,
    beneficiary_name VARCHAR(255),
    payment_method VARCHAR(50) DEFAULT 'cash',
    reference_number VARCHAR(100),
    description TEXT,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'cancelled')),
    posted BOOLEAN DEFAULT false,
    journal_entry_id INTEGER REFERENCES journal_entries(id) ON DELETE SET NULL,
    created_by VARCHAR(100),
    approved_by VARCHAR(100),
    approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- جدول سندات القبض (Receipt Vouchers)
CREATE TABLE IF NOT EXISTS receipt_vouchers (
    id SERIAL PRIMARY KEY,
    voucher_number VARCHAR(50) UNIQUE NOT NULL,
    date DATE NOT NULL,
    amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
    account_id INTEGER REFERENCES accounts(id) ON DELETE RESTRICT,
    payer_name VARCHAR(255),
    payment_method VARCHAR(50) DEFAULT 'cash',
    reference_number VARCHAR(100),
    description TEXT,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'cancelled')),
    posted BOOLEAN DEFAULT false,
    journal_entry_id INTEGER REFERENCES journal_entries(id) ON DELETE SET NULL,
    created_by VARCHAR(100),
    approved_by VARCHAR(100),
    approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- جدول مرفقات القيود (Journal Entry Attachments)
CREATE TABLE IF NOT EXISTS journal_entry_attachments (
    id SERIAL PRIMARY KEY,
    journal_entry_id INTEGER REFERENCES journal_entries(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_type VARCHAR(50),
    file_size INTEGER,
    uploaded_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- إنشاء الفهارس لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_payment_vouchers_date ON payment_vouchers(date);
CREATE INDEX IF NOT EXISTS idx_payment_vouchers_status ON payment_vouchers(status);
CREATE INDEX IF NOT EXISTS idx_payment_vouchers_account ON payment_vouchers(account_id);
CREATE INDEX IF NOT EXISTS idx_payment_vouchers_posted ON payment_vouchers(posted);

CREATE INDEX IF NOT EXISTS idx_receipt_vouchers_date ON receipt_vouchers(date);
CREATE INDEX IF NOT EXISTS idx_receipt_vouchers_status ON receipt_vouchers(status);
CREATE INDEX IF NOT EXISTS idx_receipt_vouchers_account ON receipt_vouchers(account_id);
CREATE INDEX IF NOT EXISTS idx_receipt_vouchers_posted ON receipt_vouchers(posted);

CREATE INDEX IF NOT EXISTS idx_journal_attachments_entry ON journal_entry_attachments(journal_entry_id);

-- إنشاء دالة لتحديث updated_at تلقائياً
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- إنشاء Triggers لتحديث updated_at
DROP TRIGGER IF EXISTS update_payment_vouchers_updated_at ON payment_vouchers;
CREATE TRIGGER update_payment_vouchers_updated_at
    BEFORE UPDATE ON payment_vouchers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_receipt_vouchers_updated_at ON receipt_vouchers;
CREATE TRIGGER update_receipt_vouchers_updated_at
    BEFORE UPDATE ON receipt_vouchers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- تعليقات على الجداول
COMMENT ON TABLE payment_vouchers IS 'جدول سندات الصرف - يحتوي على جميع سندات الصرف النقدية والبنكية';
COMMENT ON TABLE receipt_vouchers IS 'جدول سندات القبض - يحتوي على جميع سندات القبض النقدية والبنكية';
COMMENT ON TABLE journal_entry_attachments IS 'جدول مرفقات القيود - يحتوي على المستندات المرفقة بالقيود المحاسبية';

-- رسالة نجاح
SELECT 'تم إنشاء جداول سندات الصرف والقبض بنجاح!' AS message;
