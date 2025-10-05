import { Router } from 'express';
import { getGiftComments, createGiftComment, getCommentById } from '../controllers/giftCommentController';

const router = Router();

router.get('/:commentId', getCommentById);
router.post('/', createGiftComment);

export default router;
