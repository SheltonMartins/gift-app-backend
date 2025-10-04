// src/controllers/userController.ts
import { Request, Response } from 'express';
import { PrismaClient, User as PrismaUser } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = 'seu_segredo_aqui';

// ----------------------
// Cadastro de usuário
// ----------------------
export const registerUser = async (req: Request, res: Response) => {
  const { name, last_name, email, password, nickname, profile_picture, bio } = req.body;

  if (!name || !last_name || !email || !nickname) {
    return res.status(400).json({ error: 'Campos obrigatórios: name, last_name, email, nickname' });
  }
  if (!password) {
    return res.status(400).json({ error: 'Senha obrigatória para cadastro' });
  }

  const password_hash = bcrypt.hashSync(password, 10);

  try {
    const user: PrismaUser = await prisma.user.create({
      data: { name, last_name, email, nickname, password_hash, profile_picture, bio },
    });

    res.status(201).json({
      message: 'Usuário cadastrado',
      userId: user.id,
      name: user.name,
      last_name: user.last_name,
      nickname: user.nickname,
    });
  } catch (err: any) {
    if (err.code === 'P2002') {
      return res.status(400).json({ error: 'Email ou nickname já cadastrado' });
    }
    console.error(err);
    res.status(500).json({ error: 'Erro no servidor' });
  }
};

// ----------------------
// Login
// ----------------------
export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Email e senha obrigatórios' });

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password_hash) {
      return res.status(401).json({ error: 'Usuário não encontrado ou sem senha cadastrada' });
    }

    const isValid = bcrypt.compareSync(password, user.password_hash);
    if (!isValid) return res.status(401).json({ error: 'Senha incorreta' });

    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        last_name: user.last_name,
        nickname: user.nickname,
        email: user.email,
        profile_picture: user.profile_picture,
        bio: user.bio,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro no servidor' });
  }
};

// ----------------------
// Buscar usuário pelo ID
// ----------------------
export const getUserById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const user = await prisma.user.findUnique({
      where: { id: Number(id) },
      select: {
        id: true,
        name: true,
        last_name: true,
        email: true,
        nickname: true,
        profile_picture: true,
        bio: true,
        gifts: true,
        giftComments: true,
      },
    });

    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro no servidor' });
  }
};

// ----------------------
// Buscar usuário pelo nickname
// ----------------------
export const searchUserByNickname = async (req: Request, res: Response) => {
  const { nickname } = req.params;
  if (!nickname) return res.status(400).json({ error: 'Nickname é obrigatório' });

  try {
    const user = await prisma.user.findUnique({
      where: { nickname },
      select: { id: true, name: true, last_name: true, nickname: true },
    });

    if (!user) return res.status(404).json({ error: 'Nickname não encontrado' });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro no servidor' });
  }
};

// ----------------------
// Listar todos os usuários
// ----------------------
export const getAllUsers = async (_req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        last_name: true,
        email: true,
        nickname: true,
        profile_picture: true,
        bio: true,
      },
    });
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro no servidor' });
  }
};

// ----------------------
// Listar presentes de um usuário
// ----------------------
export const getUserGifts = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const gifts = await prisma.gift.findMany({
      where: { user_id: Number(id) },
      orderBy: { created_at: 'desc' },
      include: { giftComments: true },
    });

    res.json(gifts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar presentes' });
  }
};
