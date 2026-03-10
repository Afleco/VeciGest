import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

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
      multiline
    />
    <TouchableOpacity onPress={onSend} style={styles.sendBtn}>
      <Ionicons name="send" size={20} color="white" />
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  container: { flexDirection: 'row', padding: 10, backgroundColor: '#F0F0F0', alignItems: 'center' },
  input: { flex: 1, backgroundColor: 'white', borderRadius: 25, paddingHorizontal: 15, paddingVertical: 8, marginRight: 8, fontSize: 16 },
  sendBtn: { backgroundColor: '#075E54', width: 45, height: 45, borderRadius: 25, justifyContent: 'center', alignItems: 'center' }
});