import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Loader2, Grid } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import api from '../utils/api';

const CollectionDetails = () => {
  const { id } = useParams();
  const [collection, setCollection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCollection = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await api.get(`/collections/${id}`);
        setCollection(data);
      } catch (err) {
        console.error('Error fetching collection details:', err);
        setError('Failed to load collection details. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchCollection();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#faf9f6]">
        <Loader2 className="animate-spin text-primary" size={48} />
        <p className="font-black uppercase tracking-widest text-xs animate-pulse text-neutral-500">Loading Collection...</p>
      </div>
    );
  }

  if (error || !collection) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-[#faf9f6] px-4 text-center">
        <h2 className="text-3xl font-black uppercase tracking-tight text-neutral-800">Collection not found</h2>
        <p className="text-neutral-500 max-w-md">{error || "The collection you're looking for doesn't exist or has been removed."}</p>
        <Link to="/" className="px-8 py-3 bg-black text-white rounded-full text-xs font-black uppercase tracking-widest hover:bg-neutral-800 transition-colors shadow-lg">
          Back to Home
        </Link>
      </div>
    );
  }

  const products = collection.products || [];

  return (
    <div className="bg-[#faf9f6] min-h-screen pb-20 pt-28">
      {/* Premium Hero Banner */}
      <div className="relative overflow-hidden mb-12 bg-white border-b border-neutral-100">
        <div className="container mx-auto px-4 lg:px-8 py-12 md:py-16 flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
          <div className="max-w-xl text-center md:text-left">
            <Link to="/" className="inline-flex items-center gap-2 text-xs font-bold text-neutral-400 hover:text-primary transition-colors uppercase tracking-widest mb-6">
              <ArrowLeft size={14} /> Back to Home
            </Link>
            <h1 className="text-4xl md:text-5xl font-black text-neutral-900 uppercase tracking-tight mb-4">
              {collection.name}
            </h1>
            {collection.description && (
              <p className="text-sm md:text-base text-neutral-600 leading-relaxed font-medium">
                {collection.description}
              </p>
            )}
            <div className="mt-6 flex items-center justify-center md:justify-start gap-2 text-neutral-400 text-xs font-black uppercase tracking-wider">
              <Grid size={14} /> {products.length} {products.length === 1 ? 'item' : 'items'} available
            </div>
          </div>
          
          {collection.imageUrl && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="w-full md:w-1/2 max-w-md aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border border-white"
            >
              <img 
                src={collection.imageUrl} 
                alt={collection.name} 
                className="w-full h-full object-cover"
              />
            </motion.div>
          )}
        </div>
        
        {/* Subtle decorative background element */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full filter blur-3xl -z-10 translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/5 rounded-full filter blur-3xl -z-10 -translate-x-1/3 translate-y-1/3"></div>
      </div>

      {/* Products Grid */}
      <div className="container mx-auto px-4 lg:px-8">
        {products.length === 0 ? (
          <div className="bg-white py-16 px-8 rounded-3xl border border-neutral-100 text-center shadow-sm max-w-lg mx-auto">
            <h3 className="text-xl font-bold text-neutral-800 mb-2">No products in this collection yet</h3>
            <p className="text-neutral-500 mb-6">Stay tuned! We are adding new arrivals to this collection very soon.</p>
            <Link to="/shop" className="px-6 py-3 border-2 border-primary text-primary font-bold text-xs uppercase tracking-widest hover:bg-primary hover:text-white transition-all rounded-full">
              Explore All Products
            </Link>
          </div>
        ) : (
          <motion.div 
            layout
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8"
          >
            <AnimatePresence mode="popLayout">
              {products.map((product) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default CollectionDetails;
