import prisma from '../config/prisma';

export class FriendsService {
    // 🟩 ADD FRIEND — Adicionar um amigo
    static async addFriend(userId: string, friendId: string): Promise<void> {
        await prisma.friends.create({
            data: {
                userId,
                friendId
            },
        });
    }
    // 🟩 REMOVE FRIEND — Remover um amigo
    static async removeFriend(userId: string, friendId: string): Promise<void> {
        await prisma.friends.deleteMany({
            where: {
                userId,
                friendId
            },
        });
    }
    // 🟩 LIST FRIENDS — Listar amigos de um usuário
    static async listFriends(userId: string): Promise<string[]> {
        const friends = await prisma.friends.findMany({
            where: { userId },
            select: { friendId: true },
        });
        return friends.map(friend => friend.friendId);
    }
}