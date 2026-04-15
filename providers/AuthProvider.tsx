import AsyncStorage from '@react-native-async-storage/async-storage';
import { Session } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useState } from "react";
import { ActivityIndicator, AppState, Platform, View } from "react-native";
import { supabase } from "../lib/supabase";
import { Colors } from "../styles/theme";

type UserProfile = {
  nombre: string;
  rol: string;
  vivienda_id: string | null;
  email: string;
  auth_id: string;
};

type AuthData = {
  loading: boolean;
  session: Session | null;
  user: any | null;
  profile: UserProfile | null;
  isAdmin: boolean;
  refreshProfile: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthData>({
  loading: true,
  session: null,
  user: null,
  profile: null,
  isAdmin: false,
  refreshProfile: async () => {},
  logout: async () => {},
});

interface Props {
  children: React.ReactNode;
}

export default function AuthProvider(props: Props) {
  const [loading, setLoading] = useState<boolean>(true);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.warn("Error de Supabase ignorado:", error);
    } finally {
      setSession(null);
      setProfile(null);

      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined') window.localStorage.clear();
      } else {
        try {
          const keys = await AsyncStorage.getAllKeys();
          const authKeys = keys.filter(k => k.includes('supabase') || k.includes('sb-'));
          await AsyncStorage.multiRemove(authKeys);
        } catch (e) {
          console.error("Error limpiando storage:", e);
        }
      }
    }
  };

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('auth_id', userId)
        .single();
      
      if (error && error.code === 'PGRST116') {
        console.warn('El perfil ya no existe. Expulsando...');
        await handleLogout();
        return null; // Devolvemos null para saber que falló
      }

      if (data) {
        setProfile(data);
        return data; // Devolvemos los datos para usarlos en initAuth
      }
    } catch (e) {
      console.error('Error cargando perfil:', e);
    }
    return null;
  };

  useEffect(() => {
    let realtimeChannel: any;

    async function initAuth() {
      try {
        const { data } = await supabase.auth.getSession();
        setSession(data.session);
        
        if (data.session) {
          const userProfile = await fetchProfile(data.session.user.id);

          // Solo nos suscribimos si el perfil existe realmente
          if (userProfile) {
            realtimeChannel = supabase.channel(`perfil-${data.session.user.id}`)
              .on(
                'postgres_changes',
                { 
                  event: 'DELETE', 
                  schema: 'public', 
                  table: 'usuarios', 
                  filter: `auth_id=eq.${data.session.user.id}` 
                },
                () => {
                  console.warn('¡Realtime detectó DELETE! Expulsando...');
                  handleLogout();
                }
              )
              .on(
                'postgres_changes',
                { 
                  event: 'UPDATE', 
                  schema: 'public', 
                  table: 'usuarios', 
                  filter: `auth_id=eq.${data.session.user.id}` 
                },
                (payload) => {
                  console.log('¡Realtime detectó UPDATE! Nuevo rol:', payload.new.rol);
                  setProfile(payload.new as UserProfile);
                }
              )
              .subscribe((status) => {
                // Esto dice si engancha con el servidor
                console.log("Estado de Realtime de Supabase:", status); 
              });
          }
        }
      } catch (e) {
        console.warn("Error auth:", e);
      } finally {
        setLoading(false);
      }
    }

    initAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setSession(session);
        await fetchProfile(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setSession(null);
        setProfile(null);
      } else if (event === 'TOKEN_REFRESHED') {
        setSession(session);
      }
    });

    const appStateListener = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        supabase.auth.startAutoRefresh();
        supabase.auth.getSession().then(({ data }) => {
          if (data.session) fetchProfile(data.session.user.id);
        });
      } else {
        supabase.auth.stopAutoRefresh();
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
      appStateListener.remove();
      if (realtimeChannel) supabase.removeChannel(realtimeChannel);
    };
  }, []);

  const isAdmin = profile?.rol === 'Administrador' || profile?.rol === 'Presidente' || profile?.rol === 'Vicepresidente';

  if (loading) {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.base.white }}>
            <ActivityIndicator size="large" color={Colors.primary.orange} />
        </View>
    );
  }

  return (
    <AuthContext.Provider value={{ 
        loading, 
        session, 
        user: session?.user || null, 
        profile,
        isAdmin,
        refreshProfile: async () => { if(session) await fetchProfile(session.user.id) },
        logout: handleLogout
    }}>
      {props.children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);