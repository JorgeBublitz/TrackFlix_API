import { Request, Response } from 'express';
import { WatchListService } from '../services/watchList.service';
import { AppError } from '../utils/app-error';
import { handleError } from '../utils/handle-error';

export class WatchListController {
    /**
     * POST /watchlist
     * Adiciona um item à watchlist do usuário
     */
    static async addToWatchList(req: Request, res: Response) {
        try {
            const userId = req.user!.userId;
            const { crossoverId } = req.body;
            if (!crossoverId) {
                throw new AppError('crossoverId é obrigatório', 400);
            }

            await WatchListService.addToWatchList(userId, crossoverId);
            return res.status(201).json({ success: true, message: 'Item adicionado à watchlist com sucesso' });
        } catch (error) {
            return handleError(res, error);
        }
    }

    /**
     * DELETE /watchlist
     * Remove um item da watchlist do usuário
     */
    static async removeFromWatchList(req: Request, res: Response) {
        try {
            const userId = req.user!.userId;
            const { crossoverId } = req.body;
            if (!crossoverId) {
                throw new AppError('crossoverId é obrigatório', 400);
            }

            await WatchListService.removeFromWatchList(userId, crossoverId);
            return res.status(200).json({ success: true, message: 'Item removido da watchlist com sucesso' });
        } catch (error) {
            return handleError(res, error);
        }
    }

    /**
     * GET /watchlist
     * Lista os itens da watchlist do usuário
     */
    static async listWatchList(req: Request, res: Response) {
        try {
            const userId = req.user!.userId;
            const watchlist = await WatchListService.listWatchList(userId);
            return res.status(200).json({ success: true, data: watchlist });
        } catch (error) {
            return handleError(res, error);
        }
    }

    /**
     * GET /watchlist/public?userId=xxx
     * Lista watchlist pública de um usuário
     */
    static async listPublicWatchList(req: Request, res: Response) {
        try {
            const userId = req.query.userId as string;

            if (!userId) {
                throw new AppError('UserId é obrigatório', 400);
            }

            const watchlist = await WatchListService.listWatchList(userId);
            res.status(200).json({ success: true, data: watchlist });
        } catch (error) {
            return handleError(res, error);
        }
    }
}
