import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

export const useGlobalChat = (chatId: number) => {
  const [messages, setMessages] = useState<any[]>([]);

  // Función para traer los mensajes de la DB
  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('mensajes')
      .select(`
        id, 
        contenido, 
        created_at, 
        user_email,
        usuarios:user_email (nombre, rol, vivienda_id) 
      `) 
      .eq('chat_id', chatId)
      .order('created_at', { ascending: false });
      
    if (error) {
        console.error("❌ Error de Supabase:", error.message);
      } else {
        console.log("✅ Mensajes cargados:", data?.length);
      }
    if (data) setMessages(data);
  };

  useEffect(() => {
    // Al montar el componente, cargamos historial
    fetchMessages();

    // Suscribirse a cambios en tiempo real
    const channel = supabase
      .channel(`chat_${chatId}`) // Crea un canal único para este chat
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'mensajes', 
          filter: `chat_id=eq.${chatId}` 
        },
        () => {
          // Cuando hay un nuevo mensaje, refrescamos la lista
          fetchMessages();
        }
      )
      .subscribe();

    // Limpieza al salir
    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId]);

  // 5. Función para insertar nuevos mensajes
  const sendMessage = async (texto: string, email: string) => {
    if (!texto.trim()) return;
    const { error } = await supabase.from('mensajes').insert([
      { contenido: texto, user_email: email, chat_id: chatId }
    ]);
    if (error) console.error("Error enviando:", error.message);
  };

  return { messages, sendMessage };
};

export default useGlobalChat;