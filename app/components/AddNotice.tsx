import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
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

interface AddNoticeProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  noticiaAEditar?: any;
}

const AddNotice: React.FC<AddNoticeProps> = ({ onSuccess, onCancel, noticiaAEditar }) => {
  const [titulo, setTitulo] = useState('');
  const [cuerpo, setCuerpo] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (noticiaAEditar) {
      const partes = noticiaAEditar.contenido.split('\n');
      setTitulo(partes[0] || '');
      setCuerpo(partes.slice(1).join('\n') || '');
      // Si editamos, mostramos la URL que viene de la BD
      setImageUri(noticiaAEditar.imagen_url || null);
    }
  }, [noticiaAEditar]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.5, // Bajamos calidad para subir más rápido
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri: string): Promise<string | null> => {
    try {
      // 1. Si la URI ya es de Supabase (http...), no hay que subir nada
      if (uri.startsWith('http')) return uri;

      // 2. Preparar el archivo
      const arrayBuffer = await fetch(uri).then(res => res.arrayBuffer());
      const fileExt = uri.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // 3. Subir al Bucket 'noticias'
      const { error: uploadError, data } = await supabase.storage
        .from('noticias')
        .upload(filePath, arrayBuffer, {
          contentType: `image/${fileExt}`,
          upsert: false
        });

      if (uploadError) {
        throw uploadError;
      }

      // 4. Obtener la URL Pública
      const { data: urlData } = supabase.storage
        .from('noticias')
        .getPublicUrl(filePath);

      return urlData.publicUrl;

    } catch (error) {
      console.error('Error subiendo imagen:', error);
      Alert.alert('Error', 'Falló la subida de la imagen');
      return null;
    }
  };

  const handleSave = async () => {
    if (!titulo.trim() || !cuerpo.trim()) {
      Alert.alert('Error', 'Título y descripción obligatorios.');
      return;
    }

    setLoading(true);
    try {
      const contenidoCompleto = `${titulo.trim()}\n${cuerpo.trim()}`;
      
      // 1. GESTIONAR SUBIDA DE IMAGEN
      let finalImageUrl = null;

      // Si hay imagen seleccionada...
      if (imageUri) {
        // Si la imagen cambió (es local) o es nueva, la subimos
        if (!imageUri.startsWith('http')) {
           finalImageUrl = await uploadImage(imageUri);
           if (!finalImageUrl) throw new Error("No se pudo obtener la URL de la imagen");
        } else {
           // Si ya era remota (edición sin cambiar foto), la mantenemos
           finalImageUrl = imageUri;
        }
      }

      const datos = {
        contenido: contenidoCompleto,
        email_user: user?.email,
        fecha: new Date().toISOString().split('T')[0],
        imagen_url: finalImageUrl // Guardamos la URL de Supabase, NO el blob
      };

      if (noticiaAEditar) {
        const { error } = await supabase
          .from('noticias')
          .update(datos)
          .eq('id', noticiaAEditar.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('noticias')
          .insert([datos]);
        if (error) throw error;
      }

      if (onSuccess) onSuccess(); 
      
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Ocurrió un error al guardar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.headerTitle}>
        {noticiaAEditar ? 'Editar Noticia' : 'Nueva Noticia'}
      </Text>

      <Text style={styles.label}>Título</Text>
      <TextInput
        style={styles.titleInput}
        placeholder="Título de la noticia"
        value={titulo}
        onChangeText={setTitulo}
        maxLength={100}
      />

      <Text style={styles.label}>Imagen (Opcional)</Text>
      <TouchableOpacity style={styles.imageSelector} onPress={pickImage}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.previewImage} resizeMode="cover" />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons name="camera-outline" size={40} color={Colors.text.light} />
            <Text style={styles.placeholderText}>Toca para adjuntar imagen</Text>
          </View>
        )}
      </TouchableOpacity>
      
      {imageUri && (
        <TouchableOpacity 
          onPress={() => setImageUri(null)} 
          style={{ alignItems: 'flex-end', marginBottom: 15 }}
        >
          <Text style={{ color: Colors.status.error, fontWeight: 'bold' }}>Eliminar imagen</Text>
        </TouchableOpacity>
      )}

      <Text style={styles.label}>Descripción</Text>
      <TextInput
        style={styles.bodyInput}
        placeholder="Escribe los detalles aquí..."
        multiline
        value={cuerpo}
        onChangeText={setCuerpo}
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
            <Text style={styles.buttonText}>{noticiaAEditar ? 'Guardar' : 'Publicar'}</Text>
          )}
        </TouchableOpacity>
      </View>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

// ... (Los estilos se mantienen igual que en tu código anterior)
const styles = StyleSheet.create({
  container: { padding: Spacing.sm },
  headerTitle: { fontSize: FontSizes.xl, fontWeight: 'bold', color: Colors.primary.blue, marginBottom: Spacing.lg, textAlign: 'center' },
  label: { fontSize: FontSizes.sm, fontWeight: FontWeights.bold, color: Colors.text.primary, marginBottom: 6 },
  titleInput: { backgroundColor: '#f9f9f9', borderRadius: BorderRadius.md, padding: Spacing.md, fontSize: FontSizes.md, borderWidth: 1, borderColor: '#e0e0e0', marginBottom: Spacing.lg },
  imageSelector: { marginBottom: Spacing.sm, borderRadius: BorderRadius.md, overflow: 'hidden' },
  previewImage: { width: '100%', height: 200, borderRadius: BorderRadius.md },
  placeholderImage: { width: '100%', height: 120, backgroundColor: '#f0f0f0', borderRadius: BorderRadius.md, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#e0e0e0', borderStyle: 'dashed' },
  placeholderText: { color: Colors.text.light, marginTop: 5 },
  bodyInput: { backgroundColor: '#f9f9f9', borderRadius: BorderRadius.md, padding: Spacing.md, fontSize: FontSizes.sm, minHeight: 150, borderWidth: 1, borderColor: '#e0e0e0', marginBottom: Spacing.xl },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  cancelButton: { flex: 1, padding: Spacing.lg, borderRadius: BorderRadius.lg, alignItems: 'center', borderWidth: 1, borderColor: Colors.text.light },
  cancelButtonText: { color: Colors.text.secondary, fontWeight: 'bold' },
  button: { flex: 2, backgroundColor: Colors.primary.blue, padding: Spacing.lg, borderRadius: BorderRadius.lg, alignItems: 'center' },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: Colors.base.white, fontWeight: FontWeights.bold },
});

export default AddNotice;