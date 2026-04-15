import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { Platform } from 'react-native'; // <-- Asegúrate de tener Platform importado
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../../styles/theme';

// Importar las pantallas de gestión
import CrearUsuario from './(Usuarios)/CrearUsuario';
import EditarUsuario from './(Usuarios)/EditarUsuario';
import EliminarUsuario from './(Usuarios)/EliminarUsuario';
import ListarUsuarios from './(Usuarios)/ListarUsuarios';

const Tab = createBottomTabNavigator();

const GestionUsuarios = () => {
  const insets = useSafeAreaInsets(); 

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary.orange,
        tabBarInactiveTintColor: Colors.text.light,
        
        // Forzamos a que siempre esté debajo 
        tabBarLabelPosition: 'below-icon', 
        
        tabBarStyle: {
          backgroundColor: Colors.base.white,
          borderTopWidth: 1,
          borderTopColor: Colors.background.main,
          // En web le damos 65px fijos. En móvil la altura normal + el espacio seguro.
          height: Platform.OS === 'web' ? 65 : 60 + insets.bottom, 
          // En web reducimos el padding inferior para que el texto respire.
          paddingBottom: Platform.OS === 'web' ? 5 : Math.max(8, insets.bottom), 
          paddingTop: 5,
        },
        tabBarItemStyle: {
          paddingHorizontal: 0, 
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 0,
        },
      }}
    >
      <Tab.Screen
        name="Listar"
        component={ListarUsuarios}
        options={{
          tabBarLabel: 'Lista', 
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Crear"
        component={CrearUsuario}
        options={{
          tabBarLabel: 'Crear',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-add-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Editar"
        component={EditarUsuario}
        options={{
          tabBarLabel: 'Editar',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="create-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Eliminar"
        component={EliminarUsuario}
        options={{
          tabBarLabel: 'Eliminar', 
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="trash-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default GestionUsuarios;