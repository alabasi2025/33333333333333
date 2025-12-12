# خطة المرحلة 4: الميزات المحاسبية المتقدمة

## تاريخ البدء
**12 ديسمبر 2025**

---

## نظرة عامة

المرحلة 4 تركز على إضافة **التقارير المالية الأساسية** و**القيود المتكررة** لجعل النظام أكثر اكتمالاً واحترافية.

---

## الأهداف الرئيسية

1. ✅ **التقارير المالية الأساسية**
   - قائمة الدخل (Income Statement)
   - الميزانية العمومية (Balance Sheet)
   - قائمة التدفقات النقدية (Cash Flow Statement)

2. ✅ **القيود المتكررة** (Recurring Transactions)
   - إنشاء قوالب للقيود المتكررة
   - جدولة تلقائية للقيود
   - إدارة القيود المتكررة

3. ✅ **تحسينات إضافية**
   - تحسين واجهة المستخدم
   - إضافة Filters متقدمة
   - تحسين الأداء

---

## المرحلة 1: التقارير المالية الأساسية

### 1.1 قائمة الدخل (Income Statement)

**الهدف**: عرض الإيرادات والمصروفات لفترة محددة

**البيانات المطلوبة**:
```typescript
interface IncomeStatement {
  period: {
    startDate: string;
    endDate: string;
  };
  revenue: {
    items: AccountBalance[];
    total: number;
  };
  expenses: {
    items: AccountBalance[];
    total: number;
  };
  netIncome: number; // الربح الصافي
}
```

**الحسابات المستخدمة**:
- **الإيرادات**: حسابات من نوع `revenue` (4000)
- **المصروفات**: حسابات من نوع `expense` (5000)
- **صافي الدخل**: الإيرادات - المصروفات

**API Endpoint**:
```
GET /api/reports/income-statement?startDate=2024-01-01&endDate=2024-12-31
```

---

### 1.2 الميزانية العمومية (Balance Sheet)

**الهدف**: عرض الأصول والخصوم وحقوق الملكية في تاريخ محدد

**البيانات المطلوبة**:
```typescript
interface BalanceSheet {
  asOfDate: string;
  assets: {
    current: AccountBalance[];
    nonCurrent: AccountBalance[];
    total: number;
  };
  liabilities: {
    current: AccountBalance[];
    nonCurrent: AccountBalance[];
    total: number;
  };
  equity: {
    items: AccountBalance[];
    total: number;
  };
  totalLiabilitiesAndEquity: number;
}
```

**الحسابات المستخدمة**:
- **الأصول**: حسابات من نوع `asset` (1000)
- **الخصوم**: حسابات من نوع `liability` (2000)
- **حقوق الملكية**: حسابات من نوع `equity` (3000)

**المعادلة المحاسبية**:
```
الأصول = الخصوم + حقوق الملكية
```

**API Endpoint**:
```
GET /api/reports/balance-sheet?asOfDate=2024-12-31
```

---

### 1.3 قائمة التدفقات النقدية (Cash Flow Statement)

**الهدف**: عرض التدفقات النقدية من الأنشطة التشغيلية والاستثمارية والتمويلية

**البيانات المطلوبة**:
```typescript
interface CashFlowStatement {
  period: {
    startDate: string;
    endDate: string;
  };
  operatingActivities: {
    items: CashFlowItem[];
    total: number;
  };
  investingActivities: {
    items: CashFlowItem[];
    total: number;
  };
  financingActivities: {
    items: CashFlowItem[];
    total: number;
  };
  netCashFlow: number;
  openingBalance: number;
  closingBalance: number;
}
```

**الحسابات المستخدمة**:
- **النقدية**: حسابات من نوع `asset` مع `subType = 'cash'`
- **البنوك**: حسابات من نوع `asset` مع `subType = 'bank'`

**API Endpoint**:
```
GET /api/reports/cash-flow?startDate=2024-01-01&endDate=2024-12-31
```

---

## المرحلة 2: القيود المتكررة (Recurring Transactions)

### 2.1 جدول قاعدة البيانات

```sql
CREATE TABLE recurring_transactions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  frequency VARCHAR(20) NOT NULL, -- 'daily', 'weekly', 'monthly', 'yearly'
  start_date DATE NOT NULL,
  end_date DATE,
  next_run_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  template_data JSONB NOT NULL, -- بيانات القيد (الحسابات والمبالغ)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_recurring_transactions_next_run ON recurring_transactions(next_run_date, is_active);
```

### 2.2 الميزات المطلوبة

1. **إنشاء قيد متكرر**:
   - اختيار التكرار (يومي، أسبوعي، شهري، سنوي)
   - تحديد تاريخ البداية والنهاية
   - حفظ بيانات القيد كـ Template

2. **تنفيذ تلقائي**:
   - Cron Job يعمل يومياً
   - يتحقق من القيود المستحقة
   - ينشئ القيود تلقائياً

3. **إدارة القيود المتكررة**:
   - عرض قائمة القيود المتكررة
   - تعديل/حذف/إيقاف القيود
   - عرض تاريخ التنفيذ

### 2.3 API Endpoints

