// src/controllers/friendController.ts
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

// ----------------------
// Listar amigos do usuário logado
// ----------------------
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

// ----------------------
// Remover amigo (recíproco) ✅ ALTERADO
// ----------------------
export const removeFriend = async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Não autorizado' });

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const userId = decoded.id;
    const { friendId } = req.params;

    // Verifica se a relação existe em pelo menos um dos lados
    const friendRelation = await prisma.friend.findFirst({
      where: {
        OR: [
          { user_id: userId, friend_id: Number(friendId) },
          { user_id: Number(friendId), friend_id: userId }
        ]
      }
    });

    if (!friendRelation) {
      return res.status(404).json({ error: 'Amizade não encontrada' });
    }

    // REMOVE NOS DOIS SENTIDOS
    await prisma.friend.deleteMany({
      where: {
        OR: [
          { user_id: userId, friend_id: Number(friendId) },
          { user_id: Number(friendId), friend_id: userId }
        ]
      }
    });

    res.json({ message: 'Amizade removida de forma recíproca' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao remover amizade' });
  }
};

// ----------------------
// Encontrar amigos de outro usuário
// ----------------------
export const getFriendsOfUser = async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Não autorizado' });

  try {
    jwt.verify(token, JWT_SECRET); // só valida o token, não precisa ser o dono

    const { userId } = req.params;

    const friends = await prisma.friend.findMany({
      where: { user_id: Number(userId) },
      include: {
        friend: { select: { id: true, name: true, nickname: true } }
      }
    });

    res.json(friends.map((f: { friend: FriendDTO }) => f.friend));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar amigos do usuário' });
  }
};

// ----------------------
// Adicionar amigo pelo nickname (recíproco)
// ----------------------
export const addFriend = async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Não autorizado' });

  const { nickname } = req.body;
  if (!nickname) return res.status(400).json({ error: 'Nickname é obrigatório' });

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const userId = decoded.id;

    const friend = await prisma.user.findUnique({ where: { nickname } });
    if (!friend) return res.status(404).json({ error: 'Nickname não encontrado' });

    if (friend.id === userId) {
      return res.status(400).json({ error: 'Você não pode se adicionar como amigo' });
    }

    // Verifica se já existe A → B
    const existing = await prisma.friend.findFirst({
      where: { user_id: userId, friend_id: friend.id }
    });
    if (!existing) {
      await prisma.friend.create({
        data: { user_id: userId, friend_id: friend.id }
      });
    }

    // Verifica se já existe B → A (para reciprocidade)
    const reciprocal = await prisma.friend.findFirst({
      where: { user_id: friend.id, friend_id: userId }
    });
    if (!reciprocal) {
      await prisma.friend.create({
        data: { user_id: friend.id, friend_id: userId }
      });
    }

    res.json({ message: 'Amizade adicionada (recíproca)', friendId: friend.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao adicionar amigo' });
  }
};
