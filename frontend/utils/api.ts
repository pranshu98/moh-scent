import axios from 'axios';
import { Product, User, Order } from '../types';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Products
export const getProducts = async (params?: {
  keyword?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
}) => {
  const { data } = await api.get('/products', { params });
  return data;
};

export const getProduct = async (id: string) => {
  const { data } = await api.get(`/products/${id}`);
  return data;
};

export const getFeaturedProducts = async () => {
  const { data } = await api.get('/products/featured');
  return data;
};

// Auth
export const login = async (email: string, password: string) => {
  const { data } = await api.post('/auth/login', { email, password });
  localStorage.setItem('token', data.token);
  return data;
};

export const register = async (name: string, email: string, password: string) => {
  const { data } = await api.post('/auth/register', { name, email, password });
  localStorage.setItem('token', data.token);
  return data;
};

export const logout = () => {
  localStorage.removeItem('token');
};

export const getProfile = async () => {
  const { data } = await api.get('/auth/me');
  return data;
};

// Orders
export const createOrder = async (orderData: {
  orderItems: { product: string; quantity: number }[];
  shippingAddress: {
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  paymentMethod: string;
}) => {
  const { data } = await api.post('/orders', orderData);
  return data;
};

export const getOrder = async (id: string) => {
  const { data } = await api.get(`/orders/${id}`);
  return data;
};

export const getMyOrders = async () => {
  const { data } = await api.get('/orders/myorders');
  return data;
};

export const updateOrderToPaid = async (
  orderId: string,
  paymentResult: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }
) => {
  const { data } = await api.put(`/orders/${orderId}/pay`, paymentResult);
  return data;
};

// Payment
export const initializeRazorpay = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

// Helper functions
export const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
};

export const calculateTotalPrice = (items: { price: number; quantity: number }[]) => {
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
};

// Error handling
export const handleApiError = (error: any) => {
  if (error.response) {
    // Server responded with a status code outside of 2xx range
    return error.response.data.message || 'An error occurred';
  } else if (error.request) {
    // Request was made but no response received
    return 'No response from server';
  } else {
    // Something happened in setting up the request
    return 'Error setting up request';
  }
};

export default api;
