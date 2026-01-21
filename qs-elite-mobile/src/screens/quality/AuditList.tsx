import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import axios from 'axios';

// --- Interface alignée sur le modèle Audit de Prisma ---
interface Audit {
  AU_Id: string;
  AU_Reference: string;
  AU_Title: string;
  AU_DateAudit: string;
  AU_Status: 'PLANIFIE' | 'EN_COURS' | 'TERMINE' | 'ANNULE';
  AU_Site: { S_Name: string };
  AU_Processus: { PR_Libelle: string } | null;
}

const AuditList = ({ navigation }: any) => {
  const { token, tenantId } = useAuthStore();
  const [audits, setAudits] = useState<Audit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAudits();
  }, []);

  const fetchAudits = async () => {
    try {
      // Filtrage par tenantId assuré par le middleware backend
      const response = await axios.get(`https://api.elite.qualisoft.sn/v1/quality/audits`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAudits(response.data);
    } catch (err) {
      Alert.alert("Erreur", "Impossible de charger le planning des audits.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PLANIFIE': return '#3B82F6';
      case 'EN_COURS': return '#F59E0B';
      case 'TERMINE': return '#10B981';
      default: return '#64748B';
    }
  };

  const renderAuditItem = ({ item }: { item: Audit }) => (
    <TouchableOpacity 
      style={styles.auditCard}
      onPress={() => navigation.navigate('AuditExecution', { auditId: item.AU_Id })}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.refText}>{item.AU_Reference}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.AU_Status) }]}>
          <Text style={styles.statusText}>{item.AU_Status}</Text>
        </View>
      </View>
      
      <Text style={styles.auditTitle}>{item.AU_Title}</Text>
      
      <View style={styles.infoRow}>
        <Ionicons name="location-outline" size={14} color="#94A3B8" />
        <Text style={styles.infoText}>{item.AU_Site.S_Name}</Text>
        <Ionicons name="git-branch-outline" size={14} color="#94A3B8" style={{ marginLeft: 15 }} />
        <Text style={styles.infoText}>{item.AU_Processus?.PR_Libelle || 'SMI Global'}</Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.dateText}>
          Prévu le : {new Date(item.AU_DateAudit).toLocaleDateString('fr-FR')}
        </Text>
        <Ionicons name="chevron-forward-circle" size={24} color="#2563EB" />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Planning Audits</Text>
        <TouchableOpacity onPress={fetchAudits} style={styles.refreshBtn}>
          <Ionicons name="refresh-outline" size={22} color="#F8FAFC" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#2563EB" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={audits}
          keyExtractor={(item) => item.AU_Id}
          renderItem={renderAuditItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.empty}>Aucun audit planifié pour le moment.</Text>}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, alignItems: 'center' },
  title: { color: '#F8FAFC', fontSize: 24, fontWeight: '800' },
  refreshBtn: { backgroundColor: '#1E293B', padding: 10, borderRadius: 12 },
  list: { padding: 20 },
  auditCard: { backgroundColor: '#1E293B', borderRadius: 20, padding: 18, marginBottom: 15, borderWidth: 1, borderColor: '#334155' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  refText: { color: '#64748B', fontSize: 12, fontWeight: '700', letterSpacing: 1 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusText: { color: '#FFF', fontSize: 10, fontWeight: '800' },
  auditTitle: { color: '#F8FAFC', fontSize: 17, fontWeight: '700', marginBottom: 12 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  infoText: { color: '#94A3B8', fontSize: 13, marginLeft: 5 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#334155', paddingTop: 15 },
  dateText: { color: '#F8FAFC', fontSize: 13, fontWeight: '600' },
  empty: { color: '#475569', textAlign: 'center', marginTop: 100 }
});

export default AuditList;