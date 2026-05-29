import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Loader2, ArrowRight, Disc } from "lucide-react";
import ProductCard from "../components/ProductCard";
import api from "../utils/api";

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
        console.error("Error fetching collection details:", err);
        setError("Failed to load collection details. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchCollection();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-neutral-50 font-sans">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  if (error || !collection) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-neutral-50 px-4 text-center font-sans">
        <h2 className="text-2xl font-bold tracking-tight text-neutral-900">
          Collection Not Found
        </h2>
        <Link
          to="/"
          className="px-6 py-2.5 bg-primary text-white rounded font-bold hover:bg-[#002855] transition-colors"
        >
          Return Home
        </Link>
      </div>
    );
  }

  const products = collection.products || [];

  return (
    <div className="bg-neutral-50 min-h-screen font-sans text-neutral-900">

      {/* Top Banner - Compact Version */}
      <div className="bg-[#fcf8f5]">
        <div className="max-w-6xl mx-auto px-4 pt-4 pb-6">

          <div className="mb-4">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-neutral-500 hover:text-primary transition-colors"
            >
              <ArrowLeft size={14} /> Back
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">

            {/* Left Content */}
            <div className="flex flex-col justify-center lg:col-span-7 order-2 lg:order-1">
              <div className="flex items-center gap-2 text-secondary text-[11px] font-bold uppercase tracking-widest mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                Collection Spotlight
              </div>

              <h1 className="text-3xl sm:text-4xl font-bold text-primary tracking-tight leading-tight mb-3">
                {collection.name}
              </h1>

              <p className="text-sm text-neutral-600 leading-relaxed max-w-lg mb-6">
                {collection.description ||
                  "Explore a curated edit of styles, accessories, and essentials selected for everyday comfort and special moments."}
              </p>

              <div className="flex items-center gap-4">
                <Link
                  to="/shop"
                  className="inline-flex items-center gap-2 bg-primary px-6 py-2.5 text-xs font-bold text-white rounded-lg transition hover:bg-[#002855] active:scale-[0.98]"
                >
                  Shop Now <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            {/* Right Image Container - Simple, no shadows/cards */}
            {collection.imageUrl && (
              <div className="w-full lg:col-span-5 order-1 lg:order-2 flex justify-center lg:justify-end">
                <div className="w-full max-w-[250px] lg:max-w-[320px]">
                  <img
                    src={collection.imageUrl}
                    alt={collection.name}
                    className="w-full h-auto object-contain"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Featured Products Grid Section */}
      <div className="max-w-6xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 border-b border-neutral-200 pb-3">
          <h2 className="text-xl font-bold tracking-tight text-primary">
            Available Products
          </h2>
          <Link
            to="/shop"
            className="mt-2 sm:mt-0 text-xs font-bold text-primary hover:text-secondary transition-colors"
          >
            View All Products &rarr;
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-16 bg-white border border-neutral-200 rounded-xl">
            <h3 className="text-base font-bold text-neutral-900 mb-2">
              No products in this collection yet
            </h3>
            <p className="text-xs text-neutral-500 max-w-md mx-auto mb-6">
              Stay tuned. New arrivals will appear here as soon as they are added.
            </p>
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
          >
            <AnimatePresence mode="popLayout">
              {products.map((product) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
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
