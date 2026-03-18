import React, { useEffect, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import { Colors, FontSizes, FontWeights, Spacing } from '../../styles/theme';
import { ChatInput } from '../components/ChatInput';
import { MessageBubble } from '../components/MessageBubble';
import { useGlobalChat } from '../hooks/useGlobalChat';

export default function Chats() {
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [userEmail, setUserEmail] = useState<string | null>(null);
  
  const { messages, sendMessage } = useGlobalChat(1);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserEmail(user.email ?? null);
    };
    getUser();
  }, []);

  const handleSend = () => {
    if (nuevoMensaje.trim() && userEmail) {
      sendMessage(nuevoMensaje, userEmail);
      setNuevoMensaje('');
    }
  };

  const formatMessageDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
        return 'Hoy';
    } else if (date.toDateString() === yesterday.toDateString()) {
        return 'Ayer';
    } else {
        return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0} 
      >
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id.toString()}
          inverted
          contentContainerStyle={{ padding: Spacing.md }}
          renderItem={({ item, index }) => {
            const olderMessage = messages[index + 1];
            const showDateHeader = !olderMessage || 
              new Date(item.created_at).toDateString() !== new Date(olderMessage.created_at).toDateString();

            return (
              <View>
                {/* SOLUCIÓN: Separadores de ancho completo con líneas */}
                {showDateHeader && (
                  <View style={styles.dateSeparatorContainer}>
                    <View style={styles.dateLine} />
                    <View style={styles.dateTextWrapper}>
                        <Text style={styles.dateHeaderText}>
                            {formatMessageDate(item.created_at)}
                        </Text>
                    </View>
                    <View style={styles.dateLine} />
                  </View>
                )}
                <MessageBubble
                  mensaje={item.contenido}
                  nombre={item.usuarios?.nombre || 'Vecino'}
                  rol={item.usuarios?.rol || 'Vecino'} // <-- Pasamos el rol
                  fecha={item.created_at}
                  isMine={item.user_email === userEmail}
                />
              </View>
            );
          }}
        />
        <ChatInput 
          value={nuevoMensaje} 
          onChange={setNuevoMensaje} 
          onSend={handleSend} 
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // SOLUCIÓN CONTRASTE: Usamos el fondo gris suave corporativo
    backgroundColor: Colors.background.main, 
  },
  // Estilos para el separador con líneas laterales
  dateSeparatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.lg,
    paddingHorizontal: Spacing.xs,
  },
  dateLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.08)', // Línea muy fina y suave
  },
  dateTextWrapper: {
    paddingHorizontal: Spacing.md,
  },
  dateHeaderText: {
    color: Colors.text.light,
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.bold,
    letterSpacing: 0.5,
  }
});