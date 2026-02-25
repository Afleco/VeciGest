import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import {
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
import NewsCard from '../components/NewsCard';

const Inicio = () => {
  const [noticias, setNoticias] = useState<any[]>([]);
  const [avisos, setAvisos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation<any>();
  const { profile, user } = useAuth();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [newsRes, avisosRes] = await Promise.all([
        supabase.from('noticias').select('*, profiles:email_user(nombre, rol)').order('id', { ascending: false }).limit(3),
        supabase.from('avisos').select('*, profiles:email_user(nombre, rol)').order('id', { ascending: false }).limit(3)
      ]);

      setNoticias(newsRes.data || []);
      setAvisos(avisosRes.data || []);
    } catch (error: any) {
      console.error('Error:', error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchData(); }, []));

  //Definimos los campos para las tarjetas de noticias y avisos
  const renderSafeCard = (item: any) => {
    const safeData = {
      ...item,
      titulo: item.titulo || "Sin título",
      contenido: item.contenido || "",
      imagen_url: item.imagen_url,
      created_at: item.fecha || item.created_at || new Date().toISOString(),
      profiles: item.profiles || { nombre: "Anónimo", rol: "Vecino" }
    };

    return (
      <View key={item.id} style={styles.cardWrapper}>
        <NewsCard noticia={safeData} readOnly={true} />
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background.main }}>
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchData} />}>
          
          <View style={styles.welcomeCard}>
            <Ionicons name="person-circle-outline" size={60} color={Colors.primary.orange} />
            <Text style={styles.welcomeText}>¡Bienvenido!</Text>
            <Text style={styles.userName}>{profile?.nombre || user?.email}</Text>
            {profile?.rol && <Text style={styles.roleLabel}>{profile.rol}</Text>}
          </View>

          <View style={styles.columnsContainer}>
            {/* COLUMNA IZQUIERDA: NOTICIAS */}
            <View style={styles.column}>
              {/* Título por fuera del color */}
              <View style={styles.columnHeader}>
                <Ionicons name="newspaper-outline" size={20} color={Colors.primary.blue} />
                <Text style={styles.columnTitle}>Noticias</Text>
              </View>

              {/* Si hay noticias, pintamos la caja de fondo verde. Si no, solo el texto sin fondo */}
              {noticias.length > 0 ? (
                <View style={styles.columnNoticiasContent}>
                  {noticias.map(item => renderSafeCard(item))}
                </View>
              ) : (
                <Text style={styles.emptyText}>No hay noticias recientes.</Text>
              )}

              <TouchableOpacity onPress={() => navigation.navigate('Noticias')}>
                <Text style={styles.seeMore}>Ver todas</Text>
              </TouchableOpacity>
            </View>

            {/* COLUMNA DERECHA: AVISOS */}
            <View style={styles.column}>
              {/* Título por fuera del color */}
              <View style={styles.columnHeader}>
                <Ionicons name="megaphone-outline" size={20} color={Colors.primary.orange} />
                <Text style={styles.columnTitle}>Avisos</Text>
              </View>

              {/* Si hay avisos, pintamos la caja de fondo naranja. Si no, solo el texto sin fondo */}
              {avisos.length > 0 ? (
                <View style={styles.columnAvisosContent}>
                  {avisos.map(item => renderSafeCard(item))}
                </View>
              ) : (
                <Text style={styles.emptyText}>No hay avisos recientes.</Text>
              )}

              <TouchableOpacity onPress={() => navigation.navigate('Avisos')}>
                <Text style={styles.seeMore}>Ver todos</Text>
              </TouchableOpacity>
            </View>
          </View>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  welcomeCard: { 
    backgroundColor: Colors.background.card, 
    margin: Spacing.lg, 
    padding: Spacing.xl, 
    borderRadius: BorderRadius.lg, 
    alignItems: 'center', 
    ...Shadows.medium 
  },
  welcomeText: { fontSize: FontSizes.xxl, fontWeight: FontWeights.bold, color: Colors.text.primary },
  userName: { fontSize: FontSizes.lg, color: Colors.primary.blue },
  roleLabel: { fontSize: FontSizes.xs, color: Colors.text.secondary, fontStyle: 'italic' },
  
  columnsContainer: { 
    flexDirection: 'row', 
    paddingHorizontal: Spacing.xs,
    paddingBottom: Spacing.xl
  },
  column: { 
    flex: 1, 
    paddingHorizontal: 4 
  },
  columnHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: Spacing.sm, 
    justifyContent: 'center'
  },
  columnTitle: { 
    fontSize: FontSizes.md, 
    fontWeight: FontWeights.bold, 
    marginLeft: 5,
    color: Colors.text.primary 
  },
  // --- CAJAS DE FONDO PARA LAS CARDS ---
  columnNoticiasContent: {
    backgroundColor: Colors.primary.green,
    padding: 6, // Reducido para que la tarjeta ocupe más espacio
    paddingTop: 8,
    borderRadius: BorderRadius.md,
    ...Shadows.small,
    marginBottom: Spacing.sm,
  },
  columnAvisosContent: {
    backgroundColor: Colors.primary.orange,
    padding: 6, // Reducido para que la tarjeta ocupe más espacio
    paddingTop: 8,
    borderRadius: BorderRadius.md,
    ...Shadows.small,
    marginBottom: Spacing.sm,
  },
  emptyText: {
    textAlign: 'center',
    color: Colors.text.light,
    fontStyle: 'italic',
    marginVertical: Spacing.lg,
  },
  seeMore: {
    textAlign: 'center',
    color: Colors.primary.blue,
    fontWeight: 'bold',
    marginTop: Spacing.sm,
    fontSize: FontSizes.xs
  },
  cardWrapper: { 
    marginBottom: 8, // Reducido un poco para aprovechar espacio vertical
    width: '100%' 
  },
});

export default Inicio;