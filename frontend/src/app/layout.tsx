import './globals.css';
import Providers from './providers';

export const metadata = {
  title: 'Qualisoft RD 2030',
  description: 'Système SMQ Elite',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}