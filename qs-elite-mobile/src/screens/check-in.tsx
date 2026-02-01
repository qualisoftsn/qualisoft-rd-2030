import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router'; // ✅ Remplaçant de useSearchParams
import Signature from 'react-native-signature-canvas'; // ✅ Version Mobile
import apiClient from '@/api/apiClient';
import { ShieldCheck, CheckCircle, RotateCcw } from 'lucide-react-native'; // ✅ Version Native

export default function MobileCheckIn() {
  const { token } = useLocalSearchParams();
  const [status, setStatus] = useState<'IDLE' | 'SIGNING' | 'LOADING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [signature, setSignature] = useState<string | null>(null);

  const handleSignature = (signature: string) => {
    setSignature(signature);
    confirmPresence(signature);
  };

  const confirmPresence = async (sigData: string) => {
    setStatus('LOADING');
    try {
      await apiClient.post('/causeries/validate-attendance', {
        token,
        signature: sigData
      });
      setStatus('SUCCESS');
    } catch (err) {
      setStatus('ERROR');
    }
  };

  if (status === 'SUCCESS') {
    return (
      <View style={styles.container}>
        <CheckCircle size={100} color="#10b981" />
        <Text style={styles.title}>Présence Validée</Text>
        <Text style={styles.subtitle}>Indexé au SMI Qualisoft</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ShieldCheck size={48} color="#3b82f6" />
        <Text style={styles.headerTitle}>Certification SSE</Text>
      </View>

      <View style={styles.signatureBox}>
        <Signature
          onOK={handleSignature}
          descriptionText="Signez ici pour certifier votre présence"
          clearText="Effacer"
          confirmText="Valider"
          webStyle={`.m-signature-pad--footer {display: none; margin: 0px;}`}
        />
      </View>

      {status === 'LOADING' && <ActivityIndicator size="large" color="#3b82f6" />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0F1A', alignItems: 'center', justifyContent: 'center', padding: 20 },
  header: { alignItems: 'center', marginBottom: 30 },
  headerTitle: { color: 'white', fontSize: 24, fontWeight: '900', fontStyle: 'italic', textTransform: 'uppercase' },
  signatureBox: { width: '100%', height: 350, backgroundColor: 'white', borderRadius: 20, overflow: 'hidden' },
  title: { color: '#10b981', fontSize: 28, fontWeight: '900', marginTop: 20 },
  subtitle: { color: '#64748b', fontSize: 12, marginTop: 10, textTransform: 'uppercase' }
});