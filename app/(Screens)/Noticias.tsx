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
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../providers/AuthProvider';
import { Colors, Spacing } from '../../styles/theme';
import AddNotice from '../components/AddNotice';
import NewsCard from '../components/NewsCard';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const Noticias = () => {
  const [noticias, setNoticias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingNotice, setEditingNotice] = useState<any | null>(null);
  
  // --- ANIMACIÓN ---
  // Inicializamos la posición fuera de la pantalla (abajo)
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  const { profile } = useAuth();
  
  const rolesPermitidos = ['Presidente', 'Vicepresidente', 'Secretario'];
  const tienePermisoEscritura = rolesPermitidos.includes(profile?.rol || '');

  const fetchNoticias = async () => {
    try {
      const { data, error } = await supabase
        .from('noticias')
        .select(`
          *,
          profiles:email_user ( nombre, rol )
        `)
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

  useFocusEffect(
    useCallback(() => {
      fetchNoticias();
    }, [])
  );

  // Efecto para animar al ABRIR el modal
  useEffect(() => {
    if (modalVisible) {
      Animated.spring(slideAnim, {
        toValue: 0, // Sube a su posición original
        useNativeDriver: true,
        bounciness: 5, // Un pequeño rebote para que se sienta fluido
        speed: 12,
      }).start();
    }
  }, [modalVisible]);

  // Función para CERRAR con animación inversa
  const closeModal = () => {
    Animated.timing(slideAnim, {
      toValue: SCREEN_HEIGHT, // Baja fuera de la pantalla
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      // Una vez terminada la animación, ocultamos el modal real
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
    // Reseteamos posición por si acaso (aunque el effect lo maneja)
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
      <SafeAreaView style={styles.container} edges={['top']}>
        {loading && !refreshing ? (
          <ActivityIndicator size="large" color={Colors.primary.blue} style={{ marginTop: 20 }} />
        ) : (
          <FlatList
            data={noticias}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <NewsCard 
                noticia={item} 
                canEdit={tienePermisoEscritura}
                onDelete={handleDeleteNotice} 
                onEdit={openEditModal}
              />
            )}
            contentContainerStyle={styles.listContent}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No hay noticias publicadas aún.</Text>
            }
          />
        )}
      </SafeAreaView>

      {/* --- MODAL CON ANIMACIÓN MIXTA --- */}
      <Modal 
        visible={modalVisible} 
        animationType="fade" // El fondo negro hace FADE
        transparent={true} 
        onRequestClose={closeModal} 
      >
        <View style={styles.modalOverlay}>
          {/* El contenido hace SLIDE con Animated.View */}
          <Animated.View 
            style={[
              styles.modalContent, 
              { transform: [{ translateY: slideAnim }] }
            ]}
          >
            {/* Pasamos closeModal tanto al cancelar como al terminar con éxito */}
            <AddNotice 
              noticiaAEditar={editingNotice}
              onSuccess={() => { closeModal(); fetchNoticias(); }}
              onCancel={closeModal}
            />
          </Animated.View>
        </View>
      </Modal>

      {tienePermisoEscritura && (
        <TouchableOpacity style={styles.fab} onPress={openCreateModal}>
          <Ionicons name="add" size={32} color={Colors.base.white} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
  },
  listContent: {
    padding: Spacing.lg,
    paddingBottom: 100,
  },
  emptyText: {
    textAlign: 'center',
    color: Colors.text.light,
    marginTop: 50,
    fontSize: 16,
  },
  fab: { 
    position: 'absolute', 
    right: 20, 
    bottom: 20, 
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
  // ESTILOS DEL MODAL
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    justifyContent: 'flex-end', 
  },
  modalContent: { 
    backgroundColor: Colors.base.white, 
    borderTopLeftRadius: 20, 
    borderTopRightRadius: 20, 
    height: '90%',
    padding: Spacing.lg,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default Noticias;