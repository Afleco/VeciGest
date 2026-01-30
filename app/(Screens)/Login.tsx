import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import { BorderRadius, Colors, FontSizes, FontWeights, Shadows, Spacing } from '../../styles/theme';

const LoginScreen: React.FC = () => {
  const [usuario, setUsuario] = useState<string>(''); 
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  
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
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: usuario.trim(), 
        password: password,
      });

      if (authError) {
        showAlert('Error de acceso', 'Credenciales incorrectas');
        setLoading(false);
        return;
      }

      // Validar perfil
      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .select('auth_id')
        .eq('auth_id', authData.user.id) 
        .single();

      if (userError || !userData) {
        await supabase.auth.signOut();
        showAlert('Error de perfil', 'Tu cuenta no está vinculada a un perfil de vecino.');
        setLoading(false);
        return;
      }

      // NO HACEMOS NADA MÁS.
      // Al haber hecho signIn, el AuthProvider actualizará el estado 'session'.
      // El _layout.tsx detectará que hay sesión y cambiará la pantalla 'Login' por 'Inicio'.
      // setLoading(false) no es necesario porque el componente se desmontará.

    } catch (error: any) {
      console.error(error);
      showAlert('Error', 'Ocurrió un error inesperado.');
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
          <Image 
            source={require('../../assets/images/iconapp.png')} 
            style={styles.logo} 
            resizeMode="contain" 
          />
          <Text style={styles.title}>VeciGest</Text>
        </View>

        <View style={styles.card}>
          <TextInput
            style={styles.input}
            placeholder="Correo electrónico"
            placeholderTextColor={Colors.text.light}
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
              placeholderTextColor={Colors.text.light}
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
                  size={24} 
                  color={Colors.base.black} 
                />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity 
            style={[styles.button, loading && { opacity: 0.7 }]} 
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={Colors.base.white} />
            ) : (
              <Text style={styles.buttonText}>Iniciar sesión</Text>
            )}
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
  container: { flex: 1, backgroundColor: Colors.base.white },
  centerContent: { flex: 1, alignItems: 'center', justifyContent: 'center', width: '100%' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.xl, width: '100%', maxWidth: 450 },
  headerContainer: { alignItems: 'center', marginBottom: BorderRadius.xl },
  logo: { width: 200, height: 200, marginBottom: Spacing.md },
  title: { fontSize: FontSizes.xxxl, fontWeight: FontWeights.bold, color: Colors.base.black },
  card: { backgroundColor: Colors.primary.blue, width: '100%', borderRadius: BorderRadius.xl, paddingVertical: 45, paddingHorizontal: 25, alignItems: 'center', ...Shadows.large },
  passwordContainer: { width: '100%', position: 'relative', marginBottom: Spacing.xl, justifyContent: 'center' },
  input: { backgroundColor: Colors.base.white, width: '100%', height: 55, borderRadius: BorderRadius.xl, paddingHorizontal: 50, fontSize: FontSizes.lg, marginBottom: Spacing.xl, textAlign: 'center', color: Colors.text.primary, ...Platform.select({ web: { outlineStyle: 'none' } as any }) },
  eyeIcon: { position: 'absolute', right: 15, zIndex: 10 },
  button: { backgroundColor: Colors.primary.orange, width: '100%', height: 55, borderRadius: BorderRadius.xl, justifyContent: 'center', alignItems: 'center', marginTop: Spacing.md },
  buttonText: { color: Colors.base.white, fontSize: FontSizes.xl, fontWeight: FontWeights.bold },
});

export default LoginScreen;