import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '@/types';
import { supabase } from '@/lib/supabase';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  pendingAction: { type: 'checkout' | 'buy_tickets'; eventId?: string } | null;
  login: (identifier: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  updateUserProfile: (userData: Partial<User>) => void;
  deleteAccount: () => Promise<void>;
  setPendingAction: (action: { type: 'checkout' | 'buy_tickets'; eventId?: string } | null) => void;
  clearPendingAction: () => void;
}

// Helper function to format error messages
const formatError = (error: any): string => {
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  if (error?.error_description) return error.error_description;
  if (error?.details) return error.details;
  if (error?.hint) return error.hint;
  if (error?.code) return `Error ${error.code}: ${error.message || 'Unknown error'}`;
  return 'Une erreur inattendue est survenue';
};

// Helper function to determine if input is email or phone
const isEmail = (value: string) => {
  return /\S+@\S+\.\S+/.test(value);
};

const isPhone = (value: string) => {
  return /^\+?[0-9]{8,15}$/.test(value.replace(/\s+/g, ''));
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      pendingAction: null,
      
      login: async (identifier, password) => {
        set({ isLoading: true, error: null });
        
        try {
          let data, error;
          
          // Determine if the identifier is an email or phone number
          if (isEmail(identifier)) {
            // Login with email
            const result = await supabase.auth.signInWithPassword({
              email: identifier,
              password,
            });
            data = result.data;
            error = result.error;
          } else if (isPhone(identifier)) {
            // Format phone number to ensure it's in the correct format
            const formattedPhone = identifier.replace(/\s+/g, '');
            const phoneWithPlus = formattedPhone.startsWith('+') ? formattedPhone : `+${formattedPhone}`;
            
            // Login with phone
            const result = await supabase.auth.signInWithPassword({
              phone: phoneWithPlus,
              password,
            });
            data = result.data;
            error = result.error;
          } else {
            throw new Error("Format d'identifiant non valide. Veuillez utiliser un email ou un numéro de téléphone.");
          }
          
          if (error) throw error;
          
          if (data.user) {
            // Récupérer les informations supplémentaires de l'utilisateur depuis la table profiles
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', data.user.id)
              .single();
            
            if (profileError && profileError.code !== 'PGRST116') {
              console.warn('Profile fetch error:', profileError);
            }
            
            const userData: User = {
              id: data.user.id,
              email: data.user.email || '',
              name: profileData?.name || (data.user.email?.split('@')[0] || 'User'),
              phone: profileData?.phone || data.user.phone || undefined,
              location: profileData?.location || undefined,
              bio: profileData?.bio || undefined,
              role: profileData?.role || 'user',
              status: profileData?.status || 'active',
              avatar: profileData?.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80',
              created_at: profileData?.created_at || data.user.created_at,
            };
            
            set({ 
              user: userData,
              isAuthenticated: true,
              isLoading: false
            });
          }
        } catch (error: any) {
          console.error('Login error:', error);
          set({ 
            error: formatError(error),
            isLoading: false
          });
          throw error;
        }
      },
      
      register: async (name, email, password, phone) => {
        set({ isLoading: true, error: null });
        
        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                name: name,
                phone: phone || null,
              },
            },
          });
          
          if (error) throw error;
          
          if (data.user) {
            // Créer un profil pour le nouvel utilisateur
            const { error: profileError } = await supabase
              .from('profiles')
              .insert([
                { 
                  id: data.user.id,
                  name: name,
                  email: email,
                  phone: phone || null,
                  role: 'user',
                  status: 'active'
                }
              ]);
            
            if (profileError) {
              console.warn('Profile creation error:', profileError);
            }
            
            const userData: User = {
              id: data.user.id,
              email: data.user.email || '',
              name: name,
              phone: phone,
              role: 'user',
              status: 'active',
              avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80',
              created_at: data.user.created_at,
            };
            
            set({ 
              user: userData,
              isAuthenticated: true,
              isLoading: false
            });
          }
        } catch (error: any) {
          console.error('Register error:', error);
          set({ 
            error: formatError(error),
            isLoading: false
          });
          throw error;
        }
      },
      
      logout: async () => {
        set({ isLoading: true, error: null });
        
        try {
          // First clear the local state
          set({ 
            user: null,
            isAuthenticated: false,
            isLoading: true,
            pendingAction: null,
            error: null
          });
          
          // Then sign out from Supabase
          const { error } = await supabase.auth.signOut();
          if (error) throw error;
          
          // Clear AsyncStorage cache for auth
          try {
            await AsyncStorage.removeItem('temba-auth-storage');
          } catch (storageError) {
            console.warn('Failed to clear auth storage:', storageError);
          }
          
          console.log('Logout successful');
          set({ isLoading: false });
          return Promise.resolve();
        } catch (error: any) {
          console.error('Logout error:', error);
          set({
            error: formatError(error),
            isLoading: false
          });
          return Promise.reject(error);
        }
      },
      
      clearError: () => {
        set({ error: null });
      },
      
      updateUserProfile: (userData) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: {
              ...currentUser,
              ...userData
            }
          });
        }
      },
      
      deleteAccount: async () => {
        set({ isLoading: true, error: null });
        
        try {
          const user = get().user;
          
          if (!user) {
            throw new Error("Utilisateur non connecté");
          }
          
          // Delete user data from profiles table
          const { error: profileError } = await supabase
            .from('profiles')
            .delete()
            .eq('id', user.id);
          
          if (profileError) {
            console.warn('Profile deletion error:', profileError);
            // Continue with deletion even if profile deletion fails
          }
          
          // Delete notification preferences
          try {
            await supabase
              .from('notification_preferences')
              .delete()
              .eq('user_id', user.id);
          } catch (error) {
            console.warn('Could not delete notification preferences:', error);
            // Continue with deletion even if notification preferences deletion fails
          }
          
          // Since we can't use admin.deleteUser from client side,
          // we'll sign out the user and clear local state
          // In a real app, you would need a server function to delete the user
          
          // First clear the local state
          set({ 
            user: null,
            isAuthenticated: false,
            isLoading: true,
            pendingAction: null,
            error: null
          });
          
          // Then sign out from Supabase
          await supabase.auth.signOut();
          
          // Clear AsyncStorage cache for auth
          try {
            await AsyncStorage.removeItem('temba-auth-storage');
          } catch (storageError) {
            console.warn('Failed to clear auth storage:', storageError);
          }
          
          console.log('Account deletion successful (client-side)');
          set({ isLoading: false });
          return Promise.resolve();
        } catch (error: any) {
          console.error('Delete account error:', error);
          set({
            error: formatError(error),
            isLoading: false
          });
          return Promise.reject(error);
        }
      },

      setPendingAction: (action) => {
        set({ pendingAction: action });
      },

      clearPendingAction: () => {
        set({ pendingAction: null });
      }
    }),
    {
      name: 'temba-auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        pendingAction: state.pendingAction
      }),
    }
  )
);