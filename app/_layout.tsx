import { Ionicons } from '@expo/vector-icons';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Image, Modal, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { supabase } from '../lib/supabase';
import { BorderRadius, Colors, FontSizes, FontWeights, Spacing } from '../styles/theme';

// Importamos el Provider
import AuthProvider, { useAuth } from '../providers/AuthProvider';

// Pantallas
import GestionCuotas from './(Screens)/(admin)/GestionCuotas';
import GestionUsuarios from './(Screens)/(admin)/GestionUsuarios';
import Administracion from './(Screens)/Administracion';
import Inicio from './(Screens)/Inicio';
import Login from './(Screens)/Login';
import MisCuotas from './(Screens)/MisCuotas';
import Noticias from './(Screens)/Noticias'; // <--- IMPORTANTE: Importar la nueva pantalla

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
  const { session, isAdmin, profile, user } = useAuth();
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
                // Cambiado a Home para diferenciar de Noticias
                drawerIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />,
              }}
            />

            {/* --- NUEVA PANTALLA DE NOTICIAS --- */}
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

      {/* Desplegable del Icono de Usuario */}
      <Modal
        visible={menuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.popoverMenu}>
              <View style={styles.popoverUserSection}>
                <Text style={styles.popoverName}>{profile?.nombre || 'Usuario'}</Text>
                <Text style={styles.popoverRole}>{profile?.rol || 'Vecino'}</Text>
              </View>

              <TouchableOpacity style={styles.popoverAvisos} onPress={() => { setMenuVisible(false); /* Navegar a avisos */ }}>
                <Text style={styles.popoverText}>Avisos</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.popoverLogout} onPress={() => { setMenuVisible(false); handleSignOut() }}>
                <Text style={styles.popoverText}>Cerrar Sesión</Text>
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
  modalOverlay: { flex: 1, backgroundColor: 'transparent' },
  popoverMenu: {
    position: 'absolute',
    top: 60,
    right: 15,
    width: 180,
    backgroundColor: '#D1D1D1',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#999',
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  popoverUserSection: {
    padding: 10,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#999',
  },
  popoverName: { fontSize: 16, fontWeight: 'bold', color: '#000' },
  popoverRole: { fontSize: 14, color: '#333' },
  popoverAvisos: {
    backgroundColor: '#FFFF00',
    padding: 12,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
  },
  popoverLogout: {
    backgroundColor: '#ea5151',
    padding: 12,
    alignItems: 'center',
  },
  popoverText: { fontSize: 16, fontWeight: 'bold', color: '#000' },
});