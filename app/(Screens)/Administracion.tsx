import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../SupaBase/Supabase';
import { BorderRadius, Colors, FontSizes, FontWeights, Shadows, Spacing } from '../../styles/theme';

const Administracion = () => {
  const [userRole, setUserRole] = useState('');
  const navigation = useNavigation<any>();

  useEffect(() => {
    getUserRole();
  }, []);

  const getUserRole = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: userData } = await supabase
          .from('usuarios')
          .select('rol')
          .eq('auth_id', user.id)
          .single();

        if (userData) {
          setUserRole(userData.rol);
        }
      }
    } catch (error) {
      console.error('Error obteniendo rol:', error);
    }
  };

  const showAlert = (titulo: string, mensaje: string) => {
    if (Platform.OS === 'web') {
      window.alert(`${titulo}: ${mensaje}`);
    } else {
      Alert.alert(titulo, mensaje);
    }
  };

  const adminOptions = [
    {
      id: 1,
      title: 'Gestión de Usuarios',
      description: 'Administrar vecinos y permisos',
      icon: 'people-outline',
      color: Colors.primary.blue,
      action: () => navigation.navigate('GestionUsuarios')
    },
    {
      id: 2,
      title: 'Gestión de Noticias',
      description: 'Publicar y editar comunicados',
      icon: 'newspaper-outline',
      color: Colors.primary.orange,
      action: () => showAlert('Próximamente', 'Gestión de noticias en desarrollo')
    },
    {
      id: 3,
      title: 'Gestión de Incidencias',
      description: 'Ver y gestionar reportes',
      icon: 'warning-outline',
      color: Colors.primary.green,
      action: () => showAlert('Próximamente', 'Gestión de incidencias en desarrollo')
    },
    {
      id: 4,
      title: 'Gestión de Cuotas',
      description: 'Control de pagos y recibos',
      icon: 'cash-outline',
      color: Colors.primary.blue,
      action: () => showAlert('Próximamente', 'Gestión de cuotas en desarrollo')
    },
    {
      id: 5,
      title: 'Mensajería',
      description: 'Comunicación con vecinos',
      icon: 'chatbubbles-outline',
      color: Colors.primary.orange,
      action: () => showAlert('Próximamente', 'Sistema de mensajería en desarrollo')
    },
    {
      id: 6,
      title: 'Configuración',
      description: 'Ajustes de la comunidad',
      icon: 'settings-outline',
      color: Colors.primary.green,
      action: () => showAlert('Próximamente', 'Configuración en desarrollo')
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Cabecera */}
        <View style={styles.headerCard}>
          <Ionicons name="shield-checkmark-outline" size={60} color={Colors.primary.orange} />
          <Text style={styles.headerTitle}>Panel de Administración</Text>
          {userRole ? (
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{userRole}</Text>
            </View>
          ) : null}
        </View>

        {/* Opciones de Administración */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Opciones Administrativas</Text>
          
          {adminOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={styles.optionCard}
              onPress={option.action}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, { backgroundColor: option.color }]}>
                <Ionicons name={option.icon as any} size={28} color={Colors.base.white} />
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>{option.title}</Text>
                <Text style={styles.optionDescription}>{option.description}</Text>
              </View>
              <Ionicons name="chevron-forward-outline" size={24} color={Colors.text.light} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Información */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle-outline" size={24} color={Colors.primary.blue} />
          <Text style={styles.infoText}>
            Como {userRole}, tienes acceso a funciones administrativas de la comunidad. 
            Las nuevas funcionalidades se irán habilitando en próximas actualizaciones.
          </Text>
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
  scrollView: {
    flex: 1,
  },
  headerCard: {
    backgroundColor: Colors.background.card,
    margin: Spacing.lg,
    padding: Spacing.xxl,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    ...Shadows.medium,
  },
  headerTitle: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.bold,
    color: Colors.text.primary,
    marginTop: Spacing.md,
    textAlign: 'center',
  },
  roleBadge: {
    backgroundColor: Colors.primary.green,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 6,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.md,
  },
  roleText: {
    color: Colors.base.white,
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold,
  },
  section: {
    margin: Spacing.lg,
    marginTop: Spacing.sm,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
    marginLeft: Spacing.xs,
  },
  optionCard: {
    backgroundColor: Colors.background.card,
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    ...Shadows.small,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.lg,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  optionDescription: {
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
  },
  infoCard: {
    backgroundColor: Colors.background.card,
    flexDirection: 'row',
    margin: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary.blue,
    ...Shadows.small,
  },
  infoText: {
    flex: 1,
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
    marginLeft: Spacing.md,
    lineHeight: 20,
  },
});

export default Administracion;