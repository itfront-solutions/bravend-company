import { type User, type LoginRequest } from "@shared/schema";

export interface AuthUser {
  id: string;
  tenantId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  department?: string;
  avatar?: string;
  totalPoints: number;
  level: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

const AUTH_TOKEN_KEY = 'auth_token';
const AUTH_USER_KEY = 'auth_user';

export class AuthService {
  static async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    const data: AuthResponse = await response.json();
    
    // Store token and user data
    localStorage.setItem(AUTH_TOKEN_KEY, data.token);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.user));
    
    return data;
  }

  static async register(userData: any): Promise<AuthResponse> {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Registration failed');
    }

    const data: AuthResponse = await response.json();
    
    // Store token and user data
    localStorage.setItem(AUTH_TOKEN_KEY, data.token);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.user));
    
    return data;
  }

  static async getCurrentUser(): Promise<AuthUser | null> {
    const token = this.getToken();
    if (!token) return null;

    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        this.logout();
        return null;
      }

      const user: AuthUser = await response.json();
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
      return user;
    } catch (error) {
      this.logout();
      return null;
    }
  }

  static getToken(): string | null {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  }

  static getStoredUser(): AuthUser | null {
    const userStr = localStorage.getItem(AUTH_USER_KEY);
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  static logout(): void {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
  }

  static isAuthenticated(): boolean {
    return !!this.getToken();
  }

  static hasRole(requiredRoles: string[]): boolean {
    const user = this.getStoredUser();
    return user ? requiredRoles.includes(user.role) : false;
  }
}
