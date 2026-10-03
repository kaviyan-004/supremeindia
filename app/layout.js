import './globals.css';
import { CartProvider } from '../components/CartContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BottomNav from '../components/BottomNav';
import SplashIntro from '../components/SplashIntro';

export const metadata = {
  title: 'Supreme India | Graphic Printed Tees & Heavyweight Hoodies',
  description:
    'Shop premium oversized graphic t-shirts and heavyweight hoodies. Get custom prints or order in bulk for your college fests and club events.',
  icons: {
    icon: [
      { url: '/logo-circle.png', sizes: 'any' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/logo-circle.png',
    shortcut: '/logo-circle.png',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#FFFFFF',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Marks sessions that already saw the intro before first paint (avoids a flash on reload) */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{if(sessionStorage.getItem('si_intro_seen'))document.documentElement.classList.add('si-intro-seen')}catch(e){}",
          }}
        />
        <link rel="icon" href="/logo-circle.png" type="image/png" sizes="any" />
        <link rel="apple-touch-icon" href="/logo-circle.png" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
      </head>
      <body className="bg-slate-100 text-text-primary font-body min-h-screen">
        <SplashIntro />
        <CartProvider>
          <div className="mobile-shell flex flex-col min-h-screen relative">
            <Header />
            <main className="flex-1 pb-20 lg:pb-0">
              <div className="page-wrap">{children}</div>
            </main>
            <Footer />
            <BottomNav />
          </div>
        </CartProvider>
      </body>
    </html>
  );
}
