import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Platform } from 'react-native';
import { supabase } from '../../lib/supabase';
import { Colors, Shadows } from '../../styles/theme';
import { Ionicons } from '@expo/vector-icons';
import CustomPicker from '../components/CustomPicker';

interface CederVotoProps {
    reunion: { id: number; fecha: string; titulo: string } | null;
    onClose: () => void;
    onSuccess: () => void;
}

const CederVoto: React.FC<CederVotoProps> = ({ reunion, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [cesorVivienda, setCesorVivienda] = useState('');
    const [receptor, setReceptor] = useState('');
    const [opcionesViviendas, setOpcionesViviendas] = useState<{ label: string; value: string }[]>([]);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        if (reunion) {
            cargarDatos();

            // --- CONFIGURACIÓN REALTIME ---
            const channel = supabase
                .channel(`votos_reunion_${reunion.id}`)
                .on(
                    'postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'votos_cedidos',
                        filter: `id_reunion=eq.${reunion.id}`
                    },
                    (payload) => {
                        console.log('Cambio detectado en Realtime:', payload);
                    }
                )
                .subscribe();

            // Limpieza cerramos la conexión al cerrar el componente
            return () => {
                supabase.removeChannel(channel);
            };
        }
    }, [reunion]);

    const cargarDatos = async () => {
        setFetching(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Obtener el perfil del usuario para saber su vivienda_id (cesor)
            const { data: userData, error: userError } = await supabase
                .from('usuarios')
                .select('vivienda_id')
                .eq('auth_id', user.id)
                .single();

            if (userError) throw userError;
            if (userData) setCesorVivienda(userData.vivienda_id);

            // Cargar todas las viviendas para el receptor (tabla viviendas)
            const { data: viviendasData, error: viviendasError } = await supabase
                .from('viviendas')
                .select('unidad, propietario')
                .order('unidad', { ascending: true });

            if (viviendasError) throw viviendasError;

            if (viviendasData) {
                const formatted = viviendasData
                    .filter(v => v.unidad !== userData?.vivienda_id)
                    .map(v => ({
                        label: `${v.unidad} - ${v.propietario}`,
                        value: v.unidad 
                    }));
                setOpcionesViviendas(formatted);
            }
        } catch (error: any) {
            console.error("Error cargando datos del modal:", error.message);
        } finally {
            setFetching(false);
        }
    };

    const handleGuardar = async () => {
        if (!reunion || !receptor) {
            const msg = 'Por favor, selecciona una vivienda receptora.';
            Platform.OS === 'web' ? window.alert(msg) : Alert.alert('Atención', msg);
            return;
        }

        setLoading(true);
        try {
            // Insertar en votos_cedidos
            // Usamos .select() al final para forzar la confirmación de la inserción
            const { data, error } = await supabase
                .from('votos_cedidos')
                .insert([{
                    id_reunion: reunion.id,
                    cesor: cesorVivienda,
                    receptor: receptor,
                    fecha_cesion: new Date().toISOString()
                }])
                .select(); 

            if (error) throw error;

            if (Platform.OS === 'web') window.alert('Voto delegado con éxito');
            else Alert.alert('Éxito', 'Voto delegado con éxito');
            
            onSuccess();
        } catch (error: any) {
            console.error("Error en inserción:", error);
            Alert.alert('Error', error.message || 'No se pudo guardar la delegación.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.overlay}>
            <View style={styles.modal}>
                <View style={styles.header}>
                    <Text style={styles.title}>Delegar Voto</Text>
                    <TouchableOpacity onPress={onClose} disabled={loading}>
                        <Ionicons name="close-circle" size={28} color="#ccc" />
                    </TouchableOpacity>
                </View>

                {fetching ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator color={Colors.primary.orange} size="large" />
                        <Text style={styles.loadingText}>Cargando datos...</Text>
                    </View>
                ) : (
                    <View style={styles.content}>
                        <View style={styles.fieldGroup}>
                            <Text style={styles.label}>Vivienda que cede:</Text>
                            <View style={styles.readOnlyContainer}>
                                <Ionicons name="home" size={20} color={Colors.primary.orange} />
                                <Text style={styles.readOnlyText}>{cesorVivienda || 'No asignada'}</Text>
                            </View>
                        </View>

                        <CustomPicker
                            label="Vivienda receptora *"
                            value={receptor}
                            options={opcionesViviendas}
                            placeholder="Selecciona quién recibirá el voto"
                            onChange={(val) => setReceptor(val)}
                            icon="people-outline"
                            disabled={loading}
                        />

                        <View style={styles.buttonRow}>
                            <TouchableOpacity 
                                style={styles.btnCancel} 
                                onPress={onClose}
                                disabled={loading}
                            >
                                <Text style={styles.btnTextCancel}>Cerrar</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity 
                                style={[styles.btnConfirm, loading && { opacity: 0.7 }]} 
                                onPress={handleGuardar}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.btnTextConfirm}>Confirmar</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    overlay: { 
        flex: 1, 
        backgroundColor: 'rgba(0,0,0,0.6)', 
        justifyContent: 'center', 
        alignItems: 'center',
        padding: 20 
    },
    modal: { 
        width: '100%',
        maxWidth: 500,
        backgroundColor: '#fff', 
        borderRadius: 20, 
        padding: 24, 
        ...Shadows.dark 
    },
    header: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 20 
    },
    title: { fontSize: 22, fontWeight: 'bold', color: Colors.primary.orange },
    content: { gap: 20 },
    loadingContainer: { padding: 40, alignItems: 'center' },
    loadingText: { marginTop: 10, color: '#666' },
    fieldGroup: { marginBottom: 5 },
    label: { fontSize: 15, fontWeight: 'bold', color: '#444', marginBottom: 10 },
    readOnlyContainer: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        backgroundColor: '#f8f8f8', 
        padding: 14, 
        borderRadius: 12, 
        gap: 12, 
        borderWidth: 1, 
        borderColor: '#eee' 
    },
    readOnlyText: { fontSize: 16, fontWeight: '600', color: '#333' },
    buttonRow: { flexDirection: 'row', gap: 12, marginTop: 10 },
    btnCancel: { 
        flex: 1, 
        padding: 16, 
        borderRadius: 12, 
        borderWidth: 1, 
        borderColor: '#ddd', 
        alignItems: 'center' 
    },
    btnConfirm: { 
        flex: 2, 
        backgroundColor: Colors.primary.orange, 
        padding: 16, 
        borderRadius: 12, 
        alignItems: 'center' 
    },
    btnTextCancel: { color: '#777', fontWeight: 'bold', fontSize: 16 },
    btnTextConfirm: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});

export default CederVoto;