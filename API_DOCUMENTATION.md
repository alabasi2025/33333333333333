# توثيق API - النظام المحاسبي

## معلومات عامة

**Base URL**: `http://72.61.111.217:3000/api`  
**النسخة**: 1.1.0  
**التاريخ**: 12 ديسمبر 2025

---

## المصادقة (Authentication)

### تسجيل الدخول
```http
POST /auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "password"
}
```

**Response**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### استخدام Token
```http
Authorization: Bearer {access_token}
```

---

## 1. التقارير المالية (Financial Reports)

### 1.1 قائمة الدخل (Income Statement)

```http
GET /reports/income-statement?startDate=2025-01-01&endDate=2025-12-31
```

**Parameters**:
- `startDate` (required): تاريخ البداية (YYYY-MM-DD)
- `endDate` (required): تاريخ النهاية (YYYY-MM-DD)

**Response**:
```json
{
  "period": {
    "startDate": "2025-01-01",
    "endDate": "2025-12-31"
  },
  "revenue": {
    "items": [
      {
        "accountCode": "4000",
        "accountName": "إيرادات المبيعات",
        "amount": 100000
      }
    ],
    "total": 100000
  },
  "expenses": {
    "items": [
      {
        "accountCode": "5000",
        "accountName": "مصروفات الرواتب",
        "amount": 50000
      }
    ],
    "total": 50000
  },
  "netIncome": 50000
}
```

---

### 1.2 الميزانية العمومية (Balance Sheet)

```http
GET /reports/balance-sheet?asOfDate=2025-12-31
```

**Parameters**:
- `asOfDate` (required): التاريخ (YYYY-MM-DD)

**Response**:
```json
{
  "asOfDate": "2025-12-31",
  "assets": {
    "items": [
      {
        "accountCode": "1110",
        "accountName": "النقدية",
        "amount": 50000
      }
    ],
    "total": 286200
  },
  "liabilities": {
    "items": [
      {
        "accountCode": "2100",
        "accountName": "حسابات دائنة",
        "amount": 235000
      }
    ],
    "total": 235000
  },
  "equity": {
    "items": [
      {
        "accountCode": "3000",
        "accountName": "رأس المال",
        "amount": 50000
      }
    ],
    "total": 50000
  },
  "totalLiabilitiesAndEquity": 285000,
  "difference": 1200,
  "isBalanced": false
}
```

---

### 1.3 قائمة التدفقات النقدية (Cash Flow Statement)

```http
GET /reports/cash-flow?startDate=2025-01-01&endDate=2025-12-31
```

**Parameters**:
- `startDate` (required): تاريخ البداية (YYYY-MM-DD)
- `endDate` (required): تاريخ النهاية (YYYY-MM-DD)

**Response**:
```json
{
  "period": {
    "startDate": "2025-01-01",
    "endDate": "2025-12-31"
  },
  "openingBalance": 0,
  "cashFlowItems": [
    {
      "date": "2025-12-10",
      "description": "قيد افتتاحي",
      "accountCode": "1110",
      "accountName": "النقدية",
      "amount": 50000
    }
  ],
  "totalCashFlow": 51200,
  "closingBalance": 51200
}
```

---

### 1.4 ميزان المراجعة (Trial Balance)

```http
GET /reports/trial-balance?startDate=2025-01-01&endDate=2025-12-31&postingStatus=posted
```

**Parameters**:
- `startDate` (optional): تاريخ البداية (YYYY-MM-DD)
- `endDate` (optional): تاريخ النهاية (YYYY-MM-DD)
- `postingStatus` (optional): حالة الترحيل (`all` | `posted` | `unposted`)

**Response**:
```json
{
  "items": [
    {
      "accountCode": "1110",
      "accountName": "النقدية",
      "debit": 50000,
      "credit": 0,
      "balance": 50000,
      "balanceType": "debit"
    }
  ],
  "totalDebit": 287800,
  "totalCredit": 287800,
  "difference": 0,
  "isBalanced": true
}
```

---

### 1.5 كشف حساب (Account Statement)

```http
GET /reports/account-statement/:accountId?startDate=2025-01-01&endDate=2025-12-31
```

**Parameters**:
- `accountId` (required): رقم الحساب
- `startDate` (optional): تاريخ البداية (YYYY-MM-DD)
- `endDate` (optional): تاريخ النهاية (YYYY-MM-DD)

