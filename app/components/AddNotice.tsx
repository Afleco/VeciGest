import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView, // IMPORTANTE
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
      setImageUri(noticiaAEditar.imagen_url || null);
    }
  }, [noticiaAEditar]);

  const handleImageSelection = async () => {
    if (Platform.OS === 'web') {
      await pickFromGallery();
      return;
    }
    Alert.alert("Añadir imagen", "Selecciona una opción", [
      { text: "Cancelar", style: "cancel" },
      { text: "Galería", onPress: pickFromGallery },
      { text: "Cámara", onPress: takePhoto },
    ]);
  };

  const pickFromGallery = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') return; 
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, 
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') return;
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.7,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  const uploadImage = async (uri: string): Promise<string | null> => {
    try {
      if (uri.startsWith('http')) return uri;
      const fileExt = uri.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;
      const mimeType = fileExt === 'png' ? 'image/png' : 'image/jpeg';
      let fileBody;
      if (Platform.OS === 'web') {
        const response = await fetch(uri);
        fileBody = await response.blob();
      } else {
        const response = await fetch(uri);
        fileBody = await response.arrayBuffer();
      }
      const { error: uploadError } = await supabase.storage.from('noticias').upload(filePath, fileBody, {
          contentType: Platform.OS === 'web' ? (fileBody as Blob).type : mimeType,
          upsert: false
        });
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from('noticias').getPublicUrl(filePath);
      return urlData.publicUrl;
    } catch (error: any) {
      console.error('Error subiendo imagen:', error);
      return null;
    }
  };

  const handleSave = async () => {
    if (!titulo.trim() || !cuerpo.trim()) {
      const msg = 'Título y descripción obligatorios.';
      Platform.OS === 'web' ? window.alert(msg) : Alert.alert('Aviso', msg);
      return;
    }
    setLoading(true);
    try {
      const contenidoCompleto = `${titulo.trim()}\n${cuerpo.trim()}`;
      let finalImageUrl = null;

      if (imageUri) {
        if (!imageUri.startsWith('http')) {
           finalImageUrl = await uploadImage(imageUri);
           if (!finalImageUrl) throw new Error("Fallo en la subida de imagen");
        } else {
           finalImageUrl = imageUri;
        }
      }

      if (noticiaAEditar && noticiaAEditar.imagen_url) {
        if (noticiaAEditar.imagen_url !== finalImageUrl) {
           const oldFileName = noticiaAEditar.imagen_url.split('/').pop();
           if (oldFileName) {
             await supabase.storage.from('noticias').remove([oldFileName]);
           }
        }
      }

      const datos = {
        contenido: contenidoCompleto,
        email_user: user?.email,
        fecha: new Date().toISOString().split('T')[0],
        imagen_url: finalImageUrl 
      };

      if (noticiaAEditar) {
        const { error } = await supabase.from('noticias').update(datos).eq('id', noticiaAEditar.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('noticias').insert([datos]);
        if (error) throw error;
      }
      if (onSuccess) onSuccess(); 
      
    } catch (error: any) {
      const msg = error.message || 'Error al guardar';
      Platform.OS === 'web' ? window.alert(msg) : Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    // CAMBIO: Wrapper para gestionar el teclado
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
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
        <TouchableOpacity style={styles.imageSelector} onPress={handleImageSelection}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.previewImage} resizeMode="cover" />
          ) : (
            <View style={styles.placeholderImage}>
              <Ionicons name="image-outline" size={40} color={Colors.text.light} />
              <Text style={styles.placeholderText}>Añadir imagen</Text>
            </View>
          )}
        </TouchableOpacity>
        
        {imageUri && (
          <TouchableOpacity onPress={() => setImageUri(null)} style={{ alignItems: 'flex-end', marginBottom: 15 }}>
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
            {loading ? <ActivityIndicator color={Colors.base.white} /> : <Text style={styles.buttonText}>{noticiaAEditar ? 'Guardar Cambios' : 'Publicar'}</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { padding: Spacing.sm, flex: 1 }, // flex: 1 importante
  headerTitle: { fontSize: FontSizes.xl, fontWeight: 'bold', color: Colors.primary.blue, marginBottom: Spacing.lg, textAlign: 'center' },
  label: { fontSize: FontSizes.sm, fontWeight: FontWeights.bold, color: Colors.text.primary, marginBottom: 6 },
  titleInput: { backgroundColor: '#f9f9f9', borderRadius: BorderRadius.md, padding: Spacing.md, fontSize: FontSizes.md, borderWidth: 1, borderColor: '#e0e0e0', marginBottom: Spacing.lg },
  imageSelector: { marginBottom: Spacing.sm, borderRadius: BorderRadius.md, overflow: 'hidden' },
  previewImage: { width: '100%', height: 200, borderRadius: BorderRadius.md },
  placeholderImage: { width: '100%', height: 120, backgroundColor: '#f0f0f0', borderRadius: BorderRadius.md, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#e0e0e0', borderStyle: 'dashed' },
  placeholderText: { color: Colors.text.light, marginTop: 5 },
  bodyInput: { backgroundColor: '#f9f9f9', borderRadius: BorderRadius.md, padding: Spacing.md, fontSize: FontSizes.sm, minHeight: 150, borderWidth: 1, borderColor: '#e0e0e0', marginBottom: Spacing.xl },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, marginTop: Spacing.md },
  cancelButton: { flex: 1, padding: Spacing.lg, borderRadius: BorderRadius.lg, alignItems: 'center', borderWidth: 1, borderColor: Colors.text.light },
  cancelButtonText: { color: Colors.text.secondary, fontWeight: 'bold' },
  button: { flex: 2, backgroundColor: Colors.primary.blue, padding: Spacing.lg, borderRadius: BorderRadius.lg, alignItems: 'center' },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: Colors.base.white, fontWeight: FontWeights.bold },
});

export default AddNotice;