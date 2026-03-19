import { StyleSheet, Text, View } from 'react-native';
import { BorderRadius, Colors, FontSizes, Shadows, Spacing } from '../../styles/theme';

interface Props {
  mensaje: string;
  nombre: string;
  rol: string; 
  fecha: string;
  isMine: boolean;
}

export const MessageBubble = ({ mensaje, nombre, rol, fecha, isMine }: Props) => {
  const time = new Date(fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <View style={[styles.bubble, isMine ? styles.myBubble : styles.otherBubble]}>
      {!isMine && (
        // Anidamos los textos para que se comporten como un párrafo único
        <Text style={styles.senderHeader}>
            <Text style={styles.senderName}>{nombre}</Text>
            <Text style={styles.senderRol}> ({rol})</Text>
        </Text>
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
    // maxWidth para que la burbuja no ocupe todo el ancho
    maxWidth: '85%', 
    ...Shadows.small 
  },
  myBubble: { 
    alignSelf: 'flex-end', 
    backgroundColor: Colors.primary.green, 
    borderBottomRightRadius: 4 
  },
  otherBubble: { 
    alignSelf: 'flex-start', 
    backgroundColor: Colors.base.white, 
    borderBottomLeftRadius: 4 
  },
  senderHeader: {
    marginBottom: Spacing.xs,
    // Forzamos a que el texto herede la alineación base para el anidamiento
    textAlign: 'left', 
  },
  senderName: { 
    fontSize: FontSizes.md, 
    fontWeight: 'bold', 
    color: Colors.primary.blue, 
  },
  senderRol: {
    fontSize: 12,
    color: Colors.text.secondary,
    fontStyle: 'italic',
  },
  // --------------------------------------------------------
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
    fontSize: 12, 
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