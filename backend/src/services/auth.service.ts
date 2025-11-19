import prisma from '../config/prisma';
import dotenv from 'dotenv';

import { HashUtil } from '../utils/hash.util';
import { JwtUtil } from '../utils/jwt.util';
import { TokenPair } from '../types/jwt.types';
import { RegisterInput, LoginInput } from '../utils/zod/validation.schemas';

dotenv.config();

export class AuthService {
  // 🟩 CREATE — Registrar novo usuário
  static async register(data: RegisterInput): Promise<void> {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) throw new Error('Email já está em uso');

    const hashedPassword = await HashUtil.hashPassword(data.password);

    await prisma.user.create({
      data: {
        name: data.name,
        nickname: data.nickname,
        email: data.email,
        password: hashedPassword,
      },
    });
  }

  // 🟨 READ — Buscar todos os usuários
  static async getAll() {
    return prisma.user.findMany();
  }

  // 🟨 READ — Buscar usuários por nome
  static async getByName(name: string) {
    return prisma.user.findMany({
      where: {
        name: {
          contains: name,
          mode: 'insensitive',
        },
      },
    });
  }

  static async getByNickname(nickname: string) {
    return prisma.user.findMany({
      where: {
        nickname: {
          contains: nickname,
          mode: 'insensitive',
        },
      },
    });
  }

  
  // 🟦 UPDATE — Atualizar dados de um usuário
  static async update(userId: string, data: Partial<RegisterInput>): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data,
    });
  }

  // 🟥 DELETE — Remover usuário
  static async delete(userId: string): Promise<void> {
    await prisma.user.delete({
      where: { id: userId },
    });
  }

  // 🔑 LOGIN — Autenticação e geração de tokens
  static async login(data: LoginInput): Promise<TokenPair> {
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) throw new Error('Email não cadastrado');

    const isPasswordValid = await HashUtil.comparePassword(data.password, user.password);
    if (!isPasswordValid) throw new Error('Senha incorreta');

    const payload = { userId: user.id.toString(), email: user.email };

    const accessToken = JwtUtil.generateAccessToken(payload);
    const refreshToken = JwtUtil.generateRefreshToken(payload);

    // Deletar refresh tokens antigos
    await prisma.refreshToken.deleteMany({ where: { userId: user.id } });

    // Criar novo token de refresh
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: JwtUtil.getRefreshTokenExpirationDate(),
      },
    });

    return { accessToken, refreshToken };
  }

  // ♻️ REFRESH — Renovar tokens
  static async refreshAccessToken(refreshToken: string): Promise<TokenPair> {
    const payload = JwtUtil.verifyRefreshToken(refreshToken);
    const { exp, iat, ...cleanPayload } = payload as any;

    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });

    if (!storedToken) throw new Error('Refresh token inválido');
    if (storedToken.expiresAt < new Date()) {
      await prisma.refreshToken.delete({ where: { id: storedToken.id } });
      throw new Error('Refresh token expirado');
    }

    // Remove o antigo e cria um novo
    await prisma.refreshToken.delete({ where: { id: storedToken.id } });

    const newAccessToken = JwtUtil.generateAccessToken(cleanPayload);
    const newRefreshToken = JwtUtil.generateRefreshToken(cleanPayload);

    await prisma.refreshToken.create({
      data: {
        token: newRefreshToken,
        userId: String(cleanPayload.userId),
        expiresAt: JwtUtil.getRefreshTokenExpirationDate(),
      },
    });

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  // 🚪 LOGOUT — Invalidar refresh token
  static async logout(refreshToken: string): Promise<void> {
    await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
  }
}
