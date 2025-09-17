// src/controllers/friendController.ts
import { Request, Response } from 'express';
import { getDB } from '../db';
import jwt from 'jsonwebtoken';

const db = getDB();
const JWT_SECRET = 'seu_segredo_aqui';

// Listar amigos do usuário logado
export const getFriends = (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Não autorizado' });

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const userId = decoded.id;

    const friends = db.prepare(`
      SELECT u.id, u.name, u.nickname
      FROM friends f
      JOIN users u ON f.friend_id = u.id
      WHERE f.user_id = ?
    `).all(userId);

    res.json(friends);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar amigos' });
  }
};

export const removeFriend = (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Não autorizado' });

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const userId = decoded.id;
    const { friendId } = req.params;

    // Verifica se existe amizade
    const existing = db.prepare(
      'SELECT 1 FROM friends WHERE user_id = ? AND friend_id = ?'
    ).get(userId, friendId);

    if (!existing) {
      return res.status(404).json({ error: 'Amizade não encontrada' });
    }

    db.prepare('DELETE FROM friends WHERE user_id = ? AND friend_id = ?')
      .run(userId, friendId);

    res.json({ message: 'Amizade removida com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao remover amizade' });
  }
};

// Adicionar amigo pelo nickname
export const addFriend = (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Não autorizado' });

  const { nickname } = req.body;
  if (!nickname) return res.status(400).json({ error: 'Nickname é obrigatório' });

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const userId = decoded.id;

    // Busca o amigo pelo nickname
    const friend = db.prepare('SELECT id FROM users WHERE nickname = ?').get(nickname);
    if (!friend) return res.status(404).json({ error: 'Nickname não encontrado' });

    // Evita duplicar amizade
    const existing = db.prepare('SELECT 1 FROM friends WHERE user_id = ? AND friend_id = ?')
      .get(userId, friend.id);
    if (existing) return res.status(400).json({ error: 'Amigo já adicionado' });

    // Insere amizade
    db.prepare('INSERT INTO friends (user_id, friend_id) VALUES (?, ?)').run(userId, friend.id);

    res.json({ message: 'Amigo adicionado', friendId: friend.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao adicionar amigo' });
  }
};
