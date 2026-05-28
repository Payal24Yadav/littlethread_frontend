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
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#faf9f6]">
        <Loader2 className="animate-spin text-primary" size={48} />
        <p className="font-black uppercase tracking-widest text-xs animate-pulse text-neutral-500">
          Loading Collection...
        </p>
      </div>
    );
  }

  if (error || !collection) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-[#faf9f6] px-4 text-center">
        <h2 className="text-3xl font-black uppercase tracking-tight text-neutral-800">
          Collection not found
        </h2>
        <p className="text-neutral-500 max-w-md">
          {error ||
            "The collection you're looking for doesn't exist or has been removed."}
        </p>
        <Link
          to="/"
          className="px-8 py-3 bg-black text-white rounded-full text-xs font-black uppercase tracking-widest hover:bg-neutral-800 transition-colors shadow-lg"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  const products = collection.products || [];

  return (
    <div className="min-h-screen bg-neutral-50 pb-16">
      {/* Collection Header */}
      <section className="border-b border-neutral-100 bg-white">
        {/* max-w-7xl aur mx-auto lagane se content screen ke corners se chipkega nahi */}
        <div className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-neutral-500 transition-colors hover:text-primary"
          >
            <ArrowLeft size={15} /> Back to Home
          </Link>

          {/* Grid spacing aur layout ko balance kiya hai */}
          <div className="mt-8 grid items-start gap-12 lg:grid-cols-2">
            <div className="max-w-2xl pr-0 lg:pr-4">
              <p className="text-[11px] font-black uppercase tracking-[0.35em] text-secondary">
                Collection
              </p>
              <h1 className="mt-4 text-4xl font-black uppercase tracking-tight text-neutral-950 sm:text-5xl lg:text-6xl leading-tight">
                {collection.name}
              </h1>
              <p className="mt-5 text-base leading-7 text-neutral-600">
                {collection.description ||
                  "Explore a curated edit of kids styles, accessories, and essentials selected for everyday comfort and special moments."}
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <div className="inline-flex h-11 items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-4 text-xs font-black uppercase tracking-[0.16em] text-neutral-700">
                  <Grid size={15} /> {products.length}{" "}
                  {products.length === 1 ? "Item" : "Items"}
                </div>
                <Link
                  to="/shop"
                  className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-xs font-black uppercase tracking-[0.16em] text-white transition hover:bg-neutral-950"
                >
                  <ShoppingBag size={15} /> Shop All
                </Link>
              </div>
            </div>

            {collection.imageUrl ? (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
                // Container ko grid me safely adjust karne aur balance banane ke liye changes:
                className="overflow-hidden rounded-2xl border border-neutral-100 bg-neutral-50 shadow-sm w-full max-w-xl lg:max-w-2xl lg:ml-auto"
              >
                {/* Is wrapper ko flexibility ke liye change kiya hai */}
                <div className="w-full h-full flex items-center justify-center">
                  <img
                    src={collection.imageUrl}
                    alt={collection.name}
                    // CLASS CHANGES YAHAN HAIN:
                    // 'w-auto' aur 'h-auto' ke saath 'max-h' lagane se image text ke length se badi nahi hogi.
                    // 'object-contain' isse cut hone se rokega.
                    className="w-auto h-auto max-w-full max-h-[85vh] lg:max-h-[600px] object-contain rounded-2xl p-2"
                    // 85vh sets a base max-height on smaller screens.
                    // 600px limits it on larger desktop screens.
                  />
                </div>
              </motion.div>
            ) : null}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-3 border-b border-neutral-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.28em] text-neutral-400">
              Products
            </p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-neutral-950">
              Available in this collection
            </h2>
          </div>
          <p className="text-sm font-semibold text-neutral-500">
            Showing {products.length}{" "}
            {products.length === 1 ? "product" : "products"}
          </p>
        </div>

        {products.length === 0 ? (
          <div className="mx-auto max-w-xl rounded-2xl border border-neutral-200 bg-white px-6 py-12 text-center shadow-sm">
            <h3 className="text-xl font-black text-neutral-900">
              No products in this collection yet
            </h3>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-neutral-500">
              Stay tuned. New arrivals will appear here as soon as they are
              added.
            </p>
            <Link
              to="/shop"
              className="mt-6 inline-flex h-11 items-center rounded-full bg-primary px-6 text-xs font-black uppercase tracking-widest text-white transition hover:bg-neutral-950"
            >
              Explore All Products
            </Link>
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 xl:grid-cols-4"
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
      </section>
    </div>
  );
};

export default CollectionDetails;
