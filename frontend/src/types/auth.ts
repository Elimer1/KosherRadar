export type UserRole = 'USER' | 'ADMIN';

// What the server sends about a user. It never includes the password hash.
export interface User {
  id: string;
  email: string;
  role: UserRole;
}

// Returned by GET /users/me. Points are private and only sent to their owner.
export interface UserProfile extends User {
  points: number;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface Credentials {
  email: string;
  password: string;
}
