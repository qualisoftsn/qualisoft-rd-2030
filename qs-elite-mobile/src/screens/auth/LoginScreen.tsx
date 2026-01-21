import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuthStore } from "../../store/authStore";
import apiClient from "../../api/apiClient";

const LoginScreen = ({ route, navigation }: any) => {
  // Récupération sécurisée du tenantData passé par LandingPage
  const { tenantData } = route.params || {
    tenantData: { T_Name: "Organisation", T_Id: "" },
  };

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Accès à l'action globale de connexion (Zustand)
  const setLogin = useAuthStore((state) => state.setLogin);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Champs requis", "Veuillez saisir vos identifiants.");
      return;
    }

    setLoading(true);

    try {
      // APPEL RÉEL À VOTRE BACKEND OVH
      const response = await apiClient.post("/auth/login", {
        email: email.toLowerCase().trim(),
        password: password,
        tenantId: tenantData.T_Id,
      });

      // Extraction des données réelles de la base PostgreSQL (via NestJS)
      const { user, token } = response.data;

      // Persistance des données utilisateur et organisation
      setLogin({
        U_Id: user.U_Id,
        U_Email: user.U_Email,
        U_FirstName: user.U_FirstName,
        U_LastName: user.U_LastName,
        U_Role: user.U_Role, // ADMIN, HSE, PILOTE, etc.
        token: token,
        tenantId: tenantData.T_Id,
        tenantName: tenantData.T_Name,
      });

      // Le RootNavigator basculera automatiquement l'interface vers le Dashboard
    } catch (error: any) {
      console.error("Erreur de login Elite:", error);
      const message = error.response?.data?.message || "Identifiants incorrects ou serveur injoignable.";
      Alert.alert("Échec de connexion", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.tenantName}>{tenantData.T_Name}</Text>
          <Text style={styles.subtitle}>Espace de connexion sécurisé</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Email professionnel</Text>
          <TextInput
            style={styles.input}
            placeholder="votre.nom@entreprise.sn"
            placeholderTextColor="#64748B"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!loading}
          />

          <Text style={styles.label}>Mot de passe</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor="#64748B"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            editable={!loading}
          />

          <TouchableOpacity
            style={[styles.loginBtn, (loading || !email || !password) && styles.disabledBtn]}
            onPress={handleLogin}
            disabled={loading || !email || !password}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.btnText}>Accéder à Qualisoft Elite</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
            disabled={loading}
          >
            <Text style={styles.backBtnText}>Changer d'organisation</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0F172A" },
  content: { flex: 1, justifyContent: "center", padding: 30 },
  header: { alignItems: "center", marginBottom: 40 },
  tenantName: { color: "#F8FAFC", fontSize: 26, fontWeight: "800", textAlign: "center" },
  subtitle: { color: "#2563EB", fontSize: 14, fontWeight: "600", marginTop: 8, textTransform: "uppercase" },
  form: { width: "100%" },
  label: { color: "#94A3B8", fontSize: 12, fontWeight: "700", marginBottom: 8, marginLeft: 4 },
  input: { backgroundColor: "#1E293B", color: "#FFF", height: 55, borderRadius: 12, paddingHorizontal: 15, marginBottom: 20, borderWidth: 1, borderColor: "#334155" },
  loginBtn: { backgroundColor: "#2563EB", height: 60, borderRadius: 12, justifyContent: "center", alignItems: "center", marginTop: 10, elevation: 4 },
  disabledBtn: { opacity: 0.6 },
  btnText: { color: "#FFF", fontWeight: "800", fontSize: 16 },
  backBtn: { marginTop: 25, alignItems: "center" },
  backBtnText: { color: "#64748B", fontWeight: "600", textDecorationLine: "underline" },
});

export default LoginScreen;