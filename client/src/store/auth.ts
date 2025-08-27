import { create } from 'zustand';
import { AuthService, type AuthUser } from '@/lib/auth';

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: any) => Promise<void>;
  logout: () => void;
  initialize: () => Promise<void>;
  updateUser: (updates: Partial<AuthUser>) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  login: async (credentials) => {
    try {
      const response = await AuthService.login(credentials);
      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({ user: null, isAuthenticated: false, isLoading: false });
      throw error;
    }
  },

  logout: () => {
    AuthService.logout();
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  initialize: async () => {
    set({ isLoading: true });
    
    try {
      // Try to get stored user first
      const storedUser = AuthService.getStoredUser();
      if (storedUser && AuthService.isAuthenticated()) {
        set({
          user: storedUser,
          isAuthenticated: true,
          isLoading: false,
        });
        
        // Validate with server in the background
        AuthService.getCurrentUser().then(user => {
          if (user) {
            set({ user });
          } else {
            get().logout();
          }
        });
      } else {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    } catch (error) {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  updateUser: (updates) => {
    const currentUser = get().user;
    if (currentUser) {
      const updatedUser = { ...currentUser, ...updates };
      set({ user: updatedUser });
      localStorage.setItem('auth_user', JSON.stringify(updatedUser));
    }
  },
}));
