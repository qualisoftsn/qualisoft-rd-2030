/**
 * 🛰️ MODULE : Root Landing Page
 * -------------------------------------------------------------------------
 * RÔLE : Aiguillage serveur vers la vue spécifique au Tenant.
 * RÉVISION : 03 Mars 2026 | 02:40 GMT
 */

import LandingView from "@/components/layout/LandingView";
import { headers } from "next/headers";

export default async function HomePage() {
  const headersList = await headers();
  const tenantSlug = headersList.get("x-tenant-slug") || "elite";
  const tenantType = headersList.get("x-tenant-type") || "LANDING";

  return <LandingView slug={tenantSlug} type={tenantType} />;
}
