import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Heart, Share2, ArrowLeft, Star, ShieldCheck, Truck, RefreshCw, Loader2, ChevronRight, Check, X, ImagePlus, Trash2, Send, MessageCircle } from 'lucide-react';
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
      if (k && val) attrs[k.trim().toLowerCase()] = val.trim();
    });
  } else {
    const slashParts = v.title.split(' / ');
    if (slashParts.length >= 2) {
      attrs['color'] = slashParts[0].trim();
      attrs['size'] = slashParts[1].trim();
    } else {
      attrs['option'] = title.trim();
    }
  }
  return { ...v, attrs };
};

const getProductEndpoint = (param) => {
  if (/^\d+$/.test(param)) return `/products/${param}`;
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(param)) return `/products/${param}`;
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
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [handle]);

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4 bg-neutral-50">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4 bg-neutral-50">
        <h2 className="text-2xl font-bold text-neutral-900">Product not found</h2>
        <Link to="/shop" className="px-6 py-2.5 bg-primary text-white rounded-lg text-sm font-bold">Return to Shop</Link>
      </div>
    );
  }

  const isWishlisted = wishlist.some(item => item.id === product.id);
  const relatedProducts = product.relatedProducts || [];
  const reviews = Array.isArray(product.reviews) ? product.reviews : [];
  const reviewCount = reviews.length;
  const averageRating = reviewCount ? reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / reviewCount : 0;
  
  const currentVariant = parsedVariants.find(v => {
    if (selectedColor && selectedSize) return v.attrs.color === selectedColor && v.attrs.size === selectedSize;
    return v.title === selectedSize;
  }) || parsedVariants[0];

  const productImages = [
    ...(Array.isArray(currentVariant?.images) ? currentVariant.images : []),
    ...(Array.isArray(product.images) ? product.images : []),
    product.thumbnailUrl,
    product.hoverThumbnailUrl,
    ...parsedVariants.flatMap((variant) => Array.isArray(variant.images) ? variant.images : []),
  ].filter((image, index, images) => typeof image === 'string' && image.trim() && !image.includes('placeholder-product') && images.indexOf(image) === index);

  if (productImages.length === 0) productImages.push('/placeholder-product.png');

  const displayPrice = currentVariant?.price ?? product.price;
  const displayStock = currentVariant ? currentVariant.stock : (product.stock || 0);

  const availableColors = [...new Set(parsedVariants.filter(v => v.attrs.color).map(v => v.attrs.color))];
  const allSizes = [...new Set(parsedVariants.map(v => v.attrs.size).filter(Boolean))];
  const availableSizesForColor = parsedVariants.filter(v => v.attrs.color === selectedColor).map(v => v.attrs.size).filter(Boolean);

  const handleColorChange = (color) => {
    setSelectedColor(color);
    const sizes = parsedVariants.filter(v => v.attrs.color === color).map(v => v.attrs.size);
    if (sizes.length > 0 && !sizes.includes(selectedSize)) setSelectedSize(sizes[0]);
    setSelectedImage(0);
  };

  const handleImageError = (e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/placeholder-product.png'; };
  const handleReviewInputChange = (e) => {
    const { name, value } = e.target;
    setReviewForm(curr => ({ ...curr, [name]: name === 'userPhone' ? value.replace(/\D/g, '').slice(0, 10) : value }));
  };

  const handleReviewImageChange = (e) => {
    const incomingFiles = Array.from(e.target.files || []);
    if (!incomingFiles.length) return;
    const availableSlots = Math.max(0, 5 - reviewFiles.length);
    const acceptedFiles = incomingFiles.filter(file => file.type.startsWith('image/')).slice(0, availableSlots);
    if (incomingFiles.length > acceptedFiles.length) toast.error('Up to 5 photos allowed.');
    setReviewFiles(curr => [...curr, ...acceptedFiles]);
    setReviewPreviews(curr => [...curr, ...acceptedFiles.map(file => ({ name: file.name, url: URL.createObjectURL(file) }))]);
    e.target.value = '';
  };

  const removeReviewImage = (index) => {
    setReviewFiles(curr => curr.filter((_, i) => i !== index));
    setReviewPreviews(curr => {
      const next = curr.filter((_, i) => i !== index);
      URL.revokeObjectURL(curr[index]?.url);
      return next;
    });
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    const finalName = (reviewForm.userName || user?.name || '').trim();
    const finalEmail = (reviewForm.userEmail || user?.email || '').trim().toLowerCase();
    const finalPhone = reviewForm.userPhone.replace(/\D/g, '').slice(0, 10);
    const finalComment = reviewForm.comment.trim();

    if (!finalName) return toast.error('Please add your name.');
    if (!finalEmail && !finalPhone) return toast.error('Please add an email or phone number.');
    if (finalPhone && finalPhone.length !== 10) return toast.error('Valid 10-digit phone required.');
    if (finalComment.length < 10) return toast.error('Review must be at least 10 characters.');

    setIsSubmittingReview(true);
    try {
      let imageUrls = [];
      if (reviewFiles.length > 0) {
        const formData = new FormData();
        reviewFiles.forEach((file) => formData.append('images', file));
        formData.append('uploadType', 'product');
        const uploadResponse = await api.post('/reviews/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
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
      setProduct(curr => ({ ...curr, reviews: [response.data, ...(curr.reviews || [])] }));
      setReviewForm({ rating: 5, userName: '', userEmail: '', userPhone: '', comment: '' });
      setReviewFiles([]);
      setReviewPreviews([]);
      toast.success('Review submitted successfully.');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Unable to submit review.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <main className="min-h-screen bg-neutral-50 pt-6 pb-12 font-sans">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <Link to="/shop" className="mb-4 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-neutral-500 hover:text-primary transition-colors">
          <ArrowLeft size={14} /> Back to Shop
        </Link>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 bg-white p-4 sm:p-6 lg:p-8 rounded-xl shadow-sm border border-neutral-100">
          
          {/* Gallery - Compact layout */}
          <div className="lg:col-span-5 space-y-3">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex aspect-[3/4] w-full items-center justify-center overflow-hidden rounded-lg bg-[#f4f5f7]"
            >
              <AnimatePresence mode='wait'>
                <motion.img
                  key={selectedImage}
                  src={productImages[selectedImage]}
                  alt={product.name}
                  onError={handleImageError}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full w-full object-cover mix-blend-multiply"
                />
              </AnimatePresence>
            </motion.div>

            {productImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {productImages.map((img, idx) => (
                  <button
                    key={`${img}-${idx}`}
                    onClick={() => setSelectedImage(idx)}
                    className={`h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border-2 bg-white transition-all ${selectedImage === idx ? 'border-primary p-0.5' : 'border-transparent hover:border-neutral-200'}`}
                  >
                    <img src={img} alt="" onError={handleImageError} className="h-full w-full rounded object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="lg:col-span-7 flex flex-col pt-2">
            <div className="flex items-start justify-between gap-4 mb-2">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-primary leading-tight">
                  {product.name}
                </h1>
                {product.subtitle && (
                  <p className="mt-1 text-sm font-medium text-neutral-500">{product.subtitle}</p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (!user) { toast.error('Login required'); navigate('/login'); return; }
                    toggleWishlist(product);
                  }}
                  className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors ${isWishlisted ? 'bg-secondary/10 text-secondary' : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'}`}
                >
                  <Heart size={18} fill={isWishlisted ? "currentColor" : "none"} />
                </button>
                <button className="flex items-center justify-center w-10 h-10 rounded-full bg-neutral-100 text-neutral-500 hover:bg-neutral-200 transition-colors">
                  <Share2 size={18} />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-neutral-100">
              <div className="flex items-center text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} fill={i < Math.round(averageRating || 0) ? 'currentColor' : 'none'} />
                ))}
              </div>
              <span className="text-xs font-medium text-neutral-500">
                {(averageRating || 0).toFixed(1)} | {reviewCount} Reviews
              </span>
            </div>

            <div className="mb-6 flex items-end gap-3">
              <p className="text-3xl font-bold text-neutral-900">₹{displayPrice}</p>
              {(currentVariant?.compareAtPrice || product.compareAtPrice) && (currentVariant?.compareAtPrice || product.compareAtPrice) > displayPrice && (
                <>
                  <p className="text-lg font-bold text-neutral-400 line-through mb-0.5">₹{currentVariant?.compareAtPrice || product.compareAtPrice}</p>
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded text-[10px] font-bold uppercase tracking-wider mb-1">
                    {product.discountPercentage}% OFF
                  </span>
                </>
              )}
            </div>

            <p className="mb-6 text-sm leading-relaxed text-neutral-600 max-w-xl">
              {product.description || 'Premium Collection. Carefully crafted for style and comfort.'}
            </p>

            {/* Size Selection */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-xs uppercase tracking-widest text-primary">
                  {availableColors.length > 0 ? 'Select Size' : 'Select Variant'}
                </h3>
                <button className="text-xs font-bold text-secondary hover:underline">Size Guide</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {availableColors.length > 0 ? (
                  allSizes.map(size => {
                    const isAvailable = availableSizesForColor.includes(size);
                    return (
                      <button
                        key={size}
                        onClick={() => {
                          if (isAvailable) setSelectedSize(size);
                          else {
                            const colorForSize = parsedVariants.find(v => v.attrs.size === size)?.attrs.color;
                            if (colorForSize) { setSelectedColor(colorForSize); setSelectedSize(size); setSelectedImage(0); }
                          }
                        }}
                        className={`min-w-[44px] h-10 px-3 rounded text-sm font-bold transition-all border ${
                          selectedSize === size
                            ? 'border-primary bg-primary text-white'
                            : isAvailable
                              ? 'border-neutral-200 text-neutral-700 hover:border-primary'
                              : 'border-neutral-100 text-neutral-300 opacity-50 relative after:absolute after:w-full after:h-[1px] after:bg-neutral-300 after:rotate-45 hover:cursor-not-allowed'
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
                      className={`h-10 px-4 rounded text-sm font-bold transition-all border ${
                        selectedSize === v.title
                          ? 'border-primary bg-primary text-white'
                          : 'border-neutral-200 text-neutral-700 hover:border-primary'
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
              <div className="mb-8">
                <h3 className="font-bold text-xs uppercase tracking-widest text-primary mb-3">
                  Color: <span className="text-neutral-500 font-medium ml-1 capitalize">{selectedColor?.toLowerCase()}</span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {availableColors.map(color => {
                    const v = parsedVariants.find(v => v.attrs.color === color && v.images?.length > 0) || parsedVariants.find(v => v.attrs.color === color);
                    const thumb = v?.images?.[0] || productImages[0];
                    return (
                      <button
                        key={color}
                        onClick={() => handleColorChange(color)}
                        className={`w-12 h-12 rounded-full overflow-hidden border-2 transition-all p-0.5 ${
                          selectedColor === color ? 'border-primary' : 'border-transparent hover:border-neutral-300'
                        }`}
                      >
                        <img src={thumb} alt={color} onError={handleImageError} className="w-full h-full object-cover rounded-full" />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Add to Cart Actions */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="flex items-center justify-between border border-neutral-200 bg-white rounded-lg h-12 px-2 sm:w-32">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 flex items-center justify-center text-lg text-neutral-500 hover:bg-neutral-50 rounded disabled:opacity-50"
                  disabled={quantity <= 1 || displayStock === 0}
                >
                  -
                </button>
                <span className="text-sm font-bold text-neutral-900">{quantity}</span>
                <button 
                  onClick={() => {
                    if (quantity >= displayStock) toast.error(`Only ${displayStock} left`);
                    else setQuantity(quantity + 1);
                  }}
                  className="w-8 h-8 flex items-center justify-center text-lg text-neutral-500 hover:bg-neutral-50 rounded disabled:opacity-50"
                  disabled={displayStock === 0}
                >
                  +
                </button>
              </div>

              <button
                onClick={() => {
                  if (!user) { toast.error('Login required'); navigate('/login'); return; }
                  setIsAdding(true);
                  setTimeout(() => {
                    addToCart(product, currentVariant?.title || selectedSize, quantity);
                    setIsAdding(false);
                    toast.success('Successfully added to cart');
                  }, 500);
                }}
                disabled={displayStock === 0 || isAdding}
                className="flex-1 h-12 bg-primary text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-[#002855] transition-colors disabled:opacity-70 flex items-center justify-center shadow-sm"
              >
                {displayStock === 0 ? 'Out of Stock' : isAdding ? 'Adding...' : 'Add to Cart'}
              </button>
            </div>

            <button 
              disabled={displayStock === 0}
              onClick={() => {
                if (!user) { toast.error('Login required'); navigate('/login'); return; }
                addToCart(product, currentVariant?.title || selectedSize, quantity);
                navigate('/checkout');
              }}
              className="w-full h-12 bg-secondary text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-[#d03554] transition-colors disabled:opacity-70 flex items-center justify-center gap-2 shadow-sm mb-8"
            >
              Order Now <ChevronRight size={16} />
            </button>

            {/* Info Cards - Compact */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg border border-neutral-100">
                <Truck size={18} className="text-primary flex-shrink-0" />
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wide text-primary">Free Delivery</p>
                  <p className="text-[10px] text-neutral-500">Orders above ₹1999</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg border border-neutral-100">
                <RefreshCw size={18} className="text-primary flex-shrink-0" />
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wide text-primary">10 Day Returns</p>
                  <p className="text-[10px] text-neutral-500">Easy & hassle free</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <section className="mt-12 bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-neutral-100">
          <div className="flex items-center justify-between mb-6 pb-6 border-b border-neutral-100">
            <h2 className="text-xl font-bold text-primary flex items-center gap-2">
              <MessageCircle size={20} className="text-secondary" /> Customer Reviews
            </h2>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-neutral-900">{(averageRating || 0).toFixed(1)}</span>
              <div className="flex flex-col">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => <Star key={i} size={14} fill={i < Math.round(averageRating || 0) ? 'currentColor' : 'none'} />)}
                </div>
                <span className="text-xs text-neutral-500">{reviewCount} Reviews</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-5">
              <form onSubmit={handleReviewSubmit} className="bg-neutral-50 p-5 rounded-lg border border-neutral-100">
                <h3 className="text-sm font-bold text-primary mb-4">Write a Review</h3>
                <div className="mb-4 flex gap-1 text-amber-400">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button key={rating} type="button" onClick={() => setReviewForm(c => ({ ...c, rating }))} className="p-1 hover:scale-110 transition-transform">
                      <Star size={20} fill={rating <= reviewForm.rating ? 'currentColor' : 'none'} />
                    </button>
                  ))}
                </div>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <input name="userName" value={reviewForm.userName} onChange={handleReviewInputChange} placeholder="Name" className="w-full h-10 px-3 text-sm rounded border border-neutral-200 focus:border-primary outline-none" />
                    <input name="userPhone" type="tel" value={reviewForm.userPhone} onChange={handleReviewInputChange} placeholder="Phone" maxLength={10} className="w-full h-10 px-3 text-sm rounded border border-neutral-200 focus:border-primary outline-none" />
                  </div>
                  <textarea name="comment" value={reviewForm.comment} onChange={handleReviewInputChange} placeholder="Share your experience..." rows={3} className="w-full p-3 text-sm rounded border border-neutral-200 focus:border-primary outline-none resize-none" />
                  <button type="submit" disabled={isSubmittingReview} className="w-full h-10 bg-primary text-white rounded text-xs font-bold uppercase tracking-widest hover:bg-[#002855] transition-colors disabled:opacity-70 flex items-center justify-center gap-2">
                    {isSubmittingReview ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />} {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                </div>
              </form>
            </div>

            <div className="lg:col-span-7 space-y-4">
              {reviews.length > 0 ? (
                reviews.map(review => (
                  <div key={review.id} className="p-4 border border-neutral-100 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="flex text-amber-400">
                          {[...Array(5)].map((_, i) => <Star key={i} size={12} fill={i < Number(review.rating || 0) ? 'currentColor' : 'none'} />)}
                        </div>
                        <span className="text-sm font-bold text-primary">{review.userName || 'Anonymous'}</span>
                      </div>
                      <span className="text-xs text-neutral-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-neutral-600">{review.comment}</p>
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center py-10 text-center border border-dashed border-neutral-200 rounded-lg">
                  <MessageCircle size={32} className="text-neutral-300 mb-2" />
                  <p className="text-sm font-bold text-neutral-500">No reviews yet.</p>
                  <p className="text-xs text-neutral-400">Be the first to review this product!</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-16">
            <h2 className="text-xl font-bold text-primary mb-6">You Might Also Like</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map(p => <ProductCard key={p.handle} product={p} />)}
            </div>
          </section>
        )}
      </div>
    </main>
  );
};

export default ProductDetails;
