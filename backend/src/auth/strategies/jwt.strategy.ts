import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

/**
 * JWT Strategy للتحقق من صحة الـ Token
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'semop-secret-key-2025',
    });
  }

  /**
   * يتم استدعاء هذه الدالة بعد التحقق من صحة الـ Token
   * @param payload البيانات المشفرة في الـ Token
   * @returns بيانات المستخدم
   */
  async validate(payload: any) {
    if (!payload.sub || !payload.username) {
      throw new UnauthorizedException('Invalid token payload');
    }

    return {
      userId: payload.sub,
      username: payload.username,
      roles: payload.roles || [],
    };
  }
}
