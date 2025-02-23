import useSWR from 'swr';
import { Product } from '../types';
import * as api from '../utils/api';

interface ProductsResponse {
  data: Product[];
  page: number;
  pages: number;
  total: number;
}

interface UseProductsOptions {
  keyword?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
}

const fetcher = async (url: string) => {
  const response = await api.getProducts({
    ...Object.fromEntries(new URLSearchParams(url.split('?')[1]).entries()),
  });
  return response;
};

const productFetcher = async (url: string) => {
  const id = url.split('/').pop();
  if (!id) throw new Error('Product ID is required');
  const response = await api.getProduct(id);
  return response;
};

const featuredFetcher = async () => {
  const response = await api.getFeaturedProducts();
  return response;
};

export const useProducts = (options: UseProductsOptions = {}) => {
  const queryString = new URLSearchParams({
    ...(options.keyword && { keyword: options.keyword }),
    ...(options.category && { category: options.category }),
    ...(options.minPrice && { minPrice: options.minPrice.toString() }),
    ...(options.maxPrice && { maxPrice: options.maxPrice.toString() }),
    ...(options.page && { page: options.page.toString() }),
  }).toString();

  const { data, error, mutate } = useSWR<ProductsResponse>(
    `/products?${queryString}`,
    fetcher
  );

  return {
    products: data?.data || [],
    page: data?.page || 1,
    pages: data?.pages || 1,
    total: data?.total || 0,
    loading: !error && !data,
    error,
    mutate,
  };
};

export const useProduct = (id: string) => {
  const { data, error, mutate } = useSWR<{ data: Product }>(
    id ? `/products/${id}` : null,
    productFetcher
  );

  return {
    product: data?.data,
    loading: !error && !data,
    error,
    mutate,
  };
};

export const useFeaturedProducts = () => {
  const { data, error, mutate } = useSWR<{ data: Product[] }>(
    '/products/featured',
    featuredFetcher
  );

  return {
    products: data?.data || [],
    loading: !error && !data,
    error,
    mutate,
  };
};

// Helper function to prefetch products
export const prefetchProducts = async (options: UseProductsOptions = {}) => {
  return api.getProducts(options);
};

// Helper function to prefetch a single product
export const prefetchProduct = async (id: string) => {
  return api.getProduct(id);
};

// Helper function to prefetch featured products
export const prefetchFeaturedProducts = async () => {
  return api.getFeaturedProducts();
};
