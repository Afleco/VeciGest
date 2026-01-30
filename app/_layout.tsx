import { Ionicons } from '@expo/vector-icons';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { StatusBar } from 'expo-status-bar';
<<<<<<< HEAD
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';
import { supabase } from '../SupaBase/Supabase';
import { BorderRadius, Colors, FontSizes, FontWeights, Spacing } from './theme';

// Importamos las pantallas
import Administracion from './Screens/Administracion';
import Inicio from './Screens/Inicio';
import Login from './Screens/Login';
=======
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { BorderRadius, Colors, FontSizes, FontWeights, Spacing } from '../styles/theme';

// Importamos el Provider
import AuthProvider, { useAuth } from '../providers/AuthProvider';

// Pantallas
import Administracion from './(Screens)/Administracion';
import GestionUsuarios from './(Screens)/GestionUsuarios';
import Inicio from './(Screens)/Inicio';
import Login from './(Screens)/Login';
>>>>>>> 86a43b7 (Fixed: Persistencia de sesión y navegación adaptada con AuthProvider)

const Drawer = createDrawerNavigator();

function CustomDrawerContent(props: any) {
  const { profile } = useAuth();
  
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
      {profile && (
        <View style={{ paddingHorizontal: 20, marginBottom: 15 }}>
           <Text style={{ color: 'white', fontSize: 14, fontWeight: 'bold' }}>{profile.nombre}</Text>
           <Text style={{ color: Colors.base.white, opacity: 0.8, fontSize: 12 }}>{profile.rol}</Text>
        </View>
      )}
      <DrawerItemList {...props} />
    </DrawerContentScrollView>
  );
}

function AppNavigation() {
  // Obtenemos la sesión para decidir qué pantallas mostrar
  const { session, isAdmin } = useAuth(); 

  return (
    <>
      <StatusBar style="light" />
      <Drawer.Navigator
        // Quitamos initialRouteName fijo. Dejamos que React Navigation elija la primera disponible.
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={{
          headerStyle: { backgroundColor: Colors.background.header, height: 90 },
          headerTintColor: Colors.text.white,
          headerTitleStyle: { fontWeight: FontWeights.bold, fontSize: FontSizes.xl },
          headerTitle: 'VeciGest',
          drawerStyle: { backgroundColor: Colors.background.drawer, width: 280 },
          drawerActiveTintColor: Colors.accent.active,
          drawerInactiveTintColor: Colors.accent.inactive,
          drawerLabelStyle: { fontSize: FontSizes.md, marginLeft: -10, fontWeight: FontWeights.medium },
        }}
      >
<<<<<<< HEAD
        {/* PANTALLA LOGIN */}
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
=======
        {!session ? (
          // --- ESTADO: NO LOGUEADO ---
          // Solo mostramos Login. Bloquea ir a Inicio.
>>>>>>> 86a43b7 (Fixed: Persistencia de sesión y navegación adaptada con AuthProvider)
          <Drawer.Screen 
            name="Login" 
            component={Login} 
            options={{
              headerShown: false,
              swipeEnabled: false, // Bloqueamos el gesto lateral
            }} 
          />
        ) : (
          // --- ESTADO: LOGUEADO ---
          // Mostramos la App real. Login no existe aquí.
          <>
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

            {isAdmin && (
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

            <Drawer.Screen 
              name="GestionUsuarios" 
              component={GestionUsuarios}
              options={{
                drawerItemStyle: { display: 'none' },
                headerTitle: 'Gestión de Usuarios',
              }}
            />
          </>
        )}
<<<<<<< HEAD

=======
>>>>>>> 86a43b7 (Fixed: Persistencia de sesión y navegación adaptada con AuthProvider)
      </Drawer.Navigator>
    </>
  );
}

export default function Index() {
  return (
    <AuthProvider>
      <AppNavigation />
    </AuthProvider>
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
    shadowColor: Colors.shadow.color,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
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
});