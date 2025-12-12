import { SetMetadata } from '@nestjs/common';

/**
 * Metadata key للـ endpoints العامة
 */
export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Decorator لتحديد الـ endpoints التي لا تحتاج إلى Authentication
 * 
 * @example
 * @Public()
 * @Get('health')
 * healthCheck() {
 *   return { status: 'ok' };
 * }
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
