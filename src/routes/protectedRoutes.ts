import { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getDB } from '../db';

const router = Router();
const db = getDB();
const JWT_SECRET = process.env.JWT_SECRET || 'seu_segredo_aqui';

// Middleware para validar JWT
const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Token não fornecido' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; email: string };
    (req as any).user = decoded; // adiciona user no req
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Token inválido ou expirado' });
  }
};

// rota GET /profile (pega id do JWT)
router.get('/profile', authMiddleware, (req: Request, res: Response) => {
  const user = (req as any).user;

  const dbUser = db.prepare('SELECT id, name, email, nickname FROM users WHERE id = ?').get(user.id);

  if (!dbUser) return res.status(404).json({ error: 'Usuário não encontrado' });

  res.json({ user: dbUser });
});

export default router;
