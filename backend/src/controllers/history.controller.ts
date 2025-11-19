import { Request, Response } from 'express';
import { HistoryService } from '../services/history.service';

export class HistoryController {
    /**
     * GET /history
     * Lista o histórico de visualizações do usuário    
     *  */
    static async listHistory(req: Request, res: Response) {
        try {
            const userId = req.user.userId;
            const history = await HistoryService.listHistory(userId);
            return res.status(200).json({ history });
        } catch (error: any) {
            return res.status(500).json({
                message: 'Erro ao listar histórico',
                error: error.message
            });
        }
    }
    /**
     * POST /history
     * Adiciona um item ao histórico de visualizações do usuário
     *  */
    static async addToHistory(req: Request, res: Response) {
        try {
            const userId = req.user.userId;
            const { crossoverId } = req.body;
            if (!crossoverId) {
                return res.status(400).json({ message: 'crossoverId é obrigatório' });
            }
            await HistoryService.addToHistory(userId, crossoverId);
            return res.status(201).json({ message: 'Item adicionado ao histórico com sucesso' });
        } catch (error: any) {
            return res.status(500).json({
                message: 'Erro ao adicionar item ao histórico',
                error: error.message
            });
        }
    }
    /**
     * DELETE /history
     * Limpa o histórico de visualizações do usuário
     * */
    static async clearHistory(req: Request, res: Response) {
        try {
            const userId = req.user.userId;
            await HistoryService.clearHistory(userId);
            return res.status(200).json({ message: 'Histórico limpo com sucesso' });
        } catch (error: any) {
            return res.status(500).json({
                message: 'Erro ao limpar histórico',
                error: error.message
            });
        }
    }
}