import { ReactNode } from 'react';
import Head from 'next/head';
import { ThemeProvider } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './Header';
import Footer from './Footer';
import { Toaster } from 'react-hot-toast';

interface LayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
}

const Layout = ({ 
  children, 
  title = 'Moh-Scent | Luxury Candles', 
  description = 'Discover our collection of handcrafted luxury candles at Moh-Scent' 
}: LayoutProps) => {
  return (
    <ThemeProvider attribute="class">
      <div className="min-h-screen flex flex-col dark:bg-gray-900">
        <Head>
          <title>{title}</title>
          <meta name="description" content={description} />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
          
          {/* Open Graph / Social Media Meta Tags */}
          <meta property="og:type" content="website" />
          <meta property="og:title" content={title} />
          <meta property="og:description" content={description} />
          <meta property="og:image" content="/og-image.jpg" />
          
          {/* Twitter Card Meta Tags */}
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={title} />
          <meta name="twitter:description" content={description} />
          <meta name="twitter:image" content="/twitter-image.jpg" />
        </Head>

        <Header />

        <AnimatePresence mode="wait">
          <motion.main 
            className="flex-grow container-custom py-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.main>
        </AnimatePresence>

        <Footer />

        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 5000,
            style: {
              background: '#333',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#4ade80',
                secondary: '#fff',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </div>
    </ThemeProvider>
  );
};

export default Layout;
