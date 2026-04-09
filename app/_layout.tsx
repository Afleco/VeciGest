import { Ionicons } from '@expo/vector-icons';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { useNavigationState } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Image, Modal, Platform, Pressable, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, useWindowDimensions, View } from 'react-native';
import { BorderRadius, Colors, FontSizes, FontWeights, Shadows, Spacing } from '../styles/theme';

import AuthProvider, { useAuth } from '../providers/AuthProvider';
import UserProfileModal from './components/UserProfileModal';

// Pantallas
import GestionCuotas from './(Screens)/(admin)/GestionCuotas';
import GestionUsuarios from './(Screens)/(admin)/GestionUsuarios';
import Administracion from './(Screens)/Administracion';
import Avisos from './(Screens)/Avisos';
import Chat from './(Screens)/Chat';
import Inicio from './(Screens)/Inicio';
import Login from './(Screens)/Login';
import MisCuotas from './(Screens)/MisCuotas';
import Noticias from './(Screens)/Noticias';
import CederVoto from './(Screens)/Votos';

const Drawer = createDrawerNavigator();

function WebNavbar({ navigation, isAdmin, esInquilino, puedeCederVoto, setMenuVisible, profile }: any) {
  const currentRouteName = useNavigationState((state) => state?.routes[state.index].name);

  const NavItem = ({ name, label }: { name: string; label: string }) => {
    const isActive = currentRouteName === name;

    return (
      <Pressable
        onPress={() => navigation.navigate(name)}
        style={({ hovered }) => [
          styles.webNavLink,
          isActive && styles.activeWebNavLink,
          hovered && styles.hoverWebNavLink,
        ]}
      >
        {({ hovered }) => (
          <Text style={[
            styles.webNavLinkText,
            (isActive || hovered) && styles.activeWebNavLinkText
          ]}>
            {label}
          </Text>
        )}
      </Pressable>
    );
  };

  const primerNombre = profile?.nombre ? profile.nombre.split(' ')[0] : 'Usuario';

  return (
    <View style={styles.webHeader}>
      <View style={styles.webHeaderLeft}>
        <View style={styles.webLogoContainer}>
          <Image source={require('../assets/images/iconapp.png')} style={styles.webLogo} resizeMode="contain" />
        </View>
        <Text style={styles.webTitle}>VeciGest</Text>
      </View>

      <View style={styles.webNavLinks}>
        <NavItem name="Inicio" label="Inicio" />
        <NavItem name="Noticias" label="Noticias" />
        <NavItem name="Avisos" label="Avisos" />
        <NavItem name="Chat" label="Chat" />
        
        {puedeCederVoto && <NavItem name="Ceder Votos" label="Ceder Votos" />}
        
        {!esInquilino && <NavItem name="Mis Cuotas" label="Mis Cuotas" />}
        {isAdmin && <NavItem name="Administración" label="Administración" />}
      </View>

      <Pressable
        onPress={() => setMenuVisible(true)}
        style={({ hovered }) => [styles.webProfileBtn, hovered && { opacity: 0.7 }]}
      >
        <Text style={styles.webProfileName}>{primerNombre}</Text>
        <Ionicons name="person-circle-outline" size={35} color={Colors.base.white} />
      </Pressable>
    </View>
  );
}

