// src/server.ts
import express from 'express';
import cors from 'cors';
import session from 'express-session';
import userRoutes from './routes/userRoutes';
import giftRoutes from './routes/giftRoutes';
import friendRoutes from './routes/friendsRoutes';
import authRoutes from './routes/authRoutes';
import 'dotenv/config';
import giftCommentRoutes from './routes/giftCommentRoutes';

const app = express();
const PORT = process.env.PORT || 3000;

// Configuração do CORS para aceitar o frontend
app.use(cors({
  origin: [
    'http://localhost:3000',          // Para testes locais
    'https://gift-app-beta.vercel.app', // Frontend em produção (ajuste se o domínio for outro)
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Configuração de sessão
app.use(session({
  secret: process.env.SESSION_SECRET || 'chave-secreta',
  resave: false,
  saveUninitialized: false,
}));

// Middlewares
app.use(express.json());

// Rotas
app.use('/users', userRoutes);
app.use('/gifts', giftRoutes);
app.use('/friends', friendRoutes);
app.use('/auth', authRoutes);
app.use('/gift-comments', giftCommentRoutes);
app.get('/', (req, res) => res.send('API funcionando 🚀'));

// Exporta o app para a Vercel
export default app;

// Só executa localmente se não estiver na Vercel
if (process.env.VERCEL === undefined) {
  app.listen(PORT, () =>
    console.log(`Servidor rodando em http://localhost:${PORT}`)
  );
}