```typescript
// إنشاء قيد متكرر
POST /api/recurring-transactions
{
  name: "رواتب الموظفين",
  description: "قيد رواتب شهري",
  frequency: "monthly",
  startDate: "2024-01-01",
  templateData: {
    description: "رواتب شهر {month}",
    lines: [
      { accountId: 10, debit: 50000, credit: 0 },
      { accountId: 20, debit: 0, credit: 50000 }
    ]
  }
}

// قائمة القيود المتكررة
GET /api/recurring-transactions

// تنفيذ يدوي لقيد متكرر
POST /api/recurring-transactions/:id/execute

// حذف قيد متكرر
DELETE /api/recurring-transactions/:id
```

---

## المرحلة 3: Frontend للتقارير

### 3.1 صفحة قائمة الدخل

**المسار**: `/reports/income-statement`

**الميزات**:
- اختيار الفترة (من - إلى)
- عرض الإيرادات والمصروفات
- حساب صافي الدخل تلقائياً
- تصدير PDF/Excel

### 3.2 صفحة الميزانية العمومية

**المسار**: `/reports/balance-sheet`

**الميزات**:
- اختيار التاريخ
- عرض الأصول والخصوم وحقوق الملكية
- التحقق من توازن المعادلة المحاسبية
- تصدير PDF/Excel

### 3.3 صفحة التدفقات النقدية

**المسار**: `/reports/cash-flow`

**الميزات**:
- اختيار الفترة
- عرض التدفقات حسب النشاط
- حساب صافي التدفق النقدي
- تصدير PDF/Excel

### 3.4 صفحة القيود المتكررة

**المسار**: `/recurring-transactions`

**الميزات**:
- قائمة القيود المتكررة
- إنشاء قيد متكرر جديد
- تعديل/حذف القيود
- تنفيذ يدوي

---

## الأولويات

### أولوية عالية (High Priority)
1. ✅ قائمة الدخل (Income Statement)
2. ✅ الميزانية العمومية (Balance Sheet)

### أولوية متوسطة (Medium Priority)
3. ✅ قائمة التدفقات النقدية (Cash Flow Statement)
4. ✅ القيود المتكررة (Recurring Transactions)

### أولوية منخفضة (Low Priority)
5. تصدير التقارير PDF/Excel
6. تحسينات UI/UX

---

## الجدول الزمني المتوقع

| المهمة | المدة المتوقعة | الحالة |
|--------|----------------|--------|
| قائمة الدخل (Backend) | 2 ساعة | ⏳ قيد التنفيذ |
| الميزانية العمومية (Backend) | 2 ساعة | ⏳ |
| قائمة التدفقات النقدية (Backend) | 2 ساعة | ⏳ |
| القيود المتكررة (Backend) | 3 ساعات | ⏳ |
| Frontend للتقارير | 3 ساعات | ⏳ |
| Frontend للقيود المتكررة | 2 ساعة | ⏳ |
| الاختبار والنشر | 1 ساعة | ⏳ |
| **المجموع** | **15 ساعة** | |

---

## الملاحظات الفنية

### 1. حساب قائمة الدخل
```typescript
// الإيرادات
const revenue = await this.getAccountBalances('revenue', startDate, endDate);
const totalRevenue = revenue.reduce((sum, acc) => sum + acc.credit - acc.debit, 0);

// المصروفات
const expenses = await this.getAccountBalances('expense', startDate, endDate);
const totalExpenses = expenses.reduce((sum, acc) => sum + acc.debit - acc.credit, 0);

// صافي الدخل
const netIncome = totalRevenue - totalExpenses;
```

### 2. حساب الميزانية العمومية
```typescript
// الأصول
const assets = await this.getAccountBalances('asset', null, asOfDate);
const totalAssets = assets.reduce((sum, acc) => sum + acc.debit - acc.credit, 0);

// الخصوم
const liabilities = await this.getAccountBalances('liability', null, asOfDate);
const totalLiabilities = liabilities.reduce((sum, acc) => sum + acc.credit - acc.debit, 0);

// حقوق الملكية
const equity = await this.getAccountBalances('equity', null, asOfDate);
const totalEquity = equity.reduce((sum, acc) => sum + acc.credit - acc.debit, 0);

// التحقق من التوازن
const isBalanced = Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 0.01;
```

### 3. Cron Job للقيود المتكررة
```typescript
@Cron('0 0 * * *') // يعمل يومياً في منتصف الليل
async processRecurringTransactions() {
  const today = new Date();
  
  // البحث عن القيود المستحقة
  const dueTransactions = await this.recurringTransactionRepository.find({
    where: {
      isActive: true,
      nextRunDate: LessThanOrEqual(today)
    }
  });
  
  // تنفيذ كل قيد
  for (const recurring of dueTransactions) {
    await this.executeRecurringTransaction(recurring);
  }
}
```

---

## المخرجات المتوقعة

1. ✅ **3 تقارير مالية جديدة** (Income Statement, Balance Sheet, Cash Flow)
2. ✅ **نظام القيود المتكررة** كامل
3. ✅ **واجهات مستخدم** لجميع الميزات
4. ✅ **API Endpoints** موثقة
5. ✅ **اختبارات شاملة** لجميع الميزات

---

**الحالة**: 🚀 جاهز للتنفيذ
**الأولوية التالية**: قائمة الدخل (Income Statement)
