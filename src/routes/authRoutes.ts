// src/routes/authRoutes.ts
import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import { getDB } from '../db';

const router = Router();
const db = getDB();
const JWT_SECRET = process.env.JWT_SECRET || 'seu_segredo_aqui';

interface GoogleUserInfo {
  email: string;
  name: string;
  sub: string;
}

// Função para gerar JWT
const generateToken = (user: any) => {
  return jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1d' });
};

// Login via Google (aceita id_token do Postman ou token do frontend)
router.post('/google', async (req: Request, res: Response) => {
  // aceita ambos: frontend envia `token`, Postman envia `id_token`
  const token = req.body.token || req.body.id_token;
  if (!token) return res.status(400).json({ error: 'id_token é obrigatório' });

  try {
    // Verifica o id_token no Google
    const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`);
    const dataJson = await response.json();

    // Faz type assertion para GoogleUserInfo
    const data = dataJson as GoogleUserInfo & { error?: string };

    console.log('DEBUG Google token:', data);

    if (data.error) return res.status(400).json({ error: data.error });
    const { email, name } = data;

    if (!email) return res.status(400).json({ error: 'Email não encontrado' });

    // Verifica se usuário existe
    let user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

    if (!user) {
      // Usa o email como nickname para garantir unicidade
      const nickname = email;

      // Cria usuário no banco (senha nula)
      const stmt = db.prepare(
        'INSERT INTO users (name, email, nickname, password_hash) VALUES (?, ?, ?, ?)'
      );
      const info = stmt.run(name, email, nickname, null);
      user = { id: info.lastInsertRowid, name, email, nickname };
    }

    const jwtToken = generateToken(user);
    res.json({ token: jwtToken, userId: user.id, name: user.name });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao verificar token do Google' });
  }
});

export default router;
