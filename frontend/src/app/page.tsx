/**
 * 🛰️ ROOT PAGE - AIGUILLAGE MULTI-TENANT SOUVERAIN
 * -------------------------------------------------------------------------
 * RÔLE : Distribuer l'affichage et injecter le contexte de Tenant.
 * -------------------------------------------------------------------------
 */

import { headers } from "next/headers";
import LandingContent from "@/components/landing/LandingContent";
import LoginPage from "@/app/auth/login/page";

export default async function RootPage() {
  // 1. Récupération des étiquettes (headers) posées par le Middleware
  const headerList = await headers();
  
  const tenantType = headerList.get("x-tenant-type") || "LANDING";
  const tenantSlug = headerList.get("x-tenant-slug") || "vitrine";

  /**
   * 🚩 LOGIQUE DE ROUTAGE 
   * On utilise 'tenantSlug' pour personnaliser l'expérience client.
   */

  // CAS 1 : LA VITRINE (qualisoft.sn)
  if (tenantType === "LANDING") {
    return <LandingContent />;
  }

  // CAS 2 & 3 : LES PORTAILS (MASTER OU TENANT)
  // 🚀 On injecte le 'tenantSlug' pour que LoginPage sache qui il sert !
  return <LoginPage tenantSlug={tenantSlug} />;
}