function CustomDrawerContent(props: any) {
  return (
    <DrawerContentScrollView {...props}>
      <View style={styles.drawerHeader}>
        <View style={styles.logoContainer}>
          <Image source={require('../assets/images/iconapp.png')} style={styles.drawerLogo} resizeMode="contain" />
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
  const { session, isAdmin, profile, logout } = useAuth();
  
  // Estados para el Popover de opciones
  const [menuVisible, setMenuVisible] = useState(false);
  
  // Estado para el Modal de Perfil
  const [profileModalVisible, setProfileModalVisible] = useState(false);

  const esInquilino = profile?.rol === 'Inquilino';
  const esVecino = profile?.rol === 'Vecino';
  const puedeCederVoto = !esInquilino && !esVecino;

  const { width } = useWindowDimensions();
  const isDesktop = width >= 1280;

  if (!session) {
    return <Login />;
  }

  const handleOpenProfile = () => {
    setMenuVisible(false);
    setProfileModalVisible(true);
  };

  return (
    <>
      <StatusBar style="light" />
      <Drawer.Navigator
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={({ navigation: drawerNav }) => ({
          header: isDesktop
            ? () => <WebNavbar
              navigation={drawerNav}
              isAdmin={isAdmin}
              esInquilino={esInquilino}
              puedeCederVoto={puedeCederVoto}
              setMenuVisible={setMenuVisible}
              profile={profile}
            />
            : undefined,
          headerStyle: {
            backgroundColor: Colors.background.header,
            height: isDesktop ? 70 : 100,
            elevation: 0,
            shadowOpacity: 0
          },
          headerTintColor: Colors.text.white,
          headerTitleStyle: { fontWeight: FontWeights.bold, fontSize: FontSizes.lg },
          headerTitleAlign: 'center',
          headerRight: () => (
            <TouchableOpacity onPress={() => setMenuVisible(true)} style={{ marginRight: 20 }}>
              <Ionicons name="person-circle-outline" size={40} color={Colors.base.white} />
            </TouchableOpacity>
          ),
          drawerStyle: { backgroundColor: Colors.background.drawer, width: isDesktop ? 0 : 280 },
          drawerActiveBackgroundColor: Colors.primary.orange,
          drawerActiveTintColor: Colors.base.white,
          drawerInactiveTintColor: Colors.base.white,
        })}
      >
        <Drawer.Screen
          name="Inicio"
          component={Inicio}
          options={{
            drawerIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />
          }}
        />

        <Drawer.Screen
          name="Chat"
          component={Chat}
          options={{
            headerTitle: 'Chat de la Comunidad',
            drawerIcon: ({ color, size }) => <Ionicons name="chatbubbles-outline" size={size} color={color} />
          }}
        />

        <Drawer.Screen
          name="Noticias"
          component={Noticias}
          options={{
            drawerIcon: ({ color, size }) => <Ionicons name="newspaper-outline" size={size} color={color} />
          }}
        />

        <Drawer.Screen
          name="Avisos"
          component={Avisos}
          options={{
            drawerIcon: ({ color, size }) => <Ionicons name="notifications-outline" size={size} color={color} />
          }}
        />

        {puedeCederVoto && (
          <Drawer.Screen
            name="Ceder Votos"
            component={CederVoto}
            options={{
              headerTitle: 'Cediendo Voto',
              drawerIcon: ({ color, size }) => (
                <Ionicons name="swap-horizontal-outline" size={size} color={color} />
              ),
            }}
          />
        )}

        {!esInquilino && (
          <Drawer.Screen
            name="Mis Cuotas"
            component={MisCuotas}
            options={{
              headerTitle: 'Mis Cuotas',
              drawerIcon: ({ color, size }) => <Ionicons name="wallet-outline" size={size} color={color} />
            }}
          />
        )}

        {isAdmin && (
          <>
            <Drawer.Screen
              name="Administración"
              component={Administracion}
              options={{
                headerTitle: 'Administración',
                drawerIcon: ({ color, size }) => <Ionicons name="settings-outline" size={size} color={color} />
              }}
            />
            <Drawer.Screen
              name="GestionCuotas"
              component={GestionCuotas}
              options={{
                headerTitle: 'Gestión de Cuotas',
                drawerItemStyle: { display: 'none' }
              }}
            />
            <Drawer.Screen
              name="GestionUsuarios"
              component={GestionUsuarios}
              options={{
                headerTitle: 'Gestión de Usuarios',
                drawerItemStyle: { display: 'none' }
              }}
            />
          </>
        )}
      </Drawer.Navigator>

      {/* MODAL POPOVER DEL MENÚ DE USUARIO */}
      <Modal visible={menuVisible} transparent animationType="fade" onRequestClose={() => setMenuVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={[styles.popoverMenu, isDesktop && styles.webPopover]}>
              <View style={styles.popoverHeader}>
                {profile?.vivienda_id ? (
                  <View style={styles.popoverUnitBadge}>
                    <Text style={styles.popoverUnitText}>{profile.vivienda_id}</Text>
                  </View>
                ) : (
                  <Ionicons name="person-circle" size={44} color={Colors.primary.blue} />
                )}
                
                <View style={styles.popoverUserInfo}>
                  <Text style={styles.popoverName}>{profile?.nombre || 'Usuario'}</Text>
                  <Text style={styles.popoverRole}>{profile?.rol || 'Vecino'}</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <TouchableOpacity style={styles.popoverItem} onPress={handleOpenProfile}>
                <Ionicons name="person-outline" size={22} color={Colors.text.primary} />
                <Text style={styles.popoverText}>Mi Perfil</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.popoverItem} onPress={() => setMenuVisible(false)}>
                <Ionicons name="notifications-outline" size={22} color={Colors.text.primary} />
                <Text style={styles.popoverText}>Avisos</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.popoverItem}
                onPress={() => {
                  setMenuVisible(false);
                  logout();
                }}
              >
                <Ionicons name="log-out-outline" size={22} color={Colors.status.error} />
                <Text style={[styles.popoverText, { color: Colors.status.error }]}>Cerrar Sesión</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* COMPONENTE DE PERFIL */}
      <UserProfileModal 
        visible={profileModalVisible} 
        onClose={() => setProfileModalVisible(false)} 
      />

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
  webHeader: {
    flexDirection: 'row',
    height: 70,
    backgroundColor: Colors.background.header,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 40,
    ...Shadows.medium,
  },
  webHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  webLogoContainer: {
    backgroundColor: '#FFFFFF',
    padding: 6,
    borderRadius: 8,
    marginRight: 15,
    ...Shadows.small,
  },
  webLogo: {
    width: 35,
    height: 35
  },
  webTitle: {
    color: Colors.base.white,
    fontSize: 22,
    fontWeight: 'bold'
  },
  webNavLinks: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'center'
  },
  webNavLink: {
    marginHorizontal: 15,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.md,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
    // @ts-ignore
    cursor: Platform.OS === 'web' ? 'pointer' : 'default',
  },
  webNavLinkText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
    fontWeight: '500'
  },
  activeWebNavLink: {
    borderBottomColor: Colors.primary.orange,
  },
  activeWebNavLinkText: {
    color: Colors.base.white,
    fontWeight: 'bold',
  },
  hoverWebNavLink: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  webProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  webProfileName: {
    color: Colors.base.white,
    marginRight: 10,
    fontWeight: '500'
  },
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
  drawerLogo: {
    width: 35,
    height: 35
  },
  drawerTitle: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    color: Colors.base.white
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'flex-end', 
  },
  popoverMenu: {
    marginTop: 60, 
    marginRight: 15, 
    minWidth: 200, 
    maxWidth: 280, 
    backgroundColor: Colors.base.white,
    borderRadius: BorderRadius.lg,
    ...Shadows.medium,
    paddingVertical: Spacing.md, 
  },
  webPopover: {
    marginTop: 75, 
    marginRight: 40, 
  },
  popoverHeader: {
    flexDirection: 'row',
    alignItems: 'center', 
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm, 
  },
  popoverUnitBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary.blue,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.small,
  },
  popoverUnitText: {
    color: Colors.base.white,
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.bold,
  },
  popoverUserInfo: {
    marginLeft: Spacing.md,
    flexShrink: 1, 
    justifyContent: 'center',
  },
  popoverName: {
    fontSize: FontSizes.md,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 4,
    flexShrink: 1, 
  },
  popoverRole: {
    fontSize: FontSizes.xs,
    color: Colors.text.secondary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.background.main,
    marginVertical: Spacing.xs
  },
  popoverItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10, 
    paddingHorizontal: Spacing.md
  },
  popoverText: {
    fontSize: FontSizes.md,
    fontWeight: '500',
    color: Colors.text.primary,
    marginLeft: Spacing.md
  },
});