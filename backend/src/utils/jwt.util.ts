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

  static generateAccessToken(payload: JwtPayload): string {
    // Remove exp/iat se existirem
    const { exp, iat, ...cleanPayload } = payload as any;

    const options: SignOptions = {
      expiresIn: this.parseExpiration(env.jwtAccessExpiration),
    };
    return jwt.sign(cleanPayload, env.jwtAccessSecret as string, options);
  }

  static generateRefreshToken(payload: JwtPayload): string {
    const { exp, iat, ...cleanPayload } = payload as any;

    const options: SignOptions = {
      expiresIn: this.parseExpiration(env.jwtRefreshExpiration),
    };
    return jwt.sign(cleanPayload, env.jwtRefreshSecret as string, options);
  }

  static verifyAccessToken(token: string): JwtPayload {
    return jwt.verify(token, env.jwtAccessSecret as string) as JwtPayload;
  }

  static verifyRefreshToken(token: string): JwtPayload {
    return jwt.verify(token, env.jwtRefreshSecret as string) as JwtPayload;
  }

  static getRefreshTokenExpirationDate(): Date {
    const expirationString = env.jwtRefreshExpiration as string;
    const now = new Date();

    const match = expirationString.match(/^(\d+)([dhms])$/);
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
