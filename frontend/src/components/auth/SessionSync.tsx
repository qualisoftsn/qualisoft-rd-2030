"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { Loader2 } from "lucide-react";

export default function SessionSync({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const setLogin = useAuthStore((state) => state.setLogin);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    // Si NextAuth a trouvé une session (via le cookie SDE)
    // Et que notre Store est vide... ON LE REMPLIT !
    if (status === "authenticated" && session?.user && !user) {
      console.log("🔄 Réhydratation de la session SDE...", session.user);
      setLogin({
        token: "",
        user: session.user
      });
    }
  }, [session, status, user, setLogin]);

  // Pendant que NextAuth vérifie le cookie, on affiche un petit chargement
  if (status === "loading") {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-900 text-white gap-4">
        <Loader2 className="animate-spin text-blue-500" size={48} />
        <p className="text-xs font-black uppercase tracking-widest animate-pulse">
          Vérification Identité Souveraine...
        </p>
      </div>
    );
  }

  // Si après vérification, il n'y a vraiment pas de session, on laisse l'app gérer (ou on redirige)
  return <>{children}</>;
}