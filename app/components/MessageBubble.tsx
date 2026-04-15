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

      {/* Usamos flexShrink: 1 para todos los mensajes.
          Para que la burbuja ocupe el ancho del texto, pero si este va a superar el ancho de su padre
          haga un salto de linea */}
      <View style={[
        styles.bubble, 
        isMine ? styles.myBubble : styles.otherBubble,
        { flexShrink: 1 } 
      ]}>
        {!isMine && (
          <Text style={styles.senderHeader}>
            <Text style={styles.senderName}>{nombre}</Text>
            <Text style={styles.senderRol}> ({rol})</Text>
          </Text>
        )}
        <Text style={[styles.messageText, isMine ? styles.myMessageText : styles.otherMessageText]}>
          {mensaje}
        </Text>
        <Text style={[styles.timeText, isMine ? styles.myTimeText : styles.otherTimeText]}>
          {time}
        </Text>
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
    width: 44,
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
    fontSize: 14,
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
    color: Colors.text.light,
  },
  messageText: {
    fontSize: FontSizes.md,
    lineHeight: 20,
  },
  myMessageText: {
    color: Colors.base.white,
  },
  otherMessageText: {
    color: Colors.text.primary,
  },
  timeText: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  myTimeText: {
    color: 'rgba(255,255,255,0.7)',
  },
  otherTimeText: {
    color: Colors.text.light,
  },
});

export default MessageBubble;