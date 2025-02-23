import { 
  Product,
  ProductStructuredData,
  ArticleStructuredData,
  BreadcrumbItem 
} from '../types';

export const generateTitle = (title: string, siteName = 'Moh-Scent') => {
  return title === siteName ? title : `${title} | ${siteName}`;
};

export const generateCanonicalUrl = (path: string) => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
  return `${baseUrl}${path}`;
};

export const generateProductStructuredData = (product: Product) => {
  return {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.images,
    sku: product._id,
    brand: {
      '@type': 'Brand',
      name: 'Moh-Scent',
    },
    offers: {
      '@type': 'Offer',
      url: generateCanonicalUrl(`/products/${product._id}`),
      priceCurrency: 'USD',
      price: product.price,
      availability: product.stock > 0 
        ? 'https://schema.org/InStock' 
        : 'https://schema.org/OutOfStock',
    },
    ...(product.rating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: product.rating,
        reviewCount: product.numReviews,
      },
    }),
  };
};

export const generateCategoryStructuredData = (
  category: string,
  products: Product[]
) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${category} Candles`,
    description: `Browse our collection of ${category.toLowerCase()} candles`,
    url: generateCanonicalUrl(`/categories/${category.toLowerCase()}`),
    numberOfItems: products.length,
    itemListElement: products.map((product, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Product',
        name: product.name,
        url: generateCanonicalUrl(`/products/${product._id}`),
        image: product.images[0],
        description: product.description,
        offers: {
          '@type': 'Offer',
          price: product.price,
          priceCurrency: 'USD',
        },
      },
    })),
  };
};

export const generateArticleStructuredData = (article: ArticleStructuredData) => {
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
    publisher: {
      '@type': 'Organization',
      name: 'Moh-Scent',
      logo: {
        '@type': 'ImageObject',
        url: `${process.env.NEXT_PUBLIC_BASE_URL}/images/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': generateCanonicalUrl(`/blog/${article.headline.toLowerCase().replace(/\s+/g, '-')}`),
    },
  };
};

export const generateBreadcrumbStructuredData = (items: BreadcrumbItem[]) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: generateCanonicalUrl(item.item),
    })),
  };
};

export const generateOrganizationStructuredData = () => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Moh-Scent',
    url: process.env.NEXT_PUBLIC_BASE_URL,
    logo: `${process.env.NEXT_PUBLIC_BASE_URL}/images/logo.png`,
    sameAs: [
      'https://facebook.com/mohscent',
      'https://instagram.com/mohscent',
      'https://twitter.com/mohscent',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+1-234-567-8900',
      contactType: 'customer service',
      email: 'support@mohscent.com',
      availableLanguage: ['English'],
    },
  };
};

export const generateLocalBusinessStructuredData = () => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Store',
    name: 'Moh-Scent',
    image: `${process.env.NEXT_PUBLIC_BASE_URL}/images/store.jpg`,
    '@id': process.env.NEXT_PUBLIC_BASE_URL,
    url: process.env.NEXT_PUBLIC_BASE_URL,
    telephone: '+1-234-567-8900',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '123 Candle Street',
      addressLocality: 'New York',
      addressRegion: 'NY',
      postalCode: '10001',
      addressCountry: 'US',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 40.7128,
      longitude: -74.0060,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: [
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
        ],
        opens: '09:00',
        closes: '18:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Saturday'],
        opens: '10:00',
        closes: '17:00',
      },
    ],
    priceRange: '$$',
  };
};

export const generateFAQStructuredData = (faqs: { question: string; answer: string }[]) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
};

export default {
  generateTitle,
  generateCanonicalUrl,
  generateProductStructuredData,
  generateCategoryStructuredData,
  generateArticleStructuredData,
  generateBreadcrumbStructuredData,
  generateOrganizationStructuredData,
  generateLocalBusinessStructuredData,
  generateFAQStructuredData,
};
