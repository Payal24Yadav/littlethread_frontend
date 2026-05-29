import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ShieldCheck, Ticket } from 'lucide-react';
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
      <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center container mx-auto px-6 text-center pt-8 pb-16">
        <div className="w-24 h-24 bg-white border border-neutral-200 rounded-full flex items-center justify-center mb-6 shadow-sm">
          <ShoppingBag size={36} className="text-neutral-400" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight mb-2 text-primary">Your bag is empty</h2>
        <p className="text-sm text-neutral-500 mb-8 max-w-sm">Looks like you haven't added anything to Little Threads yet. Start exploring our latest finds!</p>
        <Link to="/shop" className="bg-primary text-white hover:bg-[#002855] px-8 py-3 rounded-lg font-bold text-sm transition-colors shadow-sm active:scale-[0.98]">
          GO TO SHOP
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-neutral-50 min-h-screen pt-8 pb-16 font-sans text-[#1d2432]">
      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* Header */}
        <div className="flex flex-col mb-8 border-b border-neutral-200 pb-4">
          <h1 className="text-3xl font-bold text-primary tracking-tight">Your Bag</h1>
          <p className="text-neutral-500 text-sm mt-1 flex items-center gap-2">
            <ShoppingBag size={16} className="text-primary" /> Review your items before checkout.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* Left Side: Cart Items & Coupons */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Items List */}
            <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
              <div className="p-4 sm:p-6 border-b border-neutral-100 bg-neutral-50/50">
                <h3 className="text-lg font-bold text-neutral-900">Items ({cart.length})</h3>
              </div>
              <div className="p-4 sm:p-6 space-y-4">
                <AnimatePresence>
                  {cart.map((item) => (
                    <motion.div 
                      key={`${item.id}-${item.selectedSize}`}
                      layout
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.2 }}
                      className="flex gap-4 p-4 bg-white rounded-lg border border-neutral-100 shadow-sm hover:border-primary/30 transition-colors"
                    >
                      {/* Thumbnail */}
                      <div className="w-20 h-28 sm:w-24 sm:h-32 rounded-md overflow-hidden flex-shrink-0 border border-neutral-200 bg-neutral-50">
                        <img src={item.thumbnailUrl || item.images?.[0]} alt={item.name} className="w-full h-full object-cover" />
                      </div>

                      {/* Details */}
                      <div className="flex-1 flex flex-col justify-between py-1">
                        <div>
                          <div className="flex justify-between items-start gap-2">
                            <Link to={`/product/${item.handle || item.id}`}>
                              <h3 className="text-sm font-bold text-neutral-900 leading-snug hover:text-primary transition-colors line-clamp-2">
                                {item.name}
                              </h3>
                            </Link>
                            <button 
                              onClick={() => removeFromCart(item.id, item.selectedSize)}
                              className="text-neutral-400 hover:text-red-500 transition-colors p-1"
                              title="Remove item"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                          <p className="text-xs text-neutral-500 mt-1">
                            {item.categories?.[0]?.name || item.category} • Size: <span className="font-semibold text-neutral-700">{item.selectedSize}</span>
                          </p>
                        </div>

                        <div className="flex justify-between items-end mt-4">
                          {/* Quantity Selector */}
                          <div className="flex items-center bg-neutral-50 border border-neutral-200 rounded-md p-0.5">
                            <button 
                              onClick={() => updateQuantity(item.id, item.selectedSize, -1)}
                              className="p-1.5 hover:bg-white hover:shadow-sm rounded transition-all text-neutral-600"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="w-8 text-center text-sm font-semibold text-neutral-900">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.id, item.selectedSize, 1)}
                              className="p-1.5 hover:bg-white hover:shadow-sm rounded transition-all text-neutral-600"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                          <p className="text-sm font-bold text-neutral-900">₹{item.price * item.quantity}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Promo Code Section */}
            <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm">
              <h3 className="text-sm font-bold text-neutral-900 mb-3 flex items-center gap-2">
                <Ticket size={16} className="text-primary"/> Have a promo code?
              </h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="ENTER CODE"
                  value={couponCodeInput}
                  onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                  disabled={couponLoading}
                  className="flex-1 bg-white border border-neutral-200 h-10 px-3 rounded-lg focus:outline-none focus:border-primary font-mono text-sm tracking-wider uppercase disabled:opacity-70 transition-colors"
                />
                {coupon ? (
                  <button
                    type="button"
                    onClick={() => {
                      removeCoupon();
                      setCouponCodeInput('');
                    }}
                    className="px-4 h-10 bg-red-50 text-red-600 font-bold text-xs rounded-lg hover:bg-red-100 transition-colors uppercase tracking-wider border border-red-100"
                  >
                    Remove
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => applyCoupon(couponCodeInput)}
                    disabled={couponLoading || !couponCodeInput.trim()}
                    className="px-6 h-10 bg-neutral-900 text-white font-bold text-xs rounded-lg hover:bg-neutral-800 transition-colors uppercase tracking-wider disabled:opacity-50"
                  >
                    {couponLoading ? '...' : 'Apply'}
                  </button>
                )}
              </div>
              {couponError && <p className="text-[11px] text-red-500 mt-2 font-medium">{couponError}</p>}
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

          {/* Right Side: Order Summary */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-xl p-6 border border-neutral-200 shadow-sm sticky top-24">
              <h2 className="text-lg font-bold text-neutral-900 mb-6 border-b border-neutral-100 pb-3">Order Summary</h2>
              
              <div className="space-y-3 mb-6 text-sm">
                <div className="flex justify-between text-neutral-600">
                  <span>Subtotal</span>
                  <span className="font-medium text-neutral-900">₹{cartTotal}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Discount ({coupon?.code})</span>
                    <span>-₹{discountAmount}</span>
                  </div>
                )}
                <div className="flex justify-between text-neutral-600">
                  <span>Shipping</span>
                  <span className="font-semibold text-emerald-600">FREE</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Estimated Tax</span>
                  <span className="font-medium text-neutral-900">₹0</span>
                </div>
                
                <div className="pt-4 border-t border-neutral-200 flex justify-between items-center mt-2">
                  <span className="text-base font-bold text-neutral-900">Total</span>
                  <span className="text-2xl font-black text-primary">₹{finalTotal}</span>
                </div>
              </div>

              <Link to="/checkout" className="w-full h-11 bg-primary text-white font-bold text-sm rounded-lg hover:bg-[#002855] transition-colors flex items-center justify-center gap-2 shadow-sm active:scale-[0.99]">
                PROCEED TO CHECKOUT
                <ArrowRight size={16} />
              </Link>

              <div className="mt-6 pt-6 border-t border-neutral-100">
                <div className="flex items-center justify-center gap-2 text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mb-4">
                  <ShieldCheck size={14} className="text-emerald-600" /> Secure Checkout Guaranteed
                </div>
                <div className="flex justify-center gap-3 text-neutral-400">
                  <div className="px-2 py-1 border border-neutral-200 rounded text-[10px] font-black tracking-widest bg-neutral-50">VISA</div>
                  <div className="px-2 py-1 border border-neutral-200 rounded text-[10px] font-black tracking-widest bg-neutral-50">UPI</div>
                  <div className="px-2 py-1 border border-neutral-200 rounded text-[10px] font-black tracking-widest bg-neutral-50">GPAY</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Cart;
