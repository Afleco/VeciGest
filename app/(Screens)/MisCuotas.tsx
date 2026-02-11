import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../providers/AuthProvider';
import { BorderRadius, Colors, FontSizes, FontWeights, Shadows, Spacing } from '../../styles/theme';

interface Cuota {
  id: number; 
  fecha: string;
  concepto: string; 
  coste: number;
  pagada: boolean;
  vivienda_id: string;
}

const MisCuotas = () => {
  const { profile, loading: authLoading } = useAuth();
  const [cuotas, setCuotas] = useState<Cuota[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (profile?.vivienda_id) {
        cargarCuotas();
      } else {
        setLoading(false);
      }
    }, [profile])
  );

  const cargarCuotas = async () => {
    try {
      if (!profile?.vivienda_id) return;

      const { data, error } = await supabase
        .from('cuotas')
        .select('*')
        .eq('vivienda_id', profile.vivienda_id)
        .order('fecha', { ascending: false }); // Las más recientes primero

      if (error) throw error;
      setCuotas(data || []);
    } catch (error) {
      console.error('Error cargando cuotas:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    cargarCuotas();
  };

  // Cálculos
  const cuotasPendientes = cuotas.filter(c => !c.pagada);
  const deudaTotal = cuotasPendientes.reduce((acc, curr) => acc + curr.coste, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const renderCuota = ({ item }: { item: Cuota }) => (
    <View style={[styles.card, item.pagada ? styles.cardPaid : styles.cardPending]}>
      <View style={styles.cardHeader}>
        <View style={styles.iconContainer}>
          <Ionicons 
            name={item.pagada ? "checkmark-circle" : "alert-circle"} 
            size={32} 
            color={item.pagada ? Colors.status.success : Colors.status.error} 
          />
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{item.concepto || 'Cuota de Comunidad'}</Text>
          <Text style={styles.cardDate}>{formatDate(item.fecha)}</Text>
        </View>
        <View style={styles.cardAmount}>
          <Text style={[styles.amountText, item.pagada ? { color: Colors.status.success } : { color: Colors.status.error }]}>
            {formatCurrency(item.coste)}
          </Text>
          <Text style={styles.statusText}>
            {item.pagada ? 'PAGADO' : 'PENDIENTE'}
          </Text>
        </View>
      </View>
    </View>
  );

  if (authLoading || loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary.orange} />
      </View>
    );
  }

  // Estado: Usuario sin vivienda asignada
  if (!profile?.vivienda_id) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <Ionicons name="home-outline" size={80} color={Colors.text.light} />
          <Text style={styles.emptyTitle}>Sin Vivienda Asignada</Text>
          <Text style={styles.emptyText}>
            Tu usuario no está vinculado a ninguna vivienda. 
            Contacta con el administrador para ver tus cuotas.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Resumen de Deuda */}
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryLabel}>Deuda Total Pendiente</Text>
        <Text style={[styles.summaryAmount, deudaTotal > 0 ? { color: Colors.status.error } : { color: Colors.status.success }]}>
          {formatCurrency(deudaTotal)}
        </Text>
        {deudaTotal === 0 && (
          <View style={styles.congratsBadge}>
             <Ionicons name="thumbs-up" size={16} color={Colors.base.white} />
             <Text style={styles.congratsText}>¡Estás al día!</Text>
          </View>
        )}
      </View>

      <View style={styles.listContainer}>
        <Text style={styles.sectionTitle}>Historial de Recibos</Text>
        <FlatList
          data={cuotas}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderCuota}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary.orange]} />
          }
          ListEmptyComponent={
            <View style={styles.emptyList}>
              <Text style={styles.emptyText}>No hay recibos registrados.</Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.main,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background.main,
  },
  // Resumen Header
  summaryContainer: {
    backgroundColor: Colors.base.white,
    padding: Spacing.xl,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    ...Shadows.small,
  },
  summaryLabel: {
    fontSize: FontSizes.md,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  summaryAmount: {
    fontSize: 40,
    fontWeight: FontWeights.bold,
  },
  congratsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.status.success,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.sm,
  },
  congratsText: {
    color: Colors.base.white,
    fontWeight: 'bold',
    marginLeft: 6,
    fontSize: FontSizes.sm,
  },
  // Lista
  listContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: Colors.text.primary,
    margin: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  listContent: {
    padding: Spacing.lg,
  },
  // Tarjetas de Cuotas
  card: {
    backgroundColor: Colors.base.white,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    ...Shadows.small,
    borderLeftWidth: 5,
  },
  cardPending: {
    borderLeftColor: Colors.status.error,
  },
  cardPaid: {
    borderLeftColor: Colors.status.success,
    opacity: 0.8, // Un poco más apagado si ya está pagado
  },
  cardHeader: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: Spacing.md,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
    color: Colors.text.primary,
  },
  cardDate: {
    fontSize: FontSizes.xs,
    color: Colors.text.light,
    marginTop: 2,
  },
  cardAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: Colors.text.light,
    marginTop: 2,
  },
  // Empty States
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xxl,
  },
  emptyTitle: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    color: Colors.text.primary,
    marginTop: Spacing.md,
  },
  emptyList: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    color: Colors.text.secondary,
    textAlign: 'center',
  },
});

export default MisCuotas;