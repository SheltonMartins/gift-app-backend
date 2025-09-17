import { Request, Response } from 'express';
import { getDB } from '../db';
import { User } from '../models/User';
import bcrypt = require('bcrypt');
import jwt = require('jsonwebtoken');

const db = getDB();
const JWT_SECRET = 'seu_segredo_aqui';

// Cadastro de usuário com nickname obrigatório
export const registerUser = (req: Request, res: Response) => {
  const { name, email, password, nickname, profile_picture, bio } = req.body;

  // Campos obrigatórios
  if (!name || !email || !nickname) {
    return res.status(400).json({ error: 'Campos obrigatórios: name, email, nickname' });
  }

  // Senha obrigatória para cadastro manual
  if (!password) {
    return res.status(400).json({ error: 'Senha obrigatória para cadastro manual' });
  }

  const password_hash = bcrypt.hashSync(password, 10);

  try {
    const stmt = db.prepare(
      `INSERT INTO users (name, email, password_hash, nickname, profile_picture, bio) 
       VALUES (?, ?, ?, ?, ?, ?)`
    );
    const info = stmt.run(name, email, password_hash, nickname, profile_picture, bio);

    res.status(201).json({
      message: 'Usuário cadastrado',
      userId: info.lastInsertRowid,
    });
  } catch (err: any) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(400).json({ error: 'Email ou nickname já cadastrado' });
    }
    console.error(err);
    res.status(500).json({ error: 'Erro no servidor' });
  }
};



// Login
export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Email e senha obrigatórios' });

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as User;
  if (!user) return res.status(401).json({ error: 'Usuário não encontrado' });

  const isValid = bcrypt.compareSync(password, user.password_hash);
  if (!isValid) return res.status(401).json({ error: 'Senha incorreta' });

  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1d' });
  res.json({ token, userId: user.id, name: user.name });
};

// Buscar usuário pelo ID
export const getUserById = (req: Request, res: Response) => {
  const { id } = req.params;
  const user = db
    .prepare('SELECT id, name, email, nickname, profile_picture, bio FROM users WHERE id = ?')
    .get(id);
  if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
  res.json(user);
};

// Buscar usuário pelo nickname
export const searchUserByNickname = (req: Request, res: Response) => {
  const { nickname } = req.params;
  const user = db.prepare('SELECT id, name, nickname FROM users WHERE nickname = ?').get(nickname);
  if (!user) return res.status(404).json({ error: 'Nickname não encontrado' });
  res.json(user);
};

// Listar todos os usuários
export const getAllUsers = (req: Request, res: Response) => {
  const users = db.prepare('SELECT id, name, email, nickname, profile_picture, bio FROM users').all();
  res.json(users);
};

// Listar presentes de um usuário
export const getUserGifts = (req: Request, res: Response) => {
  const { id } = req.params;
  const gifts = db.prepare('SELECT * FROM gifts WHERE user_id = ?').all(id);
  res.json(gifts);
};
