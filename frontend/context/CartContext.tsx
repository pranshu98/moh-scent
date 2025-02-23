import { createContext, useContext, useReducer, ReactNode } from 'react';
import { CartItem, Product } from '../types';

interface CartState {
  items: CartItem[];
  itemCount: number;
  total: number;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: { product: Product; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { productId: string; quantity: number } }
  | { type: 'CLEAR_CART' };

interface CartContextType extends CartState {
  addItem: (product: Product, quantity: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItemIndex = state.items.findIndex(
        (item) => item.product._id === action.payload.product._id
      );

      if (existingItemIndex > -1) {
        const updatedItems = [...state.items];
        updatedItems[existingItemIndex].quantity += action.payload.quantity;

        return {
          ...state,
          items: updatedItems,
          itemCount: state.itemCount + action.payload.quantity,
          total: state.total + action.payload.product.price * action.payload.quantity,
        };
      }

      return {
        ...state,
        items: [...state.items, { product: action.payload.product, quantity: action.payload.quantity }],
        itemCount: state.itemCount + action.payload.quantity,
        total: state.total + action.payload.product.price * action.payload.quantity,
      };
    }

    case 'REMOVE_ITEM': {
      const itemToRemove = state.items.find((item) => item.product._id === action.payload);
      if (!itemToRemove) return state;

      return {
        ...state,
        items: state.items.filter((item) => item.product._id !== action.payload),
        itemCount: state.itemCount - itemToRemove.quantity,
        total: state.total - itemToRemove.product.price * itemToRemove.quantity,
      };
    }

    case 'UPDATE_QUANTITY': {
      const existingItemIndex = state.items.findIndex(
        (item) => item.product._id === action.payload.productId
      );

      if (existingItemIndex === -1) return state;

      const updatedItems = [...state.items];
      const item = updatedItems[existingItemIndex];
      const quantityDiff = action.payload.quantity - item.quantity;

      updatedItems[existingItemIndex] = {
        ...item,
        quantity: action.payload.quantity,
      };

      return {
        ...state,
        items: updatedItems,
        itemCount: state.itemCount + quantityDiff,
        total: state.total + item.product.price * quantityDiff,
      };
    }

    case 'CLEAR_CART':
      return {
        items: [],
        itemCount: 0,
        total: 0,
      };

    default:
      return state;
  }
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider = ({ children }: CartProviderProps) => {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    itemCount: 0,
    total: 0,
  });

  const addItem = (product: Product, quantity: number) => {
    dispatch({ type: 'ADD_ITEM', payload: { product, quantity } });
  };

  const removeItem = (productId: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: productId });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  return (
    <CartContext.Provider
      value={{
        ...state,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;
