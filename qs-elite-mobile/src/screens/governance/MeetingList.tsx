import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import axios from 'axios';

// --- Interfaces basées sur les modèles Meeting et GovernanceActivity ---
interface Meeting {
  MG_Id: string;
  MG_Title: string;
  MG_Date: string;
  MG_Status: 'PLANIFIE' | 'EN_COURS' | 'TERMINE' | 'ANNULE';
  MG_Processus?: { PR_Libelle: string };
  _count: { MG_Attendees: number };
}

const MeetingList = ({ navigation }: any) => {
  const { token, U_Role } = useAuthStore();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      const response = await axios.get(`https://api.qualisoft.sn/v1/gouvernance/meetings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMeetings(response.data);
    } catch (err) {
      Alert.alert("Erreur", "Impossible de charger les réunions de gouvernance.");
    } finally {
      setLoading(false);
    }
  };

  const renderMeetingItem = ({ item }: { item: Meeting }) => (
    <TouchableOpacity 
      style={styles.meetingCard}
      onPress={() => navigation.navigate('MeetingDetail', { meetingId: item.MG_Id })}
    >
      <View style={styles.cardSidebar}>
        <Text style={styles.dayText}>{new Date(item.MG_Date).getDate()}</Text>
        <Text style={styles.monthText}>
          {new Date(item.MG_Date).toLocaleString('fr-FR', { month: 'short' }).toUpperCase()}
        </Text>
      </View>

      <View style={styles.cardContent}>
        <View style={styles.statusRow}>
          <Text style={[styles.statusBadge, styles[item.MG_Status]]}>
            {item.MG_Status.replace('_', ' ')}
          </Text>
          {item.MG_Processus && (
            <Text style={styles.processTag}>{item.MG_Processus.PR_Libelle}</Text>
          )}
        </View>
        
        <Text style={styles.meetingTitle}>{item.MG_Title}</Text>
        
        <View style={styles.footerRow}>
          <View style={styles.metaItem}>
            <Ionicons name="people-outline" size={14} color="#94A3B8" />
            <Text style={styles.metaText}>{item._count.MG_Attendees} participants</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={14} color="#94A3B8" />
            <Text style={styles.metaText}>
              {new Date(item.MG_Date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Gouvernance</Text>
          <Text style={styles.subtitle}>Instances de décision & Pilotage</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => { /* Logique création */ }}>
          <Ionicons name="calendar-number-outline" size={24} color="#F8FAFC" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#2563EB" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={meetings}
          keyExtractor={(item) => item.MG_Id}
          renderItem={renderMeetingItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.empty}>Aucune réunion planifiée.</Text>}
        />
      )}
    </SafeAreaView>
  );
};

const styles: any = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 25, alignItems: 'center' },
  title: { color: '#F8FAFC', fontSize: 24, fontWeight: '800' },
  subtitle: { color: '#64748B', fontSize: 13, marginTop: 4 },
  addBtn: { backgroundColor: '#2563EB', padding: 12, borderRadius: 15 },
  list: { paddingHorizontal: 20 },
  meetingCard: { 
    flexDirection: 'row', backgroundColor: '#1E293B', borderRadius: 20, 
    marginBottom: 15, overflow: 'hidden', borderWidth: 1, borderColor: '#334155' 
  },
  cardSidebar: { 
    backgroundColor: '#334155', width: 70, justifyContent: 'center', 
    alignItems: 'center', paddingVertical: 15 
  },
  dayText: { color: '#F8FAFC', fontSize: 22, fontWeight: '800' },
  monthText: { color: '#94A3B8', fontSize: 12, fontWeight: '700', marginTop: 2 },
  cardContent: { flex: 1, padding: 15 },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  statusBadge: { fontSize: 9, fontWeight: '800', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginRight: 8, color: '#FFF', overflow: 'hidden' },
  PLANIFIE: { backgroundColor: '#3B82F6' },
  EN_COURS: { backgroundColor: '#F59E0B' },
  TERMINE: { backgroundColor: '#10B981' },
  processTag: { color: '#64748B', fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  meetingTitle: { color: '#F8FAFC', fontSize: 15, fontWeight: '700', marginBottom: 12 },
  footerRow: { flexDirection: 'row', alignItems: 'center' },
  metaItem: { flexDirection: 'row', alignItems: 'center', marginRight: 15 },
  metaText: { color: '#94A3B8', fontSize: 11, marginLeft: 5, fontWeight: '600' },
  empty: { color: '#475569', textAlign: 'center', marginTop: 100 }
});

export default MeetingList;