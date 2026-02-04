import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../providers/AuthProvider';
import { BorderRadius, Colors, FontSizes, FontWeights, Spacing } from '../../styles/theme';

interface AddNoticeProps {
  onSuccess?: () => void;
}

// Componente que se carga en un emergente al pulsar el boton de crear noticias
const AddNotice: React.FC<AddNoticeProps> = ({ onSuccess }) => {
  const [titulo, setTitulo] = useState('');
  const [cuerpo, setCuerpo] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Funcion que recoge y guarda la noticia en SupaBase
  const handleCreate = async () => {
    if (!titulo.trim() || !cuerpo.trim()) {
      Alert.alert('Error', 'Tanto el título como el cuerpo son obligatorios.');
      return;
    }

    setLoading(true);
    try {
      // El título y el cuerpo se guardan unidos por un salto de línea
      const contenidoCompleto = `${titulo.trim()}\n${cuerpo.trim()}`;

      const { error } = await supabase
        .from('noticias')
        .insert([
          { 
            contenido: contenidoCompleto,
            email_user: user?.email,
            fecha: new Date().toISOString().split('T')[0] 
          }
        ]);

      if (error) throw error;

      setTitulo('');
      setCuerpo('');
      if (onSuccess) onSuccess(); 
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Título</Text>
      <TextInput
        style={styles.titleInput}
        placeholder="Titulo"
        value={titulo}
        onChangeText={setTitulo}
        maxLength={50}
      />

      <Text style={styles.label}>Cuerpo del mensaje</Text>
      <TextInput
        style={styles.bodyInput}
        placeholder="Escribe los detalles aquí..."
        multiline
        value={cuerpo}
        onChangeText={setCuerpo}
        textAlignVertical="top"
      />
        
      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]} 
        onPress={handleCreate}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={Colors.base.white} />
        ) : (
          <Text style={styles.buttonText}>Publicar Noticia</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: Spacing.sm,
  },
  label: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.bold,
    color: Colors.primary.blue,
    marginBottom: 6,
    marginLeft: 4,
  },
  titleInput: {
    backgroundColor: '#f9f9f9',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: FontSizes.md,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: Spacing.lg,
    color: Colors.text.primary,
  },
  bodyInput: {
    backgroundColor: '#f9f9f9',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: FontSizes.sm,
    minHeight: 120,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: Spacing.xl,
    color: Colors.text.primary,
  },
  button: {
    backgroundColor: Colors.primary.blue,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: Colors.base.white,
    fontWeight: FontWeights.bold,
    fontSize: FontSizes.md,
  },
});

export default AddNotice;