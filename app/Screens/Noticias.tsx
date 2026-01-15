import React from 'react';
import { View, Text, Button, Alert, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../../SupaBase/Supabase'; // Ajusta la ruta

const Noticias = () => {
  const navigation = useNavigation<any>();

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      navigation.navigate('Login');
    } else {
      Alert.alert('Error', 'No se pudo cerrar sesión');
    }
  };

  return (
    <SafeAreaView>
      <View>
        <Text>Pantalla de Noticias</Text>
        
        {/* Botón 1: Acción de la pantalla */}
        <Button 
          title="Actualizar Noticias" 
          onPress={() => Alert.alert('Info', 'Cargando noticias...')} 
          color="#77A2D1" 
        />

        {/* Botón 2: Cerrar Sesión */}
        <Button 
          title="Cerrar Sesión" 
          onPress={handleSignOut} 
          color="#E68A4B" 
        />
      </View>
    </SafeAreaView>
  );
};

export default Noticias;