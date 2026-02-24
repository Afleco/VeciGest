import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../providers/AuthProvider';
import { BorderRadius, Colors, FontSizes, FontWeights, Spacing } from '../../styles/theme';

interface AddAvisoProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  avisoAEditar?: any;
}

const AddAviso: React.FC<AddAvisoProps> = ({ onSuccess, onCancel, avisoAEditar }) => {
  const [titulo, setTitulo] = useState(''); 
  const [texto, setTexto] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (avisoAEditar) {
      // Usamos 'contenido' que es el nuevo nombre de la columna
      const partes = (avisoAEditar.contenido || '').split('\n');
      setTitulo(partes[0] || '');
      setTexto(partes.slice(1).join('\n') || '');
    }
  }, [avisoAEditar]);

  const handleSave = async () => {
    if (!titulo.trim() || !texto.trim()) {
      const msg = 'El título y el contenido son obligatorios.';
      if (Platform.OS === 'web') {
        window.alert(msg);
      } else {
        Alert.alert('Aviso', msg);
      }
      return;
    }

    setLoading(true);
    try {
      // Combinamos el título y el cuerpo para guardarlo
      const contenidoCompleto = `${titulo.trim()}\n${texto.trim()}`;
      
      // Generamos la fecha actual en formato YYYY-MM-DD para el tipo DATE de SQL
      const fechaHoy = new Date().toISOString().split('T')[0];

      const datos = {
        contenido: contenidoCompleto, // Columna actualizada
        correo_user: user?.email,
        fecha: fechaHoy, // Evita el error 'null value violates not-null constraint'
      };

      if (avisoAEditar) {
        const { error } = await supabase
          .from('avisos')
          .update(datos)
          .eq('id', avisoAEditar.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('avisos')
          .insert([datos]);
        if (error) throw error;
      }
      
      if (onSuccess) onSuccess(); 
      
    } catch (error: any) {
      const msg = error.message || 'Error al guardar';
      if (Platform.OS === 'web') {
        window.alert(msg);
      } else {
        Alert.alert('Error', msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
        <Text style={styles.headerTitle}>
          {avisoAEditar ? 'Editar Aviso' : 'Nuevo Aviso'}
        </Text>

        <Text style={styles.label}>Título</Text>
        <TextInput
          style={styles.titleInput}
          placeholder="Título del aviso..."
          value={titulo}
          onChangeText={setTitulo}
          maxLength={100}
        />

        <Text style={styles.label}>Descripción</Text>
        <TextInput
          style={styles.bodyInput}
          placeholder="Escribe los detalles aquí..."
          multiline
          value={texto}
          onChangeText={setTexto}
          textAlignVertical="top"
        />
          
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]} 
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={Colors.base.white} />
            ) : (
              <Text style={styles.buttonText}>
                {avisoAEditar ? 'Actualizar' : 'Publicar Aviso'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { padding: Spacing.sm, flex: 1 },
  headerTitle: { 
    fontSize: FontSizes.xl, 
    fontWeight: 'bold', 
    color: Colors.primary.blue, 
    marginBottom: Spacing.lg, 
    textAlign: 'center' 
  },
  label: { 
    fontSize: FontSizes.sm, 
    fontWeight: FontWeights.bold, 
    color: Colors.text.primary, 
    marginBottom: 6 
  },
  titleInput: { 
    backgroundColor: '#f9f9f9', 
    borderRadius: BorderRadius.md, 
    padding: Spacing.md, 
    fontSize: FontSizes.md, 
    borderWidth: 1, 
    borderColor: '#e0e0e0', 
    marginBottom: Spacing.lg 
  },
  bodyInput: { 
    backgroundColor: '#f9f9f9', 
    borderRadius: BorderRadius.md, 
    padding: Spacing.md, 
    fontSize: FontSizes.md, 
    minHeight: 150, 
    borderWidth: 1, 
    borderColor: '#e0e0e0', 
    marginBottom: Spacing.xl 
  },
  buttonRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    gap: 10, 
    marginTop: Spacing.md 
  },
  cancelButton: { 
    flex: 1, 
    padding: Spacing.lg, 
    borderRadius: BorderRadius.lg, 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: Colors.text.light 
  },
  cancelButtonText: { 
    color: Colors.text.secondary, 
    fontWeight: 'bold' 
  },
  button: { 
    flex: 2, 
    backgroundColor: Colors.primary.blue, 
    padding: Spacing.lg, 
    borderRadius: BorderRadius.lg, 
    alignItems: 'center' 
  },
  buttonDisabled: { 
    opacity: 0.7 
  },
  buttonText: { 
    color: Colors.base.white, 
    fontWeight: FontWeights.bold 
  },
});

export default AddAviso;