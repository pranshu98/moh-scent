import type { AppProps } from 'next/app';
import { ThemeProvider } from 'next-themes';
import { CartProvider } from '../context/CartContext';
import Layout from '../components/layout/Layout';
import ErrorBoundary from '../components/ErrorBoundary';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ErrorBoundary>
      <ThemeProvider attribute="class">
        <CartProvider>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </CartProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
