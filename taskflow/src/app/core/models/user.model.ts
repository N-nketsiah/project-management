// src/app/core/models/user.model.ts
// src/app/core/models/user.model.ts
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role?: 'admin' | 'member';
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateUserDto {
  email: string;
  name: string;
  password: string;
  avatar?: string;
  role?: 'admin' | 'member';
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  avatar?: string;
  role?: 'admin' | 'member';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
