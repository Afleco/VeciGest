import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../../lib/supabase';
import { BorderRadius, Colors, FontSizes, FontWeights, Shadows, Spacing } from '../../../styles/theme';

interface ViviendaDeuda {
  id: string;
  unidad: string;
  nombrePropietario: string; // El nombre real recuperado de la tabla usuarios
  totalDeuda: number;
  recibosPendientes: number;
}

const GestionCuotas = () => {
  const [data, setData] = useState<ViviendaDeuda[]>([]);
  const [filteredData, setFilteredData] = useState<ViviendaDeuda[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [totalComunidad, setTotalComunidad] = useState(0);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      // Descargamos las 3 tablas necesarias
      const [resViviendas, resCuotas, resUsuarios] = await Promise.all([
        supabase.from('viviendas').select('*').order('unidad', { ascending: true }),
        supabase.from('cuotas').select('coste, vivienda_id').eq('pagada', false),
        supabase.from('usuarios').select('email, nombre') // Necesitamos email para enlazar y nombre para mostrar
      ]);

      if (resViviendas.error) throw resViviendas.error;
      if (resCuotas.error) throw resCuotas.error;
      // Si falla usuarios no bloqueamos, pero no saldrán nombres
      
      const viviendas = resViviendas.data || [];
      const cuotas = resCuotas.data || [];
      const usuarios = resUsuarios.data || [];

      // Procesamos los datos
      const reporte: ViviendaDeuda[] = viviendas.map((vivienda) => {
        // Calcular deuda 
        const susCuotas = cuotas.filter(c => c.vivienda_id === vivienda.unidad);
        const total = susCuotas.reduce((acc, curr) => acc + curr.coste, 0);
        
        // Encontrar el nombre real del propietario
        // vivienda.propietario contiene el EMAIL. Buscamos ese email en la tabla usuarios.
        const emailPropietario = vivienda.propietario; 
        const datosUsuario = usuarios.find(u => u.email === emailPropietario);
        
        // Si encontramos al usuario usamos su nombre, si no, mostramos "Sin propietario" o el email como fallback
        const nombreReal = datosUsuario ? datosUsuario.nombre : (emailPropietario || 'Sin propietario asignado');

        return {
          id: vivienda.id || vivienda.unidad,
          unidad: vivienda.unidad,
          nombrePropietario: nombreReal,
          totalDeuda: total,
          recibosPendientes: susCuotas.length
        };
      });

      // Ordenar (Morosos primero)
      const ordenado = reporte.sort((a, b) => b.totalDeuda - a.totalDeuda);
      
      // Calcular total global
      const granTotal = ordenado.reduce((acc, curr) => acc + curr.totalDeuda, 0);

      setData(ordenado);
      setFilteredData(ordenado);
      setTotalComunidad(granTotal);

    } catch (error) {
      console.error('Error cargando balance:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    cargarDatos();
  };

  // --- BUSCADOR ---
  const handleSearch = (text: string) => {
    setSearch(text);
    if (text) {
      const lowerText = text.toLowerCase();
      const filtered = data.filter(item => 
        // Buscamos SOLO por Unidad o por el Nombre Real que hemos recuperado
        item.unidad.toLowerCase().includes(lowerText) ||
        item.nombrePropietario.toLowerCase().includes(lowerText)
      );
      setFilteredData(filtered);
    } else {
      setFilteredData(data);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount);
  };

  const renderItem = ({ item }: { item: ViviendaDeuda }) => (
    <View style={[styles.card, item.totalDeuda > 0 ? styles.cardDebt : styles.cardClean]}>
      <View style={styles.cardHeader}>
        <View style={styles.unidadBadge}>
          <Text style={styles.unidadText}>{item.unidad}</Text>
        </View>
        
        <View style={styles.infoContainer}>
            {/* Aquí muestra el NOMBRE REAL, no el email */}
            <Text style={styles.propietarioText}>{item.nombrePropietario}</Text>
            
            {item.totalDeuda > 0 ? (
                <Text style={styles.recibosText}>{item.recibosPendientes} recibos pendientes</Text>
            ) : (
                <Text style={styles.cleanText}>Al corriente de pago</Text>
            )}
        </View>
        
        <View style={styles.amountContainer}>
            <Text style={[styles.amountText, item.totalDeuda > 0 ? { color: Colors.status.error } : { color: Colors.status.success }]}>
                {formatCurrency(item.totalDeuda)}
            </Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.summaryHeader}>
        <Text style={styles.summaryLabel}>Deuda Total Comunidad</Text>
        <Text style={styles.summaryAmount}>{formatCurrency(totalComunidad)}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={Colors.text.light} style={styles.searchIcon} />
            <TextInput
                style={styles.searchInput}
                placeholder="Buscar por vivienda o nombre..."
                placeholderTextColor={Colors.text.light}
                value={search}
                onChangeText={handleSearch}
            />
        </View>

        {loading ? (
            <ActivityIndicator size="large" color={Colors.primary.orange} style={{ marginTop: 20 }} />
        ) : (
            <FlatList
                data={filteredData}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary.orange]} />
                }
                ListEmptyComponent={
                    <Text style={styles.emptyText}>No se encontraron datos.</Text>
                }
            />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.main,
  },
  summaryHeader: {
    backgroundColor: Colors.base.white,
    padding: Spacing.xl,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    ...Shadows.small,
  },
  summaryLabel: {
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.xs,
  },
  summaryAmount: {
    fontSize: 32,
    fontWeight: FontWeights.bold,
    color: Colors.status.error,
  },
  content: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.base.white,
    margin: Spacing.lg,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    height: 50,
    ...Shadows.small,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    height: 50,
    fontSize: FontSizes.md,
    color: Colors.text.primary,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  card: {
    backgroundColor: Colors.base.white,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    padding: Spacing.md,
    ...Shadows.small,
    borderLeftWidth: 5,
  },
  cardDebt: {
    borderLeftColor: Colors.status.error,
  },
  cardClean: {
    borderLeftColor: Colors.status.success,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  unidadBadge: {
    backgroundColor: Colors.background.main,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.sm,
    marginRight: Spacing.md,
    minWidth: 50,
    alignItems: 'center',
  },
  unidadText: {
    fontWeight: 'bold',
    fontSize: FontSizes.md,
    color: Colors.text.primary,
  },
  infoContainer: {
    flex: 1,
  },
  propietarioText: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
    color: Colors.text.primary,
  },
  recibosText: {
    fontSize: FontSizes.xs,
    color: Colors.status.error,
    marginTop: 2,
  },
  cleanText: {
    fontSize: FontSizes.xs,
    color: Colors.status.success,
    marginTop: 2,
    fontWeight: '600',
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: Colors.text.secondary,
  },
});

export default GestionCuotas;