// src/routes/authRoutes.ts
import { Router, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { prisma } from '../db'

const router = Router()
const JWT_SECRET = process.env.JWT_SECRET || 'seu_segredo_aqui'

const generateToken = (user: any) => {
  return jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1d' })
}

// Exemplo de login simples (email + senha)
router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body

  if (!email || !password) return res.status(400).json({ error: 'Email e senha são obrigatórios' })

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return res.status(404).json({ error: 'Usuário não encontrado' })

  // Aqui você pode implementar hash/verify da senha
  if (user.password_hash !== password) {
    return res.status(401).json({ error: 'Senha inválida' })
  }

  const token = generateToken(user)
  res.json({ token, userId: user.id, name: user.name })
})

export default router
