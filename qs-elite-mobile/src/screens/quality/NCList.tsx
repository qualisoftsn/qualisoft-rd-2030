import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import axios from 'axios';

// --- Type conforme au schéma Prisma ---
interface NonConformite {
  NC_Id: string;
  NC_Libelle: string;
  NC_Gravite: 'MINEURE' | 'MAJEURE' | 'CRITIQUE';
  NC_Statut: string;
  NC_CreatedAt: string;
}

const NCList = ({ navigation }: any) => {
  const { tenantId, token } = useAuthStore();
  const [ncs, setNcs] = useState<NonConformite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNCs();
  }, []);

  const fetchNCs = async () => {
    try {
      const response = await axios.get(`https://api.elite.qualisoft.sn/v1/quality/nc`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNcs(response.data);
    } catch (error) {
      console.error("Erreur de récupération NC", error);
    } finally {
      setLoading(false);
    }
  };

  const renderNCItem = ({ item }: { item: NonConformite }) => (
    <TouchableOpacity 
      style={styles.ncCard}
      onPress={() => navigation.navigate('NCDetail', { ncId: item.NC_Id })}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.badge, { backgroundColor: item.NC_Gravite === 'MAJEURE' ? '#EF4444' : '#F59E0B' }]}>
          <Text style={styles.badgeText}>{item.NC_Gravite}</Text>
        </View>
        <Text style={styles.dateText}>{new Date(item.NC_CreatedAt).toLocaleDateString()}</Text>
      </View>
      <Text style={styles.ncTitle}>{item.NC_Libelle}</Text>
      <View style={styles.cardFooter}>
        <View style={styles.statusRow}>
          <Ionicons name="time-outline" size={14} color="#94A3B8" />
          <Text style={styles.statusText}>{item.NC_Statut}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#334155" />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Non-Conformités</Text>
        <TouchableOpacity style={styles.addBtn}>
          <Ionicons name="filter-outline" size={24} color="#F8FAFC" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#2563EB" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={ncs}
          keyExtractor={(item) => item.NC_Id}
          renderItem={renderNCItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Aucune non-conformité détectée.</Text>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, alignItems: 'center' },
  title: { color: '#F8FAFC', fontSize: 24, fontWeight: '800' },
  addBtn: { backgroundColor: '#1E293B', padding: 10, borderRadius: 12 },
  list: { padding: 20 },
  ncCard: { 
    backgroundColor: '#1E293B', borderRadius: 16, padding: 16, marginBottom: 15, 
    borderWidth: 1, borderColor: '#334155' 
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  badgeText: { color: '#FFF', fontSize: 10, fontWeight: '800' },
  dateText: { color: '#64748B', fontSize: 12 },
  ncTitle: { color: '#F8FAFC', fontSize: 16, fontWeight: '700', marginBottom: 15 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#334155', paddingTop: 12 },
  statusRow: { flexDirection: 'row', alignItems: 'center' },
  statusText: { color: '#94A3B8', fontSize: 13, marginLeft: 5, fontWeight: '600' },
  emptyText: { color: '#475569', textAlign: 'center', marginTop: 100, fontSize: 16 }
});

export default NCList;