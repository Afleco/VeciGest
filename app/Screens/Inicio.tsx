import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
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
import { supabase } from '../../SupaBase/Supabase';
import { BorderRadius, Colors, FontSizes, FontWeights, Shadows, Spacing } from '../theme';

const Noticias = () => {
  const navigation = useNavigation<any>();
  const [refreshing, setRefreshing] = useState(false);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    getUserInfo();
  }, []);

  const getUserInfo = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: userData } = await supabase
          .from('usuarios')
          .select('nombre')
          .eq('auth_id', user.id)
          .single();

        if (userData) {
          setUserName(userData.nombre);
        }
      }
    } catch (error) {
      console.error('Error obteniendo información del usuario:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    // Aquí irá la lógica para cargar noticias desde Supabase
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulación
    setRefreshing(false);
  };

  const handleSignOut = async () => {
    const confirmSignOut = () => {
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

    const performSignOut = async () => {
      const { error } = await supabase.auth.signOut();
      if (!error) {
        navigation.navigate('Login');
      } else {
        if (Platform.OS === 'web') {
          window.alert('Error: No se pudo cerrar sesión');
        } else {
          Alert.alert('Error', 'No se pudo cerrar sesión');
        }
      }
    };

    confirmSignOut();
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
          {userName ? <Text style={styles.userName}>{userName}</Text> : null}
        </View>

        {/* Sección de Noticias */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="newspaper-outline" size={24} color={Colors.primary.blue} />
            <Text style={styles.sectionTitle}>Últimas Noticias</Text>
          </View>

          {/* Placeholder para noticias - Aquí irán las noticias de Supabase */}
          <View style={styles.newsCard}>
            <View style={styles.newsHeader}>
              <Ionicons name="megaphone-outline" size={20} color={Colors.primary.orange} />
              <Text style={styles.newsTitle}>Información importante</Text>
            </View>
            <Text style={styles.newsDate}>Hace 2 horas</Text>
            <Text style={styles.newsContent}>
              Próximamente podrás ver aquí todas las noticias y comunicados de tu comunidad.
            </Text>
          </View>

          <View style={styles.newsCard}>
            <View style={styles.newsHeader}>
              <Ionicons name="calendar-outline" size={20} color={Colors.primary.orange} />
              <Text style={styles.newsTitle}>Próximos eventos</Text>
            </View>
            <Text style={styles.newsDate}>Hace 1 día</Text>
            <Text style={styles.newsContent}>
              Las reuniones y eventos de la comunidad aparecerán listados en esta sección.
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

export default Noticias;