// src/routes/giftRoutes.ts
import { Router } from 'express';
import { getUserGifts, createGift, deleteGift } from '../controllers/giftController';

const router = Router();

// Lista todos os presentes de um usuário (GET /gifts/:userId)
router.get('/:userId', getUserGifts);

// Cria um novo presente (POST /gifts) -> usa token para definir dono
router.post('/', createGift);

// Deleta presente por id (DELETE /gifts/:giftId) -> só dono consegue
router.delete('/:giftId', deleteGift);

export default router;
