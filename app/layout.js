import Script from 'next/script';

export const metadata = {
  metadataBase: new URL('https://growthwithajay.com'),
  title: 'Growth with Ajay',
  description: 'Growth marketing consultant across Web3, real estate and fashion.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="no-js">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="alternate icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/assets/img/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wdth,wght@12..96,75..100,300..800&family=Archivo:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" />
        <link rel="stylesheet" href="/assets/css/style.css" />
      </head>
      <body>
        {children}
        <Script src="/assets/js/main.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}