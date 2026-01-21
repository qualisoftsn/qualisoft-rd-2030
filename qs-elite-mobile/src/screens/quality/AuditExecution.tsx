import React, { useState } from 'react';
import { 
  StyleSheet, View, Text, ScrollView, TextInput, 
  TouchableOpacity, Alert, ActivityIndicator, Modal 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import axios from 'axios';

// --- Alignement strict sur les Enums du schéma Prisma ---
type FindingType = 'POINT_FORT' | 'CONFORMITE' | 'OBSERVATION' | 'NC_MINEURE' | 'NC_MAJEURE';

const AuditExecution = ({ route, navigation }: any) => {
  const { auditId } = route.params;
  const { token, U_Id, tenantId } = useAuthStore();

  const [description, setDescription] = useState('');
  const [findingType, setFindingType] = useState<FindingType>('CONFORMITE');
  const [loading, setLoading] = useState(false);

  // --- Logique d'Excellence : Enregistrement de la Constatation ---
  const handleAddFinding = async () => {
    if (!description.trim()) {
      Alert.alert("Champ requis", "Veuillez décrire votre constatation d'audit.");
      return;
    }

    setLoading(true);
    try {
      // 1. Création du Finding lié à l'Audit (Modèle Finding Prisma)
      const findingPayload = {
        FI_Description: description,
        FI_Type: findingType,
        FI_AuditId: auditId
      };

      await axios.post(`https://api.elite.qualisoft.sn/v1/quality/audits/${auditId}/findings`, findingPayload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // 2. Logique Automatisée : Si NC, on instancie une NonConformite liée (Modèle NonConformite)
      if (findingType === 'NC_MAJEURE' || findingType === 'NC_MINEURE') {
        const ncPayload = {
          NC_Libelle: `NC issue de l'audit ${auditId}`,
          NC_Description: description,
          NC_Gravite: findingType === 'NC_MAJEURE' ? 'MAJEURE' : 'MINEURE',
          NC_Source: 'INTERNAL_AUDIT',
          NC_AuditId: auditId,
          NC_DetectorId: U_Id,
          tenantId: tenantId
        };
        await axios.post(`https://api.elite.qualisoft.sn/v1/quality/nc`, ncPayload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      Alert.alert("Succès", "Constatation enregistrée. Le Système de Management Intégré a été mis à jour.");
      setDescription('');
      setFindingType('CONFORMITE');
      
    } catch (err) {
      Alert.alert("Erreur technique", "Échec de la synchronisation de l'audit.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close-circle-outline" size={32} color="#94A3B8" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Exécution d'Audit</Text>
        <TouchableOpacity onPress={() => navigation.navigate('AuditSummary', { auditId })}>
          <Ionicons name="checkmark-done-circle" size={32} color="#10B981" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Saisie d'une constatation</Text>
        
        {/* Sélecteur de Type de Finding (Elite UI) */}
        <View style={styles.typeContainer}>
          {(['POINT_FORT', 'CONFORMITE', 'OBSERVATION', 'NC_MINEURE', 'NC_MAJEURE'] as FindingType[]).map((t) => (
            <TouchableOpacity 
              key={t}
              style={[styles.typeBadge, findingType === t && styles.activeBadge, { borderColor: getFindingColor(t) }]}
              onPress={() => setFindingType(t)}
            >
              <Text style={[styles.typeText, findingType === t && styles.activeTypeText]}>
                {t.replace('_', ' ')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Input de Description */}
        <View style={styles.inputCard}>
          <TextInput
            style={styles.textArea}
            placeholder="Décrivez ici les preuves d'audit, les écarts constatés ou les points forts..."
            placeholderTextColor="#475569"
            multiline
            numberOfLines={10}
            value={description}
            onChangeText={setDescription}
          />
        </View>

        {/* Bouton d'Action */}
        <TouchableOpacity 
          style={[styles.mainBtn, loading && styles.disabledBtn]} 
          onPress={handleAddFinding}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Text style={styles.btnText}>Enregistrer le Finding</Text>
              <Ionicons name="add-circle-outline" size={20} color="#FFF" style={{ marginLeft: 10 }} />
            </>
          )}
        </TouchableOpacity>

        <View style={styles.helperBox}>
          <Ionicons name="information-circle-outline" size={20} color="#3B82F6" />
          <Text style={styles.helperText}>
            Toute Non-Conformité (NC) enregistrée ici apparaîtra automatiquement dans le dashboard du Responsable Qualité.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Helper pour les couleurs
const getFindingColor = (type: FindingType) => {
  switch (type) {
    case 'POINT_FORT': return '#10B981';
    case 'NC_MAJEURE': return '#EF4444';
    case 'NC_MINEURE': return '#F59E0B';
    default: return '#334155';
  }
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#1E293B' },
  headerTitle: { color: '#F8FAFC', fontSize: 18, fontWeight: '700' },
  content: { padding: 20 },
  sectionTitle: { color: '#94A3B8', fontSize: 13, fontWeight: '700', textTransform: 'uppercase', marginBottom: 20, letterSpacing: 1 },
  typeContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 25 },
  typeBadge: { borderWidth: 1, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, marginRight: 10, marginBottom: 10 },
  activeBadge: { backgroundColor: '#2563EB', borderColor: '#3B82F6' },
  typeText: { color: '#64748B', fontSize: 11, fontWeight: '800' },
  activeTypeText: { color: '#FFF' },
  inputCard: { backgroundColor: '#1E293B', borderRadius: 16, padding: 15, borderWidth: 1, borderColor: '#334155', minHeight: 200 },
  textArea: { color: '#FFF', fontSize: 16, lineHeight: 24, textAlignVertical: 'top' },
  mainBtn: { backgroundColor: '#2563EB', flexDirection: 'row', padding: 18, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 30 },
  disabledBtn: { opacity: 0.6 },
  btnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  helperBox: { flexDirection: 'row', marginTop: 40, backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: 15, borderRadius: 12, alignItems: 'center' },
  helperText: { color: '#94A3B8', fontSize: 12, marginLeft: 10, flex: 1, lineHeight: 18 }
});

export default AuditExecution;