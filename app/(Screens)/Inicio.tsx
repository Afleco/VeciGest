import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Alert,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../providers/AuthProvider'; // Importamos el hook para usar el perfil
import { BorderRadius, Colors, FontSizes, FontWeights, Shadows, Spacing } from '../../styles/theme';

const Inicio = () => {
  const [refreshing, setRefreshing] = useState(false);
  
  // Usamos los datos del contexto 
  const { profile, user } = useAuth();
  // Si por alguna razón el perfil tarda un poco en cargar, usamos un fallback
  const userName = profile?.nombre || user?.email || 'Usuario';

  const onRefresh = async () => {
    setRefreshing(true);
    // Noticias aquí ? 
    await new Promise(resolve => setTimeout(resolve, 1000)); 
    setRefreshing(false);
  };

  const handleSignOut = async () => {
    const performSignOut = async () => {
      try {
        const { error } = await supabase.auth.signOut();
        if (error) {
          Alert.alert('Error', 'No se pudo cerrar sesión');
        }
        
        // El AuthProvider detectará el "SIGNED_OUT" y nos llevará al login solo.
      } catch (error) {
        console.error(error);
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm('¿Estás seguro de que quieres cerrar sesión?')) {
        performSignOut();
      }
    } else {
      Alert.alert(
        'Cerrar Sesión',
        '¿Estás seguro de que quieres cerrar sesión?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Cerrar Sesión', onPress: performSignOut, style: 'destructive' }
        ]
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={[Colors.primary.orange]}
            tintColor={Colors.primary.orange}
          />
        }
      >
        {/* Cabecera de Bienvenida */}
        <View style={styles.welcomeCard}>
          <Ionicons name="person-circle-outline" size={60} color={Colors.primary.orange} />
          <Text style={styles.welcomeText}>¡Bienvenido!</Text>
          <Text style={styles.userName}>{userName}</Text>
        </View>

        {/* Sección de Noticias */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="newspaper-outline" size={24} color={Colors.primary.blue} />
            <Text style={styles.sectionTitle}>Últimas Noticias</Text>
          </View>

          <View style={styles.newsCard}>
            <View style={styles.newsHeader}>
              <Ionicons name="megaphone-outline" size={20} color={Colors.primary.orange} />
              <Text style={styles.newsTitle}>Información importante</Text>
            </View>
            <Text style={styles.newsDate}>Hace 4 días</Text>
            <Text style={styles.newsContent}>
              El sistema de gestión de usuarios ya está operativo.
            </Text>
          </View>

          <View style={styles.newsCard}>
            <View style={styles.newsHeader}>
              <Ionicons name="calendar-outline" size={20} color={Colors.primary.orange} />
              <Text style={styles.newsTitle}>Próximos eventos</Text>
            </View>
            <Text style={styles.newsDate}>Hace 1 día</Text>
            <Text style={styles.newsContent}>
              Revisión de cuotas anuales programada para el próximo mes.
            </Text>
          </View>
        </View>

        {/* Botones de Acción */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={onRefresh}
          >
            <Ionicons name="refresh-outline" size={24} color={Colors.base.white} />
            <Text style={styles.actionButtonText}>Actualizar Noticias</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.signOutButton]}
            onPress={handleSignOut}
          >
            <Ionicons name="log-out-outline" size={24} color={Colors.base.white} />
            <Text style={styles.actionButtonText}>Cerrar Sesión</Text>
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
  scrollView: {
    flex: 1,
  },
  welcomeCard: {
    backgroundColor: Colors.background.card,
    margin: Spacing.lg,
    padding: Spacing.xxl,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    ...Shadows.medium,
  },
  welcomeText: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.bold,
    color: Colors.text.primary,
    marginTop: Spacing.md,
  },
  userName: {
    fontSize: FontSizes.lg,
    color: Colors.primary.blue,
    marginTop: Spacing.xs,
    fontWeight: FontWeights.semibold,
  },
  section: {
    margin: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    color: Colors.text.primary,
    marginLeft: Spacing.sm,
  },
  newsCard: {
    backgroundColor: Colors.background.card,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    ...Shadows.small,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary.green,
  },
  newsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  newsTitle: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
    color: Colors.text.primary,
    marginLeft: Spacing.sm,
    flex: 1,
  },
  newsDate: {
    fontSize: FontSizes.xs,
    color: Colors.text.light,
    marginBottom: Spacing.sm,
  },
  newsContent: {
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  actionsContainer: {
    margin: Spacing.lg,
    marginTop: Spacing.sm,
  },
  actionButton: {
    backgroundColor: Colors.primary.blue,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.md,
    ...Shadows.medium,
  },
  signOutButton: {
    backgroundColor: Colors.primary.orange,
  },
  actionButtonText: {
    color: Colors.base.white,
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
    marginLeft: Spacing.sm,
  },
});

export default Inicio;