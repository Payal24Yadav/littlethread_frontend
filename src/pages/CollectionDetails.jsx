import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Loader2, Grid, ShoppingBag } from "lucide-react";
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
        <p className="font-bold uppercase tracking-widest text-xs animate-pulse text-neutral-500">
          Loading Collection...
        </p>
      </div>
    );
  }

  if (error || !collection) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-neutral-50 px-4 text-center font-sans">
        <h2 className="text-2xl font-bold tracking-tight text-primary">
          Collection Not Found
        </h2>
        <p className="text-sm text-neutral-500 max-w-md">
          {error ||
            "The collection you're looking for doesn't exist or has been removed."}
        </p>
        <Link
          to="/"
          className="px-6 py-2.5 bg-primary text-white rounded-lg text-xs font-bold hover:bg-[#002855] transition-colors shadow-sm"
        >
          Return Home
        </Link>
      </div>
    );
  }

  const products = collection.products || [];

  return (
    <div className="bg-neutral-50 min-h-screen pt-8 pb-16 font-sans text-[#1d2432]">
      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* Breadcrumb Navigation */}
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-500 hover:text-primary transition-colors"
          >
            <ArrowLeft size={14} /> Back to Home
          </Link>
        </div>

        {/* Collection Hero Card */}
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            
            {/* Left Content */}
            <div className="p-8 lg:p-12 flex flex-col justify-center order-2 lg:order-1">
              <span className="inline-block px-3 py-1 bg-secondary/10 text-secondary text-[10px] font-bold uppercase tracking-widest rounded-md w-fit mb-4">
                Collection Spotlight
              </span>
              <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-primary mb-3">
                {collection.name}
              </h1>
              <p className="text-sm leading-relaxed text-neutral-600 max-w-md mb-8">
                {collection.description ||
                  "Explore a curated edit of kids styles, accessories, and essentials selected for everyday comfort and special moments."}
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <div className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-xs font-bold text-neutral-700">
                  <Grid size={15} className="text-primary"/> {products.length}{" "}
                  {products.length === 1 ? "Item" : "Items"}
                </div>
                <Link
                  to="/shop"
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-xs font-bold text-white transition hover:bg-[#002855] shadow-sm active:scale-[0.98]"
                >
                  <ShoppingBag size={15} /> Shop All
                </Link>
              </div>
            </div>

            {/* Right Image */}
            {collection.imageUrl && (
              <div className="h-64 sm:h-80 lg:h-full w-full bg-neutral-100 order-1 lg:order-2 border-b lg:border-b-0 lg:border-l border-neutral-200">
                <img
                  src={collection.imageUrl}
                  alt={collection.name}
                  className="h-full w-full object-cover"
                />
              </div>
            )}
          </div>
        </div>

        {/* Products Grid Section */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 border-b border-neutral-200 pb-3">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-primary flex items-center gap-2">
                <Grid size={20} /> Available Products
              </h2>
            </div>
            <p className="text-xs font-semibold text-neutral-500 mt-2 sm:mt-0">
              Showing {products.length}{" "}
              {products.length === 1 ? "product" : "products"}
            </p>
          </div>

          {products.length === 0 ? (
            <div className="rounded-xl border border-neutral-200 bg-white p-10 text-center shadow-sm max-w-2xl mx-auto mt-8">
              <ShoppingBag size={40} className="mx-auto text-neutral-300 mb-4" />
              <h3 className="text-lg font-bold text-neutral-900 mb-2">
                No products in this collection yet
              </h3>
              <p className="text-sm text-neutral-500 max-w-md mx-auto mb-6">
                Stay tuned. New arrivals will appear here as soon as they are added to this collection.
              </p>
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-xs font-bold text-white transition hover:bg-[#002855] shadow-sm active:scale-[0.98]"
              >
                Explore All Products
              </Link>
            </div>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4"
            >
              <AnimatePresence mode="popLayout">
                {products.map((product) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
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
    </div>
  );
};

export default CollectionDetails;