**Response**:
```json
{
  "account": {
    "id": 10,
    "code": "1110",
    "name": "النقدية"
  },
  "transactions": [
    {
      "date": "2025-12-10",
      "description": "قيد افتتاحي",
      "debit": 50000,
      "credit": 0,
      "balance": 50000
    }
  ],
  "totalDebit": 50000,
  "totalCredit": 0,
  "finalBalance": 50000
}
```

---

## 2. القيود المتكررة (Recurring Transactions)

### 2.1 إنشاء قيد متكرر

```http
POST /recurring-transactions
Content-Type: application/json

{
  "name": "رواتب الموظفين",
  "description": "قيد رواتب شهري",
  "frequency": "monthly",
  "startDate": "2025-01-01",
  "endDate": "2025-12-31",
  "templateData": {
    "description": "رواتب شهرية",
    "lines": [
      {
        "accountId": 10,
        "debit": 50000,
        "credit": 0,
        "description": "مصروف رواتب"
      },
      {
        "accountId": 20,
        "debit": 0,
        "credit": 50000,
        "description": "نقدية"
      }
    ]
  }
}
```

**Response**:
```json
{
  "id": 1,
  "name": "رواتب الموظفين",
  "description": "قيد رواتب شهري",
  "frequency": "monthly",
  "startDate": "2025-01-01",
  "endDate": "2025-12-31",
  "nextRunDate": "2025-01-01",
  "isActive": true,
  "templateData": { ... },
  "createdAt": "2025-12-12T00:57:28.337Z",
  "updatedAt": "2025-12-12T00:57:28.337Z"
}
```

---

### 2.2 قائمة القيود المتكررة

```http
GET /recurring-transactions
```

**Response**:
```json
[
  {
    "id": 1,
    "name": "رواتب الموظفين",
    "frequency": "monthly",
    "nextRunDate": "2025-01-01",
    "isActive": true,
    ...
  }
]
```

---

### 2.3 عرض قيد متكرر محدد

```http
GET /recurring-transactions/:id
```

**Response**:
```json
{
  "id": 1,
  "name": "رواتب الموظفين",
  ...
}
```

---

### 2.4 تعديل قيد متكرر

```http
PUT /recurring-transactions/:id
Content-Type: application/json

{
  "name": "رواتب الموظفين المحدثة",
  "isActive": false
}
```

**Response**:
```json
{
  "id": 1,
  "name": "رواتب الموظفين المحدثة",
  "isActive": false,
  ...
}
```

---

### 2.5 حذف قيد متكرر

```http
DELETE /recurring-transactions/:id
```

**Response**:
```json
{
  "success": true
}
```

---

### 2.6 تنفيذ قيد متكرر يدوياً

```http
POST /recurring-transactions/:id/execute
```

**Response**:
```json
{
  "recurring": {
    "id": 1,
    "nextRunDate": "2025-02-01",
    ...
  },
  "journalEntry": {
    "id": 14,
    "entryNumber": "JE-000013",
    "date": "2025-12-12",
    ...
  }
}
```

---

## 3. القيود اليومية (Journal Entries)

### 3.1 إنشاء قيد يومية

```http
POST /journal-entries
Content-Type: application/json

{
  "date": "2025-12-12",
  "description": "قيد افتتاحي",
  "lines": [
    {
      "accountId": 10,
      "debit": 50000,
      "credit": 0,
      "description": "نقدية"
    },
    {
      "accountId": 20,
      "debit": 0,
      "credit": 50000,
      "description": "رأس المال"
    }
  ]
}
```

**Response**:
```json
{
  "id": 1,
  "entryNumber": "JE-000001",
  "date": "2025-12-12",
  "description": "قيد افتتاحي",
  "totalDebit": "50000.00",
  "totalCredit": "50000.00",
  "isPosted": true,
  "lines": [ ... ]
}
```

---

### 3.2 قائمة القيود اليومية (مع Pagination)

```http
GET /journal-entries?page=1&limit=10
```

**Parameters**:
- `page` (optional): رقم الصفحة (default: 1)
- `limit` (optional): عدد العناصر في الصفحة (default: 10, max: 100)

**Response**:
```json
{
  "data": [
    {
      "id": 1,
      "entryNumber": "JE-000001",
      "date": "2025-12-12",
      ...
    }
  ],
  "meta": {
    "total": 7,
    "page": 1,
    "limit": 10,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPreviousPage": false
  }
}
```

---

### 3.3 عرض قيد يومية محدد

