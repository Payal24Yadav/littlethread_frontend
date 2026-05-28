import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Heart, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext.jsx';
import toast from 'react-hot-toast';

const isUsableImage = (value) => {
  if (!value || typeof value !== 'string') return false;
  const normalized = value.trim().toLowerCase();
  return normalized !== '' && !normalized.includes('placeholder-product');
};

const ProductCard = ({ product }) => {
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [hoverImageFailed, setHoverImageFailed] = useState(false);
  const [hoverImageLoaded, setHoverImageLoaded] = useState(false);
  const { addToCart, wishlist, toggleWishlist } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isWishlisted = wishlist.some(item => item.id === product.id);

  const handleWishlistClick = () => {
    if (!user) {
      toast.error('Please login to save items');
      navigate('/login');
      return;
    }
    toggleWishlist(product);
  };

  const handleAddClick = () => {
    if (!user) {
      toast.error('Please login to add items to cart');
      navigate('/login');
      return;
    }

    const variants = Array.isArray(product.variants) ? product.variants : [];
    const hasMultipleVariants = variants.length > 1;
    const firstVariant = variants[0];
    const hasStock = firstVariant ? firstVariant.stock > 0 : (product.stock || 0) > 0;

    if (hasMultipleVariants) {
      setShowVariantModal(true);
      return;
    }

    if (firstVariant && firstVariant.stock <= 0) {
      toast.error('This product variant is out of stock. Please select a different size.');
      return;
    }

    if (!hasStock) {
      toast.error('This product is out of stock.');
      return;
    }

    performAddToCart(product, firstVariant?.title || 'Standard');
  };
  
  const performAddToCart = (product, size) => {
    setIsAdding(true);
    
    // Small timeout to give visual feedback
    setTimeout(() => {
      addToCart(product, size);
      setIsAdding(false);
      toast.success('successfully added to cart', {
        style: {
          background: '#000',
          color: '#fff',
          fontSize: '12px',
          fontWeight: '900',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          borderRadius: '99px',
          padding: '12px 24px',
        },
        iconTheme: {
          primary: '#fff',
          secondary: '#000',
        },
      });
    }, 600);
  };

  const handleVariantChoose = (variant) => {
    if (variant.stock <= 0) {
      toast.error('This variant is out of stock. Please choose another size.');
      return;
    }
    performAddToCart(product, variant.title);
    setShowVariantModal(false);
  };

  const closeVariantModal = () => setShowVariantModal(false);

  const primaryImage = product.thumbnailUrl || product.images?.[0] || '/placeholder-product.png';
  const hoverImage = useMemo(() => {
    const candidates = [
      product.hoverThumbnailUrl,
      ...(Array.isArray(product.images) ? product.images.slice(1) : []),
    ];

    return candidates.find((image) => isUsableImage(image) && image !== primaryImage) || null;
  }, [primaryImage, product.hoverThumbnailUrl, product.images]);
  const showHoverImage = !hoverImageFailed && hoverImage;

  useEffect(() => {
    setHoverImageFailed(false);
    setHoverImageLoaded(false);
  }, [hoverImage]);

  const handleImageError = (event) => {
    event.currentTarget.onerror = null;
    setHoverImageFailed(true);
    setHoverImageLoaded(false);
  };

  return (
    <>
      <motion.div 
        layout
        className="group flex flex-col h-full bg-white"
    >
      {/* Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden bg-[#f9f9f9]">
        <Link to={`/product/${product.handle || product.id}`}>
          <img 
            src={primaryImage} 
            alt={product.name}
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = '/placeholder-product.png';
            }}
            className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
          />
          {showHoverImage && (
            <img
              src={hoverImage}
              alt=""
              aria-hidden="true"
              onError={handleImageError}
              onLoad={() => setHoverImageLoaded(true)}
              className={`absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 ${
                hoverImageLoaded ? 'group-hover:opacity-100' : ''
              }`}
            />
          )}
        </Link>

        {/* Wishlist Button */}
        <button 
          onClick={handleWishlistClick}
          className={`absolute top-4 right-4 p-2 rounded-full transition-all duration-300 z-10 ${
            isWishlisted ? 'text-secondary' : 'text-neutral-400 hover:text-secondary opacity-0 group-hover:opacity-100'
          }`}
        >
          <Heart size={20} fill={isWishlisted ? "currentColor" : "none"} strokeWidth={1.5} />
        </button>

        {/* Quick Add Button (Desktop) */}
        <div className="absolute bottom-0 left-0 w-full translate-y-full group-hover:translate-y-0 transition-transform duration-300 px-4 pb-4">
            <button 
              onClick={handleAddClick}
              disabled={isAdding}
              className="w-full py-2.5 bg-white/95 text-primary text-[10px] font-bold uppercase tracking-widest shadow-lg hover:bg-primary hover:text-white transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isAdding ? 'Adding to cart...' : 'Quick Add'}
            </button>
        </div>
      </div>

      {/* Info */}
      <div className="pt-4 flex flex-col items-center text-center">
        <Link to={`/product/${product.handle || product.id}`} className="mb-1">
          <h3 className="text-[13px] font-medium text-neutral-800 hover:text-primary transition-colors line-clamp-1 uppercase tracking-wide px-2">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm font-bold text-primary">
            ₹{product.price}
          </span>
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <>
              <span className="text-[11px] text-neutral-400 line-through">₹{product.compareAtPrice}</span>
              <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded ml-1">
                {product.discountPercentage}% OFF
              </span>
            </>
          )}
        </div>
      </div>
    </motion.div>

      {showVariantModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
          <div className="absolute inset-0 bg-black/50" onClick={closeVariantModal}></div>
          <div className="relative z-10 w-full max-w-md rounded-[2rem] bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-neutral-400">Choose Size</p>
                <h2 className="text-xl font-black text-neutral-900">Select a variant</h2>
              </div>
              <button onClick={closeVariantModal} className="p-2 rounded-full text-neutral-500 hover:bg-neutral-100 transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {product.variants?.filter(v => v.stock > 0).length > 0 ? (
                product.variants.filter(v => v.stock > 0).map((variant) => (
                  <button
                    key={variant.id || variant.title}
                    onClick={() => handleVariantChoose(variant)}
                    className="rounded-2xl border border-neutral-200 p-4 text-left transition-all hover:border-primary hover:bg-neutral-50"
                  >
                    <span className="block font-black text-sm text-neutral-900">{variant.title}</span>
                    <span className="block mt-2 text-[11px] uppercase tracking-[0.25em] text-neutral-500">
                      {variant.stock} in stock
                    </span>
                  </button>
                ))
              ) : (
                <div className="col-span-2 rounded-2xl border border-neutral-200 bg-neutral-100 p-6 text-center text-sm text-neutral-500">
                  No available variants. Please view the product page for more options.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductCard;
