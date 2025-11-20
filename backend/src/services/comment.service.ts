import prisma from '../config/prisma';

export class CommentService {
    // 🟩 CREATE — Adicionar um comentário
    static async addComment(userId: string, crossoverId: string, content: string): Promise<void> {
        await prisma.comment.create({
            data: {
                userId,
                crossoverId,
                content
            },
        });
    }
    // 🟩 LIST — Listar comentários de um crossover
    static async listComments(crossoverId: string) {
        return prisma.comment.findMany({
            where: {
                crossoverId
            },
            orderBy: {
                createdAt: 'desc'
            },
        });
    }
    // 🟩 DELETE — Remover um comentário
    static async deleteComment(commentId: string, userId: string): Promise<void> {
        await prisma.comment.deleteMany({
            where: {
                id: commentId,
                userId
            },
        });
    }
}   