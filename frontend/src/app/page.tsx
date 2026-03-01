import { headers } from "next/headers";
import LandingContent from "@/components/landing/LandingContent";
import LoginPage from "@/app/auth/login/page";

export default async function RootPage() {
  const headerList = await headers();
  
  // Lecture des ordres du middleware
  const tenantType = headerList.get("x-tenant-type") || "LANDING";
  const tenantSlug = headerList.get("x-tenant-slug") || "vitrine";

  // 1. SI C'EST LA VITRINE -> On affiche le site commercial
  if (tenantType === "LANDING") {
    return <LandingContent />;
  }

  // 2. SI C'EST ELITE OU UN CLIENT -> On affiche le formulaire
  return <LoginPage tenantSlug={tenantSlug} />;
}