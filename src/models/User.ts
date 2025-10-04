export interface User {
  id?: number;
  name: string;
  last_name: string;
  email: string;
  password_hash: string;
  nickname: string;
  profile_picture?: string;
  bio?: string;
}
