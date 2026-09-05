export type Role = 'user' | 'admin';

export interface User {
  id: string;
  email: string;
  role: Role;
  name: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}
