import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { AppError } from '../utils/app-error';
import {
  RegisterInput,
  LoginInput,
  RefreshTokenInput,
} from '../utils/zod/validation.schemas';

export class AuthController {
  /**
   * GET /users
   * Lista todos os usuários (sem senha)
   */
  static async getAll(req: Request, res: Response) {
    try {
      const users = await AuthService.getAll();
      return res.json({ success: true, data: users });
    } catch (error) {
      return AuthController.handleError(res, error);
    }
  }

  /**
   * GET /users?name=xxx
   * Busca usuários pelo nome (sem senha)
   */
  static async getByName(req: Request, res: Response) {
    try {
      const { name } = req.query;
      if (!name || typeof name !== 'string') {
        return res.status(400).json({ success: false, message: 'Nome é obrigatório' });
      }

      const users = await AuthService.getByName(name);
      return res.json({ success: true, data: users });
    } catch (error) {
      return AuthController.handleError(res, error);
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
      return AuthController.handleError(res, error);
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
      return AuthController.handleError(res, error);
    }
  }

  /**
   * POST /refresh
   * Gera novo access token a partir do refresh token
   */
  static async refresh(req: Request, res: Response): Promise<Response> {
    try {
      const refreshToken = req.body.refreshToken || req.headers['x-refresh-token'];

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
      return AuthController.handleError(res, error);
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
      return AuthController.handleError(res, error);
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

      // Impede que um usuário altere dados de outro
      if (req.user && req.user.userId !== id) {
        return res.status(403).json({
          success: false,
          message: 'Você não tem permissão para alterar este usuário',
        });
      }

      await AuthService.update(id, data);

      return res.status(200).json({
        success: true,
        message: 'Usuário atualizado com sucesso',
      });
    } catch (error) {
      return AuthController.handleError(res, error);
    }
  }

  /**
   * DELETE /users/:id
   * Remove um usuário pelo ID
   */
  static async delete(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      if (req.user && req.user.userId !== id) {
        return res.status(403).json({
          success: false,
          message: 'Você não tem permissão para remover este usuário',
        });
      }

      await AuthService.delete(id);

      return res.status(200).json({
        success: true,
        message: 'Usuário removido com sucesso',
      });
    } catch (error) {
      return AuthController.handleError(res, error);
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
      return AuthController.handleError(res, error);
    }
  }

  /**
   * Centraliza o tratamento de erros dos controllers
   */
  private static handleError(res: Response, error: unknown): Response {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }

    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
    });
  }
}
