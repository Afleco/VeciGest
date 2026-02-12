import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { BorderRadius, Colors, FontSizes, FontWeights, Shadows, Spacing } from '../../styles/theme';

interface NewsCardProps {
  noticia: any;
  onDelete?: (noticia: any) => void;
  onEdit?: (noticia: any) => void;
  readOnly?: boolean;
  canEdit?: boolean;
}

const NewsCard: React.FC<NewsCardProps> = ({ 
  noticia, 
  onDelete, 
  onEdit, 
  readOnly = false, 
  canEdit = false 
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  const partes = noticia.contenido.split('\n');
  const titulo = partes[0];
  const cuerpo = partes.slice(1).join('\n');
  const autorNombre = noticia.profiles?.nombre || 'Usuario';
  const autorRol = noticia.profiles?.rol || 'Vecino';
  const fecha = noticia.fecha;
  const imagen = noticia.imagen_url;

  return (
    <>
      {/* TARJETA PRINCIPAL (Thumbnail) */}
      <TouchableOpacity 
        style={styles.card} 
        activeOpacity={0.9} 
        onPress={() => setModalVisible(true)}
      >
        {imagen && (
          <Image source={{ uri: imagen }} style={styles.cardImage} resizeMode="cover" />
        )}
        
        <View style={styles.cardContent}>
          <View style={styles.headerRow}>
            <Text style={styles.title} numberOfLines={2}>{titulo}</Text>
          </View>
          
          <Text style={styles.description} numberOfLines={3}>
            {cuerpo}
          </Text>

          <View style={styles.footer}>
            <View style={styles.authorInfo}>
              <Ionicons name="person-circle-outline" size={16} color={Colors.text.secondary} />
              <Text style={styles.authorText}> {autorNombre} ({autorRol})</Text>
            </View>
            <Text style={styles.dateText}>{fecha}</Text>
          </View>

          {!readOnly && canEdit && (
            <View style={styles.actionsBar}>
              <TouchableOpacity 
                style={styles.actionButton} 
                onPress={() => onEdit && onEdit(noticia)}
              >
                <Ionicons name="create-outline" size={20} color={Colors.primary.blue} />
                <Text style={[styles.actionText, { color: Colors.primary.blue }]}>Editar</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.actionButton} 
                onPress={() => onDelete && onDelete(noticia)}
              >
                <Ionicons name="trash-outline" size={20} color={Colors.status.error} />
                <Text style={[styles.actionText, { color: Colors.status.error }]}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </TouchableOpacity>

      {/* MODAL DE DETALLE (Desplegado) */}
      <Modal 
        visible={modalVisible} 
        animationType="fade" 
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            
            {/* Botón de cerrar flotante mejorado */}
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={() => setModalVisible(false)}
              activeOpacity={0.8}
            >
              {/* Le puse un fondo negro semi-transparente para que se vea siempre sobre la imagen */}
              <Ionicons name="close-circle" size={36} color="rgba(255, 255, 255, 0.9)" />
            </TouchableOpacity>

            <ScrollView contentContainerStyle={styles.modalScroll} bounces={false}>
              {imagen && (
                <Image 
                  source={{ uri: imagen }} 
                  style={styles.modalImage} 
                  // CAMBIO PRINCIPAL AQUÍ: 'cover' elimina los bordes negros
                  resizeMode="cover" 
                />
              )}
              
              <View style={styles.modalBody}>
                <Text style={styles.modalTitle}>{titulo}</Text>
                
                <View style={styles.metaContainer}>
                   <View style={styles.badge}>
                      <Text style={styles.badgeText}>{autorRol}</Text>
                   </View>
                   <Text style={styles.modalDate}>Publicado por {autorNombre} el {fecha}</Text>
                </View>

                <View style={styles.divider} />
                
                <Text style={styles.modalDescription}>{cuerpo}</Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  // ... (Tus estilos anteriores se mantienen igual, solo modificamos modalImage y closeButton) ...
  card: {
    backgroundColor: Colors.base.white,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
    ...Shadows.medium,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: 150,
  },
  cardContent: {
    padding: Spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  title: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: Colors.text.primary,
    flex: 1,
  },
  description: {
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
    marginBottom: Spacing.md,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.background.main,
    paddingTop: Spacing.sm,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorText: {
    fontSize: FontSizes.xs,
    color: Colors.text.secondary,
    fontWeight: FontWeights.medium,
  },
  dateText: {
    fontSize: FontSizes.xs,
    color: Colors.text.light,
  },
  actionsBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: Spacing.lg,
    padding: 4,
  },
  actionText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.bold,
    marginLeft: 4,
  },
  
  // --- ESTILOS DEL MODAL ---
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)', // Un poco más oscuro para enfocar la atención
    justifyContent: 'center',
    padding: Spacing.md,
  },
  modalContainer: {
    backgroundColor: Colors.base.white,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    maxHeight: '90%',
    width: '100%', // Asegura ancho completo
  },
  modalScroll: {
    flexGrow: 1,
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    zIndex: 20, // Aumentado para asegurar que esté sobre la imagen
    // Quitamos el background del estilo anterior y usamos el del icono o un view pequeño si prefieres
  },
  modalImage: {
    width: '100%',
    height: 300, // AUMENTADO de 250 a 300 para que luzca más "inmersiva"
    backgroundColor: Colors.background.main, // Color de carga más suave que el negro puro
  },
  modalBody: {
    padding: Spacing.lg,
  },
  modalTitle: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: Spacing.md,
  },
  badge: {
    backgroundColor: Colors.primary.green,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    marginRight: Spacing.sm,
  },
  badgeText: {
    color: Colors.base.white,
    fontSize: FontSizes.xs,
    fontWeight: 'bold',
  },
  modalDate: {
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.background.main,
    marginVertical: Spacing.md,
  },
  modalDescription: {
    fontSize: FontSizes.md,
    color: Colors.text.primary,
    lineHeight: 24,
  },
});

export default NewsCard;