import { Redirect } from 'expo-router';
import React from 'react';

export default function NotFoundScreen() {
  // Si alguien carga una URL profunda y Expo no encuentre el archivo físico, este componente lo atrapa 
  // y redirige silenciosamente al usuario a la raíz ("/")
  return <Redirect href="/" />;
}