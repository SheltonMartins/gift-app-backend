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

router.post('/register', registerUser)
router.post('/login', loginUser)
router.get('/', getAllUsers)
router.get('/:id', getUserById)
router.get('/:id/gifts', getUserGifts)
router.post('/:id/add-friend', addFriend)
router.get('/search/:nickname', searchUserByNickname)
router.get('/:id/friends', getFriends)

export default router
