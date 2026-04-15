import { StyleSheet, Text, View } from 'react-native';
import { BorderRadius, Colors, FontSizes, Shadows, Spacing } from '../../styles/theme';

interface Props {
  mensaje: string;
  nombre: string;
  rol: string;
  vivienda: string;
  fecha: string;
  isMine: boolean;
}

export const MessageBubble = ({ mensaje, nombre, rol, vivienda, fecha, isMine }: Props) => {
  const time = new Date(fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <View style={[styles.mainContainer, isMine ? { alignSelf: 'flex-end' } : { alignSelf: 'flex-start' }]}>
      {!isMine && (
        <View style={styles.viviendaAvatar}>
          <Text style={styles.viviendaAvatarText}>{vivienda}</Text>
        </View>
      )}

      {/* Aplicamos flex: 1 condicionalmente para que los mensajes propios se encojan */}
      <View style={[
        styles.bubble, 
        isMine ? styles.myBubble : styles.otherBubble,
        !isMine && { flex: 1 } 
      ]}>
        {!isMine && (
          <Text style={styles.senderHeader}>
            <Text style={styles.senderName}>{nombre}</Text>
            <Text style={styles.senderRol}> ({rol})</Text>
          </Text>
        )}
        <Text style={[styles.text, isMine ? styles.myText : styles.otherText]}>{mensaje}</Text>
        <Text style={[styles.timestamp, isMine ? styles.myTimestamp : styles.otherTimestamp]}>{time}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: Spacing.sm,
    maxWidth: '85%',
  },
  viviendaAvatar: {
    width: 44,   // Tamaños de la burbuja del avatar
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary.blue,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.xs,
    ...Shadows.small,
  },
  viviendaAvatarText: {
    color: Colors.base.white,
    fontSize: 14,  // Tamaño de la fuenta del avatar
    fontWeight: 'bold',
  },
  bubble: { 
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    ...Shadows.small,
  },
  myBubble: { 
    backgroundColor: Colors.primary.green,
    borderBottomRightRadius: 4, 
  },
  otherBubble: { 
    backgroundColor: Colors.base.white,
    borderBottomLeftRadius: 4, 
  },
  senderHeader: {
    marginBottom: Spacing.xs,
    textAlign: 'left', 
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
  myText: { color: Colors.base.white },
  otherText: { color: Colors.text.primary },
  timestamp: { 
    fontSize: 10, 
    alignSelf: 'flex-end', 
    marginTop: Spacing.xs
  },
  myTimestamp: { color: 'rgba(255, 255, 255, 0.8)' },
  otherTimestamp: { color: Colors.text.light }
});