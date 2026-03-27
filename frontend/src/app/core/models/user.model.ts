import { Role } from './role.model';

export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at?: string;
  role?: string;  // 'administrador', 'jefe', 'trabajador'
  created_at: string;
  updated_at: string;
  roles?: Role[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}
