import prisma from '../config/prisma';

export class WatchListService {
    // 🟩 CREATE — Adicionar um item à watchlist
    static async addToWatchList(userId: string, crossoverId: string): Promise<void> {
        await prisma.watchlist.create({
            data: {
                userId,
                crossoverId
            },
        });
    }
    
    // 🟩 REMOVE — Remover um item da watchlist
    static async removeFromWatchList(userId: string, crossoverId: string): Promise<void> {
        await prisma.watchlist.deleteMany({
            where: {
                userId,
                crossoverId
            },
        });
    }

    // 🟩 LIST — Listar itens da watchlist de um usuário
    static async listWatchList(userId: string) {
        return prisma.watchlist.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
    }
}
