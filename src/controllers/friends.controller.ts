import { Request, Response } from 'express';
import { FriendsService } from '../services/friends.service';

export class FriendsController {
    /**
     * POST /friends/:friendId
     * Adiciona um amigo
     * */
    static async addFriend(req: Request, res: Response) {
        try {
            const userId = req.user.userId;
            const friendId = req.params.friendId;
            await FriendsService.addFriend(userId, friendId);
            res.status(201).send({ message: 'Amigo adicionado com sucesso' });
        } catch (error) {
            res.status(500).send({ error: 'Falha ao adicionar amigo' });
        }
    }
    /**
     * DELETE /friends/:friendId
     * Remove um amigo
     * */
    static async removeFriend(req: Request, res: Response) {
        try {
            const userId = req.user.userId;
            const friendId = req.params.friendId;
            await FriendsService.removeFriend(userId, friendId);
            res.status(200).send({ message: 'Amigo removido com sucesso' });
        } catch (error) {
            res.status(500).send({ error: 'Falha ao remover amigo' });
        }
    }
    /**
     * GET /friends
     * Lista os amigos do usuário
     * */
    static async listFriends(req: Request, res: Response) {
        try {
            const userId = req.user.userId;
            const friends = await FriendsService.listFriends(userId);
            res.status(200).send(friends);
        } catch (error) {
            res.status(500).send({ error: 'Falha ao listar amigos' });
        }
    }

    static async listPublicFriends(req: Request, res: Response) {
        try {
            const userId = req.query.userId as string; 
            
            if (!userId) {
                return res.status(400).send({ error: 'UserId é obrigatório' });
            }

            const friends = await FriendsService.listFriends(userId);
            res.status(200).send(friends);
        } catch (error) {
            res.status(500).send({ error: 'Falha ao listar amigos públicos' });
        }
    }
}