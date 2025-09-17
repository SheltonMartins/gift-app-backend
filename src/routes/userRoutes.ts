import { Router } from 'express';
import {
  registerUser,
  loginUser,
  getUserById,
  getAllUsers,
  getUserGifts,
  searchUserByNickname
} from '../controllers/userController';
import { addFriend, getFriends } from '../controllers/friendController';

const router = Router();

// Rotas de usuário
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/', getAllUsers);           // Listar todos os usuários
router.get('/:id', getUserById);        // Pegar usuário por ID
router.get('/:id/gifts', getUserGifts); // Listar presentes do usuário
router.post('/:id/add-friend', addFriend);
// Buscar usuário por nickname
router.get('/search/:nickname', searchUserByNickname);
// Listar amigos do usuário
router.get('/:id/friends', getFriends);

export default router;