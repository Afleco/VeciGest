import { StyleSheet, Text, View } from 'react-native';

interface Props {
  mensaje: string;
  nombre: string;
  fecha: string;
  isMine: boolean;
}

export const MessageBubble = ({ mensaje, nombre, fecha, isMine }: Props) => {
  const time = new Date(fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <View style={[styles.bubble, isMine ? styles.myBubble : styles.otherBubble]}>
      {!isMine && <Text style={styles.senderName}>{nombre}</Text>}
      <Text style={styles.text}>{mensaje}</Text>
      <Text style={styles.timestamp}>{time}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  bubble: { padding: 10, borderRadius: 15, marginBottom: 10, maxWidth: '80%', elevation: 1 },
  myBubble: { alignSelf: 'flex-end', backgroundColor: '#DCF8C6', borderBottomRightRadius: 2 },
  otherBubble: { alignSelf: 'flex-start', backgroundColor: '#FFF', borderBottomLeftRadius: 2 },
  senderName: { fontSize: 12, fontWeight: 'bold', color: '#075E54', marginBottom: 2 },
  text: { fontSize: 16 },
  timestamp: { fontSize: 10, color: '#888', alignSelf: 'flex-end', marginTop: 4 }
});