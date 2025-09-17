import express from 'express';
import cors from 'cors';
import session from 'express-session';
import userRoutes from './routes/userRoutes';
import giftRoutes from './routes/giftRoutes';
import friendRoutes from './routes/friendsRoutes';
import authRoutes from './routes/authRoutes';
import protectedRoutes from './routes/protectedRoutes';
import 'dotenv/config';

const app = express();
const PORT = 3000;

// Middleware CORS
app.use(cors({
  origin: 'http://localhost:3001',
  credentials: true,
}));

app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'chave-secreta',
  resave: false,
  saveUninitialized: false,
}));

// Rotas
app.use('/users', userRoutes);
app.use('/gifts', giftRoutes);
app.use('/friends', friendRoutes);
app.use('/auth', authRoutes);
app.use('/protected', protectedRoutes);

app.get('/', (req, res) => res.send('API funcionando 🚀'));

app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));
