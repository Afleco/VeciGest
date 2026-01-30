import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
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

interface Usuario {
  email: string;
  vivienda_id: string;
  nombre: string;
  rol: string;
  auth_id: string;
}

const EditarUsuario = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState('');
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [viviendaId, setViviendaId] = useState('');
  const [rol, setRol] = useState('');
  const [loading, setLoading] = useState(false);
  const [viviendas, setViviendas] = useState<any[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useFocusEffect(
    useCallback(() => {
      cargarDatos();
    }, [])
  );

  const cargarDatos = async () => {
    try {
      await Promise.all([cargarUsuarios(), cargarViviendas(), cargarRoles()]);
    } catch (error) {
      console.error('Error cargando datos iniciales:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const cargarUsuarios = async () => {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .order('nombre', { ascending: true });

      if (error) throw error;
      setUsuarios(data || []);
    } catch (error) {
      console.error('Error cargando usuarios:', error);
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
        setRoles(['Vecino', 'Vicepresidente', 'Presidente', 'Administrador']);
      } else {
        setRoles(data);
      }
    } catch (error) {
      console.error('Error cargando roles:', error);
      setRoles(['Vecino', 'Vicepresidente', 'Presidente', 'Administrador']);
    }
  };

  const handleSeleccionarUsuario = (authId: string) => {
    setUsuarioSeleccionado(authId);
    const usuario = usuarios.find((u) => u.auth_id === authId);
    if (usuario) {
      setNombre(usuario.nombre);
      setEmail(usuario.email);
      setViviendaId(usuario.vivienda_id || ''); // Asegurar que no sea null
      setRol(usuario.rol);
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
    setUsuarioSeleccionado('');
    setNombre('');
    setEmail('');
    setViviendaId('');
    setRol('');
  };

  const handleActualizarUsuario = async () => {
    if (!usuarioSeleccionado) {
      showAlert('Error', 'Debes seleccionar un usuario');
      return;
    }

    if (!nombre.trim()) {
      showAlert('Error', 'El nombre es obligatorio');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('usuarios')
        .update({
          nombre: nombre.trim(),
          vivienda_id: viviendaId || null,
          rol: rol,
        })
        .eq('auth_id', usuarioSeleccionado);

      if (error) throw error;

      showAlert('Éxito', 'Usuario actualizado correctamente');
      cargarUsuarios(); // Recargar lista
      limpiarFormulario();
    } catch (error: any) {
      console.error('Error actualizando usuario:', error);
      showAlert('Error', error.message || 'No se pudo actualizar el usuario');
    } finally {
      setLoading(false);
    }
  };

  // --- PREPARACIÓN DE OPCIONES PARA CUSTOM PICKER ---
  
  const opcionesUsuarios = [
    { label: 'Selecciona un usuario...', value: '' },
    ...usuarios.map(u => ({ 
      label: `${u.nombre} (${u.email})`, 
      value: u.auth_id 
    }))
  ];

  const opcionesVivienda = [
    { label: 'Sin vivienda asignada', value: '' },
    ...viviendas.map(v => ({ label: `Vivienda ${v.unidad}`, value: v.unidad }))
  ];

  const opcionesRoles = roles.map(r => ({ label: r, value: r }));


  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView>
        <View style={styles.header}>
          <Ionicons name="create" size={50} color={Colors.primary.blue} />
          <Text style={styles.title}>Editar Usuario</Text>
          <Text style={styles.subtitle}>Selecciona y modifica los datos del usuario</Text>
        </View>

        {loadingData ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary.blue} />
            <Text style={styles.loadingText}>Cargando datos...</Text>
          </View>
        ) : (
          <View style={styles.form}>
            
            {/* SELECCIONAR USUARIO */}
            <CustomPicker
              label="Seleccionar Usuario *"
              placeholder="Buscar usuario..."
              value={usuarioSeleccionado}
              options={opcionesUsuarios}
              onChange={handleSeleccionarUsuario}
              icon="people-outline"
              disabled={loading}
            />

            {usuarioSeleccionado ? (
              <>
                <View style={styles.divider} />

                {/* Nombre */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Nombre Completo *</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons name="person-outline" size={20} color={Colors.text.light} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Nombre completo"
                      placeholderTextColor={Colors.text.light}
                      value={nombre}
                      onChangeText={setNombre}
                      editable={!loading}
                    />
                  </View>
                </View>

                {/* Email (solo lectura) */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Correo Electrónico (No editable)</Text>
                  <View style={[styles.inputContainer, { opacity: 0.6, backgroundColor: '#f5f5f5' }]}>
                    <Ionicons name="mail-outline" size={20} color={Colors.text.light} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      value={email}
                      editable={false}
                    />
                  </View>
                </View>

                {/* Vivienda Picker */}
                <CustomPicker
                  label="Vivienda (Opcional)"
                  value={viviendaId}
                  options={opcionesVivienda}
                  onChange={setViviendaId}
                  icon="home-outline"
                  disabled={loading}
                />

                {/* Rol Picker */}
                <CustomPicker
                  label="Rol *"
                  value={rol}
                  options={opcionesRoles}
                  onChange={setRol}
                  icon="shield-outline"
                  disabled={loading}
                />

                {/* Botones */}
                <TouchableOpacity
                  style={[styles.button, loading && { opacity: 0.7 }]}
                  onPress={handleActualizarUsuario}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color={Colors.base.white} />
                  ) : (
                    <>
                      <Ionicons name="checkmark-circle-outline" size={24} color={Colors.base.white} />
                      <Text style={styles.buttonText}>Actualizar Usuario</Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.buttonSecondary}
                  onPress={limpiarFormulario}
                  disabled={loading}
                >
                  <Ionicons name="close-circle-outline" size={24} color={Colors.text.light} />
                  <Text style={styles.buttonTextSecondary}>Cancelar Edición</Text>
                </TouchableOpacity>
              </>
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="arrow-up-circle-outline" size={50} color={Colors.text.light} />
                <Text style={styles.emptyText}>Por favor, selecciona un usuario arriba</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    padding: Spacing.xxxl,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: FontSizes.md,
    color: Colors.text.secondary,
  },
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
  divider: {
    height: 1,
    backgroundColor: Colors.text.light,
    opacity: 0.2,
    marginVertical: Spacing.lg,
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
    height: 50, // Altura fija igual que el Picker
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
  button: {
    backgroundColor: Colors.primary.blue,
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
    borderColor: Colors.text.light,
  },
  buttonTextSecondary: {
    color: Colors.text.light,
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    marginLeft: Spacing.sm,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl,
    opacity: 0.7,
  },
  emptyText: {
    fontSize: FontSizes.md,
    color: Colors.text.secondary,
    marginTop: Spacing.sm,
  },
});

export default EditarUsuario;