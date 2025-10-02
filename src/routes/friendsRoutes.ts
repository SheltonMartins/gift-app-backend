// src/routes/friendRoutes.ts
import { Router } from 'express'
import { addFriend, getFriends, getFriendsOfUser, removeFriend } from '../controllers/friendController'

const router = Router()

router.get('/', getFriends)
router.get('/:userId', getFriendsOfUser); // amigos de outro usuário
router.post('/', addFriend)
router.delete('/:friendId', removeFriend)

export default router
