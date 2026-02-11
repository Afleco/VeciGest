import { Ionicons } from '@expo/vector-icons';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Image, Modal, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { supabase } from '../lib/supabase';
import { BorderRadius, Colors, FontSizes, FontWeights, Shadows, Spacing } from '../styles/theme';

// Importamos el Provider
import AuthProvider, { useAuth } from '../providers/AuthProvider';

// Pantallas
import GestionCuotas from './(Screens)/(admin)/GestionCuotas';
import GestionUsuarios from './(Screens)/(admin)/GestionUsuarios';
import Administracion from './(Screens)/Administracion';
import Inicio from './(Screens)/Inicio';
import Login from './(Screens)/Login';
import MisCuotas from './(Screens)/MisCuotas';
import Noticias from './(Screens)/Noticias';

const Drawer = createDrawerNavigator();

const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

function CustomDrawerContent(props: any) {
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
      <View style={{ marginTop: 10 }}>
        <DrawerItemList {...props} />
      </View>
    </DrawerContentScrollView>
  );
}

function AppNavigation() {
  const { session, isAdmin, profile } = useAuth();
  const [menuVisible, setMenuVisible] = useState(false);

  const esInquilino = profile?.rol === 'Inquilino';

  return (
    <>
      <StatusBar style="light" />
      <Drawer.Navigator
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={{
          headerStyle: { backgroundColor: Colors.background.header, height: 90 },
          headerTintColor: Colors.text.white,
          headerTitleStyle: { fontWeight: FontWeights.bold, fontSize: FontSizes.xl },
          headerTitle: 'VeciGest',
          headerTitleAlign: 'center',
          headerRight: () => (
            <TouchableOpacity onPress={() => setMenuVisible(true)} style={{ marginRight: 15 }}>
              <Ionicons name="person-circle-outline" size={32} color={Colors.base.white} />
            </TouchableOpacity>
          ),
          drawerStyle: { backgroundColor: Colors.background.drawer, width: 280 },
          drawerActiveBackgroundColor: Colors.primary.orange,
          drawerActiveTintColor: Colors.base.white,
          drawerInactiveTintColor: Colors.base.white,
          drawerItemStyle: { borderRadius: BorderRadius.xl, marginHorizontal: Spacing.sm, marginBottom: Spacing.xs },
          drawerLabelStyle: { fontSize: FontSizes.md, marginLeft: -10, fontWeight: FontWeights.medium },
        }}
      >
        {!session ? (
          <Drawer.Screen name="Login" component={Login} options={{ headerShown: false, swipeEnabled: false }} />
        ) : (
          <>
            <Drawer.Screen
              name="Inicio"
              component={Inicio}
              options={{
                drawerLabel: 'Inicio',
                headerTitle: 'Inicio',
                drawerIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />,
              }}
            />

            <Drawer.Screen 
              name="Noticias" 
              component={Noticias}
              options={{
                drawerLabel: 'Tablón de Noticias',
                headerTitle: 'Noticias de la Comunidad',
                drawerIcon: ({ color, size }) => <Ionicons name="newspaper-outline" size={size} color={color} />,
              }}
            />

            {!esInquilino && (
              <Drawer.Screen
                name="MisCuotas"
                component={MisCuotas}
                options={{ 
                  drawerLabel: 'Mis Recibos', 
                  headerTitle: 'Mis Recibos', 
                  drawerIcon: ({ color, size }) => <Ionicons name="wallet-outline" size={size} color={color} /> 
                }}
              />
            )}
            
            {isAdmin && (
              <>
                <Drawer.Screen
                  name="Administracion"
                  component={Administracion}
                  options={{ 
                    drawerLabel: 'Administración', 
                    headerTitle: 'Administración', 
                    drawerIcon: ({ color, size }) => <Ionicons name="settings-outline" size={size} color={color} /> 
                  }}
                />
                <Drawer.Screen name="GestionCuotas" 
                  component={GestionCuotas} 
                  options={{ drawerItemStyle: { display: 'none' }, headerTitle: 'Estado de Cuentas' }} 
                />
              </>
            )}
            
            <Drawer.Screen name="GestionUsuarios" 
              component={GestionUsuarios} 
              options={{ drawerItemStyle: { display: 'none' }, headerTitle: 'Gestión de Usuarios' }} 
            />
          </>
        )}
      </Drawer.Navigator>

      {/* --- DESPLEGABLE DE USUARIO (MODAL REDISEÑADO) --- */}
      <Modal
        visible={menuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.popoverMenu}>
              
              {/* Cabecera del Menú */}
              <View style={styles.popoverHeader}>
                 <Ionicons name="person-circle" size={40} color={Colors.primary.blue} />
                 <View style={styles.popoverUserInfo}>
                    <Text style={styles.popoverName} numberOfLines={1}>
                      {profile?.nombre || 'Usuario'}
                    </Text>
                    <Text style={styles.popoverRole}>{profile?.rol || 'Vecino'}</Text>
                 </View>
              </View>
              
              <View style={styles.divider} />

              {/* Opciones */}
              <TouchableOpacity 
                style={styles.popoverItem} 
                onPress={() => { setMenuVisible(false); /* TODO: Navegar a avisos */ }}
              >
                <Ionicons name="notifications-outline" size={22} color={Colors.text.primary} />
                <Text style={styles.popoverText}>Avisos</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.popoverItem} 
                onPress={() => { setMenuVisible(false); handleSignOut() }}
              >
                <Ionicons name="log-out-outline" size={22} color={Colors.status.error} />
                <Text style={[styles.popoverText, { color: Colors.status.error }]}>Cerrar Sesión</Text>
              </TouchableOpacity>

            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
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
    paddingTop: 40, 
    marginBottom: Spacing.md, 
    borderBottomWidth: 1, 
    borderBottomColor: 'rgba(255, 255, 255, 0.2)' 
  },
  logoContainer: {
    backgroundColor: Colors.base.white, 
    borderRadius: BorderRadius.sm, 
    padding: Spacing.sm, 
    marginRight: Spacing.md, 
    elevation: 3 
  },
  drawerLogo: {width: 35, height: 35 },
  drawerTitle: { 
    fontSize: FontSizes.xl, 
    fontWeight: FontWeights.bold, 
    color: Colors.base.white 
  },
  
  // ESTILOS DEL MODAL (Popover)
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.3)' // Fondo semitransparente para dar foco
  },
  popoverMenu: {
    position: 'absolute',
    top: 60,
    right: 15,
    width: 220, // Un poco más ancho
    backgroundColor: Colors.base.white,
    borderRadius: BorderRadius.lg,
    ...Shadows.medium, // Sombra bonita definida en theme.ts
    paddingVertical: Spacing.sm,
  },
  popoverHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    paddingTop: Spacing.sm,
  },
  popoverUserInfo: {
    marginLeft: Spacing.sm,
    flex: 1,
  },
  popoverName: { 
    fontSize: FontSizes.md, 
    fontWeight: 'bold', 
    color: Colors.text.primary 
  },
  popoverRole: { 
    fontSize: FontSizes.xs, 
    color: Colors.text.secondary 
  },
  divider: {
    height: 1,
    backgroundColor: Colors.background.main,
    marginVertical: Spacing.xs,
  },
  popoverItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  popoverText: { 
    fontSize: FontSizes.md, 
    fontWeight: '500', 
    color: Colors.text.primary,
    marginLeft: Spacing.md,
  },
});