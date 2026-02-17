import type { AppProps } from 'next/app';
import { TenantProvider } from '../context/TenantContext'; // Import du fichier créé précédemment
import '../styles/globals.css';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    // 💡 On enveloppe toute l'appli ici. 
    // Désormais, chaque page de Qualisoft pourra utiliser "useTenant()"
    <TenantProvider>
      <Component {...pageProps} />
    </TenantProvider>
  );
}

export default MyApp;