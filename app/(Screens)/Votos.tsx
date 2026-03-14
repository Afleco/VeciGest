import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { supabase } from '../../lib/supabase';
import { Colors, Shadows } from '../../styles/theme';
import CustomPicker from '../components/CustomPicker';

interface CederVotoProps {
    onSuccess?: () => void;
    onCancel?: () => void;
}

const CederVoto: React.FC<CederVotoProps> = ({ onSuccess, onCancel }) => {
    const navigation = useNavigation<any>();
    const [cesorNombre, setCesorNombre] = useState('');
    const [receptor, setReceptor] = useState('');
    const [usuarios, setUsuarios] = useState<{ label: string; value: string }[]>([]);
    const [reunionProxima, setReunionProxima] = useState<{ id: number; fecha: string } | null>(null);
    
    const [loading, setLoading] = useState(false);
    const [fetchingData, setFetchingData] = useState(true);
    const [yaCedio, setYaCedio] = useState(false);

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        setFetchingData(true);
        try {
            // 1. OBTENER NOMBRE DEL USUARIO ACTUAL
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: userData } = await supabase
                .from('usuarios')
                .select('nombre')
                .eq('auth_id', user.id)
                .single();

            let nombreActual = '';
            if (userData) {
                nombreActual = userData.nombre;
                setCesorNombre(nombreActual);
            }

            // 2. BUSCAR REUNIÓN PRÓXIMA
            const hoy = new Date().toISOString();
            const { data: reunionData } = await supabase
                .from('reuniones')
                .select('id, fecha')
                .gte('fecha', hoy)
                .order('fecha', { ascending: true })
                .limit(1)
                .maybeSingle(); // Cambiado a maybeSingle para evitar error si no hay

            if (reunionData) {
                setReunionProxima(reunionData);

                // 3. VERIFICAR SI YA EXISTE UNA CESIÓN
                const { data: votoExistente } = await supabase
                    .from('votos_cedidos')
                    .select('id')
                    .eq('id_reunion', reunionData.id)
                    .eq('cesor', nombreActual)
                    .maybeSingle();

                if (votoExistente) {
                    setYaCedio(true);
                }
            }

            // 4. CARGAR LISTA DE POSIBLES RECEPTORES
            const { data: usuariosData } = await supabase
                .from('usuarios')
                .select('nombre')
                .order('nombre', { ascending: true });

            if (usuariosData) {
                const formatted = usuariosData
                    .filter(u => u.nombre !== nombreActual)
                    .map(u => ({ label: u.nombre, value: u.nombre }));
                setUsuarios(formatted);
            }
        } catch (error: any) {
            console.error("Error cargando datos de cesión:", error.message);
        } finally {
            setFetchingData(false);
        }
    };

    const handleCancel = () => {
        if (onCancel) onCancel();
        navigation.navigate('Inicio');
    };

    const handleSave = async () => {
        if (!reunionProxima || !receptor) {
            const msg = 'Por favor, selecciona un receptor para tu voto.';
            Platform.OS === 'web' ? window.alert(msg) : Alert.alert('Atención', msg);
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase
                .from('votos_cedidos')
                .insert([{
                    id_reunion: reunionProxima.id,
                    cesor: cesorNombre,
                    receptor: receptor,
                    fecha_cesion: new Date().toISOString()
                }]);

            if (error) throw error;
            
            if (Platform.OS === 'web') window.alert('¡Voto cedido con éxito!');
            else Alert.alert('Éxito', '¡Voto cedido con éxito!');
            
            if (onSuccess) onSuccess();
            navigation.navigate('Inicio');
        } catch (error: any) {
            Platform.OS === 'web' ? window.alert(error.message) : Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    if (fetchingData) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={Colors.primary.orange} />
            </View>
        );
    }

    return (
        <KeyboardAvoidingView 
            style={{ flex: 1, backgroundColor: Colors.background.main }} 
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Ionicons name="swap-horizontal-outline" size={50} color={Colors.primary.orange} />
                    <Text style={styles.headerTitle}>Ceder Mi Voto</Text>
                </View>

                <View style={styles.form}>
                    {!reunionProxima ? (
                        <View style={styles.warningBox}>
                            <Ionicons name="calendar-outline" size={40} color="#ccc" />
                            <Text style={styles.warningText}>No hay reuniones próximas disponibles.</Text>
                            <TouchableOpacity style={styles.buttonSecondary} onPress={handleCancel}>
                                <Text style={styles.buttonTextSecondary}>Volver a Inicio</Text>
                            </TouchableOpacity>
                        </View>
                    ) : yaCedio ? (
                        <View style={styles.warningBox}>
                            <Ionicons name="checkmark-circle" size={40} color={Colors.primary.orange} />
                            <Text style={styles.warningText}>
                                Ya has cedido tu voto para la reunión del {new Date(reunionProxima.fecha).toLocaleDateString()}. {"\n\n"}
                                No puedes ceder más votos para esta sesión.
                            </Text>
                            <TouchableOpacity style={styles.buttonSecondary} onPress={handleCancel}>
                                <Text style={styles.buttonTextSecondary}>Volver a Inicio</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <>
                            <View style={styles.reunionBadge}>
                                <Text style={styles.reunionText}>Próxima Reunión: {new Date(reunionProxima.fecha).toLocaleDateString()}</Text>
                            </View>

                            <View style={styles.infoBox}>
                                <Text style={styles.infoLabel}>Cesor (Tú):</Text>
                                {/* CORRECCIÓN: Se cambió <div> por <View> para compatibilidad con React Native */}
                                <View style={styles.readOnlyInput}>
                                    <Ionicons name="person" size={18} color={Colors.text.secondary} />
                                    <Text style={styles.readOnlyText}>{cesorNombre}</Text>
                                </View>
                            </View>

                            <CustomPicker
                                label="Elegir Receptor *"
                                value={receptor}
                                options={usuarios}
                                placeholder="¿Quién recibirá tu voto?"
                                onChange={(val) => setReceptor(val)}
                                icon="hand-right-outline"
                                disabled={loading}
                            />

                            <View style={styles.buttonRow}>
                                <TouchableOpacity style={styles.buttonSecondary} onPress={handleCancel}>
                                    <Text style={styles.buttonTextSecondary}>Cancelar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.button} onPress={handleSave} disabled={loading}>
                                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Confirmar</Text>}
                                </TouchableOpacity>
                            </View>
                        </>
                    )}
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    scrollContent: { paddingBottom: 40 },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 },
    header: { padding: 24, alignItems: 'center', backgroundColor: '#fff' },
    headerTitle: { fontSize: 24, fontWeight: 'bold', color: Colors.primary.orange },
    form: { padding: 20 },
    reunionBadge: { backgroundColor: '#FFF4E5', padding: 12, borderRadius: 10, marginBottom: 20, alignItems: 'center' },
    reunionText: { color: Colors.primary.orange, fontWeight: 'bold' },
    warningBox: { padding: 30, alignItems: 'center', backgroundColor: '#fff', borderRadius: 15, ...Shadows.medium },
    warningText: { textAlign: 'center', color: Colors.text.primary, fontSize: 16, marginVertical: 20, lineHeight: 22 },
    infoBox: { marginBottom: 20 },
    infoLabel: { fontSize: 14, fontWeight: '600', color: Colors.text.secondary, marginBottom: 8 },
    readOnlyInput: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f9f9f9', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#eee', gap: 10 },
    readOnlyText: { fontSize: 16, color: Colors.text.primary, fontWeight: '500' },
    buttonRow: { flexDirection: 'row', gap: 12, marginTop: 10 },
    button: { flex: 2, backgroundColor: Colors.primary.orange, padding: 16, borderRadius: 10, alignItems: 'center' },
    buttonSecondary: { flex: 1, padding: 16, borderRadius: 10, borderWidth: 1, borderColor: '#ccc', alignItems: 'center' },
    buttonText: { color: '#fff', fontWeight: 'bold' },
    buttonTextSecondary: { color: '#666', fontWeight: 'bold' },
});

export default CederVoto;