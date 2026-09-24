import prisma from '../config/prisma';

export class HistoryService {
  // Registra um item no histórico. Se já existir, move para o topo (atualiza a data).
  static async addToHistory(userId: string, crossoverId: string): Promise<void> {
    await prisma.history.upsert({
      where: { userId_crossoverId: { userId, crossoverId } },
      create: { userId, crossoverId },
      update: { createdAt: new Date() },
    });
  }

  // Lista o histórico do usuário, do mais recente para o mais antigo
  static async listHistory(userId: string) {
    return prisma.history.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Limpa o histórico do usuário
  static async clearHistory(userId: string): Promise<void> {
    await prisma.history.deleteMany({ where: { userId } });
  }
}
