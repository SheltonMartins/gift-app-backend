// src/routes/giftRoutes.ts
import { Router } from 'express'
import { getUserGifts, createGift, deleteGift } from '../controllers/giftController'

const router = Router()

router.get('/:userId', getUserGifts)
router.post('/', createGift)
router.delete('/:giftId', deleteGift)

export default router
