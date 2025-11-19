import { Request, Response } from 'express';
import { WatchListService } from '../services/watchList.service';
export class WatchListController {
    /**
     * POST /watchlist
     * Adiciona um item à watchlist do usuário
     * */
    static async addToWatchList(req: Request, res: Response) {
        try {
            const userId = req.user.userId;
            const { crossoverId } = req.body;
            if (!crossoverId) {
                return res.status(400).json({ message: 'crossoverId é obrigatório' });
            }

            await WatchListService.addToWatchList(userId, crossoverId);
            return res.status(201).json({ message: 'Item adicionado à watchlist com sucesso' });
        } catch (error: any) {
            return res.status(500).json({
                message: 'Erro ao adicionar item à watchlist',
                error: error.message
            });
        }
    }
    /**
     * DELETE /watchlist
     * Remove um item da watchlist do usuário
     *  */
    static async removeFromWatchList(req: Request, res: Response) {
        try {
            const userId = req.user.userId;
            const { crossoverId } = req.body;
            if (!crossoverId) {
                return res.status(400).json({ message: 'crossoverId é obrigatório' });
            }

            await WatchListService.removeFromWatchList(userId, crossoverId);
            return res.status(200).json({ message: 'Item removido da watchlist com sucesso' });
        } catch (error: any) {
            return res.status(500).json({
                message: 'Erro ao remover item da watchlist',
                error: error.message
            });
        }
    }

    /**
     * GET /watchlist
     * Lista os itens da watchlist do usuário
     *  */
    
    static async listWatchList(req: Request, res: Response) {
        try {
            const userId = req.user.userId;
            const watchlist = await WatchListService.listWatchList(userId);
            return res.status(200).json({ watchlist });
        } catch (error: any) {
            return res.status(500).json({
                message: 'Erro ao listar itens da watchlist',
                error: error.message
            });
        }
    }
}