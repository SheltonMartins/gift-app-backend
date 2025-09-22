import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'seu_segredo_aqui';

// Criamos um tipo local para o "friend", apenas com os campos que retornamos
type FriendDTO = {
  id: number;
  name: string | null;
  nickname: string;
};

// Listar amigos do usuário logado
export const getFriends = async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Não autorizado' });

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const userId = decoded.id;

    const friends = await prisma.friend.findMany({
      where: { user_id: userId },
      include: {
        friend: { select: { id: true, name: true, nickname: true } }
      }
    });

    // mapeia para o tipo FriendDTO
    res.json(friends.map((f: { friend: FriendDTO }) => f.friend));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar amigos' });
  }
};

// Remover amigo
export const removeFriend = async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Não autorizado' });

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const userId = decoded.id;
    const { friendId } = req.params;

    const existing = await prisma.friend.findFirst({
      where: { user_id: userId, friend_id: Number(friendId) }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Amizade não encontrada' });
    }

    await prisma.friend.delete({ where: { id: existing.id } });
    res.json({ message: 'Amizade removida com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao remover amizade' });
  }
};

// Adicionar amigo pelo nickname
export const addFriend = async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Não autorizado' });

  const { nickname } = req.body;
  if (!nickname) return res.status(400).json({ error: 'Nickname é obrigatório' });

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const userId = decoded.id;

    if (!nickname) return res.status(400).json({ error: 'Nickname é obrigatório' });

    const friend = await prisma.user.findUnique({ where: { nickname: nickname } });
    if (!friend) return res.status(404).json({ error: 'Nickname não encontrado' });

    const existing = await prisma.friend.findFirst({
      where: { user_id: userId, friend_id: friend.id }
    });
    if (existing) return res.status(400).json({ error: 'Amigo já adicionado' });

    await prisma.friend.create({
      data: { user_id: userId, friend_id: friend.id }
    });

    res.json({ message: 'Amigo adicionado', friendId: friend.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao adicionar amigo' });
  }
};
