import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { supabase } from '../../lib/supabase';
import { Colors } from '../../styles/theme';

interface AddReunionProps {
    onSuccess?: () => void;
    onCancel?: () => void;
    reunionAEditar?: any;
}

const AddReunion: React.FC<AddReunionProps> = ({ onSuccess, onCancel, reunionAEditar }) => {
    const [titulo, setTitulo] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [fechaObj, setFechaObj] = useState<Date | null>(null);
    const [hora, setHora] = useState('');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [loading, setLoading] = useState(false);

    const anioActual = new Date().getFullYear();

    useEffect(() => {
        if (reunionAEditar) {
            setTitulo(reunionAEditar.titulo || '');
            setDescripcion(reunionAEditar.descripcion || '');
            setHora(reunionAEditar.hora || '');
            if (reunionAEditar.fecha) setFechaObj(new Date(reunionAEditar.fecha));
        }
    }, [reunionAEditar]);

    const handleHoraChange = (text: string) => {
        if (text === '') { setHora(''); return; }
        const cleaned = text.replace(/[^0-9]/g, '');
        let formatted = cleaned;
        if (cleaned.length > 0) {
            let h = cleaned.slice(0, 2);
            if (parseInt(h) > 23) h = '23';
            if (cleaned.length > 2) {
                let m = cleaned.slice(2, 4);
                if (parseInt(m) > 59) m = '59';
                formatted = `${h}:${m}`;
            } else { formatted = h; }
        }
        if (formatted.length <= 5) setHora(formatted);
    };

    const handleSave = async () => {
        if (!titulo.trim() || !fechaObj || hora.length < 5) {
            const msg = 'Título, fecha y hora son obligatorios.';
            Platform.OS === 'web' ? window.alert(msg) : Alert.alert('Error', msg);
            return;
        }

        // Validación para evitar el crash de toISOString con fechas inválidas
        if (isNaN(fechaObj.getTime())) {
            const msg = 'La fecha no es válida.';
            Platform.OS === 'web' ? window.alert(msg) : Alert.alert('Error', msg);
            return;
        }

        setLoading(true);
        try {
            const datos = {
                titulo: titulo.trim(),
                descripcion: descripcion.trim(),
                fecha: fechaObj.toISOString().split('T')[0],
                hora,
            };
            const { error } = reunionAEditar
                ? await supabase.from('reuniones').update(datos).eq('id', reunionAEditar.id)
                : await supabase.from('reuniones').insert([datos]);

            if (error) throw error;
            if (onSuccess) onSuccess();
        } catch (error: any) {
            Platform.OS === 'web' ? window.alert(error.message) : Alert.alert('Error', error.message);
        } finally { setLoading(false); }
    };

    // Estilo especial para el input de la WEB (evita errores de TypeScript)
    const webInputStyle = {
        flex: 1,
        border: 'none',
        outline: 'none',
        fontSize: '16px',
        height: '100%',
        backgroundColor: 'transparent',
        fontFamily: 'inherit',
        color: '#333',
        cursor: 'pointer',
    };

    return (
        <KeyboardAvoidingView 
            style={{ flex: 1, backgroundColor: Colors.background.main }} 
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Ionicons name="calendar-outline" size={50} color={Colors.primary.orange} />
                    <Text style={styles.headerTitle}>{reunionAEditar ? 'Editar' : 'Nueva'} Reunión</Text>
                </View>

                <View style={styles.form}>
                    {/* Título */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Título de la Reunión *</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons name="bookmark-outline" size={20} color={Colors.text.light} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Ej: Junta Ordinaria"
                                placeholderTextColor={Colors.text.light}
                                value={titulo}
                                onChangeText={setTitulo}
                            />
                        </View>
                    </View>

                    <View style={styles.row}>
                        {/* Fecha */}
                        <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                            <Text style={styles.label}>Fecha *</Text>
                            <View style={styles.inputContainer}>
                                {Platform.OS === 'web' ? (
                                    <input
                                        type="date"
                                        value={fechaObj && !isNaN(fechaObj.getTime()) ? fechaObj.toISOString().split('T')[0] : ""}
                                        onChange={(e) => {
                                            const d = new Date(e.target.value);
                                            if (!isNaN(d.getTime())) setFechaObj(d);
                                        }}
                                        style={webInputStyle as any}
                                    />
                                ) : (
                                    <TouchableOpacity 
                                        style={{ flex: 1, height: '100%', justifyContent: 'center' }} 
                                        onPress={() => setShowDatePicker(true)}
                                    >
                                        <Text style={[styles.input, !fechaObj && { color: Colors.text.light }]}>
                                            {fechaObj ? fechaObj.toLocaleDateString('es-ES') : `DD/MM/${anioActual}`}
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>

                        {/* Hora Input */}
                        <View style={[styles.inputGroup, { flex: 1 }]}>
                            <Text style={styles.label}>Hora *</Text>
                            <View style={styles.inputContainer}>
                                <Ionicons name="time-outline" size={20} color={Colors.text.light} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="00:00"
                                    placeholderTextColor={Colors.text.light}
                                    keyboardType="numeric"
                                    value={hora}
                                    onChangeText={handleHoraChange}
                                    maxLength={5}
                                />
                            </View>
                        </View>
                    </View>

                    {showDatePicker && Platform.OS !== 'web' && (
                        <DateTimePicker
                            value={fechaObj || new Date()}
                            mode="date"
                            display="default"
                            onChange={(_, d) => { setShowDatePicker(false); if (d) setFechaObj(d); }}
                        />
                    )}

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Descripción</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Detalles de la reunión..."
                            placeholderTextColor={Colors.text.light}
                            multiline
                            value={descripcion}
                            onChangeText={setDescripcion}
                        />
                    </View>

                    <View style={styles.buttonRow}>
                        <TouchableOpacity style={styles.buttonSecondary} onPress={onCancel}>
                            <Text style={styles.buttonTextSecondary}>Cancelar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleSave} disabled={loading}>
                            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Guardar</Text>}
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    scrollContent: { paddingBottom: 40 },
    header: { padding: 24, alignItems: 'center', backgroundColor: '#fff' },
    headerTitle: { fontSize: 24, fontWeight: 'bold', color: Colors.primary.orange },
    form: { padding: 16 },
    inputGroup: { marginBottom: 16 },
    label: { fontSize: 16, fontWeight: '600', marginBottom: 8, color: Colors.text.primary },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 8,
        paddingHorizontal: 12,
        height: 50,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    inputIcon: { marginRight: 8 },
    input: { flex: 1, fontSize: 16, color: Colors.text.primary },
    textArea: { height: 100, textAlignVertical: 'top', paddingTop: 12 },
    row: { flexDirection: 'row' },
    buttonRow: { flexDirection: 'row', gap: 12, marginTop: 24 },
    button: { flex: 2, backgroundColor: Colors.primary.orange, padding: 16, borderRadius: 10, alignItems: 'center' },
    buttonSecondary: { flex: 1, padding: 16, borderRadius: 10, borderWidth: 1, borderColor: '#ccc', alignItems: 'center' },
    buttonText: { color: '#fff', fontWeight: 'bold' },
    buttonTextSecondary: { color: '#666', fontWeight: 'bold' },
    buttonDisabled: { opacity: 0.7 }
});

export default AddReunion;