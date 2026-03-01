import { headers } from "next/headers";
import LoginPage from "@/app/auth/login/page";

/**
 * 🛰️ ROOT PAGE - ELITE & TENANTS
 * Ce projet ne gère QUE les portails d'accès. 
 * La vitrine commerciale est gérée par un autre conteneur (qualisoft-vitrine).
 */
export default async function RootPage() {
  const headerList = await headers();
  
  // On récupère juste le nom du client (ex: "sagam" ou "matrix") envoyé par le Middleware
  const tenantSlug = headerList.get("x-tenant-slug") || "matrix";

  // On affiche directement le portail de connexion avec le bon contexte
  return <LoginPage tenantSlug={tenantSlug} />;
}