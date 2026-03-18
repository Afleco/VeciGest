import { StyleSheet, Text, View } from 'react-native';
import { BorderRadius, Colors, FontSizes, Shadows, Spacing } from '../../styles/theme';

interface Props {
  mensaje: string;
  nombre: string;
  rol: string; // <-- AÑADIDO: Prop para el rol
  fecha: string;
  isMine: boolean;
}

export const MessageBubble = ({ mensaje, nombre, rol, fecha, isMine }: Props) => {
  const time = new Date(fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <View style={[styles.bubble, isMine ? styles.myBubble : styles.otherBubble]}>
      {!isMine && (
        // SOLUCIÓN: Renderizamos nombre y rol
        <View style={styles.senderInfo}>
            <Text style={styles.senderName}>{nombre}</Text>
            <Text style={styles.senderRol}> ({rol})</Text>
        </View>
      )}
      <Text style={[styles.text, isMine ? styles.myText : styles.otherText]}>{mensaje}</Text>
      <Text style={[styles.timestamp, isMine ? styles.myTimestamp : styles.otherTimestamp]}>{time}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  bubble: { 
    padding: Spacing.md, 
    borderRadius: BorderRadius.lg, 
    marginBottom: Spacing.sm, 
    maxWidth: '85%', 
    ...Shadows.small 
  },
  myBubble: { 
    alignSelf: 'flex-end', 
    backgroundColor: Colors.primary.green, 
    borderBottomRightRadius: 4 
  },
  // SOLUCIÓN CONTRASTE: Ahora destacan sobre el fondo gris suave de Chats.tsx
  otherBubble: { 
    alignSelf: 'flex-start', 
    backgroundColor: Colors.base.white, 
    borderBottomLeftRadius: 4 
  },
  senderInfo: {
    flexDirection: 'row',
    alignItems: 'baseline', // Alinea el texto por la línea base
    marginBottom: Spacing.xs,
  },
  senderName: { 
    fontSize: FontSizes.xs, 
    fontWeight: 'bold', 
    color: Colors.primary.blue, 
  },
  senderRol: {
    fontSize: 10,
    color: Colors.text.secondary,
    fontStyle: 'italic',
  },
  text: { 
    fontSize: FontSizes.md,
    lineHeight: 22 
  },
  myText: { 
    color: Colors.base.white 
  },
  otherText: { 
    color: Colors.text.primary 
  },
  timestamp: { 
    fontSize: 10, 
    alignSelf: 'flex-end', 
    marginTop: Spacing.xs 
  },
  myTimestamp: { 
    color: 'rgba(255, 255, 255, 0.8)' 
  },
  otherTimestamp: { 
    color: Colors.text.light 
  }
});