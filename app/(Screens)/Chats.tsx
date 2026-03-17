import React, { useEffect, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import { ChatInput } from '../components/ChatInput';
import { MessageBubble } from '../components/MessageBubble';
import { useGlobalChat } from '../hooks/GlobalChat';

// El nombre de la función debe coincidir y usar "export default"
export default function Chats() {
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [userEmail, setUserEmail] = useState<string | null>(null);
  
  // Usamos el ID 1 para el chat global
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

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0} 
      >
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id.toString()}
          inverted
          contentContainerStyle={{ padding: 15 }}
          renderItem={({ item }) => (
            <MessageBubble
              mensaje={item.contenido}
              nombre={item.usuarios?.nombre || 'Vecino'}
              fecha={item.created_at}
              isMine={item.user_email === userEmail}
            />
          )}
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
    backgroundColor: '#E5DDD5', 
  }
});