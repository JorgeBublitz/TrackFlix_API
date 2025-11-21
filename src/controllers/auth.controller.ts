import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import {
  RegisterInput,
  LoginInput,
  RefreshTokenInput,
} from '../utils/zod/validation.schemas';

export class AuthController {
  /**
   * GET /getAll
   * Lista todos os usuários
   */
  static async getAll(req: Request, res: Response) {
    try {
      const users = await AuthService.getAll();
      return res.json(users);
    } catch (err: any) {
      return res.status(500).json({ message: err.message });
    }
  }

  /**
   * GET /users?name=xxx
   * Busca usuários pelo nome
   */
  static async getByName(req: Request, res: Response) {
    try {
      const { name } = req.query;
      if (!name || typeof name !== 'string') {
        return res.status(400).json({ message: 'Nome é obrigatório' });
      }

      const users = await AuthService.getByName(name);
      return res.json(users);
    } catch (err: any) {
      return res.status(500).json({ message: err.message });
    }
  }

  /**
   * POST /register
   * Registra um novo usuário
   */
  static async register(req: Request, res: Response): Promise<Response> {
    try {
      const data: RegisterInput = req.body;
      await AuthService.register(data);

      return res.status(201).json({
        success: true,
        message: 'Usuário registrado com sucesso',
      });
    } catch (error) {
      if (error instanceof Error) {
        // Se o e-mail já existir, retorna 409 (Conflict)
        const status = error.message.includes('já existe') ? 409 : 400;
        return res.status(status).json({
          success: false,
          message: error.message,
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  }

  /**
   * POST /login
   * Faz login e retorna tokens JWT
   */
  static async login(req: Request, res: Response): Promise<Response> {
    try {
      const data: LoginInput = req.body;
      const tokens = await AuthService.login(data);
      return res.status(200).json({
        success: true,
        message: 'Login realizado com sucesso',
        data: tokens,
      });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(401).json({
          success: false,
          message: error.message,
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  }

  /**
   * POST /refresh
   * Gera novo access token a partir do refresh token
   */
  static async refresh(req: Request, res: Response): Promise<Response> {
    try {
      const refreshToken =
        req.body.refreshToken || req.headers['x-refresh-token'];

      if (!refreshToken || typeof refreshToken !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Refresh token é obrigatório',
        });
      }

      const tokens = await AuthService.refreshAccessToken(refreshToken);

      return res.status(200).json({
        success: true,
        message: 'Token renovado com sucesso',
        data: tokens,
      });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(403).json({
          success: false,
          message: error.message,
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  }

  /**
   * POST /logout
   * Invalida o refresh token
   */
  static async logout(req: Request, res: Response): Promise<Response> {
    try {
      const { refreshToken }: RefreshTokenInput = req.body;
      await AuthService.logout(refreshToken);

      return res.status(200).json({
        success: true,
        message: 'Logout realizado com sucesso',
      });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  }

  /**
 * PUT /users/:id
 * Atualiza um usuário existente
 */
  static async update(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const data = req.body;

      await AuthService.update(id, data);

      return res.status(200).json({
        success: true,
        message: 'Usuário atualizado com sucesso',
      });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  }

  /**
   * DELETE /users/:id
   * Remove um usuário pelo ID
   */
  static async delete(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      await AuthService.delete(id);

      return res.status(200).json({
        success: true,
        message: 'Usuário removido com sucesso',
      });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  }

  /**
   * GET /me
   * Retorna dados do usuário autenticado (JWT válido)
   */
  static async me(req: Request, res: Response): Promise<Response> {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Não autenticado',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Usuário autenticado',
        data: {
          userId: req.user.userId,
          email: req.user.email,
        },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  }
}
