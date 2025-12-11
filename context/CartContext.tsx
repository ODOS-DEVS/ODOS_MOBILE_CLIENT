// context/CartContext.tsx
import React, { createContext, useContext, useState } from "react";

export type CartItem = {
  id: string;
  title: string;
  category?: string;
  price: number;
  image?: any;
  quantity: number;
};

type CartContextType = {
  cart: CartItem[];
  addToCart: (product: Omit<CartItem, "quantity">) => void;
  increaseQty: (id: string) => void;
  decreaseQty: (id: string) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (product: Omit<CartItem, "quantity">) => {
    setCart((prev) => {
      const exists = prev.find((p) => p.id === product.id);
      if (exists) {
        return prev.map((p) =>
          p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const increaseQty = (id: string) =>
    setCart((prev) =>
      prev.map((p) => (p.id === id ? { ...p, quantity: p.quantity + 1 } : p))
    );

  const decreaseQty = (id: string) =>
    setCart((prev) =>
      prev.map((p) =>
        p.id === id && p.quantity > 1 ? { ...p, quantity: p.quantity - 1 } : p
      )
    );

  const removeItem = (id: string) =>
    setCart((prev) => prev.filter((p) => p.id !== id));

  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        increaseQty,
        decreaseQty,
        removeItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
};
