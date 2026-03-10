import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import {
  FlatList,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;

  const fetchData = async () => {
    try {
      setLoading(true);
      const [newsRes, avisosRes] = await Promise.all([
        supabase.from('noticias').select('*, profiles:email_user(nombre, rol)').order('id', { ascending: false }).limit(5),
        supabase.from('avisos').select('*, profiles:email_user(nombre, rol)').order('id', { ascending: false }).limit(5)
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

  // Recibimos "isLast" para saber si es la última tarjeta y quitarle el margen sobrante
  const renderSafeCard = (item: any, isCarousel = false, isLast = false) => {
    const safeData = {
      ...item,
      titulo: item.titulo || "Sin título",
      contenido: item.contenido || "",
      imagen_url: item.imagen_url,
      created_at: item.fecha || item.created_at || new Date().toISOString(),
      profiles: item.profiles || { nombre: "Anónimo", rol: "Vecino" }
    };

    return (
      <View 
        key={item.id} 
        style={[
          styles.cardWrapper, 
          isCarousel 
            ? { width: width * 0.75, marginRight: isLast ? 0 : 12, marginBottom: 0 } 
            : { marginBottom: isLast ? 0 : 12 } // Si es la última tarjeta vertical, no hay margen inferior
        ]}
      >
        <NewsCard noticia={safeData} readOnly={true} />
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background.main }}>
      <View style={styles.container}>
        <ScrollView 
          contentContainerStyle={{ paddingBottom: insets.bottom + 20 }} 
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchData} />}
        >
          
          <View style={styles.welcomeCard}>
            <Ionicons name="person-circle-outline" size={60} color={Colors.primary.orange} />
            <Text style={styles.welcomeText}>¡Bienvenido!</Text>
            <Text style={styles.userName}>{profile?.nombre || user?.email}</Text>
            {profile?.rol && <Text style={styles.roleLabel}>{profile.rol}</Text>}
          </View>

          {isDesktop ? (
            /* VERSIÓN WEB -- Columnas verticales */
            <View style={styles.columnsContainer}>
              {/* NOTICIAS */}
              <View style={styles.column}>
                <View style={styles.columnHeader}>
                  <Ionicons name="newspaper-outline" size={24} color={Colors.primary.blue} />
                  <Text style={styles.columnTitle}>Últimas Noticias</Text>
                </View>

                {noticias.length > 0 ? (
                  <View style={styles.columnNoticiasContent}>
                    {noticias.map((item, index) => renderSafeCard(item, false, index === noticias.length - 1))}
                  </View>
                ) : (
                  <Text style={styles.emptyText}>No hay noticias recientes.</Text>
                )}

                <TouchableOpacity style={styles.verTodasButton} onPress={() => navigation.navigate('Noticias')}>
                  <Text style={styles.verTodasText}>Ver todas las noticias</Text>
                </TouchableOpacity>
              </View>

              {/* AVISOS */}
              <View style={styles.column}>
                <View style={styles.columnHeader}>
                  <Ionicons name="megaphone-outline" size={24} color={Colors.primary.orange} />
                  <Text style={styles.columnTitle}>Avisos Recientes</Text>
                </View>

                {avisos.length > 0 ? (
                  <View style={styles.columnAvisosContent}>
                    {avisos.map((item, index) => renderSafeCard(item, false, index === avisos.length - 1))}
                  </View>
                ) : (
                  <Text style={styles.emptyText}>No hay avisos recientes.</Text>
                )}

                <TouchableOpacity style={styles.verTodasButton} onPress={() => navigation.navigate('Avisos')}>
                  <Text style={styles.verTodasText}>Ver todos los avisos</Text>
                </TouchableOpacity>
              </View>
            </View>

          ) : (
            /* Versión Mobile (Carruseles Horizontales Enmarcados) */
            <View style={styles.carouselContainer}>
              
              {/* SECCIÓN NOTICIAS */}
              <View style={styles.sectionHeader}>
                <View style={styles.titleRow}>
                  <Ionicons name="newspaper-outline" size={24} color={Colors.primary.blue} />
                  <Text style={styles.sectionTitle}>Últimas Noticias</Text>
                </View>
                <TouchableOpacity onPress={() => navigation.navigate('Noticias')}>
                  <Text style={styles.verTodasTextMobile}>Ver todas</Text>
                </TouchableOpacity>
              </View>

              {noticias.length > 0 ? (
                <View style={styles.carouselBoxGreen}>
                  <FlatList
                    horizontal
                    showsHorizontalScrollIndicator={Platform.OS === 'web'} 
                    data={noticias}
                    keyExtractor={item => item.id.toString()}
                    renderItem={({ item, index }) => renderSafeCard(item, true, index === noticias.length - 1)}
                    contentContainerStyle={styles.carouselInnerPadding}
                  />
                </View>
              ) : (
                <Text style={styles.emptyText}>No hay noticias recientes.</Text>
              )}

              {/* SECCIÓN AVISOS */}
              <View style={[styles.sectionHeader, { marginTop: Spacing.xl }]}>
                <View style={styles.titleRow}>
                  <Ionicons name="megaphone-outline" size={24} color={Colors.primary.orange} />
                  <Text style={styles.sectionTitle}>Avisos Recientes</Text>
                </View>
                <TouchableOpacity onPress={() => navigation.navigate('Avisos')}>
                  <Text style={styles.verTodasTextMobile}>Ver todos</Text>
                </TouchableOpacity>
              </View>

              {avisos.length > 0 ? (
                <View style={styles.carouselBoxOrange}>
                  <FlatList
                    horizontal
                    showsHorizontalScrollIndicator={Platform.OS === 'web'}
                    data={avisos}
                    keyExtractor={item => item.id.toString()}
                    renderItem={({ item, index }) => renderSafeCard(item, true, index === avisos.length - 1)}
                    contentContainerStyle={styles.carouselInnerPadding}
                  />
                </View>
              ) : (
                <Text style={styles.emptyText}>No hay avisos recientes.</Text>
              )}

            </View>
          )}

        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  welcomeCard: { 
    backgroundColor: Colors.base.white, 
    margin: Spacing.lg, 
    padding: Spacing.xl, 
    borderRadius: BorderRadius.lg, 
    alignItems: 'center', 
    ...Shadows.medium 
  },
  welcomeText: { fontSize: FontSizes.xxl, fontWeight: FontWeights.bold, color: Colors.text.primary },
  userName: { fontSize: FontSizes.lg, color: Colors.primary.blue, marginTop: Spacing.xs },
  roleLabel: { fontSize: FontSizes.xs, color: Colors.text.secondary, fontStyle: 'italic', marginTop: Spacing.xs },
  
  //  estilos web
  columnsContainer: { flexDirection: 'row', paddingHorizontal: Spacing.md, paddingBottom: Spacing.xl },
  column: { flex: 1, paddingHorizontal: Spacing.sm },
  columnHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md, justifyContent: 'center' },
  columnTitle: { fontSize: FontSizes.lg, fontWeight: FontWeights.bold, marginLeft: 8, color: Colors.text.primary },
  
  // Las cajas verticalespadding exacto de 12 por todos lados, un ancho del 100% y centrado.
  columnNoticiasContent: { 
    backgroundColor: Colors.primary.green, 
    padding: 12, // el padding es simétrico porque la última tarjeta ya no tiene margen inferior
    borderRadius: BorderRadius.md, 
    ...Shadows.small, 
    marginBottom: Spacing.sm,
    width: '100%',
    maxWidth: 600, // Evita que se deforme en monitores muy anchos
    alignSelf: 'center'
  },
  columnAvisosContent: { 
    backgroundColor: Colors.primary.orange, 
    padding: 12, 
    borderRadius: BorderRadius.md, 
    ...Shadows.small, 
    marginBottom: Spacing.sm,
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center'
  },
  verTodasButton: { alignSelf: 'center', paddingVertical: Spacing.sm, paddingHorizontal: Spacing.lg, backgroundColor: Colors.base.white, borderRadius: BorderRadius.xl, borderWidth: 1, borderColor: Colors.primary.blue, marginTop: Spacing.sm, marginBottom: Spacing.xl },
  verTodasText: { color: Colors.primary.blue, fontWeight: 'bold', fontSize: FontSizes.sm },

  // estilos mobile (Carruseles Enmarcados)
  carouselContainer: { paddingBottom: Spacing.xl },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.lg, marginBottom: Spacing.sm }, 
  titleRow: { flexDirection: 'row', alignItems: 'center' },
  sectionTitle: { fontSize: FontSizes.lg, fontWeight: FontWeights.bold, marginLeft: 8, color: Colors.text.primary },
  verTodasTextMobile: { color: Colors.primary.blue, fontWeight: 'bold', fontSize: FontSizes.sm },
  
  carouselBoxGreen: {
    backgroundColor: Colors.primary.green,
    paddingVertical: 12, 
    marginHorizontal: Spacing.lg, 
    borderRadius: BorderRadius.md,
    ...Shadows.small,
  },
  carouselBoxOrange: {
    backgroundColor: Colors.primary.orange,
    paddingVertical: 12,
    marginHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    ...Shadows.small,
  },
  carouselInnerPadding: { 
    paddingHorizontal: 12, 
  },
  
  // ESTILOS GENERALES
  emptyText: { textAlign: 'center', color: Colors.text.light, fontStyle: 'italic', marginVertical: Spacing.lg },
  cardWrapper: { width: '100%' },
});

export default Inicio;