// Fichier : src/app/layout.tsx
import "./globals.css";
import Providers from "./providers";
import { Toaster } from "sonner"; // Importation du moteur de notifications

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
        <Providers>
          {children}
          {/* Le Toaster est placé ici pour être disponible globalement.
            richColors permet d'avoir des styles automatiques (Vert pour succès, Rouge pour erreur).
          */}
          <Toaster position="top-right" richColors closeButton />
        </Providers>
      </body>
    </html>
  );
}