import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../lib/supabase';
import { Colors, Shadows } from '../../styles/theme';
import AdministrarVotos from '../components/AdministrarVotos';
import CederVoto from '../components/CederVoto';

const ROLES_ADMIN = ['Presidente', 'Vicepresidente', 'Secretario', 'Tesorero', 'Administrador'];

const Reuniones = () => {
    const [reuniones, setReuniones] = useState<any[]>([]);
    const [votosCedidos, setVotosCedidos] = useState<number[]>([]);
    const [userRol, setUserRol] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedReunion, setSelectedReunion] = useState(null);
    
    // Estados Modales
    const [modalVisible, setModalVisible] = useState(false);
    const [adminModalVisible, setAdminModalVisible] = useState(false);
    const [listaVotosAdmin, setListaVotosAdmin] = useState<any[]>([]);

    const getHoyLocal = () => {
        const d = new Date();
        return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0];
    };

    const fetchReuniones = async () => {
        try {
            const hoy = getHoyLocal();
            const { data, error } = await supabase
                .from('reuniones')
                .select('*')
                .gte('fecha', hoy)
                .order('fecha', { ascending: true });

            if (error) throw error;
            setReuniones(data || []);
        } catch (error) {
            console.error("Error cargando reuniones:", error);
        }
    };

    const actualizarEstadoVotos = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: userData } = await supabase
                .from('usuarios')
                .select('vivienda_id, rol')
                .eq('auth_id', user.id)
                .single();

            if (userData) {
                setUserRol(userData.rol);
                const { data: misVotos } = await supabase
                    .from('votos_cedidos')
                    .select('id_reunion')
                    .eq('cesor', userData.vivienda_id);

                setVotosCedidos(misVotos?.map(v => Number(v.id_reunion)) || []);
            }
        } catch (error) {
            console.error("Error actualizando votos:", error);
        }
    };

    const cargarDatosIniciales = async () => {
        if (reuniones.length === 0) setLoading(true);
        await Promise.all([
            fetchReuniones(),
            actualizarEstadoVotos()
        ]);
        setLoading(false);
    };

    useFocusEffect(
        useCallback(() => {
            cargarDatosIniciales();
            const channel = supabase
                .channel('cambios_reuniones_votos')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'votos_cedidos' }, () => {
                    actualizarEstadoVotos();
                })
                .on('postgres_changes', { event: '*', schema: 'public', table: 'reuniones' }, () => {
                    fetchReuniones();
                })
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        }, [])
    );

    const abrirAdminVotos = async () => {
        if (reuniones.length === 0) return;
        
        const proximaReunion: any = reuniones[0];
        try {
            const { data, error } = await supabase
                .from('votos_cedidos')
                .select('cesor, receptor')
                .eq('id_reunion', proximaReunion.id);
            if (error) throw error;
            
            setListaVotosAdmin(data || []);
            setSelectedReunion(proximaReunion);
            setAdminModalVisible(true);
        } catch (error) {
            console.error(error);
        }
    };

    const renderItem = ({ item }: any) => {
        const yaCedio = votosCedidos.includes(Number(item.id));
        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <View style={styles.dateBadge}>
                        <Ionicons name="calendar" size={16} color={Colors.primary.orange} />
                        <Text style={styles.dateText}>{new Date(item.fecha).toLocaleDateString()}</Text>
                    </View>
                    <Text style={styles.hourText}>{item.hora?.substring(0, 5)}h</Text>
                </View>
                <Text style={styles.title}>{item.titulo}</Text>
                <Text style={styles.description}>{item.descripcion}</Text>
                <TouchableOpacity
                    style={[styles.cederButton, yaCedio && styles.cederButtonDisabled]}
                    onPress={() => { setSelectedReunion(item); setModalVisible(true); }}
                    disabled={yaCedio}
                >
                    <Ionicons name={yaCedio ? "checkmark-circle" : "swap-horizontal"} size={18} color="#fff" />
                    <Text style={styles.cederButtonText}>{yaCedio ? "Ya has cedido tu voto para esta reunión" : "Ceder mi voto"}</Text>
                </TouchableOpacity>
            </View>
        );
    };

    if (loading) return <ActivityIndicator style={styles.center} color={Colors.primary.orange} size="large" />;

    return (
        <View style={styles.container}>
            {userRol && ROLES_ADMIN.includes(userRol) && reuniones.length > 0 && (
                <TouchableOpacity style={styles.adminButton} onPress={abrirAdminVotos}>
                    <Ionicons name="people" size={20} color="#fff" />
                    <Text style={styles.adminButtonText}>Administrar Votos</Text>
                </TouchableOpacity>
            )}

            {reuniones.length > 0 && (
                <View style={styles.publicInfoContainer}>
                    <Ionicons name="alert-circle-outline" size={18} color={Colors.primary.orange} />
                    <Text style={styles.publicInfoText}>
                       Las reuniones dejarán de ser visibles al comenzar el día de su celebración (00:00h), 
                       y por ende el plazo para la cesión de votos acabará en ese mismo momento.
                    </Text>
                </View>
            )}

            <FlatList
                data={reuniones}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.warningBox}>
                        <Ionicons name="calendar-outline" size={80} color="#ccc" />
                        <Text style={styles.warningTitle}>Sin reuniones a la vista</Text>
                        <Text style={styles.warningText}>No hay ninguna reunión programada en este momento.</Text>
                    </View>
                }
            />

            {/* Modal para ceder voto */}
            <Modal visible={modalVisible} animationType="slide" transparent={true}>
                <CederVoto
                    reunion={selectedReunion}
                    onClose={() => setModalVisible(false)}
                    onSuccess={() => { setModalVisible(false); actualizarEstadoVotos(); }}
                />
            </Modal>

            {/* Componente Modal Administrar Votos */}
            <AdministrarVotos
                visible={adminModalVisible}
                onClose={() => setAdminModalVisible(false)}
                selectedReunion={selectedReunion}
                listaVotosAdmin={listaVotosAdmin}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background.main },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    listContent: { padding: 16, flexGrow: 1 },
    adminButton: { flexDirection: 'row', backgroundColor: '#1a2a3a', margin: 16, padding: 16, borderRadius: 12, justifyContent: 'center', alignItems: 'center', gap: 10, ...Shadows.medium },
    adminButtonText: { color: '#fff', fontWeight: 'bold' },
    card: { backgroundColor: '#fff', borderRadius: 15, padding: 16, marginBottom: 16, ...Shadows.medium },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    dateBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#FFF4E5', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
    dateText: { color: Colors.primary.orange, fontWeight: 'bold', fontSize: 13 },
    hourText: { color: '#888', fontWeight: '600' },
    title: { fontSize: 18, fontWeight: 'bold', color: Colors.text.primary, marginBottom: 6 },
    description: { fontSize: 14, color: '#666', lineHeight: 20, marginBottom: 16 },
    cederButton: { flexDirection: 'row', backgroundColor: Colors.primary.orange, padding: 14, borderRadius: 10, justifyContent: 'center', alignItems: 'center', gap: 8 },
    cederButtonDisabled: { backgroundColor: '#bbb' },
    cederButtonText: { color: '#fff', fontWeight: 'bold' },
    warningBox: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100, paddingHorizontal: 40 },
    warningTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginTop: 20 },
    warningText: { textAlign: 'center', color: '#999', fontSize: 15, marginTop: 10, lineHeight: 22 },
    publicInfoContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 16, padding: 12, borderRadius: 12, gap: 10, borderLeftWidth: 4, borderLeftColor: Colors.primary.orange, ...Shadows.small },
    publicInfoText: { fontSize: 13, color: '#555', flex: 1, lineHeight: 18, fontWeight: '500' },
});

export default Reuniones;