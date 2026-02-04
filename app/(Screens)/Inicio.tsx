import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
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
import { useAuth } from '../../providers/AuthProvider';
import { BorderRadius, Colors, FontSizes, FontWeights, Shadows, Spacing } from '../../styles/theme';
import AddNotice from '../components/AddNotice';

const Inicio = () => {
  const [noticias, setNoticias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  
  const { profile, user } = useAuth();
  
  const rolesPermitidos = ['Presidente', 'Vicepresidente', 'Secretario'];
  const tienePermisoEscritura = rolesPermitidos.includes(profile?.rol || '');

  const fetchNoticias = async () => {
    try {
      // Buscamos el rol asociado al correo del usuario logeado 
      // y lo imprimimos en la tarjeta de la noticia
      const { data, error } = await supabase
        .from('noticias')
        .select(`
          *,
          profiles:email_user (
            rol
          )
        `)
        .order('id', { ascending: false });

      if (error) throw error;
      setNoticias(data || []);
    } catch (error: any) {
      console.error('Error:', error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleDeleteNotice = (id: number) => {
    const deleteAction = async () => {
      try {
        const { error } = await supabase.from('noticias').delete().eq('id', id);
        if (error) throw error;
        fetchNoticias(); 
      } catch (error: any) {
        Alert.alert('Error', 'No se pudo eliminar la noticia');
      }
    };

    if (Platform.OS === 'web') {
      if (confirm('¿Eliminar esta noticia?')) deleteAction();
    } else {
      Alert.alert('Eliminar Noticia', '¿Estás seguro?', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', onPress: deleteAction, style: 'destructive' }
      ]);
    }
  };

  useEffect(() => {
    fetchNoticias();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNoticias();
  };

  return (
    <View style={{ flex: 1 }}>
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

          {/* Sección Noticias */}
          {/* Imprime las Noticias guardadas en la tabla 
          y permite que los roles Presidente, Vicepresidente y Secretario
          puedan eliminar las noticias. */}
          {/* Por si acaso en supabase se hizo una tarea programada
          que elimina las noticias con 8 meses de antigüedad */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="newspaper-outline" size={24} color={Colors.primary.blue} />
              <Text style={styles.sectionTitle}>Últimas Noticias</Text>
            </View>

            {loading ? (
              <ActivityIndicator size="large" color={Colors.primary.blue} style={{ marginTop: 20 }} />
            ) : noticias.length > 0 ? (
              noticias.map((item) => {
                const partes = item.contenido.split('\n');
                const titulo = partes[0];
                const cuerpo = partes.slice(1).join('\n');
                
                // Extraemos el rol del objeto profiles que trajo la query
                const rolAutor = item.profiles?.rol || 'Usuario';

                return (
                  <View key={item.id} style={styles.newsCard}>
                    <View style={styles.newsHeaderRow}>
                      <Text style={styles.newsTitle}>{titulo}</Text>
                      {tienePermisoEscritura && (
                        <TouchableOpacity onPress={() => handleDeleteNotice(item.id)}>
                          <Ionicons name="trash-outline" size={20} color={Colors.primary.orange} />
                        </TouchableOpacity>
                      )}
                    </View>

                    {cuerpo.trim().length > 0 && (
                      <Text style={styles.newsContent}>{cuerpo.trim()}</Text>
                    )}
                    
                    <View style={styles.newsFooter}>
                      {/* Aquí mostramos el ROL del autor de la noticia y la fecha de publicsacion */}
                      <Text style={styles.newsMetaText}>{rolAutor}</Text>
                      <Text style={styles.newsMetaText}>{item.fecha}</Text>
                    </View>
                  </View>
                );
              })
            ) : (
              <Text style={styles.emptyText}>No hay noticias que mostrar.</Text>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Boton, solo visible para roles Presidente, Vicepresidente y Secretario,
       que abre una ventana emergente para la creacion de noticias */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Crear Noticia</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close-circle" size={32} color={Colors.primary.orange} />
              </TouchableOpacity>
            </View>
            <AddNotice onSuccess={() => { setModalVisible(false); fetchNoticias(); }} />
          </View>
        </View>
      </Modal>

      {tienePermisoEscritura && (
        <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
          <Ionicons name="add" size={40} color={Colors.base.white} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: Colors.background.main 
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
    marginBottom: Spacing.md 
  },
  sectionTitle: { 
    fontSize: FontSizes.xl, 
    fontWeight: FontWeights.bold, 
    marginLeft: Spacing.sm, 
    color: Colors.text.primary 
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

  newsCard: { 
    backgroundColor: Colors.background.card, 
    padding: Spacing.lg, 
    borderRadius: BorderRadius.md, 
    marginBottom: Spacing.md, 
    borderLeftWidth: 4, 
    borderLeftColor: Colors.primary.green, 
    ...Shadows.small 
  },
  newsHeaderRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start', 
    marginBottom: 4 
  },
  newsTitle: { 
    fontSize: FontSizes.md, 
    fontWeight: FontWeights.bold, 
    color: Colors.text.primary, 
    flex: 1, 
    marginRight: 10 
  },
  newsContent: { 
    fontSize: FontSizes.sm, 
    color: Colors.text.secondary, 
    lineHeight: 20 
  },
  newsFooter: { 
    alignItems: 'flex-end', 
    marginTop: Spacing.md, 
    borderTopWidth: 0.5, 
    borderTopColor: '#f0f0f0', 
    paddingTop: Spacing.xs 
  },
  newsMetaText: { 
    fontSize: 10, 
    color: Colors.text.light 
  },
  emptyText: { 
    textAlign: 'center', 
    color: Colors.text.light, 
    marginTop: 20 
  },
  
  actionsContainer: { 
    margin: Spacing.lg, 
    paddingBottom: 100 
  },
  actionButton: { 
    backgroundColor: Colors.primary.blue, 
    flexDirection: 'row', 
    padding: Spacing.lg, 
    borderRadius: BorderRadius.xl, 
    marginBottom: Spacing.md, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  actionButtonText: { 
    color: Colors.base.white, 
    fontWeight: 'bold', 
    marginLeft: 10, 
    fontSize: FontSizes.md 
  },
  signOutButton: { 
    backgroundColor: Colors.primary.orange 
  },
  fab: { 
    position: 'absolute', 
    right: 25, 
    bottom: 25, 
    backgroundColor: Colors.primary.green, 
    width: 65, 
    height: 65, 
    borderRadius: 32.5, 
    justifyContent: 'center', 
    alignItems: 'center', 
    elevation: 8, 
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
    minHeight: '65%' 
  },
  modalHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 20 
  },
  modalTitle: { 
    fontSize: FontSizes.xl, 
    fontWeight: 'bold', 
    color: Colors.primary.blue 
  },
});

export default Inicio;