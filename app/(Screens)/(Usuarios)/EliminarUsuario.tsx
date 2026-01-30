import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../../SupaBase/Supabase';
import { BorderRadius, Colors, FontSizes, FontWeights, Shadows, Spacing } from '../../../styles/theme';

interface Usuario {
  email: string;
  vivienda_id: string;
  nombre: string;
  rol: string;
  auth_id: string;
}

const EliminarUsuario = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState('');
  const [usuarioInfo, setUsuarioInfo] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(false);

  useFocusEffect(
      useCallback(() => {
        cargarUsuarios();
      }, [])
    );

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

  const handleSeleccionarUsuario = (authId: string) => {
    setUsuarioSeleccionado(authId);
    const usuario = usuarios.find((u) => u.auth_id === authId);
    setUsuarioInfo(usuario || null);
  };

  const showAlert = (titulo: string, mensaje: string) => {
    if (Platform.OS === 'web') {
      window.alert(`${titulo}: ${mensaje}`);
    } else {
      Alert.alert(titulo, mensaje);
    }
  };

  const confirmarEliminacion = () => {
    if (!usuarioInfo) return;

    if (Platform.OS === 'web') {
      if (window.confirm(`¿Estás seguro de que quieres eliminar a ${usuarioInfo.nombre}? Esta acción no se puede deshacer.`)) {
        handleEliminarUsuario();
      }
    } else {
      Alert.alert(
        'Confirmar Eliminación',
        `¿Estás seguro de que quieres eliminar a ${usuarioInfo.nombre}? Esta acción no se puede deshacer.`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { 
            text: 'Eliminar', 
            onPress: handleEliminarUsuario, 
            style: 'destructive' 
          },
        ]
      );
    }
  };

  const handleEliminarUsuario = async () => {
    if (!usuarioSeleccionado) {
      showAlert('Error', 'Debes seleccionar un usuario');
      return;
    }

    setLoading(true);

    try {
      // fixed: Usamos la RPC 'delete_user_full' en lugar de delete() directo
      // Para borrar tanto de 'auth.users' como de 'public.usuarios'
      const { error } = await supabase.rpc('delete_user_full', {
        target_user_id: usuarioSeleccionado
      });

      if (error) throw error;
      
      showAlert('Éxito', 'Usuario eliminado correctamente del sistema');
      
      // Limpiamos y recargamos
      setUsuarioSeleccionado('');
      setUsuarioInfo(null);
      cargarUsuarios();
      
    } catch (error: any) {
      console.error('Error eliminando usuario:', error);
      showAlert('Error', error.message || 'No se pudo eliminar el usuario');
    } finally {
      setLoading(false);
    }
  };

  const getRolColor = (rol: string) => {
    switch (rol) {
      case 'Administrador':
        return Colors.primary.orange;
      case 'Presidente':
        return Colors.primary.green;
      case 'Vicepresidente':
        return Colors.primary.blue;
      default:
        return Colors.text.light;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView>
        <View style={styles.header}>
          <Ionicons name="trash" size={50} color={Colors.status.error} />
          <Text style={styles.title}>Eliminar Usuario</Text>
          <Text style={styles.subtitle}>Selecciona el usuario que deseas eliminar</Text>
        </View>

        <View style={styles.form}>
          {/* Select de Usuario */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Seleccionar Usuario *</Text>
            <View style={styles.pickerContainer}>
              <Ionicons name="people-outline" size={20} color={Colors.text.light} style={styles.inputIcon} />
              <Picker
                selectedValue={usuarioSeleccionado}
                onValueChange={handleSeleccionarUsuario}
                style={styles.picker}
                enabled={!loading}
              >
                <Picker.Item label="Selecciona un usuario" value="" />
                {usuarios.map((usuario) => (
                  <Picker.Item
                    key={usuario.auth_id}
                    label={`${usuario.nombre} (${usuario.email})`}
                    value={usuario.auth_id}
                  />
                ))}
              </Picker>
            </View>
          </View>

          {usuarioInfo ? (
            <>
              {/* Información del Usuario */}
              <View style={styles.warningCard}>
                <Ionicons name="warning" size={30} color={Colors.status.error} />
                <Text style={styles.warningTitle}>¡Atención!</Text>
                <Text style={styles.warningText}>
                  Estás a punto de eliminar este usuario de forma permanente (login y datos). Esta acción no se puede deshacer.
                </Text>
              </View>

              <View style={styles.infoCard}>
                <View style={styles.infoHeader}>
                  <Ionicons name="person-circle" size={60} color={Colors.primary.blue} />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoName}>{usuarioInfo.nombre}</Text>
                    <Text style={styles.infoEmail}>{usuarioInfo.email}</Text>
                  </View>
                </View>

                <View style={styles.infoDetails}>
                  <View style={styles.infoRow}>
                    <Ionicons name="home-outline" size={20} color={Colors.text.secondary} />
                    <Text style={styles.infoText}>Vivienda: {usuarioInfo.vivienda_id || 'No asignada'}</Text>
                  </View>
                  
                  <View style={styles.infoRow}>
                    <Ionicons name="shield-outline" size={20} color={Colors.text.secondary} />
                    <View style={[styles.roleBadge, { backgroundColor: getRolColor(usuarioInfo.rol) }]}>
                      <Text style={styles.roleText}>{usuarioInfo.rol}</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Botones */}
              <TouchableOpacity
                style={[styles.buttonDanger, loading && { opacity: 0.7 }]}
                onPress={confirmarEliminacion}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={Colors.base.white} />
                ) : (
                  <>
                    <Ionicons name="trash-outline" size={24} color={Colors.base.white} />
                    <Text style={styles.buttonText}>Eliminar Definitivamente</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.buttonSecondary}
                onPress={() => {
                  setUsuarioSeleccionado('');
                  setUsuarioInfo(null);
                }}
                disabled={loading}
              >
                <Ionicons name="close-circle-outline" size={24} color={Colors.text.secondary} />
                <Text style={styles.buttonTextSecondary}>Cancelar</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="person-remove-outline" size={80} color={Colors.text.light} />
              <Text style={styles.emptyText}>Selecciona un usuario para eliminar</Text>
            </View>
          )}
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
  pickerContainer: {
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
  picker: {
    flex: 1,
    height: 50,
  },
  warningCard: {
    backgroundColor: '#FFF3CD',
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    marginBottom: Spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: Colors.status.error,
  },
  warningTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: Colors.status.error,
    marginTop: Spacing.sm,
  },
  warningText: {
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  infoCard: {
    backgroundColor: Colors.base.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    ...Shadows.small,
  },
  infoHeader: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
  },
  infoContent: {
    flex: 1,
    marginLeft: Spacing.md,
    justifyContent: 'center',
  },
  infoName: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  infoEmail: {
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
  },
  infoDetails: {
    borderTopWidth: 1,
    borderTopColor: Colors.background.main,
    paddingTop: Spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  infoText: {
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
    marginLeft: Spacing.sm,
  },
  roleBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    marginLeft: Spacing.sm,
  },
  roleText: {
    color: Colors.base.white,
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.semibold,
  },
  buttonDanger: {
    backgroundColor: Colors.status.error,
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
    color: Colors.text.secondary,
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    marginLeft: Spacing.sm,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxxl * 2,
  },
  emptyText: {
    fontSize: FontSizes.md,
    color: Colors.text.light,
    marginTop: Spacing.md,
  },
});

export default EliminarUsuario;