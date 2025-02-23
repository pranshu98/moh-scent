import { ReactNode } from 'react';

export interface LayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: 'Scented' | 'Unscented' | 'Decorative' | 'Seasonal';
  scent?: string;
  stock: number;
  rating: number;
  numReviews: number;
  featured: boolean;
  dimensions: {
    height: number;
    diameter: number;
  };
  burnTime: number;
  reviews: Review[];
  createdAt: string;
}

export interface Review {
  _id: string;
  user: string;
  name: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface User {
  _id: string;
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  token?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  _id: string;
  user: User;
  orderItems: CartItem[];
  shippingAddress: {
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  paymentMethod: 'razorpay' | 'mock';
  paymentResult?: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
    status: string;
    email_address: string;
  };
  itemsPrice: number;
  taxPrice: number;
  shippingPrice: number;
  totalPrice: number;
  isPaid: boolean;
  paidAt?: string;
  isDelivered: boolean;
  deliveredAt?: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  trackingNumber?: string;
  createdAt: string;
}

export interface ProductStructuredData {
  _id: string;
  name: string;
  description: string;
  images: string[];
  price: number;
  stock: number;
  rating?: number;
  numReviews?: number;
}

export interface ArticleStructuredData {
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

export interface BreadcrumbItem {
  name: string;
  item: string;
}

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

export interface MetaData {
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

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  page: number;
  pages: number;
  total: number;
}

export interface SearchFilters {
  keyword?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  sortBy?: 'price' | 'rating' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface ValidationRules {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  validate?: (value: string) => boolean | string;
}

export interface ImageDimensions {
  width: number;
  height: number;
}

export interface ProcessedImage {
  file: File;
  url: string;
  dimensions: ImageDimensions;
}
