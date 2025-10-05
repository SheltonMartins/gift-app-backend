import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'seu_segredo_aqui';

// Listar presentes de um usuário
export const getUserGifts = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.userId);
    if (!userId) return res.status(400).json({ error: 'ID de usuário inválido' });

    const gifts = await prisma.gift.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' }
    });

    res.json(gifts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar presentes' });
  }
};

// ✅ NOVO: Obter presente com comentários
export const getGiftWithComments = async (req: Request, res: Response) => {
  try {
    const giftId = Number(req.params.giftId);
    if (!giftId) return res.status(400).json({ error: 'ID de presente inválido' });

    const gift = await prisma.gift.findUnique({
      where: { id: giftId },
      include: {
        giftComments: { // <-- corrigido (plural)
          orderBy: { created_at: 'desc' },
          include: { user: true }
        }
      }
    });

    if (!gift) return res.status(404).json({ error: 'Presente não encontrado' });

    const giftWithComments = {
      id: gift.id,
      title: gift.title,
      description: gift.description,
      image_url: gift.image_url,
      product_link: gift.product_link,
      created_at: gift.created_at,
      comments: (gift.giftComments ?? []).map((c: any) => ({
        id: c.id,
        text: c.comment,
        userName: c.user?.name ?? 'Usuário desconhecido',
        createdAt: c.created_at
      }))
    };

    res.json(giftWithComments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar presente com comentários' });
  }
};

// Deletar presente
export const deleteGift = async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Não autorizado' });

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const userId = decoded.id;
    const giftId = Number(req.params.giftId);

    if (!giftId) return res.status(400).json({ error: 'ID de presente inválido' });

    const gift = await prisma.gift.findUnique({ where: { id: giftId } });
    if (!gift) return res.status(404).json({ error: 'Presente não encontrado' });

    if (gift.user_id !== userId) {
      return res.status(403).json({ error: 'Você não tem permissão para excluir este presente' });
    }

    await prisma.gift.delete({ where: { id: giftId } });
    res.json({ message: 'Presente removido com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao remover presente' });
  }
};

// Criar presente
export const createGift = async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Não autorizado' });

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const userId = decoded.id;

    const { title, description, image_url, product_link } = req.body;
    if (!title) return res.status(400).json({ error: 'Título é obrigatório' });

    const gift = await prisma.gift.create({
      data: { user_id: userId, title, description, image_url, product_link }
    });

    res.status(201).json({ message: 'Presente criado', giftId: gift.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao criar presente' });
  }
};
