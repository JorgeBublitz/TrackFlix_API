import { Request, Response } from 'express';
import { CommentService } from '../services/comment.service';

export class CommentController {
    /**
     * POST /comments
     * Adiciona um comentário a um crossover
     * */
    static async addComment(req: Request, res: Response) {
        try {
            const userId = req.user.userId;
            const { crossoverId, content } = req.body;
            if (!crossoverId || !content) {
                return res.status(400).json({ message: 'crossoverId e content são obrigatórios' });
            }
            await CommentService.addComment(userId, crossoverId, content);
            return res.status(201).json({ message: 'Comentário adicionado com sucesso' });
        } catch (error: any) {
            return res.status(500).json({
                message: 'Erro ao adicionar comentário',
                error: error.message
            });
        }
    }
    /**
     * GET /comments/:crossoverId
     * Lista os comentários de um crossover
     *  */
    static async listComments(req: Request, res: Response) {
        try {
            const { crossoverId } = req.params;
            const comments = await CommentService.listComments(crossoverId);
            return res.status(200).json({ comments });
        } catch (error: any) {
            return res.status(500).json({
                message: 'Erro ao listar comentários',
                error: error.message
            });
        }
    }
    /**
     * DELETE /comments/:commentId
     * Remove um comentário feito pelo usuário
     * */
    static async deleteComment(req: Request, res: Response) {
        try {
            const userId = req.user.userId;
            const { commentId } = req.params;
            await CommentService.deleteComment(commentId, userId);
            return res.status(200).json({ message: 'Comentário removido com sucesso' });
        } catch (error: any) {
            return res.status(500).json({
                message: 'Erro ao remover comentário',
                error: error.message
            });
        }
    }
    /**
     *  POST /comments/:commentId/like
     * Adiciona um like a um comentário
     * */
    static async likeComment(req: Request, res: Response) {
        try {
            const { commentId } = req.params;
            await CommentService.likeComment(commentId);
            return res.status(200).json({ message: 'Like adicionado ao comentário com sucesso' });
        } catch (error: any) {
            return res.status(500).json({
                message: 'Erro ao adicionar like ao comentário',
                error: error.message
            });
        }
    }
    /**
     *  POST /comments/:commentId/unlike
     * Remove um like de um comentário
     * */
    static async unlikeComment(req: Request, res: Response) {
        try {
            const { commentId } = req.params;
            await CommentService.unlikeComment(commentId);
            return res.status(200).json({ message: 'Like removido do comentário com sucesso' });
        } catch (error: any) {
            return res.status(500).json({
                message: 'Erro ao remover like do comentário',
                error: error.message
            });
        }
    }
}
