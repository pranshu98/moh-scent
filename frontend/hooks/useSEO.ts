import { useMemo } from 'react';
import { useRouter } from 'next/router';

export interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
  ogType?: 'website' | 'article' | 'product';
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
  canonicalUrl?: string;
  noindex?: boolean;
  structuredData?: object | object[];
  alternateUrls?: {
    [key: string]: string;
  };
}

interface ProductStructuredData {
  name: string;
  description: string;
  image: string[];
  price: number;
  priceCurrency?: string;
  availability?: 'InStock' | 'OutOfStock' | 'PreOrder';
  sku?: string;
  brand?: string;
  review?: {
    reviewRating: number;
    reviewCount: number;
  };
}

interface ArticleStructuredData {
  headline: string;
  description: string;
  image: string;
  datePublished: string;
  dateModified?: string;
  author: {
    name: string;
    url?: string;
  };
}

interface BreadcrumbItem {
  name: string;
  item: string;
}

interface MetaData {
  title?: string;
  description?: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogType?: string;
  ogUrl?: string;
  ogImage?: string;
  twitterCard?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  robots?: string;
  alternateUrls?: {
    [key: string]: string;
  };
}

const defaultSEOConfig: Required<Pick<SEOProps, 'title' | 'description' | 'keywords' | 'ogType' | 'twitterCard'>> = {
  title: 'Moh-Scent | Luxury Handcrafted Candles',
  description: 'Discover our collection of handcrafted luxury candles that bring warmth and tranquility to your sanctuary.',
  keywords: ['candles', 'luxury candles', 'scented candles', 'home decor'],
  ogType: 'website',
  twitterCard: 'summary_large_image',
};

export const useSEO = (props: SEOProps = {}) => {
  const router = useRouter();
  const config = { ...defaultSEOConfig, ...props };

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
  const currentUrl = `${baseUrl}${router.asPath}`;
  const canonicalUrl = config.canonicalUrl || currentUrl;

  const generateStructuredData = useMemo(() => {
    const structuredData = config.structuredData || {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: config.title,
      description: config.description,
      url: canonicalUrl,
    };

    return JSON.stringify(structuredData);
  }, [config.structuredData, config.title, config.description, canonicalUrl]);

  const generateProductStructuredData = (product: ProductStructuredData) => {
    return {
      '@context': 'https://schema.org/',
      '@type': 'Product',
      name: product.name,
      description: product.description,
      image: product.image,
      offers: {
        '@type': 'Offer',
        price: product.price,
        priceCurrency: product.priceCurrency || 'USD',
        availability: `https://schema.org/${product.availability || 'InStock'}`,
        ...(product.sku && { sku: product.sku }),
      },
      ...(product.brand && {
        brand: {
          '@type': 'Brand',
          name: product.brand,
        },
      }),
      ...(product.review && {
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: product.review.reviewRating,
          reviewCount: product.review.reviewCount,
        },
      }),
    };
  };

  const generateArticleStructuredData = (article: ArticleStructuredData) => {
    return {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: article.headline,
      description: article.description,
      image: article.image,
      datePublished: article.datePublished,
      dateModified: article.dateModified || article.datePublished,
      author: {
        '@type': 'Person',
        name: article.author.name,
        ...(article.author.url && { url: article.author.url }),
      },
    };
  };

  const generateBreadcrumbStructuredData = (items: BreadcrumbItem[]) => {
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: item.item,
      })),
    };
  };

  const meta: MetaData = {
    title: config.title,
    description: config.description,
    keywords: config.keywords?.join(', '),
    ogTitle: config.title,
    ogDescription: config.description,
    ogType: config.ogType,
    ogUrl: canonicalUrl,
    ogImage: config.ogImage,
    twitterCard: config.twitterCard,
    twitterTitle: config.title,
    twitterDescription: config.description,
    twitterImage: config.ogImage,
    robots: config.noindex ? 'noindex, nofollow' : undefined,
    alternateUrls: config.alternateUrls,
  };

  return {
    config,
    currentUrl,
    canonicalUrl,
    meta,
    generateStructuredData,
    generateProductStructuredData,
    generateArticleStructuredData,
    generateBreadcrumbStructuredData,
  };
};

export default useSEO;
