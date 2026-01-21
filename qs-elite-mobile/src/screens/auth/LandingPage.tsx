import React, { useState } from 'react';
import { 
  StyleSheet, View, Text, TextInput, TouchableOpacity, 
  Image, ActivityIndicator, KeyboardAvoidingView, Platform 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

const LandingPage = ({ navigation }: any) => {
  const [domain, setDomain] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVerifyDomain = async () => {
    if (!domain.trim()) {
      setError("Veuillez saisir votre domaine entreprise.");
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Appel au backend pour vérifier si le tenant existe et est actif (Modèle Tenant)
      const response = await axios.get(`https://api.qualisoft.sn/v1/tenants/check/${domain.toLowerCase()}`);
      
      if (response.data.isValid) {
        navigation.navigate('Login', { 
          tenantData: response.data.tenant 
        });
      } else {
        setError("Domaine inconnu ou compte suspendu.");
      }
    } catch (err) {
      setError("Impossible de joindre le serveur Qualisoft.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0F172A', '#1E293B']} style={styles.background} />
      
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.content}>
        <View style={styles.header}>
          <Image source={require('../../../assets/images/logo-elite.png')} style={styles.logo} resizeMode="contain" />
          <Text style={styles.tagline}>L'Excellence Qualité & Sécurité</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Domaine de l'organisation</Text>
          <View style={styles.inputGroup}>
            <TextInput
              style={styles.input}
              placeholder="votre-entreprise"
              placeholderTextColor="#64748B"
              autoCapitalize="none"
              value={domain}
              onChangeText={(t) => { setDomain(t); setError(''); }}
            />
            <Text style={styles.domainSuffix}>.qualisoft.sn</Text>
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity 
            style={[styles.button, isLoading && styles.btnDisabled]} 
            onPress={handleVerifyDomain}
            disabled={isLoading}
          >
            {isLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.btnText}>Continuer</Text>}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: { ...StyleSheet.absoluteFillObject },
  content: { flex: 1, justifyContent: 'center', padding: 30 },
  header: { alignItems: 'center', marginBottom: 50 },
  logo: { width: 200, height: 60 },
  tagline: { color: '#94A3B8', fontSize: 12, textTransform: 'uppercase', letterSpacing: 2, marginTop: 10 },
  card: { backgroundColor: 'rgba(30, 41, 59, 0.8)', padding: 25, borderRadius: 20, borderWidth: 1, borderColor: '#334155' },
  label: { color: '#F8FAFC', fontWeight: '700', marginBottom: 15 },
  inputGroup: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0F172A', borderRadius: 12, paddingHorizontal: 15, height: 55 },
  input: { flex: 1, color: '#FFF', fontSize: 16 },
  domainSuffix: { color: '#475569', fontWeight: '600' },
  errorText: { color: '#EF4444', fontSize: 12, marginTop: 10 },
  button: { backgroundColor: '#2563EB', height: 55, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 25 },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#FFF', fontWeight: '800', fontSize: 16 }
});

// L'export par défaut indispensable pour le RootNavigator
export default LandingPage;