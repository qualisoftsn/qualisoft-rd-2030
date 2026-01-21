import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Image, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform, 
  ActivityIndicator,
  Dimensions,
  SafeAreaView
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient'; // Pour un rendu "Elite"
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

// --- Types & Interfaces ---
interface TenantVerificationResponse {
  isValid: boolean;
  name?: string;
  logoUrl?: string;
  plan?: string;
}

const LandingPage: React.FC = ({ navigation }: any) => {
  const [domain, setDomain] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // --- Logique Métier : Validation du Tenant ---
  const handleVerifyDomain = async () => {
    if (!domain.trim()) {
      setError("Veuillez saisir le domaine de votre entreprise.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Appel vers votre Backend NestJS basé sur le schéma Prisma (T_Domain)
      // Remplacez par votre instance axios configurée
      const response = await fetch(`https://api.qualisoft.sn/v1/tenants/verify/${domain.trim().toLowerCase()}`);
      const data: TenantVerificationResponse = await response.json();

      if (data.isValid) {
        // Navigation vers le Login en passant les données du Tenant pour la personnalisation
        navigation.navigate('Login', { 
          tenantName: data.name, 
          tenantDomain: domain.trim().toLowerCase(),
          tenantLogo: data.logoUrl 
        });
      } else {
        setError("Domaine introuvable ou compte inactif. Contactez votre administrateur.");
      }
    } catch (err) {
      setError("Erreur de connexion aux services Qualisoft Elite.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient
        colors={['#0F172A', '#1E293B']} // Palette Navy/Slate "Elite"
        style={styles.background}
      />

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        {/* Section Header & Branding */}
        <View style={styles.header}>
          <Image 
            source={require('../../../assets/images/logo-elite-white.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.tagline}>L'Excellence Opérationnelle QSE & RSE</Text>
        </View>

        {/* Section Input Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Identification de l'organisation</Text>
          <Text style={styles.cardSubtitle}>
            Saisissez le nom de domaine fourni lors de votre souscription Qualisoft.
          </Text>

          <View style={[styles.inputContainer, error ? styles.inputError : null]}>
            <Ionicons name="business-outline" size={20} color="#64748B" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="votre-entreprise"
              placeholderTextColor="#94A3B8"
              value={domain}
              onChangeText={(text) => { setDomain(text); setError(null); }}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />
            <Text style={styles.domainExtension}>.qualisoft.sn</Text>
          </View>

          {error && <Text style={styles.errorText}>{error}</Text>}

          <TouchableOpacity 
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleVerifyDomain}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.buttonText}>Continuer</Text>
                <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Section Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Plateforme certifiée conforme zone UEMOA</Text>
          <View style={styles.footerLinks}>
            <TouchableOpacity><Text style={styles.link}>Besoin d'aide ?</Text></TouchableOpacity>
            <Text style={styles.dot}> • </Text>
            <TouchableOpacity><Text style={styles.link}>Sécurité</Text></TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// --- Design System Qualisoft Elite ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  background: { ...StyleSheet.absoluteFillObject },
  content: { flex: 1, paddingHorizontal: 30, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 50 },
  logo: { width: width * 0.6, height: 80 },
  tagline: { color: '#94A3B8', fontSize: 14, fontWeight: '500', marginTop: 10, letterSpacing: 1 },
  
  card: {
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  cardTitle: { color: '#F8FAFC', fontSize: 18, fontWeight: '700', marginBottom: 8 },
  cardSubtitle: { color: '#94A3B8', fontSize: 13, lineHeight: 20, marginBottom: 24 },
  
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: '#334155',
  },
  inputError: { borderColor: '#EF4444' },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, color: '#F8FAFC', fontSize: 16, fontWeight: '600' },
  domainExtension: { color: '#475569', fontSize: 14, fontWeight: '500' },
  
  errorText: { color: '#EF4444', fontSize: 12, marginTop: 8, marginLeft: 4 },
  
  button: {
    backgroundColor: '#2563EB', // Bleu Qualisoft Elite
    flexDirection: 'row',
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  buttonDisabled: { backgroundColor: '#1E40AF', opacity: 0.6 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', marginRight: 8 },
  
  footer: { position: 'absolute', bottom: 40, left: 0, right: 0, alignItems: 'center' },
  footerText: { color: '#475569', fontSize: 12, marginBottom: 8 },
  footerLinks: { flexDirection: 'row', alignItems: 'center' },
  link: { color: '#64748B', fontSize: 13, fontWeight: '600' },
  dot: { color: '#334155' }
});

export default LandingPage;