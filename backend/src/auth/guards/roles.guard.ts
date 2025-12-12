import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

/**
 * Guard للتحقق من صلاحيات المستخدم
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // الحصول على الأدوار المطلوبة من الـ decorator
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // إذا لم يتم تحديد أدوار، السماح بالوصول
    if (!requiredRoles) {
      return true;
    }

    // الحصول على بيانات المستخدم من الـ request
    const { user } = context.switchToHttp().getRequest();

    // التحقق من وجود المستخدم
    if (!user) {
      return false;
    }

    // التحقق من وجود أحد الأدوار المطلوبة
    return requiredRoles.some((role) => user.roles?.includes(role));
  }
}
