import { Response } from 'express';
import { Prisma } from '@prisma/client';
import { AppError } from './app-error';

/**
 * Converte erros conhecidos em respostas HTTP adequadas.
 *
 * Erros do Prisma que representam falhas do cliente (registro duplicado,
 * referência inexistente, registro não encontrado) não devem virar 500.
 */
export function toAppError(error: unknown): AppError | null {
  if (error instanceof AppError) return error;

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        return new AppError('Registro já existe', 409);
      case 'P2003':
        return new AppError('Registro relacionado não encontrado', 404);
      case 'P2025':
        return new AppError('Registro não encontrado', 404);
      default:
        return null;
    }
  }

  return null;
}

export function handleError(res: Response, error: unknown): Response {
  const appError = toAppError(error);
  if (appError) {
    return res.status(appError.statusCode).json({ success: false, message: appError.message });
  }

  console.error(error);
  return res.status(500).json({ success: false, message: 'Erro interno do servidor' });
}
