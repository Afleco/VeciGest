import { Ionicons } from '@expo/vector-icons';
import { createClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
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
import { supabase } from '../../../../lib/supabase';
import { BorderRadius, Colors, FontSizes, FontWeights, Shadows, Spacing } from '../../../../styles/theme';
import CustomPicker from '../../../components/CustomPicker';

// Necesitamos las URL y Key para crear el cliente temporal
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_KEY || ""; 


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

      if (error) throw error;
      setViviendas(data || []);
    } catch (error) {
      console.error('Error cargando viviendas:', error);
    }
  };

  const cargarRoles = async () => {
    try {
      const { data, error } = await supabase.rpc('get_enum_values', { 
        enum_name: 'Roles' 
      });
      if (error || !data) {
        setRoles(['Vecino', 'Vicepresidente', 'Presidente', 'Administrador', 'Propietario']);
        setRol('Vecino');
      } else {
        setRoles(data);
        setRol(data[0]);
      }
    } catch (error) {
      setRoles(['Vecino', 'Vicepresidente', 'Presidente', 'Administrador']);
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

  const handleCrearUsuario = async () => {
    if (!nombre.trim() || !email.trim() || !password || !rol) {
      showAlert('Error', 'Por favor completa los campos obligatorios');
      return;
    }

    setLoading(true);

    try {
      // Creamos un cliente que NO guarda sesión
      // Así, al hacer signUp, no sobrescribe la sesión de Admin que esté activa.
      const tempSupabase = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false, // Aquí no queremos mantener la sesión
          detectSessionInUrl: false,
        },
      });

      // Crear usuario en Auth usando el cliente temporal
      const { data: authData, error: authError } = await tempSupabase.auth.signUp({
        email: email.trim(),
        password: password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('No se pudo crear el usuario en Auth');

      // Insertar el perfil en la tabla pública
      // AQUÍ usamos el cliente principal 'supabase' (Admin) porque el tempClient 
      // es el nuevo usuario y  no tendrá permisos para asignarse roles
      const { error: insertError } = await supabase
        .from('usuarios')
        .insert({
          email: email.trim(),
          vivienda_id: viviendaId || null,
          password: password, // Opcional guardarla aquí (por ahora) ?? Esto se quitará en producción
          nombre: nombre.trim(),
          rol: rol,
          auth_id: authData.user.id, // Usamos el ID generado por el cliente temporal
        });

      if (insertError) {
        // Si falla la inserción en la BD, intenta borrar el usuario de Auth para no dejar basura
        // (Esto requeriría una Edge Function para ser perfecto, pero por ahora lanzamos error)
        console.error('Error insertando perfil:', insertError);
        throw new Error('El usuario se creó en Auth pero falló al crear el perfil.');
      }

      showAlert('Éxito', 'Usuario creado correctamente. Tu sesión sigue activa.');
      limpiarFormulario();
      
    } catch (error: any) {
      console.error('Error creando usuario:', error);
      showAlert('Error', error.message || 'Error al crear usuario');
    } finally {
      setLoading(false);
    }
  };

  // Preparar opciones para los Pickers
  const opcionesVivienda = [
    { label: 'Sin vivienda asignada', value: '' },
    ...viviendas.map(v => ({ label: `Vivienda ${v.unidad}`, value: v.unidad }))
  ];
  const opcionesRoles = roles.map(r => ({ label: r, value: r }));

  if (loadingData) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ActivityIndicator size="large" color={Colors.primary.orange} style={{marginTop: 50}} />
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
                placeholder="Ej: Juan Pérez"
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
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                editable={!loading}
              />
            </View>
          </View>

          {/* Vivienda CustomPicker */}
          <CustomPicker
            label="Vivienda (Opcional)"
            placeholder="Seleccionar vivienda..."
            value={viviendaId}
            options={opcionesVivienda}
            onChange={setViviendaId}
            icon="home-outline"
            disabled={loading}
          />
          <Text style={styles.helperText}>Dejar vacío para usuarios externos</Text>
          
          <View style={{ height: Spacing.lg }} />

          {/* Rol CustomPicker */}
          <CustomPicker
            label="Rol *"
            placeholder="Seleccionar rol..."
            value={rol}
            options={opcionesRoles}
            onChange={setRol}
            icon="shield-outline"
            disabled={loading}
          />

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
    height: 50,
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
  helperText: {
    fontSize: FontSizes.xs,
    color: Colors.text.light,
    marginTop: -Spacing.sm,
    marginLeft: Spacing.xs,
    fontStyle: 'italic',
    marginBottom: Spacing.sm,
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