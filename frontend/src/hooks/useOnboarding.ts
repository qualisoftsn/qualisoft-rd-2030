/* eslint-disable @typescript-eslint/no-explicit-any */
// frontend/hooks/useOnboarding.ts
import api from '../lib/axios'; // 👈 L'IMPORT MANQUANT
import { useRouter } from 'next/navigation';

export const useOnboarding = () => {
  const router = useRouter();

  const completeOnboarding = async (data: any) => {
    try {
      // Utilisation de l'instance api importée
      const res = await api.post('/auth/register-tenant', data);

      if (res.status === 201) {
        // Stockage du token et des infos user
        localStorage.setItem('access_token', res.data.access_token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        
        // Redirection vers le dashboard avec un paramètre de succès
        router.push('/dashboard?welcome=true');
      }
    } catch (error) {
      console.error("Erreur lors de l'onboarding:", error);
      alert("Une erreur est survenue lors de la création de votre compte.");
    }
  };

  return { completeOnboarding };
};