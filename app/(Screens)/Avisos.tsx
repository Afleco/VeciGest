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
import AddAviso from '../components/AddAviso';
import NewsCard from '../components/NewsCard';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const Avisos = () => {
  const [avisos, setAvisos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAviso, setEditingAviso] = useState<any | null>(null);
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  // Extraemos 'user' para comparar el email y 'profile' para el rol
  const { profile, user } = useAuth();
  
  const rolesPermitidos = ['Presidente', 'Vicepresidente', 'Secretario'];
  const esDirectiva = rolesPermitidos.includes(profile?.rol || '');

  const fetchAvisos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('avisos')
        .select(`
          *,
          profiles:email_user ( nombre, rol )
        `)
        .order('id', { ascending: false });

      if (error) throw error;
      setAvisos(data || []);
    } catch (error: any) {
      console.error('Error cargando avisos:', error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchAvisos();
    }, [])
  );

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
      setEditingAviso(null);
    });
  };

  const handleDeleteAviso = async (id: number) => {
    const deleteAction = async () => {
      try {
        const { error } = await supabase.from('avisos').delete().eq('id', id);
        if (error) throw error;
        fetchAvisos();
      } catch (error: any) {
        Alert.alert('Error', 'No se pudo eliminar: ' + error.message);
      }
    };

    if (Platform.OS === 'web') {
      if (confirm('¿Eliminar este aviso?')) deleteAction();
    } else {
      Alert.alert('Eliminar', '¿Estás seguro?', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', onPress: deleteAction, style: 'destructive' }
      ]);
    }
  };

  const openEditModal = (aviso: any) => {
    setEditingAviso(aviso);
    setModalVisible(true);
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background.main }}>
      <SafeAreaView style={styles.container} edges={['top']}>
        {loading && !refreshing ? (
          <ActivityIndicator size="large" color={Colors.primary.blue} style={{ marginTop: 20 }} />
        ) : (
          <FlatList
            data={avisos}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => {
              // Lógica de permisos combinada
              const esAutor = user?.email === item.email_user;
              const tienePermiso = esDirectiva || esAutor;

              return (
                <NewsCard
                  noticia={item}
                  canEdit={tienePermiso}
                  onDelete={() => handleDeleteAviso(item.id)}
                  onEdit={() => openEditModal(item)}
                />
              );
            }}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={fetchAvisos} />
            }
            ListEmptyComponent={
              <Text style={styles.emptyText}>No hay avisos hoy.</Text>
            }
          />
        )}
      </SafeAreaView>

      <Modal visible={modalVisible} transparent={true} onRequestClose={closeModal} animationType="none">
        <View style={styles.modalOverlay}>
          <Animated.View style={[styles.modalContent, { transform: [{ translateY: slideAnim }] }]}>
            <AddAviso
              avisoAEditar={editingAviso}
              onSuccess={() => { closeModal(); fetchAvisos(); }}
              onCancel={closeModal}
            />
          </Animated.View>
        </View>
      </Modal>

      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Ionicons name="megaphone-outline" size={30} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: { padding: Spacing.lg, paddingBottom: 100 },
  emptyText: { textAlign: 'center', color: Colors.text.light, marginTop: 50, fontSize: 16 },
  fab: { 
    position: 'absolute', 
    right: 20, 
    bottom: 20, 
    backgroundColor: Colors.primary.orange, 
    width: 65, 
    height: 65, 
    borderRadius: 35, 
    justifyContent: 'center', 
    alignItems: 'center', 
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { 
    backgroundColor: 'white', 
    borderTopLeftRadius: 20, 
    borderTopRightRadius: 20, 
    height: '75%', 
    padding: Spacing.lg 
  },
});

export default Avisos;