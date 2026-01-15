import { Ionicons } from '@expo/vector-icons';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

// Importa tus pantallas
import Login from './Screens/Login';
import Noticias from './Screens/Noticias'; // Asegúrate de que el archivo exista

const Drawer = createDrawerNavigator();

// Logo con nombre en la parte superior del drawer
function CustomDrawerContent(props: any) {
  return (
    <DrawerContentScrollView {...props}>
      <View style={styles.drawerHeader}>
        <Ionicons name="book" size={40} color="#000000" />
        <Text style={styles.drawerTitle}>Vecigest</Text>
      </View>
      
      <DrawerItemList {...props} />
    </DrawerContentScrollView>
  );
}

export default function Index() {
  return (
    <>
      <StatusBar style="light" />
      <Drawer.Navigator
        initialRouteName="Login" // Hace que el Login sea lo primero en verse
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={{
          // Estilo de la topbar (Header)
          headerStyle: { backgroundColor: '#ef4f6aff', height: 90 },
          headerTintColor: '#ffffff',
          headerTitleStyle: { fontWeight: 'bold', fontSize: 20 },
          headerTitle: 'Libreria MC',
          
          // Estilo del drawer (Menú lateral)
          drawerStyle: { backgroundColor: '#3229aeff', width: 280 },
          drawerActiveTintColor: '#9df799ff',
          drawerInactiveTintColor: '#ffffffff',
          drawerLabelStyle: { fontSize: 16, marginLeft: -10, fontWeight: '500' },
        }}
      >
        {/* PANTALLA LOGIN: Oculta del menú pero accesible */}
        <Drawer.Screen 
          name="Login" 
          component={Login} 
          options={{
            drawerItemStyle: { display: 'none' }, // <--- ESTO LO OCULTA DEL MENU
            headerShown: false,                  // Oculta la barra superior en el login
          }} 
        />

        {/* PANTALLA NOTICIAS: Visible en el menú */}
        <Drawer.Screen 
          name="Noticias" 
          component={Noticias}
          options={{
            drawerLabel: 'Noticias',
            drawerIcon: ({ color, size }) => (
              <Ionicons name="newspaper-outline" size={size} color={color} />
            ),
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
    padding: 20,
    backgroundColor: '#f5f5f5',
    marginBottom: 10,
  },
  drawerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 12,
    color: '#333',
  },
});