import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Heart, Share2, ArrowLeft, Star, ShieldCheck, Truck, RefreshCw, Loader2, ChevronRight, Zap, Check, X, ImagePlus, Trash2, Send, MessageCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext.jsx';
import ProductCard from '../components/ProductCard';
import api from '../utils/api';
import toast from 'react-hot-toast';

const parseVariant = (v) => {
  const attrs = {};
  const title = v.title || 'Default Variant';
  const parts = title.split(', ');
  if (parts.length > 1 && parts[0].includes(': ')) {
    parts.forEach(p => {
      const [k, val] = p.split(': ');
      if (k && val) attrs[k.trim().toLowerCase()] = val.trim().toUpperCase();
    });
  } else {
    const slashParts = v.title.split(' / ');
    if (slashParts.length >= 2) {
      attrs['color'] = slashParts[0].trim().toUpperCase();
      attrs['size'] = slashParts[1].trim().toUpperCase();
    } else {
      attrs['option'] = title.trim().toUpperCase();
    }
  }
  return { ...v, attrs };
};

// Helper to detect parameter type and determine which endpoint to use
const getProductEndpoint = (param) => {
  // Check if it's a numeric ID
  if (/^\d+$/.test(param)) {
    return `/products/${param}`;
  }
  // Check if it's a UUID (36 chars with hyphens)
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(param)) {
    return `/products/${param}`;
  }
  // Otherwise treat as slug/handle
  return `/products/handle/${param}`;
};

