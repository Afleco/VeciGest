import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Image,
  Modal,
  Pressable,
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

  // Transformar fecha de YYYY-MM-DD a DD-MM-YYYY
  const formatearFecha = (fechaOriginal: string) => {
    if (!fechaOriginal) return '';
    const partesFecha = fechaOriginal.split('-'); // Divide por guiones
    if (partesFecha.length === 3) {
      // Retorna en orden: Día - Mes - Año
      return `${partesFecha[2]}-${partesFecha[1]}-${partesFecha[0]}`;
    }
    return fechaOriginal; // Por si viene en otro formato (ej. con horas)
  };

  const fechaFormateada = formatearFecha(fecha);

  return (
    <>
      {/* TARJETA PRINCIPAL (Thumbnail) */}
      <TouchableOpacity 
        style={styles.card} 
        activeOpacity={0.9} 
        onPress={() => setModalVisible(true)}
      >
        {/* LÓGICA DE IMAGEN UNIFORME */}
        {imagen ? (
          <Image 
            source={{ uri: imagen }} 
            style={styles.cardImage} 
            resizeMode="cover" 
          />
        ) : (
          <View style={[styles.cardImage, styles.placeholderContainer]}>
            <Ionicons name="image-outline" size={40} color={Colors.text.light} />
            <Text style={styles.placeholderText}>Sin imagen adjunta</Text>
          </View>
        )}
        
        <View style={styles.cardContent}>
          <View style={styles.headerRow}>
            {/* Título forzado a 1 línea con puntos suspensivos */}
            <Text style={styles.title} numberOfLines={1}>{titulo}</Text>
          </View>
          
          {/* Descripción forzada a 3 líneas exactas de altura */}
          <Text style={styles.description} numberOfLines={3}>
            {cuerpo}
          </Text>

          <View style={styles.footer}>
            <View style={styles.authorInfo}>
              <Ionicons name="person-circle-outline" size={16} color={Colors.text.secondary} />
              <Text style={styles.authorText} numberOfLines={1}> {autorNombre} ({autorRol})</Text>
            </View>
            <Text style={styles.dateText}>{fechaFormateada}</Text>
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
          <Pressable 
            style={StyleSheet.absoluteFill} 
            onPress={() => setModalVisible(false)} 
          />
          
          <View style={styles.modalContainer}>
            <ScrollView contentContainerStyle={styles.modalScroll} bounces={false}>
              {imagen && (
                <Image 
                  source={{ uri: imagen }} 
                  style={styles.modalImage} 
                  resizeMode="contain" 
                />
              )}
              
              <View style={styles.modalBody}>
                <Text style={styles.modalTitle}>{titulo}</Text>
                
                <View style={styles.metaContainer}>
                   <View style={styles.badge}>
                      <Text style={styles.badgeText}>{autorRol}</Text>
                   </View>
                   <Text style={styles.modalDate}>Publicado por {autorNombre} el {fechaFormateada}</Text>
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
  card: {
    backgroundColor: Colors.base.white,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    ...Shadows.medium,
    overflow: 'hidden',
    width: '100%',
    maxWidth: 700, 
    alignSelf: 'center', 
  },
  cardImage: {
    width: '100%',
    aspectRatio: 16 / 9, 
  },
  placeholderContainer: {
    backgroundColor: Colors.background.main,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  placeholderText: {
    color: Colors.text.light,
    fontSize: FontSizes.sm,
    marginTop: Spacing.xs,
    fontStyle: 'italic',
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
    minHeight: 24, // Ocupa exactamente 1 línea
  },
  description: {
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
    marginBottom: Spacing.md,
    lineHeight: 20,
    minHeight: 60, // OBLIGA a ocupar el espacio de 3 líneas exactas (20px * 3)
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
    flex: 1, 
    marginRight: Spacing.sm, 
  },
  authorText: {
    fontSize: FontSizes.xs,
    color: Colors.text.secondary,
    fontWeight: FontWeights.medium,
    flexShrink: 1, 
  },
  dateText: {
    fontSize: FontSizes.xs,
    color: Colors.text.light,
    flexShrink: 0, 
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
    backgroundColor: 'rgba(0,0,0,0.5)', 
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.md,
  },
  modalContainer: {
    backgroundColor: Colors.base.white,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    flexShrink: 1, 
    maxHeight: '75%', 
    width: '100%',
    maxWidth: 800,
  },
  modalScroll: {
    flexGrow: 1, 
    paddingBottom: Spacing.xl, 
  },
  modalImage: {
    width: '100%',
    aspectRatio: 16 / 9, 
    backgroundColor: Colors.background.main, 
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