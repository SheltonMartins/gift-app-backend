import { Request, Response } from 'express';
import { getDB } from '../db';
import jwt from 'jsonwebtoken';

const db = getDB();
const JWT_SECRET = 'seu_segredo_aqui';

// Listar presentes de um usuário (GET /gifts/:userId)
export const getUserGifts = (req: Request, res: Response) => {
  try {
    // pega o id explicitamente passado na rota
    const userId = Number(req.params.userId);

    if (!userId) {
      return res.status(400).json({ error: 'ID de usuário inválido' });
    }

    const gifts = db
      .prepare('SELECT * FROM gifts WHERE user_id = ? ORDER BY created_at DESC')
      .all(userId);

    res.json(gifts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar presentes' });
  }
};

export const deleteGift = (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Não autorizado' });

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const userId = decoded.id;

    const giftId = Number(req.params.giftId);
    if (!giftId) return res.status(400).json({ error: 'ID de presente inválido' });

    const gift = db.prepare('SELECT user_id FROM gifts WHERE id = ?').get(giftId);
    if (!gift) return res.status(404).json({ error: 'Presente não encontrado' });

    if (gift.user_id !== userId) {
      // se o usuário do token não for o dono, bloqueia
      return res.status(403).json({ error: 'Você não tem permissão para excluir este presente' });
    }

    db.prepare('DELETE FROM gifts WHERE id = ?').run(giftId);
    res.json({ message: 'Presente removido com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao remover presente' });
  }
};

// Criar presente (POST /gifts)
export const createGift = (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Não autorizado' });
  try {
    const decoded: any = jwt.verify(token, 'seu_segredo_aqui');
    const userId = decoded.id;

    const { title, description, image_url, product_link } = req.body;
    if (!title) return res.status(400).json({ error: 'Título é obrigatório' });

    const stmt = db.prepare(`
      INSERT INTO gifts (user_id, title, description, image_url, product_link)
      VALUES (?, ?, ?, ?, ?)
    `);
    const info = stmt.run(userId, title, description, image_url, product_link);
    res.status(201).json({ message: 'Presente criado', giftId: info.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar presente' });
  }

};



