import { ValueTransformer } from 'typeorm';
import { Decimal } from 'decimal.js';

/**
 * Transformer لتحويل القيم العددية إلى Decimal والعكس
 * يستخدم مع TypeORM لضمان الدقة في الحسابات المالية
 */
export class DecimalTransformer implements ValueTransformer {
  /**
   * تحويل من Decimal إلى string للحفظ في قاعدة البيانات
   */
  to(value: Decimal | number | string | null): string | null {
    if (value === null || value === undefined) {
      return null;
    }

    if (value instanceof Decimal) {
      return value.toString();
    }

    return new Decimal(value).toString();
  }

  /**
   * تحويل من string إلى Decimal عند القراءة من قاعدة البيانات
   */
  from(value: string | null): Decimal | null {
    if (value === null || value === undefined) {
      return null;
    }

    return new Decimal(value);
  }
}

/**
 * Instance جاهز للاستخدام
 */
export const decimalTransformer = new DecimalTransformer();
