import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, View, Text, ScrollView, TouchableOpacity, 
  TextInput, Alert, ActivityIndicator 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import axios from 'axios';

// --- Interfaces basées sur le Schéma Prisma ---
interface Action {
  ACT_Id: string;
  ACT_Title: string;
  ACT_Description: string | null;
  ACT_Status: 'A_FAIRE' | 'EN_COURS' | 'A_VALIDER' | 'TERMINEE' | 'EN_RETARD';
  ACT_Priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  ACT_Deadline: string | null;
  ACT_ResponsableId: string;
}

const ActionDetail = ({ route, navigation }: any) => {
  const { actionId } = route.params;
  const { token, tenantId } = useAuthStore();
  
  const [action, setAction] = useState<Action | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchActionDetails();
  }, []);

  const fetchActionDetails = async () => {
    try {
      const response = await axios.get(`https://api.elite.qualisoft.sn/v1/quality/actions/${actionId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAction(response.data);
    } catch (err) {
      Alert.alert("Erreur", "Impossible de charger les détails de l'action.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    setUpdating(true);
    try {
      // Respect du modèle Prisma : Mise à jour de ACT_Status
      await axios.patch(`https://api.elite.qualisoft.sn/v1/quality/actions/${actionId}`, 
        { ACT_Status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      Alert.alert("Succès", `L'action est désormais : ${newStatus.replace('_', ' ')}`);
      fetchActionDetails(); // Rafraîchir les données
    } catch (err) {
      Alert.alert("Erreur", "La mise à jour a échoué.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <View style={styles.centered}><ActivityIndicator size="large" color="#2563EB" /></View>;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        
        {/* Header Action */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#F8FAFC" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Détails de l'Action</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Corps du Détail */}
        <View style={styles.mainInfo}>
          <View style={[styles.priorityBadge, styles[action?.ACT_Priority || 'MEDIUM']]}>
            <Text style={styles.priorityText}>{action?.ACT_Priority}</Text>
          </View>
          <Text style={styles.title}>{action?.ACT_Title}</Text>
          <Text style={styles.description}>{action?.ACT_Description || "Aucune description fournie."}</Text>
        </View>

        {/* Échéance (ACT_Deadline) */}
        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={20} color="#94A3B8" />
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoLabel}>Échéance</Text>
            <Text style={styles.infoValue}>
              {action?.ACT_Deadline ? new Date(action.ACT_Deadline).toLocaleDateString('fr-FR') : 'Non définie'}
            </Text>
          </View>
        </View>

        {/* Workflow de Statut (ActionStatus Enum) */}
        <Text style={styles.sectionTitle}>Mettre à jour le statut</Text>
        <View style={styles.statusGrid}>
          {['A_FAIRE', 'EN_COURS', 'A_VALIDER', 'TERMINEE'].map((status) => (
            <TouchableOpacity 
              key={status}
              style={[
                styles.statusBtn, 
                action?.ACT_Status === status && styles.activeStatus,
                updating && styles.disabledBtn
              ]}
              onPress={() => handleUpdateStatus(status)}
              disabled={updating}
            >
              <Text style={[styles.statusBtnText, action?.ACT_Status === status && styles.activeStatusText]}>
                {status.replace('_', ' ')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Section Preuve (Modèle Preuve Prisma) */}
        <TouchableOpacity style={styles.preuveBtn}>
          <Ionicons name="camera-outline" size={20} color="#F8FAFC" />
          <Text style={styles.preuveBtnText}>Ajouter une preuve (Photo/Doc)</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles: any = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  centered: { flex: 1, backgroundColor: '#0F172A', justifyContent: 'center', alignItems: 'center' },
  scroll: { padding: 25 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  headerTitle: { color: '#F8FAFC', fontSize: 18, fontWeight: '700' },
  mainInfo: { marginBottom: 30 },
  title: { color: '#F8FAFC', fontSize: 22, fontWeight: '800', marginTop: 10 },
  description: { color: '#94A3B8', fontSize: 15, lineHeight: 22, marginTop: 12 },
  priorityBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  priorityText: { color: '#FFF', fontSize: 10, fontWeight: '800' },
  LOW: { backgroundColor: '#10B981' },
  MEDIUM: { backgroundColor: '#3B82F6' },
  HIGH: { backgroundColor: '#F59E0B' },
  URGENT: { backgroundColor: '#EF4444' },
  infoRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E293B', padding: 15, borderRadius: 12, marginBottom: 25 },
  infoTextContainer: { marginLeft: 15 },
  infoLabel: { color: '#64748B', fontSize: 12, fontWeight: '600' },
  infoValue: { color: '#F8FAFC', fontSize: 15, fontWeight: '700', marginTop: 2 },
  sectionTitle: { color: '#F8FAFC', fontSize: 16, fontWeight: '700', marginBottom: 15 },
  statusGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  statusBtn: { width: '48%', backgroundColor: '#1E293B', padding: 12, borderRadius: 10, marginBottom: 10, alignItems: 'center', borderWidth: 1, borderColor: '#334155' },
  activeStatus: { backgroundColor: '#2563EB', borderColor: '#3B82F6' },
  statusBtnText: { color: '#64748B', fontSize: 12, fontWeight: '700' },
  activeStatusText: { color: '#FFF' },
  disabledBtn: { opacity: 0.5 },
  preuveBtn: { flexDirection: 'row', backgroundColor: '#334155', padding: 18, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 20 },
  preuveBtnText: { color: '#FFF', marginLeft: 10, fontWeight: '700' }
});

export default ActionDetail;