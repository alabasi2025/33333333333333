-- إضافة الشركة الرئيسية
INSERT INTO companies (name, registration_number, address, tax_number, enabled_modules, created_at)
VALUES (
  'شركة أعمال العباسي',
  'REG-2025-001',
  'اليمن',
  'TAX-2025-001',
  ARRAY['financial', 'inventory', 'suppliers', 'purchases', 'sales', 'hr'],
  CURRENT_TIMESTAMP
) ON CONFLICT DO NOTHING;

-- إضافة الوحدات الثلاث
INSERT INTO units (company_id, name, code, enabled_modules, created_at)
VALUES
  (1, 'وحدة أعمال الحديدة', 'HD', ARRAY['financial', 'inventory', 'suppliers', 'purchases', 'sales'], CURRENT_TIMESTAMP),
  (1, 'وحدة أعمال العباسي', 'AB', ARRAY['financial', 'inventory', 'suppliers', 'purchases', 'sales', 'hr'], CURRENT_TIMESTAMP),
  (1, 'وحدة محطة أعمال محطة معبر', 'MB', ARRAY['financial', 'inventory', 'suppliers', 'purchases'], CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;

-- تحديث البيانات الموجودة لربطها بالوحدة الأولى (وحدة أعمال الحديدة)
UPDATE accounts SET unit_id = 1 WHERE unit_id IS NULL;
UPDATE account_groups SET unit_id = 1 WHERE unit_id IS NULL;
UPDATE suppliers SET unit_id = 1 WHERE unit_id IS NULL;
