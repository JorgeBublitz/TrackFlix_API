import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';
import { JwtPayload } from '../types/jwt.types';

export class JwtUtil {
  private static parseExpiration(exp: string): number {
    const match = exp.match(/^(\d+)([dhms])$/);
    if (!match) throw new Error('Invalid expiration format');

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case 'd': return value * 24 * 60 * 60;
      case 'h': return value * 60 * 60;
      case 'm': return value * 60;
      case 's': return value;
      default: throw new Error('Invalid expiration unit');
    }
  }

  private static cleanPayload(payload: JwtPayload): JwtPayload {
    return { userId: payload.userId, email: payload.email };
  }

  static generateAccessToken(payload: JwtPayload): string {
    const options: SignOptions = {
      expiresIn: this.parseExpiration(env.jwtAccessExpiration),
    };
    return jwt.sign(this.cleanPayload(payload), env.jwtAccessSecret, options);
  }

  static generateRefreshToken(payload: JwtPayload): string {
    const options: SignOptions = {
      expiresIn: this.parseExpiration(env.jwtRefreshExpiration),
    };
    return jwt.sign(this.cleanPayload(payload), env.jwtRefreshSecret, options);
  }

  static verifyAccessToken(token: string): JwtPayload {
    return jwt.verify(token, env.jwtAccessSecret) as JwtPayload;
  }

  static verifyRefreshToken(token: string): JwtPayload {
    return jwt.verify(token, env.jwtRefreshSecret) as JwtPayload;
  }

  static getRefreshTokenExpirationDate(): Date {
    const now = new Date();

    const match = env.jwtRefreshExpiration.match(/^(\d+)([dhms])$/);
    if (!match) throw new Error('Invalid JWT_REFRESH_EXPIRATION format');

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case 'd': now.setDate(now.getDate() + value); break;
      case 'h': now.setHours(now.getHours() + value); break;
      case 'm': now.setMinutes(now.getMinutes() + value); break;
      case 's': now.setSeconds(now.getSeconds() + value); break;
    }

    return now;
  }
}
