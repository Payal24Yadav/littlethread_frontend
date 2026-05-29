import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Heart, ShoppingBag, Trash2, ShoppingCart, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Wishlist = () => {
  const { wishlist, toggleWishlist, addToCart } = useCart();

  if (wishlist.length === 0) {
    return (
      <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center container mx-auto px-6 text-center pt-8 pb-16 font-sans">
        <div className="w-24 h-24 bg-white border border-neutral-200 rounded-full flex items-center justify-center mb-6 shadow-sm">
          <Heart size={36} className="text-neutral-400" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight mb-2 text-primary">Your wishlist is empty</h2>
        <p className="text-sm text-neutral-500 mb-8 max-w-sm">Save your favorite items here so you never lose track of them.</p>
        <Link to="/shop" className="bg-primary text-white hover:bg-[#002855] px-8 py-3 rounded-lg font-bold text-sm transition-colors shadow-sm active:scale-[0.98]">
          START SHOPPING
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-neutral-50 min-h-screen pt-8 pb-16 font-sans text-[#1d2432]">
      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* Header Section */}
        <div className="flex flex-col mb-8 border-b border-neutral-200 pb-4">
          <h1 className="text-3xl font-bold text-primary tracking-tight">Saved Items</h1>
          <p className="text-neutral-500 text-sm mt-1 flex items-center gap-2">
            <Heart size={16} className="text-secondary" /> You have {wishlist.length} item{wishlist.length > 1 ? 's' : ''} saved to your wishlist.
          </p>
        </div>

        {/* Wishlist Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          <AnimatePresence>
            {wishlist.map((product) => (
              <motion.div 
                key={product.id} 
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden flex flex-col hover:border-primary/30 transition-colors group"
              >
                {/* Image Section */}
                <Link to={`/product/${product.handle || product.id}`} className="block relative w-full aspect-[3/4] overflow-hidden bg-neutral-100">
                  <img 
                    src={product.images?.[0]} 
                    alt={product.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                  {/* Remove Button Hover Overlay */}
                  <button 
                    onClick={(e) => {
                      e.preventDefault(); // Prevent navigating to product
                      toggleWishlist(product);
                    }} 
                    className="absolute top-2 right-2 p-2 bg-white/90 backdrop-blur-sm text-neutral-400 hover:text-red-500 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-all hover:scale-110 z-10"
                    title="Remove from wishlist"
                  >
                    <Trash2 size={16} />
                  </button>
                </Link>

                {/* Details Section */}
                <div className="p-4 flex flex-col flex-1">
                  <div className="flex-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1">
                      {product.category || 'Clothing'}
                    </p>
                    <Link to={`/product/${product.handle || product.id}`}>
                      <h3 className="font-bold text-sm text-neutral-900 leading-snug line-clamp-2 hover:text-primary transition-colors">
                        {product.name}
                      </h3>
                    </Link>
                  </div>
                  
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-base font-black text-primary">₹{product.price}</span>
                  </div>

                  {/* Add to Cart Button */}
                  <button 
                    onClick={() => {
                      // If sizes exist, we pass the first one by default. In a real scenario, linking to the product page might be safer, but we keep the original logic here.
                      addToCart(product, product.sizes?.[0]);
                    }} 
                    className="mt-4 w-full flex items-center justify-center gap-2 bg-neutral-100 hover:bg-primary hover:text-white text-neutral-700 py-2.5 rounded-lg text-xs font-bold transition-all border border-transparent hover:border-primary/20 active:scale-[0.98]"
                  >
                    <ShoppingCart size={14} /> ADD TO BAG
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
};

export default Wishlist;
