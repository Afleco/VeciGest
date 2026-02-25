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

  return (
    <>
      {/* TARJETA PRINCIPAL (Thumbnail) */}
      <TouchableOpacity 
        style={styles.card} 
        activeOpacity={0.9} 
        onPress={() => setModalVisible(true)}
      >
        {imagen && (
          // Usamos aspectRatio en lugar de height fija para evitar deformación
          <Image 
            source={{ uri: imagen }} 
            style={styles.cardImage} 
            resizeMode="cover" 
          />
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
              <Text style={styles.authorText} numberOfLines={1}> {autorNombre} ({autorRol})</Text>
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
        {/* Contenedor principal que centra todo y tiene el fondo negro */}
        <View style={styles.modalOverlay}>
          
          {/* Solución para Scroll en mobile -> botón invisible que ocupa todo el fondo por detrás. 
                 Si tocas fuera de la caja blanca, esto lo detecta y cierra el modal. */}
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
    aspectRatio: 16 / 9, // <-- Mantiene la proporción panorámica
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
    flex: 1, // Toma el espacio disponible sin empujar a la fecha
    marginRight: Spacing.sm, // pequeño margen para separar la fecha
  },
  authorText: {
    fontSize: FontSizes.xs,
    color: Colors.text.secondary,
    fontWeight: FontWeights.medium,
    flexShrink: 1, // Permite que el texto se acorte si falta espacio
  },
  dateText: {
    fontSize: FontSizes.xs,
    color: Colors.text.light,
    flexShrink: 0, //Protege a la fecha para que jamás se encoja o deforme
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
    flexShrink: 1, // Permite que el contenedor se encoja si la pantalla es pequeña
    maxHeight: '75%', // Un pelín menos del 90% suele dar mejor resultado en móviles para no chocar con las barras de estado
    // ---------------------
    width: '100%',
    maxWidth: 800,
  },
  modalScroll: {
    flexGrow: 1, 
    paddingBottom: Spacing.xl, // Añade espacio al final para que el texto no se pegue al borde inferior al hacer scroll
    // ---------------------
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