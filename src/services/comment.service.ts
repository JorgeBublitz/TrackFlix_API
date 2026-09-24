import prisma from '../config/prisma';
import { AppError } from '../utils/app-error';

export class CommentService {
  // Adiciona um comentário
  static async addComment(userId: string, crossoverId: string, content: string): Promise<void> {
    await prisma.comment.create({
      data: { userId, crossoverId, content },
    });
  }

  // Lista os comentários de um filme/série, do mais recente para o mais antigo
  static async listComments(crossoverId: string) {
    return prisma.comment.findMany({
      where: { crossoverId },
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, name: true } } },
    });
  }

  // Remove um comentário do próprio usuário
  static async deleteComment(commentId: string, userId: string): Promise<void> {
    const { count } = await prisma.comment.deleteMany({
      where: { id: commentId, userId },
    });
    if (count === 0) throw new AppError('Comentário não encontrado', 404);
  }

  // Edita um comentário do próprio usuário
  static async editComment(commentId: string, userId: string, content: string): Promise<void> {
    const { count } = await prisma.comment.updateMany({
      where: { id: commentId, userId },
      data: { content },
    });
    if (count === 0) throw new AppError('Comentário não encontrado', 404);
  }

  // Adiciona um like a um comentário
  static async likeComment(commentId: string): Promise<void> {
    const { count } = await prisma.comment.updateMany({
      where: { id: commentId },
      data: { likes: { increment: 1 } },
    });
    if (count === 0) throw new AppError('Comentário não encontrado', 404);
  }

  // Remove um like de um comentário sem deixar o contador negativo
  static async unlikeComment(commentId: string): Promise<void> {
    const comment = await prisma.comment.findUnique({ where: { id: commentId }, select: { id: true } });
    if (!comment) throw new AppError('Comentário não encontrado', 404);

    await prisma.comment.updateMany({
      where: { id: commentId, likes: { gt: 0 } },
      data: { likes: { decrement: 1 } },
    });
  }
}
