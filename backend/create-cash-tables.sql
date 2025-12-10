-- جدول الصناديق
CREATE TABLE IF NOT EXISTS cash_boxes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  unit_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) NOT NULL,
  account_id INT,
  description TEXT,
  opening_balance DECIMAL(15, 2) DEFAULT 0,
  current_balance DECIMAL(15, 2) DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE CASCADE,
  FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE SET NULL,
  UNIQUE KEY unique_code_per_unit (unit_id, code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول حركات الصناديق
CREATE TABLE IF NOT EXISTS cash_transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cash_box_id INT NOT NULL,
  transaction_type ENUM('deposit', 'withdrawal', 'transfer_in', 'transfer_out') NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  reference_number VARCHAR(100),
  reference_type VARCHAR(50),
  reference_id INT,
  description TEXT,
  transaction_date DATE NOT NULL,
  created_by VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (cash_box_id) REFERENCES cash_boxes(id) ON DELETE CASCADE,
  INDEX idx_cash_box (cash_box_id),
  INDEX idx_transaction_date (transaction_date),
  INDEX idx_reference (reference_type, reference_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- إضافة بيانات تجريبية
INSERT INTO cash_boxes (unit_id, name, code, description, opening_balance, current_balance) VALUES
(1, 'الصندوق الرئيسي', 'CASH-001', 'صندوق المكتب الرئيسي', 50000.00, 50000.00),
(1, 'صندوق الفرع الأول', 'CASH-002', 'صندوق الفرع الأول', 20000.00, 20000.00),
(2, 'الصندوق الرئيسي', 'CASH-001', 'صندوق المكتب الرئيسي', 30000.00, 30000.00);
