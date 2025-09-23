// // src/routes/protectedRoutes.ts
// import { Router, Request, Response, NextFunction } from 'express'
// import jwt from 'jsonwebtoken'
// import { prisma } from '../db'

// const router = Router()
// const JWT_SECRET = process.env.JWT_SECRET || 'seu_segredo_aqui'

// // Middleware de autenticação
// const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
//   const authHeader = req.headers['authorization']
//   const token = authHeader && authHeader.split(' ')[1]

//   if (!token) return res.status(401).json({ error: 'Token não fornecido' })

//   try {
//     const decoded = jwt.verify(token, JWT_SECRET) as { id: number; email: string }
//     ;(req as any).user = decoded
//     next()
//   } catch {
//     return res.status(403).json({ error: 'Token inválido ou expirado' })
//   }
// }

// // GET /profile
// router.get('/profile', authMiddleware, async (req: Request, res: Response) => {
//   const user = (req as any).user

//   const dbUser = await prisma.user.findUnique({
//     where: { id: user.id },
//     select: { id: true, name: true, email: true, nickname: true },
//   })

//   if (!dbUser) return res.status(404).json({ error: 'Usuário não encontrado' })

//   res.json({ user: dbUser })
// })

// export default router
