import Document, { Html, Head, Main, NextScript, DocumentContext } from 'next/document';

class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  render() {
    return (
      <Html lang="en">
        <Head>
          {/* Favicon */}
          <link rel="icon" href="/favicon.ico" />
          
          {/* Fonts */}
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap"
            rel="stylesheet"
          />
          <link
            href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"
            rel="stylesheet"
          />

          {/* Meta Tags */}
          <meta name="description" content="Moh-Scent - Luxury Handcrafted Candles" />
          <meta name="keywords" content="candles, luxury candles, scented candles, home decor" />
          <meta name="author" content="Moh-Scent" />
          
          {/* Open Graph */}
          <meta property="og:type" content="website" />
          <meta property="og:site_name" content="Moh-Scent" />
          <meta property="og:title" content="Moh-Scent - Luxury Handcrafted Candles" />
          <meta property="og:description" content="Discover our collection of handcrafted luxury candles that transform your space into a sanctuary of warmth and tranquility." />
          <meta property="og:image" content="/og-image.jpg" />
          
          {/* Twitter Card */}
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content="Moh-Scent - Luxury Handcrafted Candles" />
          <meta name="twitter:description" content="Discover our collection of handcrafted luxury candles that transform your space into a sanctuary of warmth and tranquility." />
          <meta name="twitter:image" content="/twitter-card.jpg" />

          {/* PWA */}
          <meta name="theme-color" content="#ffffff" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="default" />
          <meta name="apple-mobile-web-app-title" content="Moh-Scent" />
          <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
          <link rel="manifest" href="/manifest.json" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
