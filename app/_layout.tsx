import { Ionicons } from '@expo/vector-icons';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';
import { supabase } from '../SupaBase/Supabase';
import { BorderRadius, Colors, FontSizes, FontWeights, Spacing } from './theme';

// Importa tus pantallas
import Administracion from './Screens/Administracion';
import GestionUsuarios from './Screens/GestionUsuarios';
import Inicio from './Screens/Inicio';
import Login from './Screens/Login';

const Drawer = createDrawerNavigator();

// Logo con nombre en la parte superior del drawer
function CustomDrawerContent(props: any) {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUserRole();
  }, []);

  const checkUserRole = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: userData, error } = await supabase
          .from('usuarios')
          .select('rol')
          .eq('auth_id', user.id)
          .single();

        if (!error && userData) {
          setUserRole(userData.rol);
        }
      }
    } catch (error) {
      console.error('Error obteniendo rol:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary.orange} />
      </View>
    );
  }

  return (
    <DrawerContentScrollView {...props}>
      <View style={styles.drawerHeader}>
        <View style={styles.logoContainer}>
          <Image 
            source={require('../assets/images/iconapp.png')} 
            style={styles.drawerLogo} 
            resizeMode="contain"
          />
        </View>
        <Text style={styles.drawerTitle}>VeciGest</Text>
      </View>
      
      <DrawerItemList {...props} />
    </DrawerContentScrollView>
  );
}

export default function Index() {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUserRole();

    // Suscripción a cambios de autenticación
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN') {
          checkUserRole();
        } else if (event === 'SIGNED_OUT') {
          setUserRole(null);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const checkUserRole = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: userData, error } = await supabase
          .from('usuarios')
          .select('rol')
          .eq('auth_id', user.id)
          .single();

        if (!error && userData) {
          setUserRole(userData.rol);
        }
      }
    } catch (error) {
      console.error('Error obteniendo rol:', error);
    } finally {
      setLoading(false);
    }
  };

  // Verifica si el usuario tiene permisos de administración
  const hasAdminAccess = userRole && ['Administrador', 'Presidente', 'Vicepresidente'].includes(userRole);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary.orange} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <Drawer.Navigator
        initialRouteName="Login"
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={{
          // Estilo de la topbar
          headerStyle: { 
            backgroundColor: Colors.background.header, 
            height: 90 
          },
          headerTintColor: Colors.text.white,
          headerTitleStyle: { 
            fontWeight: FontWeights.bold, 
            fontSize: FontSizes.xl 
          },
          headerTitle: 'VeciGest',
          
          // Estilo del drawer
          drawerStyle: { 
            backgroundColor: Colors.background.drawer, 
            width: 280 
          },
          drawerActiveTintColor: Colors.accent.active,
          drawerInactiveTintColor: Colors.accent.inactive,
          drawerLabelStyle: { 
            fontSize: FontSizes.md, 
            marginLeft: -10, 
            fontWeight: FontWeights.medium 
          },
        }}
      >
        {/* PANTALLA LOGIN: Oculta del menú pero accesible */}
        <Drawer.Screen 
          name="Login" 
          component={Login} 
          options={{
            drawerItemStyle: { display: 'none' },
            headerShown: false,
          }} 
        />

        {/* PANTALLA INICIO */}
        <Drawer.Screen 
          name="Inicio" 
          component={Inicio}
          options={{
            drawerLabel: 'Inicio',
            headerTitle: 'Inicio',
            drawerIcon: ({ color, size }) => (
              <Ionicons name="newspaper-outline" size={size} color={color} />
            ),
          }}
        />

        {/* PANTALLA ADMINISTRACIÓN: Solo visible para roles específicos */}
        {hasAdminAccess && (
          <Drawer.Screen 
            name="Administracion" 
            component={Administracion}
            options={{
              drawerLabel: 'Administración',
              headerTitle: 'Administración',
              drawerIcon: ({ color, size }) => (
                <Ionicons name="settings-outline" size={size} color={color} />
              ),
            }}
          />
        )}

        {/* PANTALLA GESTIÓN DE USUARIOS: Oculta en el drawer */}
        <Drawer.Screen 
          name="GestionUsuarios" 
          component={GestionUsuarios}
          options={{
            drawerItemStyle: { display: 'none' },
            headerTitle: 'Gestión de Usuarios',
          }}
        />

      </Drawer.Navigator>
    </>
  );
}

const styles = StyleSheet.create({
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.xl,
    marginBottom: Spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: Colors.base.white,
  },
  logoContainer: {
    backgroundColor: Colors.base.white,
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
    marginRight: Spacing.md,
    ...{
      shadowColor: Colors.shadow.color,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
    },
  },
  drawerLogo: {
    width: 40,
    height: 40,
  },
  drawerTitle: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.bold,
    color: Colors.base.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.base.white,
  },
});