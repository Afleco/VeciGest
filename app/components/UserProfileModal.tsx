import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../providers/AuthProvider';
import { BorderRadius, Colors, FontSizes, FontWeights, Shadows, Spacing } from '../../styles/theme';

interface UserProfileModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function UserProfileModal({ visible, onClose }: UserProfileModalProps) {
  const { session, profile, refreshProfile } = useAuth();
  const [editNombre, setEditNombre] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Sincronizar el nombre editable cada vez que se abre el modal o cambia el perfil
  useEffect(() => {
    if (profile && visible) {
      setEditNombre(profile.nombre);
    }
  }, [profile, visible]);

  const handleUpdateProfile = async () => {
    const nombreLimpio = editNombre.trim();

    // Validación de vacío
    if (!nombreLimpio) {
      const msg = 'El nombre no puede estar vacío.';
      Platform.OS === 'web' ? window.alert(msg) : Alert.alert('Aviso', msg);
      return;
    }

    // Validación de longitud máxima
    if (nombreLimpio.length > 50) {
      const msg = 'El nombre no puede superar los 50 caracteres.';
      Platform.OS === 'web' ? window.alert(msg) : Alert.alert('Aviso', msg);
      return;
    }

    if (!session?.user.id) return;

    setIsSavingProfile(true);
    try {
      const { error } = await supabase
        .from('usuarios')
        .update({ nombre: nombreLimpio })
        .eq('auth_id', session.user.id);

      if (error) throw error;

      await refreshProfile(); // Recarga el perfil en toda la app
      
      const successMsg = 'Perfil actualizado correctamente.';
      Platform.OS === 'web' ? window.alert(successMsg) : Alert.alert('Éxito', successMsg);
      onClose(); // Cerramos el modal tras guardar con éxito
    } catch (error: any) {
      console.error('Error actualizando perfil:', error);
      const errMsg = 'Hubo un error al actualizar tu perfil.';
      Platform.OS === 'web' ? window.alert(errMsg) : Alert.alert('Error', errMsg);
    } finally {
      setIsSavingProfile(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.profileModalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.profileModalContent}>
              
              {/* Cabecera del Modal */}
              <View style={styles.profileModalHeader}>
                <Text style={styles.profileModalTitle}>Mi Perfil</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color={Colors.text.secondary} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Avatar Central */}
                <View style={styles.avatarContainer}>
                  {profile?.vivienda_id ? (
                    <View style={styles.largeUnitBadge}>
                      <Text style={styles.largeUnitText}>{profile.vivienda_id}</Text>
                    </View>
                  ) : (
                    <Ionicons name="person-circle" size={90} color={Colors.primary.blue} />
                  )}
                </View>

                {/* Formulario de Edición: Nombre */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Nombre Completo</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons name="person-outline" size={20} color={Colors.text.light} style={styles.inputIcon} />
                    <TextInput
                      style={styles.textInput}
                      value={editNombre}
                      onChangeText={setEditNombre}
                      placeholder="Tu nombre completo"
                      placeholderTextColor={Colors.text.light}
                      editable={!isSavingProfile}
                      maxLength={50}
                    />
                  </View>
                  {/* Contador de caracteres */}
                  <Text style={styles.charCounter}>
                    {editNombre.length}/50
                  </Text>
                </View>

                {/* Información de solo lectura */}
                <View style={styles.readOnlySection}>
                  <View style={styles.readOnlyRow}>
                    <Ionicons name="mail-outline" size={22} color={Colors.primary.orange} />
                    <View style={styles.readOnlyTextContainer}>
                      <Text style={styles.readOnlyLabel}>Correo Electrónico</Text>
                      <Text style={styles.readOnlyValue}>{profile?.email || session?.user?.email}</Text>
                    </View>
                  </View>

                  <View style={styles.readOnlyRow}>
                    <Ionicons name="home-outline" size={22} color={Colors.primary.green} />
                    <View style={styles.readOnlyTextContainer}>
                      <Text style={styles.readOnlyLabel}>Vivienda Asignada</Text>
                      <Text style={styles.readOnlyValue}>{profile?.vivienda_id || 'Sin asignar'}</Text>
                    </View>
                  </View>

                  <View style={styles.readOnlyRow}>
                    <Ionicons name="shield-checkmark-outline" size={22} color={Colors.primary.blue} />
                    <View style={styles.readOnlyTextContainer}>
                      <Text style={styles.readOnlyLabel}>Rol en la Comunidad</Text>
                      <Text style={styles.readOnlyValue}>{profile?.rol || 'Vecino'}</Text>
                    </View>
                  </View>
                </View>

                {/* Botón Guardar */}
                <TouchableOpacity 
                  style={[styles.saveButton, isSavingProfile && styles.saveButtonDisabled]} 
                  onPress={handleUpdateProfile}
                  disabled={isSavingProfile}
                >
                  {isSavingProfile ? (
                    <ActivityIndicator color={Colors.base.white} />
                  ) : (
                    <>
                      <Ionicons name="save-outline" size={20} color={Colors.base.white} />
                      <Text style={styles.saveButtonText}>Guardar Cambios</Text>
                    </>
                  )}
                </TouchableOpacity>
              </ScrollView>
              
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  profileModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  profileModalContent: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: Colors.base.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    ...Shadows.large,
  },
  profileModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  profileModalTitle: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    color: Colors.primary.blue,
  },
  closeButton: {
    padding: 4,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  largeUnitBadge: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: Colors.primary.blue,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.medium,
  },
  largeUnitText: {
    color: Colors.base.white,
    fontSize: 28,
    fontWeight: FontWeights.bold,
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  inputLabel: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    height: 50,
  },
  inputIcon: {
    marginRight: Spacing.sm,
  },
  textInput: {
    flex: 1,
    fontSize: FontSizes.md,
    color: Colors.text.primary,
    ...Platform.select({ web: { outlineStyle: 'none' } as any }),
  },
  // ESTILO PARA EL CONTADOR
  charCounter: {
    fontSize: 10,
    color: Colors.text.light,
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  readOnlySection: {
    marginTop: Spacing.xs,
    marginBottom: Spacing.xl,
  },
  readOnlyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.main,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  readOnlyTextContainer: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  readOnlyLabel: {
    fontSize: 11,
    color: Colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  readOnlyValue: {
    fontSize: FontSizes.md,
    fontWeight: '500',
    color: Colors.text.primary,
  },
  saveButton: {
    flexDirection: 'row',
    backgroundColor: Colors.primary.orange,
    paddingVertical: 14,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.small,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: Colors.base.white,
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
    marginLeft: Spacing.sm,
  },
});