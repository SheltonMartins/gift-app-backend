// src/config/passport.ts
import passport from 'passport';
import { getDB } from '../db';
// @ts-ignore
const GoogleTokenStrategy = require('passport-google-token').Strategy;

const db = getDB();

// Serialize/Deserialize
passport.serializeUser((user: any, done) => done(null, user.id));
passport.deserializeUser((id: number, done) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  done(null, user);
});

// Google Token Strategy
passport.use(
  new GoogleTokenStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
    async (
      accessToken: string,
      refreshToken: string,
      profile: { emails?: { value: string }[]; displayName: string },
      done: (err: any, user?: any) => void
    ) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) return done(new Error('Email não encontrado'));

        // Verifica se o usuário já existe
        let user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

        if (!user) {
          // Cadastro via Google: password_hash = NULL
          const stmt = db.prepare(
            'INSERT INTO users (name, email, nickname, password_hash) VALUES (?, ?, ?, ?)'
          );
          const info = stmt.run(profile.displayName, email, profile.displayName, null);
          user = { id: info.lastInsertRowid, name: profile.displayName, email, nickname: profile.displayName };
        }

        done(null, user);
      } catch (err) {
        done(err);
      }
    }
  )
);

export default passport;
