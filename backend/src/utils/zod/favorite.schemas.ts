import { z } from 'zod';

/**
 * Schema de validação para adicionar um favorito
 */
export const addFavoriteSchema = z.object({
    crossoverId: z.string().uuid(),
});

/**
 * Schema de validação para remover um favorito
 */
export const removeFavoriteSchema = z.object({
    crossoverId: z.string().uuid(),
});

export type AddFavoriteSchema = z.infer<typeof addFavoriteSchema>;
export type RemoveFavoriteSchema = z.infer<typeof removeFavoriteSchema>;