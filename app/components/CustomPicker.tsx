import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback, // Importado para detectar toques fuera
  View
} from 'react-native';
import { BorderRadius, Colors, FontSizes, FontWeights, Shadows, Spacing } from '../../styles/theme';

interface Option {
  label: string;
  value: string;
}

interface CustomPickerProps {
  label?: string;
  value: string;
  options: Option[];
  placeholder?: string;
  onChange: (value: string) => void;
  icon?: string;
  disabled?: boolean;
}

export default function CustomPicker({
  label,
  value,
  options,
  placeholder = 'Seleccionar...',
  onChange,
  icon = 'list-outline',
  disabled = false,
}: CustomPickerProps) {
  const [modalVisible, setModalVisible] = useState(false);

  const selectedOption = options.find((opt) => opt.value === value);

  const handleSelect = (val: string) => {
    onChange(val);
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <TouchableOpacity
        style={[styles.selector, disabled && styles.disabledSelector]}
        onPress={() => !disabled && setModalVisible(true)}
        activeOpacity={0.7}
      >
        <Ionicons name={icon as any} size={20} color={Colors.text.light} style={styles.icon} />
        
        <Text style={[
            styles.valueText, 
            !selectedOption && styles.placeholderText
        ]}>
          {selectedOption ? selectedOption.label : placeholder}
        </Text>

        <Ionicons name="chevron-down-outline" size={20} color={Colors.text.light} />
      </TouchableOpacity>

      {/* Modal de Selección */}
      <Modal
        animationType="fade" // CAMBIO: fade evita que el fondo negro suba
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        {/* TouchableWithoutFeedback permite cerrar al tocar el fondo negro */}
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            
            {/* TouchableWithoutFeedback interno para evitar que se cierre al tocar el contenido */}
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{label || 'Seleccionar opción'}</Text>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Ionicons name="close-circle" size={30} color={Colors.text.secondary} />
                  </TouchableOpacity>
                </View>

                <FlatList
                  data={options}
                  keyExtractor={(item) => item.value}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        styles.optionItem,
                        item.value === value && styles.selectedOption
                      ]}
                      onPress={() => handleSelect(item.value)}
                    >
                      <Text style={[
                        styles.optionText,
                        item.value === value && styles.selectedOptionText
                      ]}>
                        {item.label}
                      </Text>
                      {item.value === value && (
                        <Ionicons name="checkmark" size={20} color={Colors.primary.orange} />
                      )}
                    </TouchableOpacity>
                  )}
                  ItemSeparatorComponent={() => <View style={styles.separator} />}
                  style={{ maxHeight: 300 }} // Limitamos altura de la lista interna
                />
              </View>
            </TouchableWithoutFeedback>

          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.base.white,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    height: 50,
    ...Shadows.small,
  },
  disabledSelector: {
    opacity: 0.6,
    backgroundColor: '#f0f0f0',
  },
  icon: {
    marginRight: Spacing.sm,
  },
  valueText: {
    flex: 1,
    fontSize: FontSizes.md,
    color: Colors.text.primary,
  },
  placeholderText: {
    color: Colors.text.light,
  },
  // --- ESTILOS DEL MODAL ACTUALIZADOS ---
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', // CAMBIO: Centrado en lugar de flex-end
    alignItems: 'center',     // CAMBIO: Centrado horizontal
    padding: Spacing.lg,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400, // Responsive: No se estira demasiado en tablets
    backgroundColor: Colors.base.white,
    borderRadius: BorderRadius.lg, // Bordes redondeados completos
    padding: Spacing.lg,
    maxHeight: '80%',
    ...Shadows.large,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.background.main,
    paddingBottom: Spacing.sm,
  },
  modalTitle: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    color: Colors.text.primary,
  },
  optionItem: {
    paddingVertical: Spacing.md, // Un poco más compacto
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedOption: {
    backgroundColor: '#FFF8F0', 
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
  },
  optionText: {
    fontSize: FontSizes.md, // Un poco más pequeño para que quepa mejor
    color: Colors.text.primary,
  },
  selectedOptionText: {
    color: Colors.primary.orange,
    fontWeight: FontWeights.bold,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.background.main,
  },
});