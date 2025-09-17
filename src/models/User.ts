export interface User {
  id?: number;
  name: string;
  email: string;
  password_hash: string;
  nickname: string;           // adicionado
  profile_picture?: string;
  bio?: string;
}