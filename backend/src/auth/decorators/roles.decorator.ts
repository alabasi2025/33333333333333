import { SetMetadata } from '@nestjs/common';

/**
 * Metadata key للأدوار المطلوبة
 */
export const ROLES_KEY = 'roles';

/**
 * Decorator لتحديد الأدوار المطلوبة للوصول إلى endpoint
 * 
 * @param roles قائمة الأدوار المسموح لها بالوصول
 * 
 * @example
 * @Roles('admin', 'accountant')
 * @Post('approve')
 * approveVoucher() {
 *   // فقط المستخدمون بدور admin أو accountant يمكنهم الوصول
 * }
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
