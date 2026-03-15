import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    Dimensions,
    FlatList,
    Modal,
    Platform,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    useWindowDimensions
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../providers/AuthProvider';
import { BorderRadius, Colors, Shadows, Spacing } from '../../styles/theme';
import AddAviso from '../components/AddAviso';
import NewsCard from '../components/NewsCard';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const Avisos = () => {
    const [avisos, setAvisos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingAviso, setEditingAviso] = useState<any | null>(null);
    const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

    const { profile, user } = useAuth();
    
    const rolesPermitidos = ['Presidente', 'Vicepresidente', 'Secretario', 'Administrador'];
    const esDirectiva = rolesPermitidos.includes(profile?.rol || '');

    const { width } = useWindowDimensions();
    const numColumns = width >= 1024 ? 3 : width >= 768 ? 2 : 1;

    const insets = useSafeAreaInsets();

    const getGridMaxWidth = (itemsCount: number) => {
        if (numColumns === 1) return 700;
        const maxItemsInRow = Math.min(itemsCount === 0 ? 1 : itemsCount, numColumns);
        return maxItemsInRow * 420;
    };

    const fetchAvisos = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('avisos')
                .select(`
                    *,
                    profiles:usuarios!email_user ( nombre, rol )
                `)
                .order('id', { ascending: false });

            if (error) throw error;
            setAvisos(data || []);
        } catch (error: any) {
            console.error('Error cargando avisos:', error.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(useCallback(() => { fetchAvisos(); }, []));

    useEffect(() => {
        if (modalVisible) {
            Animated.spring(slideAnim, {
                toValue: 0,
                useNativeDriver: true,
                bounciness: 5,
                speed: 12,
            }).start();
        }
    }, [modalVisible]);

    const closeModal = () => {
        Animated.timing(slideAnim, {
            toValue: SCREEN_HEIGHT,
            duration: 250,
            useNativeDriver: true,
        }).start(() => {
            setModalVisible(false);
            setEditingAviso(null);
        });
    };

    const handleDeleteAviso = async (item: any) => {
        const deleteAction = async () => {
            try {
                if (item.imagen_url) {
                    const fileName = item.imagen_url.split('/').pop();
                    if (fileName) {
                        await supabase.storage.from('avisos').remove([fileName]);
                    }
                }
                const { error } = await supabase.from('avisos').delete().eq('id', item.id);
                if (error) throw error;
                fetchAvisos();
            } catch (error: any) {
                Alert.alert('Error', 'No se pudo eliminar: ' + error.message);
            }
        };

        if (Platform.OS === 'web') {
            if (confirm('¿Eliminar este aviso?')) deleteAction();
        } else {
            Alert.alert('Eliminar', '¿Estás seguro?', [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Eliminar', onPress: deleteAction, style: 'destructive' }
            ]);
        }
    };

    const openEditModal = (aviso: any) => {
        slideAnim.setValue(SCREEN_HEIGHT); // Reset de la animación al editar
        setEditingAviso(aviso);
        setModalVisible(true);
    };

    return (
        <View style={{ flex: 1, backgroundColor: Colors.background.main }}>
            <View style={styles.container}>
                {loading && !refreshing ? (
                    <ActivityIndicator size="large" color={Colors.primary.blue} style={{ marginTop: 20 }} />
                ) : (
                    <FlatList
                        key={`grid-${numColumns}`} 
                        data={avisos}
                        keyExtractor={(item) => item.id.toString()}
                        numColumns={numColumns}
                        columnWrapperStyle={numColumns > 1 ? styles.row : undefined}
                        renderItem={({ item }) => {
                            const esAutor = user?.email === item.email_user;
                            const tienePermiso = esDirectiva || esAutor;

                            if (item.notificacion === true && !esAutor && !esDirectiva) {
                                return null;
                            }

                            return (
                                <View style={[styles.cardWrapper, numColumns > 1 && { maxWidth: 400 }]}>
                                    <NewsCard
                                        noticia={item}
                                        canEdit={tienePermiso}
                                        onDelete={() => handleDeleteAviso(item)}
                                        onEdit={() => openEditModal(item)}
                                    />
                                </View>
                            );
                        }}
                        style={[styles.flatList, { maxWidth: getGridMaxWidth(avisos.length) }]}
                        contentContainerStyle={
                            avisos.length > 0
                                ? [styles.coloredContainer, { marginBottom: 80 + insets.bottom }]
                                : { padding: Spacing.lg, paddingBottom: 100 + insets.bottom }
                        }
                        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchAvisos} />}
                        ListEmptyComponent={
                            <Text style={styles.emptyText}>No hay avisos hoy.</Text>
                        }
                    />
                )}
            </View>

            {/* SOLUCIÓN: Cambiado animationType a "fade" para igualar a Noticias */}
            <Modal visible={modalVisible} transparent={true} onRequestClose={closeModal} animationType="fade">
                <View style={styles.modalOverlay}>
                    <Animated.View style={[styles.modalContent, { transform: [{ translateY: slideAnim }] }]}>
                        <AddAviso
                            avisoAEditar={editingAviso}
                            onSuccess={() => { closeModal(); fetchAvisos(); }}
                            onCancel={closeModal}
                        />
                    </Animated.View>
                </View>
            </Modal>

            {esDirectiva && (
                <TouchableOpacity 
                    style={[styles.fab, { bottom: 20 + insets.bottom }]} 
                    onPress={() => {
                        slideAnim.setValue(SCREEN_HEIGHT);
                        setEditingAviso(null);
                        setModalVisible(true);
                    }}
                >
                    <Ionicons name="add" size={32} color="#FFFFFF" />
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    flatList: { width: '100%', alignSelf: 'center' },
    coloredContainer: {
        backgroundColor: Colors.primary.orange, 
        padding: Spacing.md,
        margin: Spacing.md,
        borderRadius: BorderRadius.lg,
        ...Shadows.small,
    },
    row: { gap: Spacing.md, justifyContent: 'center' },
    cardWrapper: { flex: 1 },
    emptyText: { textAlign: 'center', color: Colors.text.light, marginTop: 50, fontSize: 16 },
    fab: { 
        position: 'absolute', 
        right: 20, 
        backgroundColor: Colors.primary.green, 
        width: 60, 
        height: 60, 
        borderRadius: 30, 
        justifyContent: 'center', 
        alignItems: 'center', 
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
    },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { 
        backgroundColor: 'white', 
        borderTopLeftRadius: 20, 
        borderTopRightRadius: 20, 
        height: '90%', 
        padding: Spacing.lg,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
});

export default Avisos;