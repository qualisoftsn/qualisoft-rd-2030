// Fichier : src/app/layout.tsx
import "./globals.css";
import Providers from "./providers";

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
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}