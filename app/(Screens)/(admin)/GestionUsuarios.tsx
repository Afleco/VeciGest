import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context'; // <-- NUEVO IMPORT
import { Colors, FontSizes } from '../../../styles/theme';

// Importar las pantallas de gestión
import CrearUsuario from './(Usuarios)/CrearUsuario';
import EditarUsuario from './(Usuarios)/EditarUsuario';
import EliminarUsuario from './(Usuarios)/EliminarUsuario';
import ListarUsuarios from './(Usuarios)/ListarUsuarios';

const Tab = createBottomTabNavigator();

const GestionUsuarios = () => {
  const insets = useSafeAreaInsets(); // <-- DETECTA EL BORDE INFERIOR DEL MÓVIL

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary.orange,
        tabBarInactiveTintColor: Colors.text.light,
        tabBarStyle: {
          backgroundColor: Colors.base.white,
          borderTopWidth: 1,
          borderTopColor: Colors.background.main,
          height: 60 + insets.bottom, // <-- SUMA EL ESPACIO EXTRA DEL MÓVIL
          paddingBottom: 8 + insets.bottom, // <-- SUMA EL ESPACIO EXTRA DEL MÓVIL
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: FontSizes.xs,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Listar"
        component={ListarUsuarios}
        options={{
          tabBarLabel: 'Ver Todos',
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