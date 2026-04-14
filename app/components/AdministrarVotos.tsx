import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../lib/supabase';
import { Colors, Shadows } from '../../styles/theme';

interface AdministrarVotosProps {
    visible: boolean;
    onClose: () => void;
    selectedReunion: any;
    listaVotosAdmin: any[];
}

const AdministrarVotos: React.FC<AdministrarVotosProps> = ({ visible, onClose, selectedReunion, listaVotosAdmin }) => {
    const [viewAll, setViewAll] = useState(false);
    const [todosLosVotos, setTodosLosVotos] = useState<any[]>([]);
    const [searchDate, setSearchDate] = useState('');
    const [loadingAll, setLoadingAll] = useState(false);

    // Reiniciamos los estados cada vez que se abre el modal
    useEffect(() => {
        if (visible) {
            setViewAll(false);
            setSearchDate('');
        }
    }, [visible]);

    const fetchTodosLosVotos = async () => {
        setLoadingAll(true);
        try {
            const { data, error } = await supabase
                .from('votos_cedidos')
                .select(`
                    cesor, 
                    receptor, 
                    reuniones ( titulo, fecha )
                `)
                .order('id_reunion', { ascending: false });

            if (error) throw error;
            setTodosLosVotos(data || []);
        } catch (error) {
            console.error("Error cargando historial de votos:", error);
        } finally {
            setLoadingAll(false);
        }
    };

    const toggleViewMode = () => {
        if (!viewAll && todosLosVotos.length === 0) {
            fetchTodosLosVotos();
        }
        setViewAll(!viewAll);
        setSearchDate('');
    };

    const votosFiltrados = todosLosVotos.filter(v => {
        if (!searchDate) return true;
        const fechaCruda = v.reuniones?.fecha || '';
        const fechaFormateada = new Date(fechaCruda).toLocaleDateString();
        return fechaCruda.includes(searchDate) || fechaFormateada.includes(searchDate);
    });

    return (
        <Modal visible={visible} animationType="fade" transparent={true}>
            <View style={styles.modalOverlay}>
                <View style={styles.adminModalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>{viewAll ? 'Historial de Votos' : 'Votos Próxima Reunión'}</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close-circle" size={28} color="#ccc" />
                        </TouchableOpacity>
                    </View>
                    
                    {!viewAll && <Text style={styles.reunionSub}>{selectedReunion?.titulo}</Text>}

                    <TouchableOpacity style={styles.toggleBtn} onPress={toggleViewMode}>
                        <Ionicons name={viewAll ? "calendar" : "list"} size={16} color={Colors.primary.orange} />
                        <Text style={styles.toggleBtnText}>
                            {viewAll ? 'Ver solo próxima reunión' : 'Ver todas las reuniones'}
                        </Text>
                    </TouchableOpacity>

                    {viewAll && (
                        <View style={styles.searchContainer}>
                            <Ionicons name="search" size={20} color="#888" />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Buscar por fecha (ej. 15/04/2024)"
                                value={searchDate}
                                onChangeText={setSearchDate}
                            />
                            {searchDate.length > 0 && (
                                <TouchableOpacity onPress={() => setSearchDate('')}>
                                    <Ionicons name="close-circle" size={20} color="#ccc" />
                                </TouchableOpacity>
                            )}
                        </View>
                    )}

                    <ScrollView style={styles.votosList}>
                        {viewAll && loadingAll ? (
                            <ActivityIndicator style={{ marginTop: 20 }} color={Colors.primary.orange} />
                        ) : viewAll ? (
                            votosFiltrados.length > 0 ? (
                                votosFiltrados.map((v, i) => (
                                    <View key={i} style={styles.historyCard}>
                                        <View style={styles.historyCardHeader}>
                                            <Ionicons name="calendar-outline" size={14} color="#666" />
                                            <Text style={styles.historyDateText}>
                                                {v.reuniones?.fecha ? new Date(v.reuniones.fecha).toLocaleDateString() : 'Sin fecha'} - {v.reuniones?.titulo || 'Reunión eliminada'}
                                            </Text>
                                        </View>
                                        <View style={styles.votoRow}>
                                            <View style={styles.viviendaBox}><Text style={styles.viviendaText}>{v.cesor}</Text></View>
                                            <Ionicons name="arrow-forward" size={16} color="#999" />
                                            <View style={[styles.viviendaBox, { backgroundColor: '#e8f5e9' }]}><Text style={[styles.viviendaText, { color: '#2e7d32' }]}>{v.receptor}</Text></View>
                                        </View>
                                    </View>
                                ))
                            ) : (
                                <Text style={styles.emptyText}>No hay votos registrados para esta búsqueda.</Text>
                            )
                        ) : (
                            listaVotosAdmin.length > 0 ? (
                                listaVotosAdmin.map((v, i) => (
                                    <View key={i} style={styles.votoRow}>
                                        <View style={styles.viviendaBox}><Text style={styles.viviendaText}>{v.cesor}</Text></View>
                                        <Ionicons name="arrow-forward" size={16} color="#999" />
                                        <View style={[styles.viviendaBox, { backgroundColor: '#e8f5e9' }]}><Text style={[styles.viviendaText, { color: '#2e7d32' }]}>{v.receptor}</Text></View>
                                    </View>
                                ))
                            ) : (
                                <Text style={styles.emptyText}>Aún no se han cedido votos para esta reunión.</Text>
                            )
                        )}
                    </ScrollView>

                    <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                        <Text style={styles.closeBtnText}>Cerrar Resumen</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
    adminModalContent: { width: '100%', backgroundColor: '#fff', borderRadius: 20, padding: 20, maxHeight: '85%', ...Shadows.medium },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#1a2a3a' },
    reunionSub: { fontSize: 14, color: Colors.primary.orange, marginBottom: 10, fontWeight: '600' },
    
    toggleBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 10, backgroundColor: '#fff0e5', borderRadius: 8, marginBottom: 15 },
    toggleBtnText: { color: Colors.primary.orange, fontWeight: 'bold', fontSize: 14 },
    searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f5f5f5', borderRadius: 10, paddingHorizontal: 12, marginBottom: 10, height: 45 },
    searchInput: { flex: 1, marginLeft: 8, fontSize: 15, color: '#333' },
    
    votosList: { marginVertical: 5 },
    emptyText: { textAlign: 'center', color: '#888', marginTop: 20, fontStyle: 'italic' },
    
    votoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#eee' },
    viviendaBox: { width: '40%', paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#f0f0f0', borderRadius: 8, alignItems: 'center' },
    viviendaText: { fontWeight: 'bold', color: '#444' },
    
    historyCard: { backgroundColor: '#fafafa', borderRadius: 10, padding: 10, marginBottom: 10, borderWidth: 1, borderColor: '#eee' },
    historyCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 5, paddingBottom: 5, borderBottomWidth: 1, borderBottomColor: '#eee' },
    historyDateText: { fontSize: 13, color: '#555', fontWeight: '500' },
    
    closeBtn: { marginTop: 15, backgroundColor: '#1a2a3a', padding: 15, borderRadius: 12, alignItems: 'center' },
    closeBtnText: { color: '#fff', fontWeight: 'bold' }
});

export default AdministrarVotos;