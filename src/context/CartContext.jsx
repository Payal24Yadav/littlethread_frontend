import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import { Check, X } from 'lucide-react';
import api from '../utils/api';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('littlethreads_cart');
    const initialCart = savedCart ? JSON.parse(savedCart) : [];
    return Array.isArray(initialCart)
      ? initialCart.filter(item => item.quantity > 0)
      : [];
  });

  const [wishlist, setWishlist] = useState(() => {
    const savedWishlist = localStorage.getItem('littlethreads_wishlist');
    return savedWishlist ? JSON.parse(savedWishlist) : [];
  });

  useEffect(() => {
    localStorage.setItem('littlethreads_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('littlethreads_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const getCartImage = (product, variant) =>
    variant?.thumbnailUrl ||
    variant?.images?.[0] ||
    product.thumbnailUrl ||
    product.images?.[0] ||
    '/placeholder-product.png';

  const buildCartItem = (product, variant, size, quantity) => ({
    id: product.id,
    handle: product.handle,
    name: product.name,
    subtitle: product.subtitle,
    categories: product.categories || [],
    category: product.category,
    selectedSize: size,
    variantId: variant?.id || null,
    variantTitle: variant?.title || size || 'Standard',
    quantity,
    price: Number(variant?.price ?? product.price ?? 0),
    compareAtPrice: Number(variant?.compareAtPrice ?? product.compareAtPrice ?? 0) || null,
    thumbnailUrl: getCartImage(product, variant),
    images: variant?.images?.length ? variant.images : (product.images || []),
    variants: Array.isArray(product.variants) ? product.variants : [],
    stock: product.stock || 0,
    weight: Number(variant?.weight ?? product.weight ?? 0) || null,
    length: Number(variant?.length ?? product.length ?? 0) || null,
    breadth: Number(variant?.breadth ?? product.breadth ?? 0) || null,
    height: Number(variant?.height ?? product.height ?? 0) || null,
  });

  const addToCart = (product, size, qty = 1) => {
    setCart((prevCart) => {
      const variant = product.variants?.find(v => v.title === size || v.id === size);
      const maxStock = variant ? variant.stock : (product.stock || 0);

      if (maxStock <= 0) {
        toast.error('This product is out of stock.');
        return prevCart;
      }

      const selectedSize = variant?.title || size || 'Standard';
      const existingItem = prevCart.find(item => item.id === product.id && item.selectedSize === selectedSize);
      if (existingItem) {
        if (existingItem.quantity + qty > maxStock) {
          toast.custom((t) => (
            <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} flex items-center gap-3 bg-black text-white px-4 py-3 rounded-full text-xs font-black tracking-widest shadow-[0_8px_30px_rgb(0,0,0,0.12)]`}>
              <div className="w-5 h-5 bg-[#10b981] rounded-full flex items-center justify-center flex-shrink-0">
                <Check size={12} strokeWidth={4} className="text-white" />
              </div>
              ONLY {maxStock} ITEM(S) LEFT IN STOCK
              <button onClick={() => toast.dismiss(t.id)} className="text-neutral-500 hover:text-white ml-2">
                <X size={14} />
              </button>
            </div>
          ), { id: 'stock-toast' });
        }

        const newQty = Math.min(existingItem.quantity + qty, maxStock);
        return prevCart.map(item => item.id === product.id && item.selectedSize === selectedSize ? { ...item, quantity: newQty } : item);
      }

      if (qty > maxStock) {
        toast.custom((t) => (
          <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} flex items-center gap-3 bg-black text-white px-4 py-3 rounded-full text-xs font-black tracking-widest shadow-[0_8px_30px_rgb(0,0,0,0.12)]`}>
            <div className="w-5 h-5 bg-[#10b981] rounded-full flex items-center justify-center flex-shrink-0">
              <Check size={12} strokeWidth={4} className="text-white" />
            </div>
            ONLY {maxStock} ITEM(S) LEFT IN STOCK
            <button onClick={() => toast.dismiss(t.id)} className="text-neutral-500 hover:text-white ml-2">
              <X size={14} />
            </button>
          </div>
        ), { id: 'stock-toast' });
      }

      const initialQty = Math.min(qty, maxStock);
      if (initialQty <= 0) {
        toast.error('This product is out of stock.');
        return prevCart;
      }
      return [...prevCart, buildCartItem(product, variant, selectedSize, initialQty)];
    });
  };

  const removeFromCart = (id, size) => {
    setCart((prevCart) => prevCart.filter(item => !(item.id === id && item.selectedSize === size)));
  };

  const updateQuantity = (id, size, delta) => {
    setCart((prevCart) => prevCart.map(item => {
      if (item.id === id && item.selectedSize === size) {
        const variant = item.variants?.find(v => v.title === size);
        const maxStock = variant ? variant.stock : (item.stock || 0);
        
        if (item.quantity + delta > maxStock) {
          toast.custom((t) => (
            <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} flex items-center gap-3 bg-black text-white px-4 py-3 rounded-full text-xs font-black tracking-widest shadow-[0_8px_30px_rgb(0,0,0,0.12)]`}>
              <div className="w-5 h-5 bg-[#10b981] rounded-full flex items-center justify-center flex-shrink-0">
                <Check size={12} strokeWidth={4} className="text-white" />
              </div>
              ONLY {maxStock} ITEM(S) LEFT IN STOCK
              <button onClick={() => toast.dismiss(t.id)} className="text-neutral-500 hover:text-white ml-2">
                <X size={14} />
              </button>
            </div>
          ), { id: 'stock-toast' });
        }
        
        const newQty = Math.max(1, Math.min(item.quantity + delta, maxStock));
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const clearCart = () => setCart([]);

  const toggleWishlist = (product) => {
    setWishlist((prev) => {
      const exists = prev.find(item => item.id === product.id);
      if (exists) {
        return prev.filter(item => item.id !== product.id);
      }
      return [...prev, product];
    });
  };

  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

  const [coupon, setCoupon] = useState(() => {
    const saved = localStorage.getItem('littlethreads_coupon');
    return saved ? JSON.parse(saved) : null;
  });
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState(null);

  useEffect(() => {
    if (coupon) {
      localStorage.setItem('littlethreads_coupon', JSON.stringify(coupon));
    } else {
      localStorage.removeItem('littlethreads_coupon');
    }
  }, [coupon]);

  useEffect(() => {
    if (cart.length === 0) {
      setCoupon(null);
      setCouponError(null);
    }
  }, [cart]);

  const discountAmount = useMemo(() => {
    if (!coupon) return 0;
    const val = Number(coupon.value || coupon.percentage || 0);
    if (coupon.type === 'PERCENTAGE') {
      return Math.round(cartTotal * (val / 100));
    } else {
      return Math.min(cartTotal, val);
    }
  }, [coupon, cartTotal]);

  const finalTotal = useMemo(() => {
    return Math.max(0, cartTotal - discountAmount);
  }, [cartTotal, discountAmount]);

  const applyCoupon = async (code, email = '') => {
    setCouponLoading(true);
    setCouponError(null);
    try {
      const response = await api.post('/coupons/validate', { code, email });
      const data = response.data;
      setCoupon(data);
      toast.success(`Coupon "${code.toUpperCase()}" applied!`);
      return { success: true, coupon: data };
    } catch (err) {
      const errMsg = err.response?.data?.error || err.message || 'Failed to apply coupon';
      setCouponError(errMsg);
      toast.error(errMsg);
      return { success: false, error: errMsg };
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
    setCouponError(null);
    toast.success('Coupon removed.');
  };

  return (
    <CartContext.Provider value={{ 
      cart, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart,
      cartTotal, 
      cartCount,
      wishlist,
      toggleWishlist,
      coupon,
      couponLoading,
      couponError,
      discountAmount,
      finalTotal,
      applyCoupon,
      removeCoupon
    }}>
      {children}
    </CartContext.Provider>
  );
};
