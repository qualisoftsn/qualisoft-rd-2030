import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, View, Text, ScrollView, TouchableOpacity, 
  ActivityIndicator, Alert, Dimensions 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import axios from 'axios'; // Utilisation d'Axios pour les appels API

const { width } = Dimensions.get('window');

// --- Interfaces alignées sur les agrégations du schéma Prisma ---
interface DashboardMetrics {
  totalNonConformites: number;
  ncEnCours: number;
  ncMajeures: number;
  totalActions: number;
  actionsATraiter: number;
  auditsPlanifies: number;
  sseIncidents: number;
  tauxFrequence: number; // Exemple d'indicateur agrégé
  tauxGravite: number; // Exemple d'indicateur agrégé
}

const StrategicDashboard = ({ navigation }: any) => {
  const { U_FirstName, U_LastName, U_Role, tenantName, token } = useAuthStore();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardMetrics();
  }, []);

  const fetchDashboardMetrics = async () => {
    setLoading(true);
    try {
      // Endpoint d'agrégation côté NestJS, qui interroge les modèles Prisma
      const response = await axios.get(`https://api.elite.qualisoft.sn/v1/dashboard/metrics`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMetrics(response.data);
    } catch (err) {
      Alert.alert("Erreur", "Impossible de charger les indicateurs du tableau de bord.");
    } finally {
      setLoading(false);
    }
  };

  const getRoleDisplayName = (role: string | null) => {
    switch (role) {
      case 'SUPER_ADMIN': return 'Super Administrateur';
      case 'ADMIN': return 'Administrateur';
      case 'PILOTE': return 'Pilote de Processus';
      case 'COPILOTE': return 'Co-Pilote de Processus';
      case 'AUDITEUR': return 'Auditeur';
      case 'HSE': return 'Responsable HSE';
      case 'SAFETY_OFFICER': return 'Responsable Sécurité';
      case 'USER': return 'Utilisateur';
      default: return 'Membre';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Header - Accueil et Profil */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>Bonjour, {U_FirstName} !</Text>
            <Text style={styles.roleText}>{getRoleDisplayName(U_Role)} - {tenantName}</Text>
          </View>
          <TouchableOpacity onPress={() => Alert.alert("Profil", "Gérer votre profil")} style={styles.profileBtn}>
            <Ionicons name="person-circle-outline" size={32} color="#F8FAFC" />
          </TouchableOpacity>
        </View>

        {/* Section Indicateurs Clés */}
        <Text style={styles.sectionTitle}>Indicateurs Clés du SMI</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#2563EB" style={styles.loader} />
        ) : (
          <View style={styles.metricsGrid}>
            <MetricCard 
              icon="alert-circle-outline" 
              label="NC en cours" 
              value={metrics?.ncEnCours || 0} 
              color="#EF4444" 
              onPress={() => navigation.navigate('NCList')}
            />
            <MetricCard 
              icon="bulb-outline" 
              label="Actions à traiter" 
              value={metrics?.actionsATraiter || 0} 
              color="#F59E0B" 
              onPress={() => navigation.navigate('ActionList')} // On ajoutera cet écran plus tard
            />
            <MetricCard 
              icon="checkmark-done-outline" 
              label="Audits planifiés" 
              value={metrics?.auditsPlanifies || 0} 
              color="#10B981" 
              onPress={() => navigation.navigate('AuditList')}
            />
            <MetricCard 
              icon="pulse-outline" 
              label="Incidents SSE" 
              value={metrics?.sseIncidents || 0} 
              color="#3B82F6" 
              onPress={() => navigation.navigate('SSEList')} // On ajoutera cet écran plus tard
            />
          </View>
        )}

        {/* Boutons d'Accès Rapide (Actions Rôle-Basées) */}
        <Text style={styles.sectionTitle}>Accès Rapide</Text>
        <View style={styles.quickActions}>
          {U_Role === 'HSE' && (
            <QuickActionButton 
              icon="document-attach-outline" 
              label="Déclarer un événement" 
              onPress={() => navigation.navigate('ReportEvent')} 
            />
          )}
          {(U_Role === 'AUDITEUR' || U_Role === 'ADMIN') && (
            <QuickActionButton 
              icon="calendar-outline" 
              label="Réaliser un audit" 
              onPress={() => navigation.navigate('AuditList')} 
            />
          )}
           {(U_Role === 'PILOTE' || U_Role === 'ADMIN') && (
            <QuickActionButton 
              icon="trending-up-outline" 
              label="Rédiger revue processus" 
              onPress={() => navigation.navigate('ProcessReview', {processId: 'some-id', processLibelle: 'Mon Processus'})} 
            />
          )}
        </View>
        
        {/* Placeholder pour les graphiques futurs */}
        <View style={styles.chartPlaceholder}>
          <Text style={styles.chartText}>Graphiques de performance futurs ici</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

// Composant pour une carte métrique individuelle
const MetricCard = ({ icon, label, value, color, onPress }: any) => (
  <TouchableOpacity style={[styles.metricCard, { borderColor: color + '50' }]} onPress={onPress}>
    <Ionicons name={icon} size={28} color={color} />
    <Text style={styles.metricValue}>{value}</Text>
    <Text style={styles.metricLabel}>{label}</Text>
  </TouchableOpacity>
);

// Composant pour un bouton d'action rapide
const QuickActionButton = ({ icon, label, onPress }: any) => (
  <TouchableOpacity style={styles.quickActionBtn} onPress={onPress}>
    <Ionicons name={icon} size={24} color="#2563EB" />
    <Text style={styles.quickActionText}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  scrollContent: { padding: 25 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  welcomeText: { color: '#F8FAFC', fontSize: 20, fontWeight: '700' },
  roleText: { color: '#94A3B8', fontSize: 13, marginTop: 4 },
  profileBtn: { padding: 5, borderRadius: 20, backgroundColor: '#1E293B' },
  sectionTitle: { color: '#F8FAFC', fontSize: 16, fontWeight: '700', marginBottom: 20, marginTop: 15 },
  loader: { marginTop: 30 },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 30 },
  metricCard: { 
    width: (width - 70) / 2, // 25 padding * 2 + 20 margin = 70
    backgroundColor: '#1E293B', borderRadius: 15, padding: 15, marginBottom: 15,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1 
  },
  metricValue: { color: '#F8FAFC', fontSize: 28, fontWeight: '800', marginTop: 10 },
  metricLabel: { color: '#94A3B8', fontSize: 12, marginTop: 5, textAlign: 'center' },
  quickActions: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 30 },
  quickActionBtn: { 
    width: (width - 70) / 2, // Ajuster pour 2 colonnes
    backgroundColor: '#1E293B', padding: 15, borderRadius: 15, marginBottom: 15,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#334155'
  },
  quickActionText: { color: '#F8FAFC', fontSize: 12, fontWeight: '600', marginTop: 8, textAlign: 'center' },
  chartPlaceholder: { backgroundColor: '#1E293B', height: 200, borderRadius: 15, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#334155' },
  chartText: { color: '#64748B', fontSize: 14 }
});

// L'export par défaut est crucial pour le RootNavigator
export default StrategicDashboard;