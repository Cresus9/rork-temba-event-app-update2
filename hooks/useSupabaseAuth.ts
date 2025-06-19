import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/auth-store';
import { User } from '@/types';

export function useSupabaseAuth() {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const [isInitialized, setIsInitialized] = useState(false);
  
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user && !isAuthenticated) {
          // Récupérer les informations supplémentaires de l'utilisateur depuis la table profiles
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          const userData: User = {
            id: session.user.id,
            email: session.user.email || '',
            name: profileData?.name || session.user.email?.split('@')[0] || '',
            phone: profileData?.phone || undefined,
            location: profileData?.location || undefined,
            bio: profileData?.bio || undefined,
            role: profileData?.role || 'user',
            status: profileData?.status || 'active',
            avatar: profileData?.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80',
            created_at: profileData?.created_at || session.user.created_at,
          };
          
          // Mettre à jour le store avec les informations de l'utilisateur
          useAuthStore.setState({
            user: userData,
            isAuthenticated: true,
          });
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
      } finally {
        setIsInitialized(true);
      }
    };
    
    initializeAuth();
    
    // Écouter les changements d'authentification
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event);
        try {
          if (event === 'SIGNED_IN' && session?.user) {
            // Récupérer les informations supplémentaires de l'utilisateur depuis la table profiles
            const { data: profileData } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
            
            const userData: User = {
              id: session.user.id,
              email: session.user.email || '',
              name: profileData?.name || session.user.email?.split('@')[0] || '',
              phone: profileData?.phone || undefined,
              location: profileData?.location || undefined,
              bio: profileData?.bio || undefined,
              role: profileData?.role || 'user',
              status: profileData?.status || 'active',
              avatar: profileData?.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80',
              created_at: profileData?.created_at || session.user.created_at,
            };
            
            useAuthStore.setState({
              user: userData,
              isAuthenticated: true,
            });
          } else if (event === 'SIGNED_OUT') {
            useAuthStore.setState({
              user: null,
              isAuthenticated: false,
            });
          }
        } catch (error) {
          console.error("Error in auth state change:", error);
        }
      }
    );
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [isAuthenticated]);
  
  return { user, isAuthenticated, isLoading, isInitialized };
}