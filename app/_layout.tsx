import { Ionicons } from '@expo/vector-icons';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { BorderRadius, Colors, FontSizes, FontWeights, Spacing } from '../styles/theme';

// Importamos el Provider
import AuthProvider, { useAuth } from '../providers/AuthProvider';

// Pantallas
import GestionUsuarios from './(Screens)/(admin)/GestionUsuarios';
import Administracion from './(Screens)/Administracion';
import Inicio from './(Screens)/Inicio';
import Login from './(Screens)/Login';
import MisCuotas from './(Screens)/MisCuotas';

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
           <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>{profile.nombre}</Text>
           <Text style={{ color: Colors.base.white, opacity: 0.8, fontSize: 13 }}>{profile.rol}</Text>
        </View>
      )}
      <View style={{ marginTop: 10 }}> 
        <DrawerItemList {...props} />
      </View>
    </DrawerContentScrollView>
  );
}

function AppNavigation() {
  const { session, isAdmin, profile } = useAuth(); // Importamos 'profile' también

  // Definimos quién NO debe ver las cuotas
  // Si el rol es 'Inquilino', esta variable será true
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

          drawerStyle: { backgroundColor: Colors.background.drawer, width: 280 },
          
          drawerActiveBackgroundColor: Colors.primary.orange,
          drawerActiveTintColor: Colors.base.white,

          drawerInactiveBackgroundColor: 'transparent',
          drawerInactiveTintColor: Colors.base.white,

          drawerItemStyle: {
            borderRadius: BorderRadius.xl, 
            marginHorizontal: Spacing.sm,  
            marginBottom: Spacing.xs,      
          },
          
          drawerLabelStyle: { 
            fontSize: FontSizes.md, 
            marginLeft: -10, 
            fontWeight: FontWeights.medium 
          },
        }}
      >
        {!session ? (
          <Drawer.Screen 
            name="Login" 
            component={Login} 
            options={{
              headerShown: false,
              swipeEnabled: false,
            }} 
          />
        ) : (
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

            {/* --- LÓGICA CONDICIONAL: OCULTAR A INQUILINOS --- */}
            {!esInquilino && (
              <Drawer.Screen 
                name="MisCuotas" 
                component={MisCuotas}
                options={{
                  drawerLabel: 'Mis Recibos',
                  headerTitle: 'Mis Recibos',
                  drawerIcon: ({ color, size }) => (
                    <Ionicons name="wallet-outline" size={size} color={color} />
                  ),
                }}
              />
            )}

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
    paddingTop: 40,
    marginBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
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
    width: 35,
    height: 35,
  },
  drawerTitle: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    color: Colors.base.white,
  },
});