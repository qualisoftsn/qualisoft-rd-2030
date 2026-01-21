import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from '../../store/authStore';

const ProcessReviewForm = ({ route, navigation }: any) => {
  const { processId, processLibelle } = route.params;
  const { token, tenantId } = useAuthStore();

  // --- État conforme au modèle ProcessReview de Prisma ---
  const [form, setForm] = useState({
    PRV_Month: new Date().getMonth() + 1,
    PRV_Year: new Date().getFullYear(),
    PRV_PerformanceAnalysis: "",
    PRV_AuditAnalysis: "",
    PRV_RiskAnalysis: "",
    PRV_Decisions: "",
    PRV_PiloteSigned: false,
  });

  const [loading, setLoading] = useState(false);

  const handleSave = async (status: "BROUILLON" | "VALIDEE") => {
    setLoading(true);
    try {
      const payload = {
        ...form,
        PRV_ProcessusId: processId,
        PRV_Status: status,
        tenantId: tenantId,
        PRV_DocRef: "F-QLT-011", // Référence standard définie dans votre schéma
      };

      await axios.post(
        `https://api.elite.qualisoft.sn/v1/quality/process-reviews`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      Alert.alert(
        "Succès",
        `Revue de processus enregistrée en tant que ${status.toLowerCase()}.`,
      );
      navigation.goBack();
    } catch (err) {
      Alert.alert(
        "Erreur",
        "Impossible d'enregistrer la revue. Vérifiez les données.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={28} color="#F8FAFC" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Revue de Processus</Text>
          <Text style={styles.headerSubtitle}>{processLibelle}</Text>
        </View>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Section 1 : Analyse Performance (Indicateurs) */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>1. Analyse de la Performance</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Analysez l'atteinte de vos cibles indicateurs ce mois-ci..."
            placeholderTextColor="#475569"
            multiline
            value={form.PRV_PerformanceAnalysis}
            onChangeText={(t) =>
              setForm({ ...form, PRV_PerformanceAnalysis: t })
            }
          />
        </View>

        {/* Section 2 : Analyse Audits & NC */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>
            2. Analyse des Audits & Non-Conformités
          </Text>
          <TextInput
            style={styles.textArea}
            placeholder="Synthèse des écarts constatés et efficacité des actions..."
            placeholderTextColor="#475569"
            multiline
            value={form.PRV_AuditAnalysis}
            onChangeText={(t) => setForm({ ...form, PRV_AuditAnalysis: t })}
          />
        </View>

        {/* Section 3 : Analyse des Risques */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>3. Analyse des Risques</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Évolution des menaces et opportunités du processus..."
            placeholderTextColor="#475569"
            multiline
            value={form.PRV_RiskAnalysis}
            onChangeText={(t) => setForm({ ...form, PRV_RiskAnalysis: t })}
          />
        </View>

        {/* Signature & Validation */}
        <View style={styles.signSection}>
          <View style={styles.signRow}>
            <Text style={styles.signLabel}>Signer électroniquement</Text>
            <Switch
              value={form.PRV_PiloteSigned}
              onValueChange={(v) => setForm({ ...form, PRV_PiloteSigned: v })}
              trackColor={{ false: "#334155", true: "#10B981" }}
            />
          </View>
          <Text style={styles.signHint}>
            En signant, vous validez l'exactitude des analyses pour la période
            sélectionnée.
          </Text>
        </View>

        <View style={styles.btnGroup}>
          <TouchableOpacity
            style={styles.draftBtn}
            onPress={() => handleSave("BROUILLON")}
          >
            <Text style={styles.draftBtnText}>Enregistrer Brouillon</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.submitBtn,
              !form.PRV_PiloteSigned && styles.disabledBtn,
            ]}
            onPress={() => handleSave("VALIDEE")}
            disabled={!form.PRV_PiloteSigned || loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.submitBtnText}>Valider la Revue</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0F172A" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#1E293B",
  },
  headerTitleContainer: { alignItems: "center" },
  headerTitle: { color: "#F8FAFC", fontSize: 16, fontWeight: "800" },
  headerSubtitle: {
    color: "#2563EB",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    marginTop: 2,
  },
  scroll: { padding: 20 },
  section: { marginBottom: 25 },
  sectionLabel: {
    color: "#F8FAFC",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 12,
  },
  textArea: {
    backgroundColor: "#1E293B",
    color: "#FFF",
    borderRadius: 12,
    padding: 15,
    minHeight: 100,
    textAlignVertical: "top",
    borderWidth: 1,
    borderColor: "#334155",
  },
  signSection: {
    backgroundColor: "rgba(16, 185, 129, 0.05)",
    padding: 20,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.2)",
    marginBottom: 30,
  },
  signRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  signLabel: { color: "#10B981", fontWeight: "700", fontSize: 15 },
  signHint: {
    color: "#64748B",
    fontSize: 11,
    marginTop: 8,
    fontStyle: "italic",
  },
  btnGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 40,
  },
  draftBtn: { width: "45%", padding: 18, alignItems: "center" },
  draftBtnText: { color: "#94A3B8", fontWeight: "700" },
  submitBtn: {
    width: "50%",
    backgroundColor: "#2563EB",
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
  },
  disabledBtn: { backgroundColor: "#334155", opacity: 0.5 },
  submitBtnText: { color: "#FFF", fontWeight: "800" },
});

export default ProcessReviewForm;