```http
GET /journal-entries/:id
```

**Response**:
```json
{
  "id": 1,
  "entryNumber": "JE-000001",
  "date": "2025-12-12",
  "description": "قيد افتتاحي",
  "lines": [ ... ]
}
```

---

### 3.4 تعديل قيد يومية

```http
PUT /journal-entries/:id
Content-Type: application/json

{
  "description": "قيد افتتاحي محدث",
  "lines": [ ... ]
}
```

---

### 3.5 حذف قيد يومية

```http
DELETE /journal-entries/:id
```

**Response**:
```json
{
  "success": true
}
```

---

## 4. الحسابات (Accounts)

### 4.1 قائمة الحسابات

```http
GET /accounts
```

**Response**:
```json
[
  {
    "id": 1,
    "code": "1110",
    "name": "النقدية",
    "type": "asset",
    "subType": "cash",
    "parentId": null
  }
]
```

---

### 4.2 إنشاء حساب

```http
POST /accounts
Content-Type: application/json

{
  "code": "1110",
  "name": "النقدية",
  "type": "asset",
  "subType": "cash"
}
```

---

### 4.3 تعديل حساب

```http
PUT /accounts/:id
Content-Type: application/json

{
  "name": "النقدية المحدثة"
}
```

---

### 4.4 حذف حساب

```http
DELETE /accounts/:id
```

---

## 5. سندات الصرف (Payment Vouchers)

### 5.1 إنشاء سند صرف

```http
POST /payment-vouchers
Content-Type: application/json

{
  "voucherNumber": "PV-001",
  "date": "2025-12-12",
  "amount": 5000,
  "accountId": 10,
  "description": "صرف مصروفات"
}
```

---

### 5.2 قائمة سندات الصرف

```http
GET /payment-vouchers
```

---

## 6. سندات القبض (Receipt Vouchers)

### 6.1 إنشاء سند قبض

```http
POST /receipt-vouchers
Content-Type: application/json

{
  "voucherNumber": "RV-001",
  "date": "2025-12-12",
  "amount": 10000,
  "accountId": 10,
  "description": "قبض من عميل"
}
```

---

### 6.2 قائمة سندات القبض

```http
GET /receipt-vouchers
```

---

## Caching

جميع التقارير المالية تستخدم Caching لمدة **5 دقائق** لتحسين الأداء.

لمسح الـ Cache، يمكنك:
1. الانتظار 5 دقائق
2. إعادة تشغيل الخادم
3. إضافة/تعديل/حذف بيانات (يتم مسح الـ Cache تلقائياً)

---

## Cron Jobs

### القيود المتكررة
- **التوقيت**: كل يوم في منتصف الليل (00:00)
- **الوظيفة**: تنفيذ القيود المتكررة المستحقة

---

## أكواد الأخطاء

| الكود | الوصف |
|------|-------|
| 200 | نجح الطلب |
| 201 | تم الإنشاء بنجاح |
| 400 | طلب غير صحيح |
| 401 | غير مصرح |
| 404 | غير موجود |
| 500 | خطأ في الخادم |

---

## أمثلة باستخدام cURL

### قائمة الدخل
```bash
curl "http://72.61.111.217:3000/api/reports/income-statement?startDate=2025-01-01&endDate=2025-12-31"
```

### الميزانية العمومية
```bash
curl "http://72.61.111.217:3000/api/reports/balance-sheet?asOfDate=2025-12-31"
```

### قائمة التدفقات النقدية
```bash
curl "http://72.61.111.217:3000/api/reports/cash-flow?startDate=2025-01-01&endDate=2025-12-31"
```

### إنشاء قيد متكرر
```bash
curl -X POST "http://72.61.111.217:3000/api/recurring-transactions" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "رواتب الموظفين",
    "frequency": "monthly",
    "startDate": "2025-01-01",
    "templateData": {
      "description": "رواتب شهرية",
      "lines": [
        {"accountId": 10, "debit": 50000, "credit": 0},
        {"accountId": 20, "debit": 0, "credit": 50000}
      ]
    }
  }'
```

---

## ملاحظات

- جميع التواريخ بصيغة ISO 8601 (YYYY-MM-DD)
- جميع المبالغ بالريال السعودي
- جميع الـ Responses بصيغة JSON
- الـ Caching يحسن الأداء بنسبة 70-90%

---

**آخر تحديث**: 12 ديسمبر 2025
