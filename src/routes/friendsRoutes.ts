// src/routes/friendRoutes.ts
import { Router } from 'express'
import { addFriend, getFriends, getFriendsOfUser, removeFriend } from '../controllers/friendController'

const router = Router()

router.post('/', addFriend)
router.get('/:userId', getFriendsOfUser); // amigos de outro usuário
router.get('/', getFriends)
router.delete('/:friendId', removeFriend)

export default router
