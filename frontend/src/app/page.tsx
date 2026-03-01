import { headers } from "next/headers";
import LoginPage from "@/app/auth/login/page";
import LandingContent from "@/components/landing/LandingContent";

/**
 * 🛰️ ROOT PAGE SOUVERAINE - PROJET SAAS (ELITE & MATRIX)
 * -------------------------------------------------------------------------
 * RÔLE : Aiguillage dynamique selon le contexte détecté par le Middleware.
 * 1. LANDING  -> Affiche la page de vente Elite (elite.qualisoft.sn)
 * 2. MASTER   -> Affiche le login de la console Matrix (app.qualisoft.sn)
 * 3. TENANT   -> Affiche le login dédié au client (sagam.qualisoft.sn)
 * -------------------------------------------------------------------------
 */
export default async function RootPage() {
  // Récupération des entêtes de sécurité injectées par le Middleware
  const headerList = await headers();
  
  const tenantType = headerList.get("x-tenant-type") || "TENANT";
  const tenantSlug = headerList.get("x-tenant-slug") || "unknown";
  const isMaster = headerList.get("x-is-master") === "true";

  // --- 🎯 CAS 1 : LA VITRINE COMMERCIALE ELITE ---
  if (tenantType === "LANDING") {
    return <LandingContent />;
  }

  // --- 🔐 CAS 2 : LE PORTAIL DE CONNEXION (MASTER ou TENANT) ---
  return (
    <main className="min-h-screen bg-[#0B0F1A]">
      <LoginPage 
        tenantSlug={tenantSlug} 
        isMaster={isMaster} 
      />
    </main>
  );
}