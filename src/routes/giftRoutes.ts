// src/routes/giftRoutes.ts
import { Router } from 'express'
import { getUserGifts, createGift, deleteGift, getGiftWithComments } from '../controllers/giftController'

const router = Router()

router.get('/:userId', getUserGifts)
router.get('/:giftId/comments', getGiftWithComments) // **nova rota**
router.post('/', createGift)
router.delete('/:giftId', deleteGift)

export default router
