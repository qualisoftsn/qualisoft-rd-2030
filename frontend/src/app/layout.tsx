/**
 * CHEMIN ABSOLU : /src/app/layout.tsx
 */
import { Toaster } from "sonner";
import "./globals.css";
import LayoutClient from "./layout-client"; // On sépare la logique client pour le SEO
import Providers from "./providers"; // 🚩 IMPORT INDISPENSABLE

export const metadata = {
  title: "Qualisoft Elite - Matrix Core",
  description: "Système d'Exploitation Souverain",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="scroll-smooth">
      <body className="bg-[#0B0F1A] text-white antialiased">
        <Providers>
          <LayoutClient>{children}</LayoutClient>
          <Toaster position="top-right" theme="dark" richColors />
        </Providers>
      </body>
    </html>
  );
}
