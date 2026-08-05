import { Request, Response } from 'express';
import { FriendsService } from '../services/friends.service';
import { AppError } from '../utils/app-error';

export class FriendsController {
    /**
     * POST /friends/:friendId
     * Adiciona um amigo
     */
    static async addFriend(req: Request, res: Response) {
        try {
            const userId = req.user!.userId;
            const friendId = req.params.friendId;

            if (!friendId) {
                throw new AppError('friendId é obrigatório', 400);
            }
            if (friendId === userId) {
                throw new AppError('Você não pode adicionar a si mesmo', 400);
            }

            await FriendsService.addFriend(userId, friendId);
            res.status(201).json({ success: true, message: 'Amigo adicionado com sucesso' });
        } catch (error) {
            return FriendsController.handleError(res, error);
        }
    }

    /**
     * DELETE /friends/:friendId
     * Remove um amigo
     */
    static async removeFriend(req: Request, res: Response) {
        try {
            const userId = req.user!.userId;
            const friendId = req.params.friendId;
            await FriendsService.removeFriend(userId, friendId);
            res.status(200).json({ success: true, message: 'Amigo removido com sucesso' });
        } catch (error) {
            return FriendsController.handleError(res, error);
        }
    }

    /**
     * GET /friends
     * Lista os amigos do usuário
     */
    static async listFriends(req: Request, res: Response) {
        try {
            const userId = req.user!.userId;
            const friends = await FriendsService.listFriends(userId);
            res.status(200).json({ success: true, data: friends });
        } catch (error) {
            return FriendsController.handleError(res, error);
        }
    }

    /**
     * GET /friends/public?userId=xxx
     * Lista amigos públicos de um usuário
     */
    static async listPublicFriends(req: Request, res: Response) {
        try {
            const userId = req.query.userId as string;

            if (!userId) {
                throw new AppError('UserId é obrigatório', 400);
            }

            const friends = await FriendsService.listFriends(userId);
            res.status(200).json({ success: true, data: friends });
        } catch (error) {
            return FriendsController.handleError(res, error);
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
