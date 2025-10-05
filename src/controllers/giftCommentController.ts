import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'seu_segredo_aqui';

// Listar comentários de um presente
export const getGiftComments = async (req: Request, res: Response) => {
  const giftId = Number(req.params.giftId);

  try {
    const comments = await prisma.giftComment.findMany({
      where: { gift_id: giftId },      // <-- corrigido
      orderBy: { created_at: 'desc' }, // <-- corrigido
      include: { user: true },
    });

    res.json(comments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar comentários' });
  }
};

// Buscar comentário por ID
export const getCommentById = async (req: Request, res: Response) => {
  const commentId = Number(req.params.commentId);
  console.log(commentId)
  if (!commentId) return res.status(400).json({ error: 'ID do comentário é obrigatório' });

  try {
    const comment = await prisma.giftComment.findUnique({
      where: { id: commentId },
      include: { user: true }, // inclui os dados do usuário que fez o comentário
    });

    if (!comment) return res.status(404).json({ error: 'Comentário não encontrado' });

    res.json(comment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar comentário' });
  }
};

// Criar comentário
export const createGiftComment = async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Não autorizado' });

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const userId = decoded.id;

    const { gift_id, comment } = req.body; // <-- use gift_id
    console.log(gift_id, comment)
    if (!gift_id || !comment) return res.status(400).json({ error: 'Campos obrigatórios' });

    const newComment = await prisma.giftComment.create({
      data: { user_id: userId, gift_id, comment }, // <-- use user_id e gift_id
    });

    res.status(201).json(newComment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao criar comentário' });
  }
};
