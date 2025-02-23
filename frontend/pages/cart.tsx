import { useState } from 'react';
import { NextPage } from 'next';
import Layout from '../components/layout/Layout';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { PlusIcon, MinusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { CartItem } from '../types';

const CartPage: NextPage = () => {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    setCartItems(
      cartItems.map((item) =>
        item.product._id === productId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const removeItem = (productId: string) => {
    setCartItems(cartItems.filter((item) => item.product._id !== productId));
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const shipping = subtotal > 100 ? 0 : 10;
  const tax = subtotal * 0.15;
  const total = subtotal + shipping + tax;

  const handleCheckout = async () => {
    try {
      // Implement checkout logic here
      router.push('/checkout');
    } catch (error) {
      console.error('Checkout error:', error);
    }
  };

  if (cartItems.length === 0) {
    return (
      <Layout title="Cart | Moh-Scent">
        <div className="container-custom py-16 text-center">
          <h1 className="text-3xl font-serif font-bold mb-8">Your Cart</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Your cart is empty
          </p>
          <button
            onClick={() => router.push('/products')}
            className="btn btn-primary"
          >
            Continue Shopping
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Cart | Moh-Scent">
      <div className="container-custom py-16">
        <h1 className="text-3xl font-serif font-bold mb-8">Your Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            {cartItems.map((item) => (
              <motion.div
                key={item.product._id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center space-x-4 border-b border-gray-200 dark:border-gray-700 py-4"
              >
                <img
                  src={item.product.images[0]}
                  alt={item.product.name}
                  className="w-24 h-24 object-cover rounded-md"
                />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{item.product.name}</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    ${item.product.price.toFixed(2)}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() =>
                      updateQuantity(item.product._id, item.quantity - 1)
                    }
                    className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <MinusIcon className="h-4 w-4" />
                  </button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <button
                    onClick={() =>
                      updateQuantity(item.product._id, item.quantity + 1)
                    }
                    className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <PlusIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => removeItem(item.product._id)}
                    className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-red-500"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>${shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={handleCheckout}
                className="w-full btn btn-primary mt-6"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CartPage;
