import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase'; // Ajusta la ruta a tu cliente

export const useGlobalChat = (chatId: number) => {
  const [messages, setMessages] = useState<any[]>([]);

  // 1. Función para traer los mensajes de la DB
  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('mensajes')
      .select(`
        id, 
        contenido, 
        created_at, 
        user_email,
        usuarios:user_email (nombre)
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
    // 2. Al montar el componente, cargamos historial
    fetchMessages();

    // 3. Suscribirse a cambios en tiempo real
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

    // 4. Limpieza al salir
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