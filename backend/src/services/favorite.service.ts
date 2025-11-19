import prisma from '../config/prisma';

export class FavoriteService {
    // 🟩 CREATE — Adicionar um favorito
    static async addFavorite(userId: string, crossoverId: string): Promise<void> {
        await prisma.favorite.create({
            data: {
                userId,
                crossoverId
            },
        });
    }

    // 🟩 REMOVE — Remover um favorito
    static async removeFavorite(userId: string, crossoverId: string): Promise<void> {
        await prisma.favorite.deleteMany({
            where: {
                userId,
                crossoverId
            },
        });
    }

    // 🟩 LIST — Listar favoritos de um usuário
    static async listFavorites(userId: string): Promise<string[]> {
        const favorites = await prisma.favorite.findMany({
            where: { userId },
            select: { crossoverId: true },
        });
        return favorites.map(favorite => favorite.crossoverId);
    }
}