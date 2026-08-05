import { Request, Response } from 'express';
import { CommentService } from '../services/comment.service';
import { AppError } from '../utils/app-error';

export class CommentController {
    /**
     * POST /comments
     * Adiciona um comentário a um crossover
     */
    static async addComment(req: Request, res: Response) {
        try {
            const userId = req.user!.userId;
            const { crossoverId, content } = req.body;
            if (!crossoverId || !content) {
                throw new AppError('crossoverId e content são obrigatórios', 400);
            }
            await CommentService.addComment(userId, crossoverId, content);
            return res.status(201).json({ success: true, message: 'Comentário adicionado com sucesso' });
        } catch (error) {
            return CommentController.handleError(res, error);
        }
    }

    /**
     * GET /comments/:crossoverId
     * Lista os comentários de um crossover
     */
    static async listComments(req: Request, res: Response) {
        try {
            const { crossoverId } = req.params;
            const comments = await CommentService.listComments(crossoverId);
            return res.status(200).json({ success: true, data: comments });
        } catch (error) {
            return CommentController.handleError(res, error);
        }
    }

    /**
     * PUT /comments/:commentId
     * Edita um comentário feito pelo usuário
     */
    static async editComment(req: Request, res: Response) {
        try {
            const userId = req.user!.userId;
            const { commentId } = req.params;
            const { content } = req.body;
            if (!content) {
                throw new AppError('Content é obrigatório', 400);
            }
            await CommentService.editComment(commentId, userId, content);
            return res.status(200).json({ success: true, message: 'Comentário editado com sucesso' });
        } catch (error) {
            return CommentController.handleError(res, error);
        }
    }

    /**
     * DELETE /comments/:commentId
     * Remove um comentário feito pelo usuário
     */
    static async deleteComment(req: Request, res: Response) {
        try {
            const userId = req.user!.userId;
            const { commentId } = req.params;
            await CommentService.deleteComment(commentId, userId);
            return res.status(200).json({ success: true, message: 'Comentário removido com sucesso' });
        } catch (error) {
            return CommentController.handleError(res, error);
        }
    }

    /**
     * POST /comments/:commentId/like
     * Adiciona um like a um comentário
     */
    static async likeComment(req: Request, res: Response) {
        try {
            const { commentId } = req.params;
            await CommentService.likeComment(commentId);
            return res.status(200).json({ success: true, message: 'Like adicionado ao comentário com sucesso' });
        } catch (error) {
            return CommentController.handleError(res, error);
        }
    }

    /**
     * POST /comments/:commentId/unlike
     * Remove um like de um comentário
     */
    static async unlikeComment(req: Request, res: Response) {
        try {
            const { commentId } = req.params;
            await CommentService.unlikeComment(commentId);
            return res.status(200).json({ success: true, message: 'Like removido do comentário com sucesso' });
        } catch (error) {
            return CommentController.handleError(res, error);
        }
    }

    private static handleError(res: Response, error: unknown): Response {
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({ success: false, message: error.message });
        }
        console.error(error);
        return res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    }
}
