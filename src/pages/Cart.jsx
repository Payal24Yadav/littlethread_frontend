import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import CouponSection from '../components/CouponSection';

const Cart = () => {
  const { 
    cart, 
    removeFromCart, 
    updateQuantity, 
    cartTotal,
    coupon,
    couponLoading,
    couponError,
    discountAmount,
    finalTotal,
    applyCoupon,
    removeCoupon
  } = useCart();

  const [couponCodeInput, setCouponCodeInput] = useState(coupon?.code || '');

  if (cart.length === 0) {
    return (
      <div className="h-screen flex flex-col items-center justify-center container mx-auto px-6 text-center">
        <div className="w-32 h-32 bg-neutral-100 dark:bg-neutral-900 rounded-full flex items-center justify-center mb-8">
          <ShoppingBag size={48} className="text-neutral-400" />
        </div>
        <h2 className="text-4xl font-black uppercase tracking-tighter mb-4">Your bag is <span className="text-secondary">empty</span></h2>
        <p className="text-neutral-500 mb-10 max-w-sm">Looks like you haven't added anything to Little Threads yet. Start exploring our latest finds!</p>
        <Link to="/shop" className="btn-primary px-12 py-4">GO TO SHOP</Link>
      </div>
    );
  }

  return (
    <div className="pt-10 pb-20 container mx-auto px-6">
      <h1 className="text-5xl md:text-7xl font-bold mb-12 font-display">
        Your <span className="text-secondary">Bag</span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        {/* List */}
        <div className="lg:col-span-2 space-y-8">
          <AnimatePresence>
            {cart.map((item) => (
              <motion.div 
                key={`${item.id}-${item.selectedSize}`}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex gap-6 p-6 bg-white rounded-3xl border border-neutral-200 shadow-sm"
              >
                <div className="w-32 h-40 rounded-2xl overflow-hidden flex-shrink-0 bg-neutral-200">
                  <img src={item.thumbnailUrl || item.images?.[0]} alt={item.name} className="w-full h-full object-cover" />
                </div>

                <div className="flex-1 flex flex-col justify-between py-2">
                  <div className="flex justify-between items-start">
                    <Link to={`/product/${item.handle || item.id}`}>
                      <h3 className="text-xl font-bold uppercase tracking-tight mb-1 font-display hover:text-primary transition-colors">{item.name}</h3>
                      <p className="text-sm text-neutral-500 font-bold uppercase tracking-widest">
                        {item.categories?.[0]?.name || item.category} • Size: {item.selectedSize}
                      </p>
                    </Link>
                    <button 
                      onClick={() => removeFromCart(item.id, item.selectedSize)}
                      className="p-3 text-neutral-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>

                  <div className="flex justify-between items-end">
                    <div className="flex items-center bg-white dark:bg-gray-100 rounded-xl p-1">
                      <button 
                        onClick={() => updateQuantity(item.id, item.selectedSize, -1)}
                        className="p-2 hover:bg-neutral-100 dark:hover:bg-gray-300 rounded-lg transition-colors"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-10 text-center font-black">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.selectedSize, 1)}
                        className="p-2 hover:bg-neutral-100 dark:hover:bg-gray-300 rounded-lg transition-colors"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    <p className="text-xl font-black">₹{item.price * item.quantity}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Coupon Input & Available Offers */}
          <div className="space-y-6 pt-4">
            <div className="bg-white rounded-[2rem] border border-neutral-200 p-6 md:p-8 shadow-sm">
              <h3 className="text-lg font-bold mb-4 font-display">Have a promo code?</h3>
              <div className="flex gap-4">
                <input
                  type="text"
                  placeholder="ENTER COUPON CODE"
                  value={couponCodeInput}
                  onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                  disabled={couponLoading}
                  className="flex-1 bg-neutral-50 border border-neutral-200 px-5 py-4 rounded-xl focus:outline-none focus:border-primary font-mono text-sm tracking-wider uppercase disabled:opacity-70"
                />
                {coupon ? (
                  <button
                    type="button"
                    onClick={() => {
                      removeCoupon();
                      setCouponCodeInput('');
                    }}
                    className="px-6 py-4 bg-red-50 text-red-500 font-black text-sm rounded-xl hover:bg-red-100 transition-colors uppercase tracking-widest"
                  >
                    REMOVE
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => applyCoupon(couponCodeInput)}
                    disabled={couponLoading || !couponCodeInput.trim()}
                    className="px-6 py-4 bg-neutral-900 text-white font-black text-sm rounded-xl hover:bg-neutral-800 transition-colors uppercase tracking-widest disabled:opacity-50"
                  >
                    {couponLoading ? 'APPLYING...' : 'APPLY'}
                  </button>
                )}
              </div>
              {couponError && <p className="text-xs text-red-500 mt-2 font-medium">{couponError}</p>}
            </div>

            {/* Reusable Active Coupon Component */}
            <CouponSection 
              onApply={(code) => {
                setCouponCodeInput(code);
                applyCoupon(code);
              }} 
              appliedCode={coupon?.code} 
            />
          </div>
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-[2.5rem] p-10 border border-neutral-200 shadow-sm sticky top-32">
            <h2 className="text-2xl font-bold mb-8 font-display">Summary</h2>
            
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-neutral-700 font-bold  text-xs">
                <span>Subtotal</span>
                <span className="text-black dark:text-white">₹{cartTotal}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold text-xs">
                  <span>Discount ({coupon?.code})</span>
                  <span>-₹{discountAmount}</span>
                </div>
              )}
              <div className="flex justify-between text-neutral-700 font-bold  text-xs">
                <span>Shipping</span>
                <span className="text-primary">FREE</span>
              </div>
              <div className="flex justify-between text-neutral-700 text-xs">
                <span>Tax</span>
                <span className="text-black dark:text-white">₹0</span>
              </div>
              <div className="pt-4 border-t border-neutral-200 flex justify-between">
                <span className="text-xl font-bold font-display">Total</span>
                <span className="text-2xl font-black">₹{finalTotal}</span>
              </div>
            </div>

            <Link to="/checkout" className="w-full py-5 bg-neutral-900 text-white font-black text-lg rounded-2xl hover:scale-[1.02] transition-transform flex items-center justify-center gap-3 font-display">
              CHECKOUT
              <ArrowRight size={20} />
            </Link>

            <div className="mt-8 pt-8 border-t border-neutral-200">
              <p className="text-sm text-neutral-700 font-bold uppercase tracking-[0.2em] mb-4 text-center">Accepted Payments</p>
              <div className="flex justify-center gap-4 text-neutral-500">
                <span className="font-black text-xs">VISA</span>
                <span className="font-black text-xs">UPI</span>
                <span className="font-black text-xs">GPAY</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
