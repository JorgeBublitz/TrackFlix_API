import { Request, Response } from 'express';
import { FavoriteService } from '../services/favorite.service';

export class FavoriteController {
    /**
     * POST /favorites
     * Adiciona um favorito para o usuário
     */
    static async addFavorite(req: Request, res: Response) {
        try {
            const userId = req.user.userId; 
            const { crossoverId } = req.body;

            if (!crossoverId) {
                return res.status(400).json({ message: 'crossoverId é obrigatório' });
            }

            await FavoriteService.addFavorite(userId, crossoverId);

            return res.status(201).json({ message: 'Favorito adicionado com sucesso' });
        } catch (error: any) {
            return res.status(500).json({
                message: 'Erro ao adicionar favorito',
                error: error.message
            });
        }
    }

    /**
     * DELETE /favorites
     * Remove um favorito do usuário
     * */
    static async removeFavorite(req: Request, res: Response) {
        try {
            const userId = req.user.userId; 
            const { crossoverId } = req.body;

            if (!crossoverId) {
                return res.status(400).json({ message: 'crossoverId é obrigatório' });
            }
            await FavoriteService.removeFavorite(userId, crossoverId);

            return res.status(200).json({ message: 'Favorito removido com sucesso' });
        } catch (error: any) {
            return res.status(500).json({
                message: 'Erro ao remover favorito',
                error: error.message
            });
        }
    }

    /**
     * GET /favorites
     * Lista os favoritos do usuário
     * */
    static async listFavorites(req: Request, res: Response) {
        try {
            const userId = req.user.userId; 
            const favorites = await FavoriteService.listFavorites(userId);
            return res.status(200).json({ favorites });
        } catch (error: any) {
            return res.status(500).json({
                message: 'Erro ao listar favoritos',
                error: error.message
            });
        }
    }
}