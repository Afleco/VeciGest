import React, { useState } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, Image, 
  SafeAreaView, KeyboardAvoidingView, Platform, Alert, 
  ActivityIndicator, TouchableWithoutFeedback, Keyboard 
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../../SupaBase/Supabase'; 
import { MaterialCommunityIcons } from '@expo/vector-icons'; 

const LoginScreen: React.FC = () => {
  const [usuario, setUsuario] = useState<string>(''); 
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  
  const navigation = useNavigation<any>();

  // Función para limpiar el formulario en caso de error
  const limpiarFormulario = () => {
    setUsuario('');
    setPassword('');
  };

  // Helper para alertas (Soluciona el problema de Alert en Web)
  const showAlert = (titulo: string, mensaje: string) => {
    if (Platform.OS === 'web') {
      window.alert(`${titulo}: ${mensaje}`);
    } else {
      Alert.alert(titulo, mensaje);
    }
  };

  const handleLogin = async () => {
    if (!usuario || !password) {
      showAlert('Error', 'Por favor, rellena todos los campos');
      return;
    }

    setLoading(true);

    try {
      // 1. Login en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: usuario.trim(), 
        password: password,
      });

      if (authError) {
        showAlert('Error de acceso', 'Correo o contraseña incorrectos');
        limpiarFormulario(); // Limpia inputs tras el error
        setLoading(false);
        return;
      }

      // 2. Validación de perfil en tabla 'usuarios'
      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .select('auth_id')
        .eq('auth_id', authData.user.id) 
        .single();

      if (userError || !userData) {
        showAlert('Error de perfil', 'Tu cuenta no está vinculada a un perfil de vecino.');
        limpiarFormulario(); // Limpia inputs tras el error
        setLoading(false);
        return;
      }

      setLoading(false);
      navigation.navigate('Noticias');

    } catch (error: any) {
      showAlert('Error', 'Ocurrió un error inesperado.');
      limpiarFormulario(); // Limpia inputs tras el error
      setLoading(false);
    }
  };

  const renderFormContent = () => (
    <View style={styles.centerContent}> 
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.content}
      >
        <View style={styles.headerContainer}>
          <Image source={require('../../assets/images/icon.png')} style={styles.logo} resizeMode="contain" />
          <Text style={styles.title}>VeciGest</Text>
        </View>

        <View style={styles.card}>
          <TextInput
            style={styles.input}
            placeholder="Correo electrónico"
            placeholderTextColor="#A9A9A9"
            value={usuario}
            onChangeText={setUsuario}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            editable={!loading}
          />

          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.input, { marginBottom: 0 }]} 
              placeholder="Contraseña"
              placeholderTextColor="#A9A9A9"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
            
            {Platform.OS !== 'web' && (
              <TouchableOpacity 
                style={styles.eyeIcon} 
                onPress={() => setShowPassword(!showPassword)}
              >
                <MaterialCommunityIcons 
                  name={showPassword ? "eye" : "eye-off"} 
                  size={24} color="#000000" 
                />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity 
            style={[styles.button, loading && { opacity: 0.7 }]} 
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>Iniciar sesión</Text>}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      {Platform.OS === 'web' ? (
        renderFormContent()
      ) : (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          {renderFormContent()}
        </TouchableWithoutFeedback>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  centerContent: { flex: 1, alignItems: 'center', justifyContent: 'center', width: '100%' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20, width: '100%', maxWidth: 450 },
  headerContainer: { alignItems: 'center', marginBottom: 30 },
  logo: { width: 120, height: 120, marginBottom: 10 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#000000' },
  card: {
    backgroundColor: '#77A2D1',
    width: '100%',
    borderRadius: 40,
    paddingVertical: 45,
    paddingHorizontal: 25,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  passwordContainer: { width: '100%', position: 'relative', marginBottom: 20, justifyContent: 'center' },
  input: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    height: 55,
    borderRadius: 30,
    paddingHorizontal: 50,
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
    ...Platform.select({
      web: { outlineStyle: 'none' } as any,
    }),
  },
  eyeIcon: { position: 'absolute', right: 15, zIndex: 10 },
  button: {
    backgroundColor: '#E68A4B',
    width: '100%',
    height: 55,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: { color: '#FFFFFF', fontSize: 20, fontWeight: 'bold' },
});

export default LoginScreen;