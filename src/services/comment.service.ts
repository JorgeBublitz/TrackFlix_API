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

    static async editComment(commentId: string, userId: string, content: string): Promise<void> {
        await prisma.comment.updateMany({
            where: {
                id: commentId,
                userId
            },
            data: {
                content
            }
        });
    }
    // 🟩 LIKE — Adicionar um like a um comentário
    static async likeComment(commentId: string): Promise<void> {
        await prisma.comment.update({
            where: { id: commentId },
            data: {
                likes: {
                    increment: 1
                }
            }
        });
    }
    // 🟩 UNLIKE — Remover um like de um comentário
    static async unlikeComment(commentId: string): Promise<void> {
        await prisma.comment.update({
            where: { id: commentId },
            data: {
                likes: {
                    decrement: 1
                }
            }
        });
    }
}   