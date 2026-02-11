import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native'; // <--- CORREGIDO AQUÍ
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../providers/AuthProvider';
import { BorderRadius, Colors, FontSizes, FontWeights, Shadows, Spacing } from '../../styles/theme';
import NewsCard from '../components/NewsCard'; // Asegúrate de tener este componente creado

const Inicio = () => {
  const [noticias, setNoticias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation<any>();
  
  const { profile, user } = useAuth();

  const fetchNoticiasRecientes = async () => {
    try {
      const { data, error } = await supabase
        .from('noticias')
        .select(`
          *,
          profiles:email_user ( nombre, rol )
        `)
        .order('id', { ascending: false })
        .limit(4); // Solo las últimas 4

      if (error) throw error;
      setNoticias(data || []);
    } catch (error: any) {
      console.error('Error:', error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchNoticiasRecientes();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchNoticiasRecientes();
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background.main }}>
      <SafeAreaView style={styles.container}>
        <ScrollView 
          style={styles.scrollView}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {/* Bienvenida */}
          <View style={styles.welcomeCard}>
            <Ionicons name="person-circle-outline" size={60} color={Colors.primary.orange} />
            <Text style={styles.welcomeText}>¡Bienvenido!</Text>
            <Text style={styles.userName}>{profile?.nombre || user?.email}</Text>
            {profile?.rol && <Text style={styles.roleLabel}>{profile.rol}</Text>}
          </View>

          {/* Sección Noticias Recientes */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Ionicons name="newspaper-outline" size={24} color={Colors.primary.blue} />
                <Text style={styles.sectionTitle}>Últimas Noticias</Text>
              </View>
              {/* Navegación a la pantalla completa de Noticias */}
              <TouchableOpacity onPress={() => navigation.navigate('Noticias')}>
                <Text style={styles.seeAllText}>Ver todas</Text>
              </TouchableOpacity>
            </View>

            {loading ? (
              <ActivityIndicator size="large" color={Colors.primary.blue} style={{ marginTop: 20 }} />
            ) : noticias.length > 0 ? (
              noticias.map((item) => (
                <NewsCard 
                  key={item.id} 
                  noticia={item} 
                  readOnly={true} // Modo solo lectura para el Inicio
                />
              ))
            ) : (
              <Text style={styles.emptyText}>No hay noticias recientes.</Text>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
  },
  scrollView: { 
    flex: 1 
  },
  section: { 
    margin: Spacing.lg 
  },
  sectionHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    marginBottom: Spacing.md 
  },
  sectionTitle: { 
    fontSize: FontSizes.xl, 
    fontWeight: FontWeights.bold, 
    marginLeft: Spacing.sm, 
    color: Colors.text.primary 
  },
  seeAllText: {
    color: Colors.primary.blue,
    fontWeight: 'bold',
    fontSize: FontSizes.sm,
  },
  welcomeCard: { 
    backgroundColor: Colors.background.card, 
    margin: Spacing.lg, 
    padding: Spacing.xxl, 
    borderRadius: BorderRadius.lg, 
    alignItems: 'center', 
    ...Shadows.medium 
  },
  welcomeText: { 
    fontSize: FontSizes.xxl, 
    fontWeight: FontWeights.bold, 
    color: Colors.text.primary, 
    marginTop: Spacing.md 
  },
  userName: { 
    fontSize: FontSizes.lg, 
    color: Colors.primary.blue, 
    marginTop: Spacing.xs 
  },
  roleLabel: { 
    fontSize: FontSizes.xs, 
    color: Colors.text.secondary, 
    fontStyle: 'italic', 
    marginTop: 4 
  },
  emptyText: { 
    textAlign: 'center', 
    color: Colors.text.light, 
    marginTop: 20 
  },
});

export default Inicio;