import { Router } from 'express';
import { getGiftComments, createGiftComment } from '../controllers/giftCommentController';

const router = Router();

router.get('/:giftId', getGiftComments);
router.post('/', createGiftComment);

export default router;
