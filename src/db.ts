// src/db.ts

// Ignora erro de falta de declaração de tipos do better-sqlite3
// @ts-ignore
import Database = require('better-sqlite3');
import path = require('path');

// Caminho do banco
const dbPath = path.join(__dirname, 'gift-app.db');

// Instância do banco
const dbInstance = new Database(dbPath);

dbInstance.prepare(`
  CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  nickname TEXT UNIQUE NOT NULL,
  password_hash TEXT,          
  profile_picture TEXT,
  bio TEXT
  )
`).run();

// Tabela de presentes
dbInstance.prepare(`
  CREATE TABLE IF NOT EXISTS gifts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    product_link TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )
`).run();


// Criação da tabela friends
dbInstance.prepare(`
  CREATE TABLE IF NOT EXISTS friends (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    friend_id INTEGER NOT NULL,
    UNIQUE(user_id, friend_id),
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(friend_id) REFERENCES users(id)
  )
`).run();

// Exporta função getter para evitar problemas de TS4023
export const getDB = (): any => dbInstance;
