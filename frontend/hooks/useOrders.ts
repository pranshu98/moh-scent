import { useState } from 'react';
import useSWR from 'swr';
import { useRouter } from 'next/router';
import { Order } from '../types';
import * as api from '../utils/api';
import toast from 'react-hot-toast';
import { useCart } from '../context/CartContext';

interface OrderResponse {
  success: boolean;
  data: Order;
}

interface OrdersResponse {
  success: boolean;
  data: Order[];
}

const orderFetcher = async (url: string) => {
  const id = url.split('/').pop();
  if (!id) throw new Error('Order ID is required');
  const response = await api.getOrder(id);
  return response;
};

const myOrdersFetcher = async () => {
  const response = await api.getMyOrders();
  return response;
};

export const useOrder = (id: string) => {
  const { data, error, mutate } = useSWR<OrderResponse>(
    id ? `/orders/${id}` : null,
    orderFetcher
  );

  return {
    order: data?.data,
    loading: !error && !data,
    error,
    mutate,
  };
};

export const useMyOrders = () => {
  const { data, error, mutate } = useSWR<OrdersResponse>(
    '/orders/myorders',
    myOrdersFetcher
  );

  return {
    orders: data?.data || [],
    loading: !error && !data,
    error,
    mutate,
  };
};

export const useCheckout = () => {
  const router = useRouter();
  const { items, total, clearCart } = useCart();
  const [loading, setLoading] = useState(false);

  const createOrder = async (shippingAddress: {
    address: string;
    city: string;
    postalCode: string;
    country: string;
  }) => {
    try {
      setLoading(true);

      // Create order in the backend
      const orderData = {
        orderItems: items.map((item) => ({
          product: item.product._id,
          quantity: item.quantity,
        })),
        shippingAddress,
        paymentMethod: 'razorpay', // or 'mock' for testing
      };

      const { data: order } = await api.createOrder(orderData);

      // Initialize Razorpay
      const res = await api.initializeRazorpay();

      if (!res) {
        toast.error('Razorpay SDK failed to load');
        return;
      }

      // Create Razorpay options
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.totalPrice * 100, // Amount in smallest currency unit
        currency: 'INR',
        name: 'Moh-Scent',
        description: 'Payment for your order',
        order_id: order.razorpayOrderId,
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          try {
            // Verify payment with backend
            await api.updateOrderToPaid(order._id, response);
            
            // Clear cart and redirect to success page
            clearCart();
            toast.success('Payment successful!');
            router.push(`/orders/${order._id}`);
          } catch (error) {
            toast.error(api.handleApiError(error));
          }
        },
        prefill: {
          name: order.user.name,
          email: order.user.email,
        },
        theme: {
          color: '#8b5cf6',
        },
      };

      // Open Razorpay payment form
      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();

    } catch (error) {
      toast.error(api.handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const processPayment = async (orderId: string, paymentResult: any) => {
    try {
      setLoading(true);
      await api.updateOrderToPaid(orderId, paymentResult);
      toast.success('Payment processed successfully');
      return true;
    } catch (error) {
      toast.error(api.handleApiError(error));
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    createOrder,
    processPayment,
    loading,
  };
};

export const useMockCheckout = () => {
  const router = useRouter();
  const { items, total, clearCart } = useCart();
  const [loading, setLoading] = useState(false);

  const createMockOrder = async (shippingAddress: {
    address: string;
    city: string;
    postalCode: string;
    country: string;
  }) => {
    try {
      setLoading(true);

      // Create order with mock payment method
      const orderData = {
        orderItems: items.map((item) => ({
          product: item.product._id,
          quantity: item.quantity,
        })),
        shippingAddress,
        paymentMethod: 'mock',
      };

      const { data: order } = await api.createOrder(orderData);

      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Process mock payment
      const mockPaymentResult = {
        razorpay_payment_id: `mock_${Date.now()}`,
        razorpay_order_id: order._id,
        razorpay_signature: 'mock_signature',
      };

      await api.updateOrderToPaid(order._id, mockPaymentResult);

      // Clear cart and redirect to success page
      clearCart();
      toast.success('Mock payment successful!');
      router.push(`/orders/${order._id}`);

    } catch (error) {
      toast.error(api.handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  return {
    createMockOrder,
    loading,
  };
};
