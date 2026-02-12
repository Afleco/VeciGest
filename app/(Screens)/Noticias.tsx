import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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

const Noticias = () => {
  const [noticias, setNoticias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingNotice, setEditingNotice] = useState<any | null>(null);
  
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

  const onRefresh = () => {
    setRefreshing(true);
    fetchNoticias();
  };

  // --- FUNCIÓN DE BORRADO SEGURA ---
  const handleDeleteNotice = (item: any) => {
    const deleteAction = async () => {
      try {
        // Borrar imagen del Storage (si existe)
        // Usando la API de Supabase Storage
        if (item.imagen_url) {
          // Extraemos el nombre del archivo de la URL
          const fileName = item.imagen_url.split('/').pop();

          if (fileName) {
            const { error: storageError } = await supabase.storage
              .from('noticias')
              .remove([fileName]);
            
            if (storageError) {
              console.warn('Aviso: No se pudo borrar la imagen del bucket:', storageError.message);
              // No lanzamos error para permitir que se borre la noticia de todos modos
              // y no dejar al usuario bloqueado.
            }
          }
        }

        // Borrar registro de la Base de Datos
        const { error } = await supabase.from('noticias').delete().eq('id', item.id);
        
        if (error) throw error;
        
        Alert.alert('Éxito', 'Noticia eliminada correctamente');
        fetchNoticias(); 
      } catch (error: any) {
        Alert.alert('Error', 'No se pudo eliminar la noticia: ' + error.message);
      }
    };

    if (Platform.OS === 'web') {
      if (confirm('¿Eliminar esta noticia?')) deleteAction();
    } else {
      Alert.alert('Eliminar Noticia', '¿Estás seguro de que deseas eliminar esta noticia?', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', onPress: deleteAction, style: 'destructive' }
      ]);
    }
  };

  const openCreateModal = () => {
    setEditingNotice(null);
    setModalVisible(true);
  };

  const openEditModal = (noticia: any) => {
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

      <Modal 
        visible={modalVisible} 
        animationType="slide" 
        transparent={true} 
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <AddNotice 
              noticiaAEditar={editingNotice}
              onSuccess={() => { setModalVisible(false); fetchNoticias(); }}
              onCancel={() => setModalVisible(false)}
            />
          </View>
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
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    justifyContent: 'flex-end' 
  },
  modalContent: { 
    backgroundColor: Colors.base.white, 
    borderTopLeftRadius: 20, 
    borderTopRightRadius: 20, 
    padding: 20, 
    height: '90%', 
  },
});

export default Noticias;