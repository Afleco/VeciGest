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
  // Estados para el Login
  const [usuario, setUsuario] = useState<string>(''); 
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  
  // Estados para la recuperación de contraseña
  const [isForgotPassword, setIsForgotPassword] = useState<boolean>(false);
  const [resetStep, setResetStep] = useState<number>(1); 
  const [otpCode, setOtpCode] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmNewPassword, setConfirmNewPassword] = useState<string>('');

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

      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .select('auth_id')
        .eq('auth_id', authData.user.id) 
        .single();

      if (userError || !userData) {
        await supabase.auth.signOut();
        showAlert('Error de perfil', 'Tu cuenta no está vinculada a un perfil de vecino.');
        setLoading(false);
      }
    } catch (error: any) {
      console.error(error);
      showAlert('Error', 'Ocurrió un error inesperado.');
      setLoading(false);
    }
  };

  const handleSendResetCode = async () => {
    if (!usuario) {
      showAlert('Error', 'Por favor, introduce tu correo electrónico.');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(usuario.trim());
      if (error) throw error;
      
      setResetStep(2); 
      showAlert('Revisa el correo introducido', 'Si pertenece a una cuenta registrada te hemos enviado un código de seguridad.');
    } catch (error: any) {
      showAlert('Error', 'No se pudo enviar el correo. Verifica que la dirección es correcta.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndChangePassword = async () => {
    if (!otpCode || !newPassword || !confirmNewPassword) {
      showAlert('Error', 'Rellena el código y ambas contraseñas.');
      return;
    }
    if (newPassword.length < 6) {
      showAlert('Error', 'La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      showAlert('Error', 'Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email: usuario.trim(),
        token: otpCode.trim(),
        type: 'recovery',
      });

      if (verifyError) {
        showAlert('Error', 'El código es incorrecto o ha caducado.');
        setLoading(false); 
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) throw updateError;

      showAlert('¡Éxito!', 'Tu contraseña ha sido actualizada correctamente.');
      cancelReset();
      
    } catch (error: any) {
      showAlert('Error', 'No se pudo actualizar la contraseña.');
    } finally {
      setLoading(false);
    }
  };

  const cancelReset = () => {
    setIsForgotPassword(false);
    setResetStep(1);
    setOtpCode('');
    setNewPassword('');
    setConfirmNewPassword('');
    setPassword('');
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
          
          {!isForgotPassword && (
            <>
              <TextInput
                style={styles.input}
                placeholder="Correo electrónico"
                placeholderTextColor={Colors.text.light}
                value={usuario}
                onChangeText={setUsuario}
                autoCapitalize="none"
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
                  editable={!loading}
                />
                {Platform.OS !== 'web' && (
                  <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPassword(!showPassword)}>
                    <MaterialCommunityIcons name={showPassword ? "eye" : "eye-off"} size={24} color={Colors.base.black} />
                  </TouchableOpacity>
                )}
              </View>

              <TouchableOpacity style={[styles.button, loading && { opacity: 0.7 }]} onPress={handleLogin} disabled={loading}>
                {loading ? <ActivityIndicator color={Colors.base.white} /> : <Text style={styles.buttonText}>Iniciar sesión</Text>}
              </TouchableOpacity>
            </>
          )}

          {isForgotPassword && resetStep === 1 && (
            <>
              <Text style={styles.instructionText}>Introduce tu correo para recibir un código de recuperación.</Text>
              <TextInput
                style={styles.input}
                placeholder="Correo electrónico"
                placeholderTextColor={Colors.text.light}
                value={usuario}
                onChangeText={setUsuario}
                autoCapitalize="none"
                keyboardType="email-address"
                editable={!loading}
              />
              
              <TouchableOpacity style={[styles.button, loading && { opacity: 0.7 }]} onPress={handleSendResetCode} disabled={loading}>
                {loading ? <ActivityIndicator color={Colors.base.white} /> : <Text style={styles.buttonText}>Enviar Código</Text>}
              </TouchableOpacity>
            </>
          )}

          {isForgotPassword && resetStep === 2 && (
            <>
              <Text style={styles.instructionText}>Introduce el código de seguridad recibido en tu correo.</Text>
              <TextInput
                style={styles.input}
                placeholder="Código de seguridad"
                placeholderTextColor={Colors.text.light}
                value={otpCode}
                onChangeText={setOtpCode}
                keyboardType="numeric"
                maxLength={8} 
                editable={!loading}
              />
              
              <TextInput
                style={styles.input} 
                placeholder="Nueva contraseña"
                placeholderTextColor={Colors.text.light}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={true}
                autoCapitalize="none"
                editable={!loading}
              />

              <TextInput
                style={[styles.input, { marginBottom: Spacing.xl }]} 
                placeholder="Confirmar contraseña"
                placeholderTextColor={Colors.text.light}
                value={confirmNewPassword}
                onChangeText={setConfirmNewPassword}
                secureTextEntry={true}
                autoCapitalize="none"
                editable={!loading}
              />

              <TouchableOpacity style={[styles.button, { backgroundColor: Colors.primary.green }, loading && { opacity: 0.7 }]} onPress={handleVerifyAndChangePassword} disabled={loading}>
                {loading ? <ActivityIndicator color={Colors.base.white} /> : <Text style={styles.buttonText}>Guardar contraseña</Text>}
              </TouchableOpacity>
            </>
          )}

        </View>

        {/* CONTENEDOR INFERIOR */}
        <View style={styles.forgotContainer}>
          {!isForgotPassword ? (
            <TouchableOpacity style={styles.forgotButtonOutside} onPress={() => setIsForgotPassword(true)} disabled={loading}>
              <Text style={styles.forgotTextOutside}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.forgotButtonOutside} onPress={cancelReset} disabled={loading}>
              <Text style={styles.forgotTextOutside}>{resetStep === 1 ? 'Volver al Login' : 'Cancelar'}</Text>
            </TouchableOpacity>
          )}
        </View>

      </KeyboardAvoidingView>

      {/* FOOTER */}
      <View style={styles.footerContainer}>
        <Text style={styles.footerText}>
          © {new Date().getFullYear()} VeciGest. Creado por Lucas Caso & Alejandro Fleitas
        </Text>
      </View>
      
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
  logo: { width: 150, height: 150, marginBottom: Spacing.md }, 
  title: { fontSize: FontSizes.xxl, fontWeight: FontWeights.bold, color: Colors.base.black },
  card: { backgroundColor: Colors.primary.blue, width: '100%', borderRadius: BorderRadius.xl, paddingTop: 35, paddingBottom: 25, paddingHorizontal: 25, alignItems: 'center', ...Shadows.large, minHeight: 320 }, 
  passwordContainer: { width: '100%', position: 'relative', marginBottom: Spacing.xl, justifyContent: 'center' },
  input: { backgroundColor: Colors.base.white, width: '100%', height: 55, borderRadius: BorderRadius.xl, paddingHorizontal: 20, fontSize: FontSizes.md, marginBottom: Spacing.xl, textAlign: 'center', color: Colors.text.primary, ...Platform.select({ web: { outlineStyle: 'none' } as any }) },
  eyeIcon: { position: 'absolute', right: 15, zIndex: 10 },
  button: { backgroundColor: Colors.primary.orange, width: '100%', height: 55, borderRadius: BorderRadius.xl, justifyContent: 'center', alignItems: 'center', marginTop: Spacing.sm },
  buttonText: { color: Colors.base.white, fontSize: FontSizes.lg, fontWeight: FontWeights.bold },
  
  instructionText: { color: Colors.base.white, fontSize: FontSizes.md, textAlign: 'center', marginBottom: Spacing.xl, fontWeight: '500' },

  forgotContainer: {
    height: 60, 
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.md,
  },
  forgotButtonOutside: {
    paddingVertical: Spacing.sm,
  },
  forgotTextOutside: {
    color: Colors.primary.blue, 
    fontSize: FontSizes.md,
    fontWeight: 'bold',
  },
  footerContainer: {
    position: 'absolute',
    bottom: Spacing.lg,
    width: '100%',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: Colors.text.light,
    fontWeight: '500',
    textAlign: 'center',
  }
});

export default LoginScreen;