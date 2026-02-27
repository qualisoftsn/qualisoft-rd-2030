/**
 * CHEMIN : /src/app/layout.tsx
 */
import "./globals.css";
import Providers from "./providers"; // 🚩 Doit contenir AuthProvider
import { Toaster } from "sonner";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="dark">
      <body className="bg-[#0B0F1A] text-white antialiased">
        <Providers>
          {/* L'application entière est maintenant protégée et hydratée */}
          {children}
          <Toaster position="top-right" theme="dark" richColors />
        </Providers>
      </body>
    </html>
  );
}