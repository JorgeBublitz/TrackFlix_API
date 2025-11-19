import prisma from '../config/prisma';

export class HistoryService {
    // 🟩 CREATE — Adicionar um item ao histórico
    static async addToHistory(userId: string, crossoverId: string): Promise<void> {
        await prisma.history.create({
            data: {
                userId,
                crossoverId
            },
        });
    }
    // 🟩 LIST — Listar itens do histórico de um usuário
    static async listHistory(userId: string) {
        return prisma.history.findMany({
            where: {
                userId
            },
        });
    }
    // 🟩 CLEAR — Limpar o histórico de um usuário
    static async clearHistory(userId: string): Promise<void> {
        await prisma.history.deleteMany({
            where: {
                userId
            },
        });
    }
}