const ProductDetails = () => {
  const { handle } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [parsedVariants, setParsedVariants] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    userName: '',
    userEmail: '',
    userPhone: '',
    comment: '',
  });
  const [reviewFiles, setReviewFiles] = useState([]);
  const [reviewPreviews, setReviewPreviews] = useState([]);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const { addToCart, wishlist, toggleWishlist } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const endpoint = getProductEndpoint(handle);
        const { data } = await api.get(endpoint);
        const productData = data?.data || data;
        setProduct(productData);
        if (productData.variants?.length > 0) {
          const parsed = productData.variants.map(parseVariant);
          setParsedVariants(parsed);
          
          const firstColor = parsed[0].attrs.color;
          const firstSize = parsed[0].attrs.size;
          
          if (firstColor) setSelectedColor(firstColor);
          if (firstSize) setSelectedSize(firstSize);
          else setSelectedSize(parsed[0].title);
        }
      } catch (err) {
        console.error('Error fetching product details:', err);
        // Show error message to user
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [handle]);

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-primary" size={48} />
        <p className="font-black uppercase tracking-widest text-xs animate-pulse">Loading Product...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-6">
        <h2 className="text-4xl font-black uppercase italic">Product not found</h2>
        <Link to="/shop" className="px-8 py-3 bg-black text-white rounded-xl text-xs font-black uppercase tracking-widest">Back to Shop</Link>
      </div>
    );
  }

  const isWishlisted = wishlist.some(item => item.id === product.id);
  const relatedProducts = product.relatedProducts || [];
  const reviews = Array.isArray(product.reviews) ? product.reviews : [];
  const reviewCount = reviews.length;
  const averageRating = reviewCount
    ? reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / reviewCount
    : 0;
  const ratingBreakdown = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: reviews.filter((review) => Number(review.rating) === rating).length,
  }));
  
  const currentVariant = parsedVariants.find(v => {
    if (selectedColor && selectedSize) {
      return v.attrs.color === selectedColor && v.attrs.size === selectedSize;
    }
    return v.title === selectedSize;
  }) || parsedVariants[0];

  const productImages = [
    ...(Array.isArray(currentVariant?.images) ? currentVariant.images : []),
    ...(Array.isArray(product.images) ? product.images : []),
    product.thumbnailUrl,
    product.hoverThumbnailUrl,
    ...parsedVariants.flatMap((variant) => Array.isArray(variant.images) ? variant.images : []),
  ].filter((image, index, images) => (
    typeof image === 'string' &&
    image.trim() &&
    !image.includes('placeholder-product') &&
    images.indexOf(image) === index
  ));

  if (productImages.length === 0) {
    productImages.push('/placeholder-product.png');
  }

  const displayPrice = currentVariant?.price ?? product.price;
  const displayStock = currentVariant ? currentVariant.stock : (product.stock || 0);

  const availableColors = [...new Set(parsedVariants.filter(v => v.attrs.color).map(v => v.attrs.color))];
  const allSizes = [...new Set(parsedVariants.map(v => v.attrs.size).filter(Boolean))];
  const availableSizesForColor = parsedVariants
    .filter(v => v.attrs.color === selectedColor)
    .map(v => v.attrs.size)
    .filter(Boolean);

  const handleColorChange = (color) => {
    setSelectedColor(color);
    const sizes = parsedVariants.filter(v => v.attrs.color === color).map(v => v.attrs.size);
    if (sizes.length > 0 && !sizes.includes(selectedSize)) {
      setSelectedSize(sizes[0]);
    }
    setSelectedImage(0);
  };

  const handleImageError = (event) => {
    event.currentTarget.onerror = null;
    event.currentTarget.src = '/placeholder-product.png';
  };

  const handleReviewInputChange = (event) => {
    const { name, value } = event.target;
    const nextValue = name === 'userPhone'
      ? value.replace(/\D/g, '').slice(0, 10)
      : value;
    setReviewForm((current) => ({ ...current, [name]: nextValue }));
  };

  const handleReviewImageChange = (event) => {
    const incomingFiles = Array.from(event.target.files || []);
    if (!incomingFiles.length) return;

    const availableSlots = Math.max(0, 5 - reviewFiles.length);
    const acceptedFiles = incomingFiles
      .filter((file) => file.type.startsWith('image/'))
      .slice(0, availableSlots);

    if (incomingFiles.length > acceptedFiles.length) {
      toast.error('You can add up to 5 review photos.');
    }

    setReviewFiles((current) => [...current, ...acceptedFiles]);
    setReviewPreviews((current) => [
      ...current,
      ...acceptedFiles.map((file) => ({
        name: file.name,
        url: URL.createObjectURL(file),
      })),
    ]);
    event.target.value = '';
  };

  const removeReviewImage = (index) => {
    setReviewFiles((current) => current.filter((_, itemIndex) => itemIndex !== index));
    setReviewPreviews((current) => {
      const next = current.filter((_, itemIndex) => itemIndex !== index);
      URL.revokeObjectURL(current[index]?.url);
      return next;
    });
  };

  const resetReviewForm = () => {
    reviewPreviews.forEach((preview) => URL.revokeObjectURL(preview.url));
    setReviewForm({
      rating: 5,
      userName: '',
      userEmail: '',
      userPhone: '',
      comment: '',
    });
    setReviewFiles([]);
    setReviewPreviews([]);
  };

  const handleReviewSubmit = async (event) => {
    event.preventDefault();

    const finalName = (reviewForm.userName || user?.name || '').trim();
    const finalEmail = (reviewForm.userEmail || user?.email || '').trim().toLowerCase();
    const finalPhone = reviewForm.userPhone.replace(/\D/g, '').slice(0, 10);
    const finalComment = reviewForm.comment.trim();

    if (!finalName) {
      toast.error('Please add your name.');
      return;
    }

    if (!finalEmail && !finalPhone) {
      toast.error('Please add an email or phone number.');
      return;
    }

    if (finalPhone && finalPhone.length !== 10) {
      toast.error('Please add a valid 10 digit phone number.');
      return;
    }

    if (finalComment.length < 10) {
      toast.error('Please write at least 10 characters.');
      return;
    }

    setIsSubmittingReview(true);

    try {
      let imageUrls = [];

      if (reviewFiles.length > 0) {
        const formData = new FormData();
        reviewFiles.forEach((file) => formData.append('images', file));
        formData.append('uploadType', 'product');
        const uploadResponse = await api.post('/reviews/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        imageUrls = uploadResponse.data?.urls || [];
      }

      const response = await api.post('/reviews', {
        productId: product.id || product.handle || handle,
        rating: Number(reviewForm.rating),
        comment: finalComment,
        userName: finalName,
        userEmail: finalEmail || null,
        userPhone: finalPhone || null,
        images: imageUrls,
      });

      setProduct((current) => ({
        ...current,
        reviews: [response.data, ...(current.reviews || [])],
      }));
      resetReviewForm();
      toast.success('Review submitted. Thank you!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Unable to submit review.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#faf9f6] pt-24 pb-16 md:pt-28 lg:pt-32">
      <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <Link to="/shop" className="mb-6 inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-[#0a192f] transition-colors hover:text-[#dca450]">
          <ArrowLeft size={16} /> Back to Shop
        </Link>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(420px,0.78fr)] lg:gap-12 xl:gap-16">
        {/* Gallery */}
        <div className="space-y-4 lg:sticky lg:top-28 lg:self-start">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex aspect-[4/5] max-h-[calc(100vh-9rem)] min-h-[320px] items-center justify-center overflow-hidden rounded-xl border border-black/5 bg-white shadow-sm sm:aspect-[5/6] lg:min-h-[520px]"
          >
            <AnimatePresence mode='wait'>
              <motion.img
                key={selectedImage + (productImages[0] || '')}
                src={productImages[selectedImage]}
                alt={product.name}
                onError={handleImageError}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full w-full object-contain"
              />
            </AnimatePresence>
          </motion.div>

          {productImages.length > 1 && (
            <div className="flex gap-3 overflow-x-auto rounded-xl border border-black/5 bg-white p-3 shadow-sm">
              {productImages.map((img, idx) => (
                <button
                  key={`${img}-${idx}`}
                  onClick={() => setSelectedImage(idx)}
                  className={`h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border bg-white transition-all sm:h-24 sm:w-24 ${selectedImage === idx ? 'border-[#0a192f] p-0.5 shadow-sm ring-2 ring-[#0a192f]/10' : 'border-black/5 hover:border-[#0a192f]/40'}`}
                  aria-label={`View product image ${idx + 1}`}
                >
                  <img src={img} alt="" onError={handleImageError} className="h-full w-full rounded-md object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col lg:pt-8"
        >
          <div className="mb-3 flex items-start justify-between gap-5">
            <div className="min-w-0">
              <h1 className="max-w-[760px] text-3xl font-black uppercase leading-[0.95] tracking-normal text-[#0a192f] sm:text-4xl xl:text-5xl">
                {product.name}
              </h1>
              {product.subtitle && (
                <p className="mt-4 text-[11px] font-black uppercase tracking-[0.22em] text-neutral-400">{product.subtitle}</p>
              )}
            </div>
            <div className="flex shrink-0 gap-2">
              <button
                onClick={() => {
                  if (!user) {
                    toast.error('Login required to save items');
                    navigate('/login');
                    return;
                  }
                  toggleWishlist(product);
                }}
                className={`grid h-12 w-12 place-items-center rounded-full border bg-white transition-all sm:h-14 sm:w-14 ${isWishlisted
                    ? 'border-[#0a192f] text-[#0a192f]'
                    : 'border-neutral-200 text-neutral-400 hover:border-[#0a192f] hover:text-[#0a192f]'
                  }`}
              >
                <Heart size={20} fill={isWishlisted ? "currentColor" : "none"} />
              </button>
              <button className="grid h-12 w-12 place-items-center rounded-full border border-neutral-200 bg-white text-neutral-400 transition-all hover:border-[#0a192f] hover:text-[#0a192f] sm:h-14 sm:w-14">
                <Share2 size={20} />
              </button>
            </div>
          </div>

          <div className="mb-7 flex flex-wrap items-center gap-3">
            <div className="flex items-center text-[#fbbf24]">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={14} fill={i < Math.round(averageRating || 0) ? 'currentColor' : 'none'} />
              ))}
            </div>
            <span className="text-[#0a192f] font-black text-xs">
              {(averageRating || 0).toFixed(1)} | ({reviewCount} Reviews)
            </span>
            <div className="w-4 h-4 bg-[#3b82f6] rounded-full text-white flex items-center justify-center">
              <ShieldCheck size={10} />
            </div>
          </div>

          <div className="mb-4 flex flex-wrap items-baseline gap-4">
            <p className="text-4xl font-black text-[#e85d04] sm:text-5xl">₹{displayPrice}</p>
            {(currentVariant?.compareAtPrice || product.compareAtPrice) && (currentVariant?.compareAtPrice || product.compareAtPrice) > displayPrice && (
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-xl font-black text-neutral-400 line-through">₹{currentVariant?.compareAtPrice || product.compareAtPrice}</p>
                <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-sm font-black uppercase tracking-widest">
                  {product.discountPercentage}% OFF
                </span>
              </div>
            )}
          </div>

          <div className="mb-7 border-b border-neutral-200 pb-7">
            <p className={`${displayStock > 0 ? 'text-[#10b981]' : 'text-[#ef4444]'} font-black italic text-sm mb-3 flex items-center gap-1`}>
              <Zap size={14} fill="currentColor" /> {displayStock > 0 ? `${displayStock} items left in stock` : 'Out of stock'}
            </p>
            <div className="h-1.5 w-full max-w-xl overflow-hidden rounded-full bg-neutral-200">
              <div 
                className={`${displayStock > 0 ? 'bg-[#10b981]' : 'bg-[#ef4444]'} h-full rounded-full transition-all`}
                style={{ width: displayStock > 0 ? `${Math.min(100, Math.max(5, (displayStock / 10) * 100))}%` : '0%' }}
              ></div>
            </div>
          </div>

          <p className="mb-7 max-w-2xl text-sm font-bold leading-relaxed text-neutral-600">
            {product.description || 'Premium Collection. Handcrafted with precision and care.'}
          </p>

          <p className="mb-8 text-[10px] font-black uppercase tracking-widest text-neutral-400">
            Inclusive of all taxes
          </p>

          <button className="flex items-center gap-2 text-[10px] font-black text-[#0a192f] tracking-widest border-b-2 border-[#0a192f] pb-0.5 uppercase w-max mb-8 hover:text-[#e85d04] hover:border-[#e85d04] transition-all">
            <ShoppingBag size={14} /> Size Guide
          </button>

          {/* Size Selection */}
          <div className="mb-8">
            <h3 className="font-black uppercase text-xs tracking-widest text-[#0a192f] mb-4">
              {availableColors.length > 0 ? `SIZE: ${selectedSize}` : 'SELECT VARIANT'}
            </h3>
            <div className="flex flex-wrap gap-2">
              {availableColors.length > 0 ? (
                allSizes.map(size => {
                  const isAvailableForColor = availableSizesForColor.includes(size);
                  return (
                    <button
                      key={size}
                      onClick={() => {
                        if (isAvailableForColor) {
                          setSelectedSize(size);
                        } else {
                          // Find a color that has this size and switch to it
                          const colorForSize = parsedVariants.find(v => v.attrs.size === size)?.attrs.color;
                          if (colorForSize) {
                            setSelectedColor(colorForSize);
                            setSelectedSize(size);
                            setSelectedImage(0);
                          }
                        }
                      }}
                      className={`min-w-[3.5rem] h-12 px-4 rounded-sm text-sm font-black transition-all border flex items-center justify-center ${
                        selectedSize === size
                          ? 'border-[#0a192f] text-[#0a192f] shadow-[0_0_0_1px_#0a192f]'
                          : isAvailableForColor
                            ? 'border-neutral-200 text-neutral-400 hover:border-[#0a192f] hover:text-[#0a192f]'
                            : 'border-neutral-200 text-neutral-300 opacity-60 overflow-hidden relative after:absolute after:w-full after:h-[1px] after:bg-neutral-300 after:rotate-45 hover:border-neutral-300'
                      }`}
                    >
                      {size}
                    </button>
                  );
                })
              ) : (
                parsedVariants.map(v => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedSize(v.title)}
                    className={`min-w-[3.5rem] h-12 px-4 rounded-sm text-sm font-black transition-all border flex items-center justify-center ${
                      selectedSize === v.title
                        ? 'border-[#0a192f] text-[#0a192f] shadow-[0_0_0_1px_#0a192f]'
                        : 'border-neutral-200 text-neutral-400 hover:border-[#0a192f] hover:text-[#0a192f]'
                    }`}
                  >
                    {v.title}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Color Selection */}
          {availableColors.length > 0 && (
            <div className="mb-10">
              <h3 className="font-black uppercase text-xs tracking-widest text-[#0a192f] mb-4">
                COLOR: <span className="text-neutral-400 ml-1">{selectedColor}</span>
              </h3>
              <div className="flex flex-wrap gap-3">
                {availableColors.map(color => {
                  const v = parsedVariants.find(v => v.attrs.color === color && v.images?.length > 0) || parsedVariants.find(v => v.attrs.color === color);
                  const thumb = v?.images?.[0] || productImages[0];
                  return (
                    <button
                      key={color}
                      onClick={() => handleColorChange(color)}
                      className={`w-14 h-14 rounded-full overflow-hidden border-2 transition-all p-0.5 ${
                        selectedColor === color ? 'border-[#0a192f]' : 'border-transparent hover:border-neutral-300'
                      }`}
                    >
                      <img src={thumb} alt={color} onError={handleImageError} className="w-full h-full object-cover rounded-full" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Add to Cart & Buy Now */}
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <div className="flex w-full items-center justify-between gap-4 rounded-lg border border-neutral-200 bg-white p-1 sm:w-max">
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 flex items-center justify-center text-xl text-neutral-500 hover:bg-neutral-100 rounded-md transition-colors disabled:opacity-50"
                disabled={quantity <= 1 || displayStock === 0}
              >
                -
              </button>
              <span className="w-8 text-center font-black">{quantity}</span>
              <button 
                onClick={() => {
                  if (quantity >= displayStock) {
                    toast.custom((t) => (
                      <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} flex items-center gap-3 bg-black text-white px-4 py-3 rounded-full text-xs font-black tracking-widest shadow-[0_8px_30px_rgb(0,0,0,0.12)]`}>
                        <div className="w-5 h-5 bg-[#10b981] rounded-full flex items-center justify-center flex-shrink-0">
                          <Check size={12} strokeWidth={4} className="text-white" />
                        </div>
                        ONLY {displayStock} ITEM(S) LEFT IN STOCK
                        <button onClick={() => toast.dismiss(t.id)} className="text-neutral-500 hover:text-white ml-2">
                          <X size={14} />
                        </button>
                      </div>
                    ));
                  } else {
                    setQuantity(quantity + 1);
                  }
                }}
                className="w-10 h-10 flex items-center justify-center text-xl text-neutral-500 hover:bg-neutral-100 rounded-md transition-colors disabled:opacity-50"
                disabled={displayStock === 0}
              >
                +
              </button>
            </div>
            <button
              onClick={() => {
                if (!user) {
                  toast.error('Login required to add items to cart');
                  navigate('/login');
                  return;
                }
                
                setIsAdding(true);
                setTimeout(() => {
                  addToCart(product, currentVariant?.title || selectedSize, quantity);
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
              }}
              disabled={displayStock === 0 || isAdding}
              className="h-14 flex-1 rounded-md bg-[#1a1a1a] px-6 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-black/10 transition-all hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
            >
              {displayStock === 0 ? 'OUT OF STOCK' : isAdding ? 'ADDING TO CART...' : 'ADD TO CART'}
            </button>
          </div>
          <button 
            disabled={displayStock === 0}
            onClick={() => {
              if (!user) {
                toast.error('Login required to checkout');
                navigate('/login');
                return;
              }
              addToCart(product, currentVariant?.title || selectedSize, quantity);
              navigate('/checkout');
            }}
            className="mb-12 flex h-14 w-full items-center justify-center gap-2 rounded-md bg-[#dca450] text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-[#dca450]/20 transition-all hover:bg-[#c99547] disabled:cursor-not-allowed disabled:opacity-50"
          >
            ORDER NOW <ChevronRight size={16} strokeWidth={3} />
          </button>

          {/* Info Cards */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex items-center gap-4 p-4 border border-neutral-100 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="p-2.5 bg-neutral-50 rounded-lg text-[#0a192f]"><Truck size={20} /></div>
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-[#0a192f]">Free Delivery</p>
                <p className="text-[10px] text-neutral-400 font-bold mt-0.5">Orders above ₹1999</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 border border-neutral-100 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="p-2.5 bg-neutral-50 rounded-lg text-[#0a192f]"><RefreshCw size={20} /></div>
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-[#0a192f]">10 Day Returns</p>
                <p className="text-[10px] text-neutral-400 font-bold mt-0.5">Easy & hassle free</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <section className="mt-16 border-t border-neutral-200 pt-14">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-6">
            <div>
              <p className="mb-2 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.24em] text-[#e97055]">
                <MessageCircle size={14} /> Customer Reviews
              </p>
              <h2 className="text-3xl font-black uppercase leading-none text-[#0a192f] sm:text-4xl">
                Little words from happy threads
              </h2>
            </div>

            <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-end justify-between gap-5">
                <div>
                  <p className="text-5xl font-black text-[#0a192f]">{(averageRating || 0).toFixed(1)}</p>
                  <div className="mt-2 flex text-[#f7b84b]">
                    {[...Array(5)].map((_, index) => (
                      <Star key={index} size={18} fill={index < Math.round(averageRating || 0) ? 'currentColor' : 'none'} />
                    ))}
                  </div>
                </div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-neutral-400">
                  Based on {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
                </p>
              </div>

              <div className="mt-6 space-y-3">
                {ratingBreakdown.map((item) => (
                  <div key={item.rating} className="grid grid-cols-[42px_1fr_28px] items-center gap-3">
                    <span className="text-xs font-black text-[#0a192f]">{item.rating} star</span>
                    <div className="h-2 overflow-hidden rounded-full bg-[#f4eee7]">
                      <div
                        className="h-full rounded-full bg-[#7dc7bd]"
                        style={{ width: reviewCount ? `${(item.count / reviewCount) * 100}%` : '0%' }}
                      ></div>
                    </div>
                    <span className="text-right text-xs font-bold text-neutral-400">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>

            <form onSubmit={handleReviewSubmit} className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
              <div className="mb-5">
                <h3 className="text-sm font-black uppercase tracking-[0.18em] text-[#0a192f]">Write a review</h3>
                <p className="mt-2 text-xs font-bold leading-6 text-neutral-500">
                  Share fit, fabric, comfort, and photos so other parents can choose with confidence.
                </p>
              </div>

              <div className="mb-5 flex gap-1 text-[#f7b84b]">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => setReviewForm((current) => ({ ...current, rating }))}
                    className="rounded-full p-1 transition-transform hover:scale-110"
                    aria-label={`${rating} star rating`}
                  >
                    <Star size={24} fill={rating <= reviewForm.rating ? 'currentColor' : 'none'} />
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <input
                  name="userName"
                  value={reviewForm.userName}
                  onChange={handleReviewInputChange}
                  placeholder={user?.name || 'Your name'}
                  className="h-12 rounded-md border border-neutral-200 bg-[#fffaf5] px-4 text-sm font-bold outline-none transition-colors focus:border-[#0a192f]"
                />
                <input
                  name="userEmail"
                  type="email"
                  value={reviewForm.userEmail}
                  onChange={handleReviewInputChange}
                  placeholder={user?.email || 'Email address'}
                  className="h-12 rounded-md border border-neutral-200 bg-[#fffaf5] px-4 text-sm font-bold outline-none transition-colors focus:border-[#0a192f]"
                />
                <input
                  name="userPhone"
                  type="tel"
                  value={reviewForm.userPhone}
                  onChange={handleReviewInputChange}
                  placeholder="Phone number"
                  inputMode="numeric"
                  maxLength={10}
                  pattern="[0-9]{10}"
                  className="h-12 rounded-md border border-neutral-200 bg-[#fffaf5] px-4 text-sm font-bold outline-none transition-colors focus:border-[#0a192f] sm:col-span-2"
                />
                <textarea
                  name="comment"
                  value={reviewForm.comment}
                  onChange={handleReviewInputChange}
                  placeholder="How did this piece feel, fit, and look?"
                  rows={4}
                  className="resize-none rounded-md border border-neutral-200 bg-[#fffaf5] px-4 py-3 text-sm font-bold leading-6 outline-none transition-colors focus:border-[#0a192f] sm:col-span-2"
                />
              </div>

              <div className="mt-4">
                <label className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-md border border-dashed border-[#7dc7bd] bg-[#f5fffd] px-4 text-[10px] font-black uppercase tracking-[0.16em] text-[#0a192f] transition-colors hover:border-[#0a192f]">
                  <ImagePlus size={16} /> Add Photos
                  <input type="file" accept="image/*" multiple onChange={handleReviewImageChange} className="hidden" />
                </label>
                {reviewPreviews.length > 0 && (
                  <div className="mt-4 grid grid-cols-5 gap-2">
                    {reviewPreviews.map((preview, index) => (
                      <div key={`${preview.name}-${preview.url}`} className="relative aspect-square overflow-hidden rounded-md border border-neutral-200 bg-neutral-50">
                        <img src={preview.url} alt="" className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeReviewImage(index)}
                          className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-white text-[#e97055] shadow-sm"
                          aria-label="Remove review photo"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmittingReview}
                className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-[#0a192f] px-5 text-xs font-black uppercase tracking-widest text-white transition-colors hover:bg-[#12345a] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmittingReview ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          </div>

          <div className="space-y-4">
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <article key={review.id} className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="mb-2 flex text-[#f7b84b]">
                        {[...Array(5)].map((_, index) => (
                          <Star key={index} size={15} fill={index < Number(review.rating || 0) ? 'currentColor' : 'none'} />
                        ))}
                      </div>
                      <h3 className="text-sm font-black uppercase tracking-wide text-[#0a192f]">
                        {review.userName || 'Anonymous'}
                      </h3>
                    </div>
                    <span className="rounded-full bg-[#f4eee7] px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#e97055]">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="mt-4 text-sm font-semibold leading-7 text-neutral-600">{review.comment}</p>
                  {Array.isArray(review.images) && review.images.length > 0 && (
                    <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-5">
                      {review.images.map((image, index) => (
                        <a
                          key={`${review.id}-${image}-${index}`}
                          href={image}
                          target="_blank"
                          rel="noreferrer"
                          className="aspect-square overflow-hidden rounded-md border border-neutral-100 bg-neutral-50"
                        >
                          <img src={image} alt="" className="h-full w-full object-cover transition-transform hover:scale-105" />
                        </a>
                      ))}
                    </div>
                  )}
                </article>
              ))
            ) : (
              <div className="flex min-h-[320px] flex-col items-center justify-center rounded-lg border border-dashed border-[#7dc7bd] bg-white p-8 text-center">
                <img src="/logo.png" alt="Little Threads" className="mb-5 h-20 w-auto object-contain" />
                <h3 className="text-lg font-black uppercase text-[#0a192f]">No reviews yet</h3>
                <p className="mt-2 max-w-sm text-sm font-bold leading-6 text-neutral-500">
                  Be the first to review this Little Threads piece.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Related */}
      {relatedProducts.length > 0 && (
        <section className="py-20 mt-10 border-t border-neutral-200">
          <h2 className="text-3xl font-black uppercase tracking-tighter mb-12 text-[#0a192f]">You Might <span className="text-[#dca450]">Also Like</span></h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {relatedProducts.map(p => <ProductCard key={p.handle} product={p} />)}
          </div>
        </section>
      )}
      </div>
    </main>
  );
};

export default ProductDetails;
