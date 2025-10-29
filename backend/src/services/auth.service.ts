import prisma from '../config/prisma';
import { HashUtil } from '../utils/hash.util';
import { JwtUtil } from '../utils/jwt.util';
import { TokenPair } from '../types/jwt.types';
import { RegisterInput, LoginInput } from '../utils/validation.schemas';

export class AuthService {
  // Buscar todos os usuários
  static async getAll() {
    return prisma.user.findMany();
  }

  // Buscar usuário pelo nome
  static async getByName(name: string) {
    return prisma.user.findMany({
      where: {
        nome: {
          contains: name,
          mode: 'insensitive',
        },
      },
    });
  }

  // Registrar usuário
  static async register(data: RegisterInput): Promise<void> {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) throw new Error('Email já está em uso');

    const hashedPassword = await HashUtil.hashPassword(data.password);

    await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        nome: data.name,
      },
    });
  }

  // Login do usuário
  static async login(data: LoginInput): Promise<TokenPair> {
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) throw new Error('Email não cadastrado');

    const isPasswordValid = await HashUtil.comparePassword(data.password, user.password);
    if (!isPasswordValid) throw new Error('Senha incorreta');

    // Gerar tokens
    const payload = { userId: user.id.toString(), email: user.email };
    const accessToken = JwtUtil.generateAccessToken(payload);
    const refreshToken = JwtUtil.generateRefreshToken(payload);

    await prisma.refreshToken.deleteMany({
      where: { userId: user.id },
    });

    // Salvar o novo refresh token
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: JwtUtil.getRefreshTokenExpirationDate(),
      },
    });

    return { accessToken, refreshToken };
  }

  static async refreshAccessToken(refreshToken: string): Promise<TokenPair> {
    const payload = JwtUtil.verifyRefreshToken(refreshToken);
    const { exp, iat, ...cleanPayload } = payload as any;

    const storedToken = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
    if (!storedToken) throw new Error('Refresh token inválido');
    if (storedToken.expiresAt < new Date()) {
      await prisma.refreshToken.delete({ where: { id: storedToken.id } });
      throw new Error('Refresh token expirado');
    }

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

  static async logout(refreshToken: string): Promise<void> {
    await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
  }
}
