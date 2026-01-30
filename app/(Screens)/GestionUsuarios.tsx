import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { Colors, FontSizes } from '../../styles/theme';

// Importar las pantallas de gestión
import CrearUsuario from './(admin)/(Usuarios)/CrearUsuario';
import EditarUsuario from './(admin)/(Usuarios)/EditarUsuario';
import EliminarUsuario from './(admin)/(Usuarios)/EliminarUsuario';
import ListarUsuarios from './(admin)/(Usuarios)/ListarUsuarios';

const Tab = createBottomTabNavigator();

const GestionUsuarios = () => {
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
          height: 60,
          paddingBottom: 8,
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