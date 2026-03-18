import { Ionicons } from '@expo/vector-icons';
import { Platform, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { BorderRadius, Colors, FontSizes, Shadows, Spacing } from '../../styles/theme';

interface Props {
  value: string;
  onChange: (t: string) => void;
  onSend: () => void;
}

export const ChatInput = ({ value, onChange, onSend }: Props) => (
  <View style={styles.container}>
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={onChange}
      placeholder="Escribe un mensaje..."
      placeholderTextColor={Colors.text.light}
      multiline
    />
    <TouchableOpacity 
      onPress={onSend} 
      style={[styles.sendBtn, !value.trim() && styles.sendBtnDisabled]}
      disabled={!value.trim()}
    >
      <Ionicons name="send" size={20} color={Colors.base.white} />
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  container: { 
    flexDirection: 'row', 
    padding: Spacing.md, 
    backgroundColor: Colors.base.white, 
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  input: { 
    flex: 1, 
    backgroundColor: Colors.background.main, 
    borderRadius: BorderRadius.xl, 
    paddingHorizontal: Spacing.lg, 
    paddingTop: Platform.OS === 'ios' ? 12 : 10,
    paddingBottom: Platform.OS === 'ios' ? 12 : 10,
    marginRight: Spacing.md, 
    fontSize: FontSizes.md,
    color: Colors.text.primary,
    maxHeight: 120, // Permite escribir mensajes largos creciendo en altura
    ...Platform.select({ web: { outlineStyle: 'none' } as any })
  },
  sendBtn: { 
    backgroundColor: Colors.primary.blue, 
    width: 45, 
    height: 45, 
    borderRadius: 25, 
    justifyContent: 'center', 
    alignItems: 'center',
    marginBottom: 2, // Lo alinea perfectamente con la base del input
    ...Shadows.small
  },
  sendBtnDisabled: {
    backgroundColor: Colors.text.light,
    elevation: 0,
    shadowOpacity: 0
  }
});