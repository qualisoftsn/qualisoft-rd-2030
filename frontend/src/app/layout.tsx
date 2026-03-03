/**
 * 🛰️ MODULE : layout.tsx (ROOT)
 * -------------------------------------------------------------------------
 * RÔLE : Fondations globales Matrix OS.
 * RÉPARATION : Neutre pour libérer la Landing Page sur elite.qualisoft.sn.
 * RÉVISION : 03 Mars 2026 | 23:35 GMT
 * -------------------------------------------------------------------------
 */

import "./globals.css";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import LayoutClient from "./layout-client";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata = {
  title: "Qualisoft Elite | Matrix SDE",
  description: "Système de Décision Éclairée Souverain",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="scroll-smooth">
      <body className={`${inter.variable} font-sans bg-[#0B0F1A] text-white antialiased`}>
        <Toaster position="top-right" richColors theme="dark" />
        {/* Le LayoutClient gère l'hydratation sans redirection forcée */}
        <LayoutClient>
          {children}
        </LayoutClient>
      </body>
    </html>
  );
}