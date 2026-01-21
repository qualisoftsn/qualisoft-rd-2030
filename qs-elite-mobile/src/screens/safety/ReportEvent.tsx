import React, { useState } from 'react';
import { 
  StyleSheet, View, Text, ScrollView, TextInput, 
  TouchableOpacity, Alert, ActivityIndicator, Platform, Image 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';

// --- Types conformes aux Énumérations de votre Schéma Prisma ---
type SSEType = 'ACCIDENT_TRAVAIL' | 'DOMMAGE_MATERIEL' | 'PRESQU_ACCIDENT' | 'SITUATION_DANGEREUSE';

const ReportEvent = ({ navigation }: any) => {
  const { U_Id, tenantId, token } = useAuthStore();
  
  // États du formulaire
  const [description, setDescription] = useState('');
  const [type, setType] = useState<SSEType>('SITUATION_DANGEREUSE');
  const [lieu, setLieu] = useState('');
  const [loading, setLoading] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);

  // --- Gestion de la Preuve Photo ---
  const pickImage = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert("Permission refusée", "L'accès à la caméra est nécessaire pour les preuves SSE.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  // --- Soumission du Rapport (Logique Multi-part/Form-data) ---
  const handleReportEvent = async () => {
    if (!description.trim() || !lieu.trim()) {
      Alert.alert("Champs requis", "Veuillez remplir la description et le lieu.");
      return;
    }

    setLoading(true);
    try {
      // 1. Création de l'événement SSE
      const eventPayload = {
        SSE_Type: type,
        SSE_Lieu: lieu,
        SSE_Description: description,
        SSE_ReporterId: U_Id,
        tenantId: tenantId,
        SSE_DateEvent: new Date().toISOString(),
      };

      const response = await axios.post(`https://api.elite.qualisoft.sn/v1/sse/events`, eventPayload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const eventId = response.data.SSE_Id;

      // 2. Envoi de la photo si elle existe (Correction de l'erreur No Overload)
      if (imageUri) {
        const formData = new FormData();
        
        // Structure spécifique à React Native pour le FormData
        const photo: any = {
          uri: Platform.OS === 'ios' ? imageUri.replace('file://', '') : imageUri,
          type: 'image/jpeg',
          name: `sse_proof_${eventId}.jpg`,
        };

        formData.append('file', photo);
        formData.append('PV_NCId', eventId); // On lie la preuve à l'ID reçu
        formData.append('tenantId', tenantId as string);

        await axios.post(`https://api.elite.qualisoft.sn/v1/preuves/upload`, formData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });
      }

      Alert.alert("Succès", "Déclaration flash enregistrée avec succès.");
      navigation.goBack();
    } catch (err) {
      console.error(err);
      Alert.alert("Erreur", "La transmission a échoué. Vérifiez votre connexion.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.title}>Signalement SSE</Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="close" size={28} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Nature du risque</Text>
        <View style={styles.typeGrid}>
          {(['SITUATION_DANGEREUSE', 'PRESQU_ACCIDENT', 'DOMMAGE_MATERIEL', 'ACCIDENT_TRAVAIL'] as SSEType[]).map((t) => (
            <TouchableOpacity 
              key={t}
              style={[styles.typeCard, type === t && styles.activeCard]}
              onPress={() => setType(t)}
            >
              <Text style={[styles.typeText, type === t && styles.activeText]}>
                {t.replace('_', ' ')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Localisation</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Ex: Zone de stockage A"
          placeholderTextColor="#475569"
          value={lieu}
          onChangeText={setLieu}
        />

        <Text style={styles.label}>Description des faits</Text>
        <TextInput 
          style={[styles.input, styles.textArea]} 
          multiline 
          placeholder="Décrivez brièvement ce que vous avez observé..."
          placeholderTextColor="#475569"
          value={description}
          onChangeText={setDescription}
        />

        <TouchableOpacity style={styles.photoBtn} onPress={pickImage}>
          <Ionicons name="camera" size={20} color="#FFF" />
          <Text style={styles.photoBtnText}>
            {imageUri ? "Changer la photo" : "Prendre une photo de preuve"}
          </Text>
        </TouchableOpacity>

        {imageUri && <Image source={{ uri: imageUri }} style={styles.preview} />}

        <TouchableOpacity 
          style={[styles.submitBtn, loading && styles.disabled]} 
          onPress={handleReportEvent}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitText}>Transmettre le signalement</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  scroll: { padding: 25 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { color: '#F8FAFC', fontSize: 24, fontWeight: '800' },
  label: { color: '#94A3B8', fontSize: 13, fontWeight: '700', textTransform: 'uppercase', marginBottom: 12, marginTop: 20 },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  typeCard: { width: '48%', backgroundColor: '#1E293B', padding: 15, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#334155', alignItems: 'center' },
  activeCard: { backgroundColor: '#2563EB', borderColor: '#3B82F6' },
  typeText: { color: '#64748B', fontSize: 11, fontWeight: '800' },
  activeText: { color: '#FFF' },
  input: { backgroundColor: '#1E293B', color: '#FFF', padding: 15, borderRadius: 12, borderWidth: 1, borderColor: '#334155', fontSize: 15 },
  textArea: { height: 120, textAlignVertical: 'top' },
  photoBtn: { flexDirection: 'row', backgroundColor: '#334155', padding: 15, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 25 },
  photoBtnText: { color: '#FFF', marginLeft: 10, fontWeight: '700' },
  preview: { width: '100%', height: 200, borderRadius: 12, marginTop: 15 },
  submitBtn: { backgroundColor: '#10B981', padding: 20, borderRadius: 12, alignItems: 'center', marginTop: 40, marginBottom: 50 },
  submitText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
  disabled: { opacity: 0.5 }
});

export default ReportEvent;