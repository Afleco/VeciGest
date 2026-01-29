import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../../SupaBase/Supabase';
import { BorderRadius, Colors, FontSizes, FontWeights, Shadows, Spacing } from '../../theme';

const CrearUsuario = () => {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [viviendaId, setViviendaId] = useState('');
  const [rol, setRol] = useState('');
  const [loading, setLoading] = useState(false);
  const [viviendas, setViviendas] = useState<any[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      await Promise.all([cargarViviendas(), cargarRoles()]);
    } catch (error) {
      console.error('Error cargando datos iniciales:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const cargarViviendas = async () => {
    try {
      const { data, error } = await supabase
        .from('viviendas')
        .select('unidad')
        .order('unidad', { ascending: true });

      if (error) {
        console.error('Error al cargar viviendas:', error);
        return;
      }
      
      console.log('Viviendas cargadas:', data);
      setViviendas(data || []);
    } catch (error) {
      console.error('Error cargando viviendas:', error);
    }
  };

  const cargarRoles = async () => {
    try {
      // Consulta SQL para obtener los valores del ENUM 'Roles'
      const { data, error } = await supabase.rpc('get_enum_values', { 
        enum_name: 'Roles' 
      });

      if (error) {
        // Si falla el RPC, usar valores por defecto conocidos
        console.warn('No se pudo cargar el ENUM, usando valores por defecto:', error);
        setRoles(['Vecino', 'Vicepresidente', 'Presidente', 'Administrador']);
        setRol('Vecino');
        return;
      }

      if (data && data.length > 0) {
        setRoles(data);
        setRol(data[0]); // Seleccionar el primer rol por defecto
      }
    } catch (error) {
      console.error('Error cargando roles:', error);
      // Valores por defecto en caso de error
      setRoles(['Vecino', 'Vicepresidente', 'Presidente', 'Administrador', "Propietario"]);
      setRol('Vecino');
    }
  };

  const showAlert = (titulo: string, mensaje: string) => {
    if (Platform.OS === 'web') {
      window.alert(`${titulo}: ${mensaje}`);
    } else {
      Alert.alert(titulo, mensaje);
    }
  };

  const limpiarFormulario = () => {
    setNombre('');
    setEmail('');
    setPassword('');
    setViviendaId('');
    setRol(roles.length > 0 ? roles[0] : '');
  };

  const validarFormulario = () => {
    if (!nombre.trim()) {
      showAlert('Error', 'El nombre es obligatorio');
      return false;
    }
    if (!email.trim()) {
      showAlert('Error', 'El email es obligatorio');
      return false;
    }
    if (!password || password.length < 6) {
      showAlert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return false;
    }
    if (!rol) {
      showAlert('Error', 'Debes seleccionar un rol');
      return false;
    }
    return true;
  };

  const handleCrearUsuario = async () => {
    if (!validarFormulario()) return;

    setLoading(true);

    try {
      // Crear usuario en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error('No se pudo crear el usuario en Auth');
      }

      // Crear registro en tabla usuarios
      // vivienda_id puede ser null si no se selecciona
      const { error: insertError } = await supabase
        .from('usuarios')
        .insert({
          email: email.trim(),
          vivienda_id: viviendaId || null, // Si está vacío, insertar null
          password: password,
          nombre: nombre.trim(),
          rol: rol,
          auth_id: authData.user.id,
        });

      if (insertError) throw insertError;

      showAlert('Éxito', 'Usuario creado correctamente');
      limpiarFormulario();
      cargarViviendas(); // Recargar viviendas disponibles  // No funciona ??? REVISAR
    } catch (error: any) {
      console.error('Error creando usuario:', error);
      showAlert('Error', error.message || 'No se pudo crear el usuario');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary.orange} />
          <Text style={styles.loadingText}>Cargando datos...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView>
        <View style={styles.header}>
          <Ionicons name="person-add" size={50} color={Colors.primary.orange} />
          <Text style={styles.title}>Crear Nuevo Usuario</Text>
          <Text style={styles.subtitle}>Completa los campos del formulario</Text>
        </View>

        <View style={styles.form}>
          {/* Nombre */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nombre Completo *</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color={Colors.text.light} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Ej: Juan Pérez García"
                placeholderTextColor={Colors.text.light}
                value={nombre}
                onChangeText={setNombre}
                editable={!loading}
              />
            </View>
          </View>

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Correo Electrónico *</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color={Colors.text.light} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="ejemplo@email.com"
                placeholderTextColor={Colors.text.light}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!loading}
              />
            </View>
          </View>

          {/* Contraseña */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Contraseña *</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color={Colors.text.light} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Mínimo 6 caracteres"
                placeholderTextColor={Colors.text.light}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                editable={!loading}
              />
            </View>
          </View>

          {/* Vivienda */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Vivienda (Opcional)</Text>
            <View style={styles.pickerContainer}>
              <Ionicons name="home-outline" size={20} color={Colors.text.light} style={styles.inputIcon} />
              <Picker
                selectedValue={viviendaId}
                onValueChange={setViviendaId}
                style={styles.picker}
                enabled={!loading}
              >
                <Picker.Item label="Sin vivienda asignada" value="" />
                {viviendas.map((vivienda) => (
                  <Picker.Item
                    key={vivienda.unidad}
                    label={`Vivienda ${vivienda.unidad}`}
                    value={vivienda.unidad}
                  />
                ))}
              </Picker>
            </View>
            <Text style={styles.helperText}>
              Dejar vacío para usuarios externos
            </Text>
          </View>

          {/* Rol */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Rol *</Text>
            <View style={styles.pickerContainer}>
              <Ionicons name="shield-outline" size={20} color={Colors.text.light} style={styles.inputIcon} />
              <Picker
                selectedValue={rol}
                onValueChange={setRol}
                style={styles.picker}
                enabled={!loading}
              >
                {roles.length === 0 ? (
                  <Picker.Item label="Cargando roles..." value="" />
                ) : (
                  roles.map((roleOption) => (
                    <Picker.Item
                      key={roleOption}
                      label={roleOption}
                      value={roleOption}
                    />
                  ))
                )}
              </Picker>
            </View>
          </View>

          {/* Información adicional */}
          <View style={styles.infoCard}>
            <Ionicons name="information-circle-outline" size={20} color={Colors.primary.blue} />
            <Text style={styles.infoText}>
              Los usuarios sin vivienda pueden acceder al sistema pero no estarán asociados a ninguna propiedad.
            </Text>
          </View>

          {/* Botones */}
          <TouchableOpacity
            style={[styles.button, loading && { opacity: 0.7 }]}
            onPress={handleCrearUsuario}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={Colors.base.white} />
            ) : (
              <>
                <Ionicons name="checkmark-circle-outline" size={24} color={Colors.base.white} />
                <Text style={styles.buttonText}>Crear Usuario</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.buttonSecondary}
            onPress={limpiarFormulario}
            disabled={loading}
          >
            <Ionicons name="refresh-outline" size={24} color={Colors.primary.blue} />
            <Text style={styles.buttonTextSecondary}>Limpiar Formulario</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.main,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: FontSizes.md,
    color: Colors.text.secondary,
  },
  header: {
    backgroundColor: Colors.base.white,
    padding: Spacing.xl,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.background.main,
  },
  title: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.bold,
    color: Colors.text.primary,
    marginTop: Spacing.md,
  },
  subtitle: {
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
    marginTop: Spacing.xs,
  },
  form: {
    padding: Spacing.lg,
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.base.white,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    ...Shadows.small,
  },
  inputIcon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: FontSizes.md,
    color: Colors.text.primary,
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.base.white,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    ...Shadows.small,
  },
  picker: {
    flex: 1,
    height: 50,
  },
  helperText: {
    fontSize: FontSizes.xs,
    color: Colors.text.light,
    marginTop: Spacing.xs,
    marginLeft: Spacing.xs,
    fontStyle: 'italic',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#E8F4FD',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary.blue,
  },
  infoText: {
    flex: 1,
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
    marginLeft: Spacing.sm,
    lineHeight: 18,
  },
  button: {
    backgroundColor: Colors.primary.orange,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.md,
    ...Shadows.medium,
  },
  buttonText: {
    color: Colors.base.white,
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    marginLeft: Spacing.sm,
  },
  buttonSecondary: {
    backgroundColor: Colors.base.white,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.primary.blue,
  },
  buttonTextSecondary: {
    color: Colors.primary.blue,
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    marginLeft: Spacing.sm,
  },
});

export default CrearUsuario;
