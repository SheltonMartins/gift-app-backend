// src/routes/userRoutes.ts
import { Router } from 'express'
import {
  registerUser,
  loginUser,
  getUserById,
  getAllUsers,
  getUserGifts,
  searchUserByNickname,
} from '../controllers/userController'
import { addFriend, getFriends } from '../controllers/friendController'

const router = Router()

// Rotas públicas
router.post('/register', registerUser)
router.post('/login', loginUser)
router.get('/search/:nickname', searchUserByNickname)

// Rotas que dependem de dados do usuário
router.get('/', getAllUsers)
router.get('/:id', getUserById)
router.get('/:id/gifts', getUserGifts)
router.post('/:id/add-friend', addFriend)
router.get('/:id/friends', getFriends)

export default router
