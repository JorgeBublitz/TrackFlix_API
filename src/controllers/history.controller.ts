import { Request, Response } from 'express';
import { HistoryService } from '../services/history.service';
import { AppError } from '../utils/app-error';
import { handleError } from '../utils/handle-error';

export class HistoryController {
    /**
     * GET /history
     * Lista o histórico de visualizações do usuário
     */
    static async listHistory(req: Request, res: Response) {
        try {
            const userId = req.user!.userId;
            const history = await HistoryService.listHistory(userId);
            return res.status(200).json({ success: true, data: history });
        } catch (error) {
            return handleError(res, error);
        }
    }

    /**
     * POST /history
     * Adiciona um item ao histórico de visualizações do usuário
     */
    static async addToHistory(req: Request, res: Response) {
        try {
            const userId = req.user!.userId;
            const { crossoverId } = req.body;
            if (!crossoverId) {
                throw new AppError('crossoverId é obrigatório', 400);
            }
            await HistoryService.addToHistory(userId, crossoverId);
            return res.status(201).json({ success: true, message: 'Item adicionado ao histórico com sucesso' });
        } catch (error) {
            return handleError(res, error);
        }
    }

    /**
     * DELETE /history
     * Limpa o histórico de visualizações do usuário
     */
    static async clearHistory(req: Request, res: Response) {
        try {
            const userId = req.user!.userId;
            await HistoryService.clearHistory(userId);
            return res.status(200).json({ success: true, message: 'Histórico limpo com sucesso' });
        } catch (error) {
            return handleError(res, error);
        }
    }

    /**
     * GET /history/public?userId=xxx
     * Lista histórico público de um usuário
     */
    static async listPublicHistory(req: Request, res: Response) {
        try {
            const userId = req.query.userId as string;

            if (!userId) {
                throw new AppError('UserId é obrigatório', 400);
            }

            const history = await HistoryService.listHistory(userId);
            res.status(200).json({ success: true, data: history });
        } catch (error) {
            return handleError(res, error);
        }
    }
}
