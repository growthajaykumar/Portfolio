import './globals.css';
import site from '../lib/site';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Choreo from '../components/Choreo';

export const metadata = { metadataBase: new URL('https://growthwithajay.com') };
export const viewport = { themeColor: '#EEEAE1' };

const FONTS = 'https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400;500&family=Geist:wght@300..700&family=Instrument+Serif:ital@0;1&display=swap';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="alternate icon" href="/assets/favicon.ico" />
        <link rel="apple-touch-icon" href="/assets/img/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href={FONTS} />
        {/* Reveal animations only arm once JS is running; without JS everything is visible. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body>
        <Header nav={site.nav} />
        <main id="main">{children}</main>
        <Footer nav={site.nav} footer={site.footer} />
        <Choreo />
      </body>
    </html>
  );
}
