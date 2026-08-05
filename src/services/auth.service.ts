import prisma from '../config/prisma';

import { HashUtil } from '../utils/hash.util';
import { JwtUtil } from '../utils/jwt.util';
import { AppError } from '../utils/app-error';
import { TokenPair } from '../types/jwt.types';
import { RegisterInput, LoginInput } from '../utils/zod/validation.schemas';

export class AuthService {
  // 🟩 CREATE — Registrar novo usuário
  static async register(data: RegisterInput): Promise<void> {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) throw new AppError('Email já está em uso', 409);

    const hashedPassword = await HashUtil.hashPassword(data.password);

    await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
      },
    });
  }

  // 🟨 READ — Buscar todos os usuários (sem senha)
  static async getAll() {
    return prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // 🟨 READ — Buscar usuários por nome (sem senha)
  static async getByName(name: string) {
    return prisma.user.findMany({
      where: {
        name: {
          contains: name,
          mode: 'insensitive',
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
        createdAt: true,
      },
    });
  }

  // 🟦 UPDATE — Atualizar dados de um usuário
  static async update(
    userId: string,
    data: { name?: string; email?: string; password?: string; bio?: string }
  ): Promise<void> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError('Usuário não encontrado', 404);

    if (data.email && data.email !== user.email) {
      const emailTaken = await prisma.user.findUnique({ where: { email: data.email } });
      if (emailTaken) throw new AppError('Email já está em uso', 409);
    }

    const updateData: { name?: string; email?: string; password?: string; bio?: string } = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.bio !== undefined) updateData.bio = data.bio;
    if (data.password !== undefined) {
      updateData.password = await HashUtil.hashPassword(data.password);
    }

    await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });
  }

  // 🟥 DELETE — Remover usuário
  static async delete(userId: string): Promise<void> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError('Usuário não encontrado', 404);

    await prisma.user.delete({
      where: { id: userId },
    });
  }

  // 🔑 LOGIN — Autenticação e geração de tokens
  static async login(data: LoginInput): Promise<TokenPair> {
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) throw new AppError('Email não cadastrado', 401);

    const isPasswordValid = await HashUtil.comparePassword(data.password, user.password);
    if (!isPasswordValid) throw new AppError('Senha incorreta', 401);

    const payload = { userId: user.id, email: user.email };

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

    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });

    if (!storedToken) throw new AppError('Refresh token inválido', 401);
    if (storedToken.expiresAt < new Date()) {
      await prisma.refreshToken.delete({ where: { id: storedToken.id } });
      throw new AppError('Refresh token expirado', 401);
    }

    // Remove o antigo e cria um novo (rotaciona o refresh token)
    await prisma.refreshToken.delete({ where: { id: storedToken.id } });

    const newAccessToken = JwtUtil.generateAccessToken({
      userId: payload.userId,
      email: payload.email,
    });
    const newRefreshToken = JwtUtil.generateRefreshToken({
      userId: payload.userId,
      email: payload.email,
    });

    await prisma.refreshToken.create({
      data: {
        token: newRefreshToken,
        userId: payload.userId,
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
