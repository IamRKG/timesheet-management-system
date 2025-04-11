import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService, User, LoginCredentials, RegisterData } from '../services/auth.service';

interface AuthState {
  token: string | null;
  user: User | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  setToken: (token: string) => void;
  setUser: (user: User) => void;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  fetchCurrentUser: () => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      loading: false,
      error: null,
      
      setToken: (token) => set({ token }),
      setUser: (user) => set({ user }),
      
      login: async (credentials) => {
        set({ loading: true, error: null });
        try {
          const response = await authService.login(credentials);
          set({ 
            token: response.token,
            user: response.user,
            loading: false 
          });
        } catch (error: any) {
          set({ 
            error: error.message, 
            loading: false 
          });
          throw error;
        }
      },
      
      register: async (userData) => {
        set({ loading: true, error: null });
        try {
          const response = await authService.register(userData);
          set({ 
            token: response.token,
            user: response.user,
            loading: false 
          });
        } catch (error: any) {
          set({ 
            error: error.message, 
            loading: false 
          });
          throw error;
        }
      },
      
      logout: () => {
        set({ token: null, user: null });
      },
      
      fetchCurrentUser: async () => {
        const { token } = get();
        if (!token) return;
        
        set({ loading: true, error: null });
        try {
          const user = await authService.getCurrentUser(token);
          set({ user, loading: false });
        } catch (error: any) {
          set({ 
            error: error.message, 
            loading: false 
          });
          // If token is invalid, logout
          if (error.message.includes('token') || error.message.includes('unauthorized')) {
            get().logout();
          }
        }
      },
      
      updateProfile: async (userData) => {
        const { token, user } = get();
        if (!token || !user) throw new Error('Not authenticated');
        
        set({ loading: true, error: null });
        try {
          const updatedUser = await authService.updateUserProfile(token, user.id, userData);
          set({ user: updatedUser, loading: false });
        } catch (error: any) {
          set({ 
            error: error.message, 
            loading: false 
          });
          throw error;
        }
      },
      
      changePassword: async (currentPassword, newPassword) => {
        const { token, user } = get();
        if (!token || !user) throw new Error('Not authenticated');
        
        set({ loading: true, error: null });
        try {
          await authService.changePassword(token, user.id, currentPassword, newPassword);
          set({ loading: false });
        } catch (error: any) {
          set({ 
            error: error.message, 
            loading: false 
          });
          throw error;
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token, user: state.user }),
    }
  )
);
