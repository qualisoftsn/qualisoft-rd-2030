/**
 * 🛰️ ROOT PAGE - AIGUILLAGE MULTI-TENANT SOUVERAIN
 * RÔLE : Détecter le sous-domaine et afficher soit la Vitrine, soit le Login.
 * -------------------------------------------------------------------------
 */

import { headers } from "next/headers";
import LandingContent from "@/components/landing/LandingContent";
import LoginPage from "@/app/(auth)/login/page";

export default async function RootPage() {
  // 1. Récupération des headers serveur
  const headerList = await headers();
  
  // On récupère le host (ex: sagam.qualisoft.sn) 
  // ou le x-forwarded-host si Nginx est derrière un proxy
  const host = headerList.get("x-forwarded-host") || headerList.get("host") || "";
  
  // 2. Analyse précise du domaine
  const parts = host.split('.');
  const slug = parts[0].toLowerCase();
  
  // 3. Liste d'exclusion (Ceux qui doivent voir la Landing Page)
  // On ajoute 'qualisoft' au cas où on accède via qualisoft.sn sans sous-domaine
  const masterSlugs = [
    'elite', 
    'www', 
    'qualisoft', 
    'localhost', 
    'matrix', 
    'app'
  ];

  // 🚩 LOGIQUE D'AIGUILLAGE CRITIQUE
  
  // Si on a un sous-domaine ET qu'il n'est pas dans la liste Master
  // Exemple : sagam.qualisoft.sn -> parts.length est 3, slug est 'sagam'
  const isClientTenant = parts.length >= 2 && !masterSlugs.includes(slug);

  if (isClientTenant) {
    // On affiche le portail de login. 
    // Le composant LoginPage que nous avons écrit a sa propre logique
    // pour détecter le tenant et afficher "Instance : Sagam".
    return <LoginPage />;
  }

  // Par défaut, ou si c'est un domaine Master : on affiche la Landing
  return <LandingContent />;
}