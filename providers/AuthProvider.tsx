import { Session } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useState } from "react";
import { ActivityIndicator, AppState, View } from "react-native";
import { supabase } from "../lib/supabase";
import { Colors } from "../styles/theme";

type UserProfile = {
  nombre: string;
  rol: string;
  vivienda_id: string | null;
  email: string;
};

type AuthData = {
  loading: boolean;
  session: Session | null;
  user: any | null;
  profile: UserProfile | null;
  isAdmin: boolean;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthData>({
  loading: true,
  session: null,
  user: null,
  profile: null,
  isAdmin: false,
  refreshProfile: async () => {},
});

interface Props {
  children: React.ReactNode;
}

export default function AuthProvider(props: Props) {
  const [loading, setLoading] = useState<boolean>(true);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const fetchProfile = async (userId: string) => {
    try {
      const { data } = await supabase
        .from('usuarios')
        .select('*')
        .eq('auth_id', userId)
        .single();
      
      if (data) setProfile(data);
    } catch (e) {
      console.error('Error cargando perfil:', e);
    }
  };

  useEffect(() => {
    async function initAuth() {
      try {
        const { data } = await supabase.auth.getSession();
        setSession(data.session);
        if (data.session) {
          await fetchProfile(data.session.user.id);
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
        if (state === 'active') supabase.auth.startAutoRefresh();
        else supabase.auth.stopAutoRefresh();
    });

    return () => {
      authListener?.subscription.unsubscribe();
      appStateListener.remove();
    };
  }, []);

  const isAdmin = profile?.rol === 'Administrador' || profile?.rol === 'Presidente' || profile?.rol === 'Vicepresidente';

  // Spinner mientras carga estado inicial
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
        refreshProfile: async () => { if(session) await fetchProfile(session.user.id) }
    }}>
      {props.children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);