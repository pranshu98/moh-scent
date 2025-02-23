import React from 'react';
import Head from 'next/head';
import { useSEO, type SEOProps } from '../hooks/useSEO';

export const SEO: React.FC<SEOProps> = (props) => {
  const { meta, generateStructuredData } = useSEO(props);

  return (
    <Head>
      {meta.title && <title>{meta.title}</title>}
      {meta.description && (
        <meta name="description" content={meta.description} />
      )}
      {meta.keywords && (
        <meta name="keywords" content={meta.keywords} />
      )}

      {/* Open Graph */}
      {meta.ogTitle && (
        <meta property="og:title" content={meta.ogTitle} />
      )}
      {meta.ogDescription && (
        <meta property="og:description" content={meta.ogDescription} />
      )}
      {meta.ogType && (
        <meta property="og:type" content={meta.ogType} />
      )}
      {meta.ogUrl && (
        <meta property="og:url" content={meta.ogUrl} />
      )}
      {meta.ogImage && (
        <meta property="og:image" content={meta.ogImage} />
      )}

      {/* Twitter Card */}
      {meta.twitterCard && (
        <meta name="twitter:card" content={meta.twitterCard} />
      )}
      {meta.twitterTitle && (
        <meta name="twitter:title" content={meta.twitterTitle} />
      )}
      {meta.twitterDescription && (
        <meta name="twitter:description" content={meta.twitterDescription} />
      )}
      {meta.twitterImage && (
        <meta name="twitter:image" content={meta.twitterImage} />
      )}

      {/* Canonical URL */}
      {meta.ogUrl && (
        <link rel="canonical" href={meta.ogUrl} />
      )}

      {/* Alternate Language URLs */}
      {meta.alternateUrls &&
        Object.entries(meta.alternateUrls).map(([lang, url]) => (
          <link
            key={lang}
            rel="alternate"
            hrefLang={lang}
            href={url}
          />
        ))}

      {/* Robots */}
      {meta.robots && (
        <meta name="robots" content={meta.robots} />
      )}

      {/* Structured Data */}
      {generateStructuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: generateStructuredData }}
        />
      )}
    </Head>
  );
};

export default SEO;
