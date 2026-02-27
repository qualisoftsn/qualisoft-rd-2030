/**
 * 🛰️ ROOT PAGE - ARCHITECTURE MULTI-TENANT (SOUVERAINE)
 * Rôle : Aiguillage dynamique basé sur le Header Host (DNS OVH).
 * -------------------------------------------------------------------------
 */

import { headers } from "next/headers";
import LandingContent from "@/components/landing/LandingContent";
import LoginPage from "@/app/(auth)/login/page";

export default async function RootPage() {
  // 1. Récupération du Host depuis les headers (SSR)
  const headerList = await headers();
  const host = headerList.get("host") || "";
  
  // 2. Analyse du sous-domaine (ex: sagam.qualisoft.sn)
  const parts = host.split('.');
  const slug = parts[0].toLowerCase();
  
  // 3. Définition des domaines "Master" qui voient la vitrine
  const masterDomains = [
    'elite', 
    'www', 
    'qualisoft', 
    'localhost', 
    'matrix',
    'app'
  ];

  // 🚩 LOGIQUE D'AIGUILLAGE SANS REDIRECTION (CLOAKING)
  
  // Cas : Sous-domaine client détecté (ex: sagam)
  // On vérifie que parts.length > 2 pour être sûr d'avoir un sous-domaine sur .qualisoft.sn
  if (parts.length >= 2 && !masterDomains.includes(slug)) {
    // On retourne directement le composant Login. 
    // L'URL reste https://sagam.qualisoft.sn mais l'utilisateur voit son portail.
    return <LoginPage />;
  }

  // Cas : Domaine principal ou Master
  // On affiche la Landing Page vitrine.
  return <LandingContent />;
}