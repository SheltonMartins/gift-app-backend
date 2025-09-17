// src/routes/friendRoutes.ts
import { Router } from 'express';
import { addFriend, getFriends, removeFriend } from '../controllers/friendController';


const router = Router();

// Lista todos os amigos do usuário logado
router.get('/', getFriends);

// Adiciona um amigo pelo nickname
router.post('/', addFriend);


router.delete('/:friendId', removeFriend);

export default router;
