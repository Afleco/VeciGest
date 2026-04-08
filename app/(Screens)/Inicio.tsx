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

    const fetchData = async () => {
        try {
            setLoading(true);
            const [newsRes, avisosRes] = await Promise.all([
                supabase.from('noticias').select('*, profiles:email_user(nombre, rol)').order('fecha', { ascending: false }).limit(5),
                supabase.from('avisos').select('*, profiles:email_user(nombre, rol)').order('fecha', { ascending: false }).limit(5) 
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

    useFocusEffect(useCallback(() => { fetchData(); }, [user?.email, profile?.rol]));

    const cardWidth = width > 500 ? 400 : width * 0.75;

    const getCarouselWidth = (itemCount: number) => {
        if (itemCount === 0) return 'auto';
        const totalCardsWidth = cardWidth * itemCount;
        const totalMargins = 12 * (itemCount - 1); // 12px de margen entre tarjetas
        const totalPaddings = 24; // 12px de padding interior a cada lado
        return totalCardsWidth + totalMargins + totalPaddings;
    };
    // ----------------------------------------------------

    const renderSafeCard = (item: any, isCarousel = true, isLast = false) => {
        const safeData = {
            ...item,
            titulo: item.titulo || "Sin título",
            contenido: item.contenido || "",
            imagen_url: item.imagen_url,
            created_at: item.fecha || item.created_at || new Date().toISOString(),
            profiles: item.profiles || { nombre: "Sistema", rol: "Automático" }
        };

        return (
            <View
                key={item.id}
                style={[
                    styles.cardWrapper,
                    isCarousel
                        ? { width: cardWidth, marginRight: isLast ? 0 : 12, marginBottom: 0 }
                        : { marginBottom: isLast ? 0 : 12 }
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
                            // Aplicamos el ancho calculado dinámicamente
                            <View style={[styles.carouselBoxGreen, { width: getCarouselWidth(noticias.length) }]}>
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
                                <Text style={styles.sectionTitle}>Últimos Avisos</Text>
                            </View>
                            <TouchableOpacity onPress={() => navigation.navigate('Avisos')}>
                                <Text style={styles.verTodasTextMobile}>Ver todos</Text>
                            </TouchableOpacity>
                        </View>
                        
                        {avisos.length > 0 ? (
                            // Aplicamos el ancho calculado dinámicamente
                            <View style={[styles.carouselBoxOrange, { width: getCarouselWidth(avisos.length) }]}>
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

  carouselContainer: { paddingBottom: Spacing.xl },
  
  sectionHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: Spacing.sm, 
    marginBottom: Spacing.sm,
    width: '100%',
    maxWidth: '94%', 
    alignSelf: 'center',
  }, 
  titleRow: { flexDirection: 'row', alignItems: 'center' },
  sectionTitle: { fontSize: FontSizes.lg, fontWeight: FontWeights.bold, marginLeft: 8, color: Colors.text.primary },
  verTodasTextMobile: { color: Colors.primary.blue, fontWeight: 'bold', fontSize: FontSizes.sm },
  
  carouselBoxGreen: {
    backgroundColor: Colors.primary.green,
    paddingTop: 12, 
    paddingBottom: 0, // El NewsCard ya tiene marginBottom de 12px, así evitamos doble margen inferior
    borderRadius: BorderRadius.md,
    alignSelf: 'center', 
    maxWidth: '94%',     
    ...Shadows.small,
  },
  carouselBoxOrange: {
    backgroundColor: Colors.primary.orange,
    paddingTop: 12,
    paddingBottom: 0, // Mismo balanceo simétrico que arriba
    borderRadius: BorderRadius.md,
    alignSelf: 'center', 
    maxWidth: '94%',     
    ...Shadows.small,
  },
  
  carouselInnerPadding: { 
    paddingHorizontal: 12,
    // flexGrow y justifyContent eliminados para no forzar al motor nativo
  },
  
  emptyText: { textAlign: 'center', color: Colors.text.light, fontStyle: 'italic', marginVertical: Spacing.lg },
  cardWrapper: { width: '100%' },
});

export default Inicio;