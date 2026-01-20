import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../../SupaBase/Supabase';
import { BorderRadius, Colors, FontSizes, FontWeights, Shadows, Spacing } from '../../theme';

interface Usuario {
  email: string;
  vivienda_id: string;
  password: string;
  nombre: string;
  rol: string;
  auth_id: string;
}

const ListarUsuarios = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useFocusEffect(
    useCallback(() => {
      cargarUsuarios();
    }, [])
  );

  const cargarUsuarios = async () => {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .order('nombre', { ascending: true });

      if (error) throw error;
      setUsuarios(data || []);
    } catch (error) {
      console.error('Error cargando usuarios:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    cargarUsuarios();
  };

  const usuariosFiltrados = usuarios.filter((usuario) =>
    usuario.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
    usuario.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    usuario.rol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRolColor = (rol: string) => {
    switch (rol) {
      case 'Administrador':
        return Colors.primary.orange;
      case 'Presidente':
        return Colors.primary.green;
      case 'Vicepresidente':
        return Colors.primary.blue;
      default:
        return Colors.text.light;
    }
  };

  const renderUsuario = ({ item }: { item: Usuario }) => (
    <View style={styles.userCard}>
      <View style={styles.userHeader}>
        <Ionicons name="person-circle" size={50} color={Colors.primary.blue} />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.nombre}</Text>
          <Text style={styles.userEmail}>{item.email}</Text>
          <View style={[styles.roleBadge, { backgroundColor: getRolColor(item.rol) }]}>
            <Text style={styles.roleText}>{item.rol}</Text>
          </View>
        </View>
      </View>
      <View style={styles.userDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="home-outline" size={16} color={Colors.text.secondary} />
          <Text style={styles.detailText}>Vivienda: {item.vivienda_id || 'No asignada'}</Text>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary.orange} />
          <Text style={styles.loadingText}>Cargando usuarios...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Usuarios de la Comunidad</Text>
        <Text style={styles.subtitle}>Total: {usuarios.length} usuarios</Text>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color={Colors.text.light} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nombre, email o rol..."
          placeholderTextColor={Colors.text.light}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={Colors.text.light} />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={usuariosFiltrados}
        renderItem={renderUsuario}
        keyExtractor={(item) => item.auth_id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary.orange]}
            tintColor={Colors.primary.orange}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={80} color={Colors.text.light} />
            <Text style={styles.emptyText}>No se encontraron usuarios</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.main,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: FontSizes.md,
    color: Colors.text.secondary,
  },
  header: {
    backgroundColor: Colors.base.white,
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.background.main,
  },
  title: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.bold,
    color: Colors.text.primary,
  },
  subtitle: {
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
    marginTop: Spacing.xs,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.base.white,
    margin: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    ...Shadows.small,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    height: 45,
    fontSize: FontSizes.md,
    color: Colors.text.primary,
  },
  listContainer: {
    padding: Spacing.lg,
    paddingTop: 0,
  },
  userCard: {
    backgroundColor: Colors.base.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadows.small,
  },
  userHeader: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
  },
  userInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  userName: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  userEmail: {
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  roleText: {
    color: Colors.base.white,
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.semibold,
  },
  userDetails: {
    borderTopWidth: 1,
    borderTopColor: Colors.background.main,
    paddingTop: Spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
    marginLeft: Spacing.sm,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxxl,
  },
  emptyText: {
    fontSize: FontSizes.md,
    color: Colors.text.light,
    marginTop: Spacing.md,
  },
});

export default ListarUsuarios;