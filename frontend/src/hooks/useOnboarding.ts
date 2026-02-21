/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

/**
 * 🚀 HOOK : USE ONBOARDING (GÉNÉSE DE TENANT)
 * -------------------------------------------------------------------------
 * FONCTION : Processus de création d'un nouvel environnement scellé (SDE).
 * RÔLE : Enregistrement B2B, initialisation des tables et auto-login.
 */

import api from '../lib/axios'; // Utilisation de l'intercepteur configuré
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export const useOnboarding = () => {
  const router = useRouter();

  const completeOnboarding = async (data: any) => {
    const tid = toast.loading("Construction de la Matrice Qualisoft en cours...");
    try {
      // Appel au Kernel pour générer l'espace disque et les tables virtuelles
      const res = await api.post('/auth/register-tenant', data);

      if (res.status === 201) {
        // Scellage immédiat de la session dans le navigateur
        localStorage.setItem('access_token', res.data.access_token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        
        toast.success("ENVIRONNEMENT SCELLÉ ET OPÉRATIONNEL", { id: tid });
        
        // Redirection vers le cockpit (déclenchera le WelcomeModal)
        router.push('/dashboard?welcome=true');
      }
    } catch (error: any) {
      console.error("Qualisoft Kernel : Échec de création d'instance.", error);
      toast.error(error.response?.data?.message || "Le Kernel a rejeté la demande de provisionnement.", { id: tid });
    }
  };

  return { completeOnboarding };
};