import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Modal,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../providers/AuthProvider';
import { BorderRadius, Colors, Shadows, Spacing } from '../../styles/theme';
import AddNotice from '../components/AddNotice';
import NewsCard from '../components/NewsCard';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const Noticias = () => {
  const [noticias, setNoticias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingNotice, setEditingNotice] = useState<any | null>(null);
  
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const { profile } = useAuth();
  
  const rolesPermitidos = ['Presidente', 'Vicepresidente', 'Secretario', 'Administrador'];
  const tienePermisoEscritura = rolesPermitidos.includes(profile?.rol || '');

  const { width } = useWindowDimensions();
  const numColumns = width >= 1024 ? 3 : width >= 768 ? 2 : 1;
  
  const insets = useSafeAreaInsets(); // <-- OBTENEMOS LOS BORDES DEL MÓVIL

  const getGridMaxWidth = (itemsCount: number) => {
    if (numColumns === 1) return 700; 
    const maxItemsInRow = Math.min(itemsCount === 0 ? 1 : itemsCount, numColumns);
    return maxItemsInRow * 420; 
  };

  const fetchNoticias = async () => {
    try {
      const { data, error } = await supabase
        .from('noticias')
        .select(`*, profiles:email_user ( nombre, rol )`)
        .order('id', { ascending: false });

      if (error) throw error;
      setNoticias(data || []);
    } catch (error: any) {
      console.error('Error cargando noticias:', error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchNoticias(); }, []));

  useEffect(() => {
    if (modalVisible) {
      Animated.spring(slideAnim, {
        toValue: 0, 
        useNativeDriver: true,
        bounciness: 5, 
        speed: 12,
      }).start();
    }
  }, [modalVisible]);

  const closeModal = () => {
    Animated.timing(slideAnim, {
      toValue: SCREEN_HEIGHT, 
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
      setEditingNotice(null);
    });
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchNoticias();
  };

  const handleDeleteNotice = (item: any) => {
    const deleteAction = async () => {
      try {
        if (item.imagen_url) {
          const fileName = item.imagen_url.split('/').pop();
          if (fileName) {
            await supabase.storage.from('noticias').remove([fileName]);
          }
        }
        const { error } = await supabase.from('noticias').delete().eq('id', item.id);
        if (error) throw error;
        Alert.alert('Éxito', 'Noticia eliminada correctamente');
        fetchNoticias(); 
      } catch (error: any) {
        Alert.alert('Error', 'No se pudo eliminar: ' + error.message);
      }
    };

    if (Platform.OS === 'web') {
      if (confirm('¿Eliminar esta noticia?')) deleteAction();
    } else {
      Alert.alert('Eliminar', '¿Estás seguro?', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', onPress: deleteAction, style: 'destructive' }
      ]);
    }
  };

  const openCreateModal = () => {
    slideAnim.setValue(SCREEN_HEIGHT);
    setEditingNotice(null);
    setModalVisible(true);
  };

  const openEditModal = (noticia: any) => {
    slideAnim.setValue(SCREEN_HEIGHT);
    setEditingNotice(noticia);
    setModalVisible(true);
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background.main }}>
      {/* CAMBIO: Usamos un View normal en lugar de SafeAreaView para evitar la franja */}
      <View style={styles.container}>
        {loading && !refreshing ? (
          <ActivityIndicator size="large" color={Colors.primary.blue} style={{ marginTop: 20 }} />
        ) : (
          <FlatList
            key={`grid-${numColumns}`} 
            data={noticias}
            keyExtractor={(item) => item.id.toString()}
            numColumns={numColumns}
            columnWrapperStyle={numColumns > 1 ? styles.row : undefined}
            renderItem={({ item }) => (
              <View style={[styles.cardWrapper, numColumns > 1 && { maxWidth: 400 }]}>
                <NewsCard 
                  noticia={item} 
                  canEdit={tienePermisoEscritura}
                  onDelete={handleDeleteNotice} 
                  onEdit={openEditModal}
                />
              </View>
            )}
            style={[styles.flatList, { maxWidth: getGridMaxWidth(noticias.length) }]}
            // Sumamos el inset.bottom al padding/margin final de la lista
            contentContainerStyle={
              noticias.length > 0 
                ? [styles.coloredContainer, { marginBottom: 80 + insets.bottom }]
                : { padding: Spacing.lg, paddingBottom: 100 + insets.bottom }
            }
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No hay noticias publicadas aún.</Text>
            }
          />
        )}
      </View>

      <Modal 
        visible={modalVisible} 
        animationType="fade" 
        transparent={true} 
        onRequestClose={closeModal} 
      >
        <View style={styles.modalOverlay}>
          <Animated.View 
            style={[
              styles.modalContent, 
              { transform: [{ translateY: slideAnim }] }
            ]}
          >
            <AddNotice 
              noticiaAEditar={editingNotice}
              onSuccess={() => { closeModal(); fetchNoticias(); }}
              onCancel={closeModal}
            />
          </Animated.View>
        </View>
      </Modal>

      {tienePermisoEscritura && (
        <TouchableOpacity 
          style={[styles.fab, { bottom: 20 + insets.bottom }]} // <-- POSICIÓN DINÁMICA
          onPress={openCreateModal}
        >
          <Ionicons name="add" size={32} color={Colors.base.white} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  flatList: { width: '100%', alignSelf: 'center' },
  coloredContainer: {
    backgroundColor: Colors.primary.green,
    padding: Spacing.md,
    margin: Spacing.md,
    borderRadius: BorderRadius.lg,
    ...Shadows.small,
  },
  row: { gap: Spacing.md, justifyContent: 'center' },
  cardWrapper: { flex: 1 },
  emptyText: { textAlign: 'center', color: Colors.text.light, marginTop: 50, fontSize: 16 },
  fab: { 
    position: 'absolute', 
    right: 20, 
    // bottom eliminado de aquí
    backgroundColor: Colors.primary.orange, 
    width: 60, 
    height: 60, 
    borderRadius: 30, 
    justifyContent: 'center', 
    alignItems: 'center', 
    elevation: 8, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    zIndex: 999 
  },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { 
    backgroundColor: Colors.base.white, 
    borderTopLeftRadius: 20, 
    borderTopRightRadius: 20, 
    height: '90%',
    padding: Spacing.lg,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default Noticias;