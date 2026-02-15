import "./globals.css";
import React from "react";
// 👇 Ces imports vont marcher maintenant car les fichiers existent
import AuthProvider from "@/components/providers/AuthProvider"; 
import AuthSync from "@/components/auth/AuthSync";   
import { Toaster } from "sonner";

export const metadata = {
  title: "Qualisoft ELITE",
  description: "Pilotage de votre conformité",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="antialiased">
        <AuthProvider>
          <AuthSync>
            {children}
          </AuthSync>
        </AuthProvider>
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}