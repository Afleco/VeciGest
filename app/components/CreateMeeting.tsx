import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { createElement, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { supabase } from '../../lib/supabase';
import { BorderRadius, Colors, FontSizes, Spacing } from '../../styles/theme';

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

    // Motor de animación para el calendario de iOS
    const slideAnim = useRef(new Animated.Value(300)).current;

    const anioActual = new Date().getFullYear();

    useEffect(() => {
        if (reunionAEditar) {
            setTitulo(reunionAEditar.titulo || '');
            setDescripcion(reunionAEditar.descripcion || '');
            setHora(reunionAEditar.hora || '');
            if (reunionAEditar.fecha) setFechaObj(new Date(reunionAEditar.fecha));
        }
    }, [reunionAEditar]);

    // Dispara la animación de subida cuando se abre el modal en iOS
    useEffect(() => {
        if (showDatePicker && Platform.OS === 'ios') {
            Animated.spring(slideAnim, {
                toValue: 0,
                useNativeDriver: true,
                bounciness: 4,
                speed: 12,
            }).start();
        }
    }, [showDatePicker, slideAnim]);

    // Función para cerrar el modal con animación de bajada en iOS
    const closeIOSDatePicker = () => {
        Animated.timing(slideAnim, {
            toValue: 300,
            duration: 250,
            useNativeDriver: true,
        }).start(() => setShowDatePicker(false));
    };

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

    const formatFecha = (d: Date | null) => {
        if (!d) return `DD-MM-${anioActual}`;
        const dia = String(d.getDate()).padStart(2, '0');
        const mes = String(d.getMonth() + 1).padStart(2, '0');
        const anio = d.getFullYear();
        return `${dia}-${mes}-${anio}`;
    };

    const handleSave = async () => {
        if (!titulo.trim() || !fechaObj || hora.length < 5) {
            const msg = 'Título, fecha y hora son obligatorios.';
            Platform.OS === 'web' ? window.alert(msg) : Alert.alert('Error', msg);
            return;
        }

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
                        <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                            <Text style={styles.label}>Fecha *</Text>
                            <View style={styles.inputContainer}>
                                {Platform.OS === 'web' ? (
                                    createElement('input', {
                                        type: 'date',
                                        value: fechaObj && !isNaN(fechaObj.getTime()) ? fechaObj.toISOString().split('T')[0] : "",
                                        onChange: (e: any) => {
                                            const val = e.target.value;
                                            if (val) {
                                                const [y, m, d] = val.split('-');
                                                setFechaObj(new Date(Number(y), Number(m) - 1, Number(d)));
                                            } else {
                                                setFechaObj(null);
                                            }
                                        },
                                        style: { 
                                            flex: 1, border: 'none', outline: 'none', fontSize: '16px', 
                                            backgroundColor: 'transparent', color: Colors.text.primary, 
                                            fontFamily: 'inherit', cursor: 'pointer', height: '100%', width: '100%' 
                                        }
                                    })
                                ) : (
                                    <TouchableOpacity 
                                        style={{ flex: 1, height: '100%', justifyContent: 'center' }} 
                                        onPress={() => {
                                            if (Platform.OS === 'ios') slideAnim.setValue(300);
                                            setShowDatePicker(true);
                                        }}
                                    >
                                        <Text style={[styles.input, !fechaObj && { color: Colors.text.light }, { marginTop: 14 }]}>
                                            {formatFecha(fechaObj)}
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>

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

                    {/* Modal de DatePicker para iOS. Mix de Fade (Fondo) y Slide (Contenido) */}
                    {showDatePicker && Platform.OS !== 'web' && (
                        Platform.OS === 'ios' ? (
                            <Modal transparent={true} animationType="fade" visible={showDatePicker} onRequestClose={closeIOSDatePicker}>
                                <View style={styles.iosPickerOverlay}>
                                    {/* Botón invisible para cerrar al tocar el fondo oscuro */}
                                    <Pressable style={StyleSheet.absoluteFill} onPress={closeIOSDatePicker} />
                                    
                                    <Animated.View style={[styles.iosPickerContainer, { transform: [{ translateY: slideAnim }] }]}>
                                        <View style={styles.iosPickerHeader}>
                                            <TouchableOpacity onPress={closeIOSDatePicker}>
                                                <Text style={styles.iosPickerDone}>Hecho</Text>
                                            </TouchableOpacity>
                                        </View>
                                        <DateTimePicker
                                            value={fechaObj || new Date()}
                                            mode="date"
                                            display="spinner"
                                            themeVariant="light" 
                                            style={{ height: 215, width: '100%' }}
                                            onChange={(_, d) => { if (d) setFechaObj(d); }}
                                        />
                                    </Animated.View>
                                </View>
                            </Modal>
                        ) : (
                            <DateTimePicker
                                value={fechaObj || new Date()}
                                mode="date"
                                display="default"
                                onChange={(_, d) => { setShowDatePicker(false); if (d) setFechaObj(d); }}
                            />
                        )
                    )}

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Descripción</Text>
                        <TextInput
                            style={styles.bodyInput}
                            placeholder="Detalles de la reunión..."
                            placeholderTextColor={Colors.text.light}
                            multiline
                            value={descripcion}
                            onChangeText={setDescripcion}
                            textAlignVertical="top"
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
    input: { flex: 1, fontSize: 16, color: Colors.text.primary, ...Platform.select({ web: { outlineStyle: 'none' } as any }) },
    
    bodyInput: { 
        backgroundColor: '#f9f9f9', 
        borderRadius: BorderRadius.md, 
        padding: Spacing.md, 
        fontSize: FontSizes.md, 
        minHeight: 150, 
        borderWidth: 1, 
        borderColor: '#e0e0e0', 
    },

    row: { flexDirection: 'row' },
    buttonRow: { flexDirection: 'row', gap: 12, marginTop: 24 },
    button: { flex: 2, backgroundColor: Colors.primary.orange, padding: 16, borderRadius: 10, alignItems: 'center' },
    buttonSecondary: { flex: 1, padding: 16, borderRadius: 10, borderWidth: 1, borderColor: '#ccc', alignItems: 'center', backgroundColor: Colors.base.white },
    buttonText: { color: '#fff', fontWeight: 'bold' },
    buttonTextSecondary: { color: '#666', fontWeight: 'bold' },
    buttonDisabled: { opacity: 0.7 },

    iosPickerOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    iosPickerContainer: {
        backgroundColor: Colors.base.white,
        paddingBottom: 20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 5,
    },
    iosPickerHeader: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    iosPickerDone: {
        color: Colors.primary.blue,
        fontWeight: 'bold',
        fontSize: 16,
    }
});

export default AddReunion;