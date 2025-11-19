import { Router } from 'express';
import authRoutesV1 from './v1/auth.routes';
import authRoutesV2 from './v2/auth.routes';
import favoriteRoutesV1 from './v2/favorite.routes';

const router = Router();

// Grupo de rotas de autenticação
router.use('/auth/v1', authRoutesV1);

router.use('/auth/v2', authRoutesV2);
router.use('/favorites/v1', favoriteRoutesV1);

export default router;
