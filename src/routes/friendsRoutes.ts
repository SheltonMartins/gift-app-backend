// src/routes/friendRoutes.ts
import { Router } from 'express'
import { addFriend, getFriends, removeFriend } from '../controllers/friendController'

const router = Router()

router.get('/', getFriends)
router.post('/', addFriend)
router.delete('/:friendId', removeFriend)

export default router
