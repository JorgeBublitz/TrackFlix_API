import { Request, Response } from 'express';
import { FavoriteService } from '../services/favorite.service';
import { AppError } from '../utils/app-error';

export class FavoriteController {
    /**
     * POST /favorites
     * Adiciona um favorito para o usuário
     */
    static async addFavorite(req: Request, res: Response) {
        try {
            const userId = req.user!.userId;
            const { crossoverId } = req.body;

            if (!crossoverId) {
                throw new AppError('crossoverId é obrigatório', 400);
            }

            await FavoriteService.addFavorite(userId, crossoverId);

            return res.status(201).json({ success: true, message: 'Favorito adicionado com sucesso' });
        } catch (error) {
            return FavoriteController.handleError(res, error);
        }
    }

    /**
     * DELETE /favorites
     * Remove um favorito do usuário
     */
    static async removeFavorite(req: Request, res: Response) {
        try {
            const userId = req.user!.userId;
            const { crossoverId } = req.body;

            if (!crossoverId) {
                throw new AppError('crossoverId é obrigatório', 400);
            }
            await FavoriteService.removeFavorite(userId, crossoverId);

            return res.status(200).json({ success: true, message: 'Favorito removido com sucesso' });
        } catch (error) {
            return FavoriteController.handleError(res, error);
        }
    }

    /**
     * GET /favorites
     * Lista os favoritos do usuário
     */
    static async listFavorites(req: Request, res: Response) {
        try {
            const userId = req.user!.userId;
            const favorites = await FavoriteService.listFavorites(userId);
            return res.status(200).json({ success: true, data: favorites });
        } catch (error) {
            return FavoriteController.handleError(res, error);
        }
    }

    /**
     * GET /favorites/public?userId=xxx
     * Lista favoritos públicos de um usuário
     */
    static async listPublicFavorites(req: Request, res: Response) {
        try {
            const userId = req.query.userId as string;

            if (!userId) {
                throw new AppError('UserId é obrigatório', 400);
            }

            const favorites = await FavoriteService.listFavorites(userId);
            res.status(200).json({ success: true, data: favorites });
        } catch (error) {
            return FavoriteController.handleError(res, error);
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
