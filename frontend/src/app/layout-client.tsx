"use client";

import { useAuth } from "@/core/providers/auth-provider";
import { Loader2 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

export default function LayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuth();
  const [isReady, setIsReady] = useState(false);

  const isPublicPage = pathname === "/" || pathname.startsWith("/auth");

  useEffect(() => {
    if (isPublicPage) {
      setIsReady(true);
      return;
    }

    if (!isLoading) {
      if (!isAuthenticated) {
        router.replace("/auth/login");
      } else {
        setIsReady(true);
      }
    }

    // Fail-safe
    const safetyTimer = setTimeout(() => setIsReady(true), 3000);
    return () => clearTimeout(safetyTimer);
  }, [isAuthenticated, isLoading, pathname, isPublicPage, router]);

  if (!isReady && !isPublicPage) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-4">
        <Loader2 className="animate-spin text-blue-600" size={40} />
        <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest italic animate-pulse">
          Synchronisation Matrix...
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
