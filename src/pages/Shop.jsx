import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, ChevronDown, X, Loader2 } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { cachedGet } from '../utils/api';
import staticProducts from '../data/products.json';

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState(['All', 'Boys', 'Girls', 'Baby', 'Toys']);
  const [loading, setLoading] = useState(true);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState('featured');
  
  const categoryFilter = searchParams.get('category') || 'All';

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await cachedGet('/products?limit=100', { cacheTtl: 60_000 });
        // If API returns data, use it; otherwise fallback to static
        if (response.data?.data && response.data.data.length > 0) {
          setProducts(response.data.data);
        } else {
          setProducts(staticProducts);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        setProducts(staticProducts);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await cachedGet('/categories', { cacheTtl: 5 * 60_000 });
        const catData = response.data?.data || response.data || [];
        const names = catData.map((cat) => cat.name).filter(Boolean);
        setCategoryOptions(['All', ...names]);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (categoryFilter !== 'All') {
      if (categoryFilter === 'New') {
        result = result.filter(p => p.newDrop);
      } else if (categoryFilter === 'Trending') {
        result = result.filter(p => p.trending);
      } else {
        result = result.filter((p) => {
          const categoryNames = Array.isArray(p.categories)
            ? p.categories.map((category) => category.name)
            : [];
          const productCategory = p.category || categoryNames[0] || '';
          return productCategory === categoryFilter || categoryNames.includes(categoryFilter);
        });
      }
    }

    if (sortBy === 'price-low') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => b.price - a.price);
    }

    return result;
  }, [categoryFilter, sortBy, products]);

  const FilterContent = () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-sm font-semibold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">Category</h3>
        <div className="flex flex-col gap-2">
          {categoryOptions.map((cat) => (
            <label key={cat} className="flex items-center gap-3 cursor-pointer group">
              <input 
                type="radio" 
                name="category"
                checked={categoryFilter === cat}
                onChange={() => setSearchParams({ category: cat })}
                className="w-4 h-4 text-primary bg-neutral-100 border-neutral-300 focus:ring-primary focus:ring-2"
              />
              <span className={`text-sm ${categoryFilter === cat ? 'text-primary font-medium' : 'text-neutral-600 group-hover:text-primary transition-colors'}`}>
                {cat}
              </span>
            </label>
          ))}
        </div>
      </div>

      <button 
        onClick={() => {
          setSearchParams({});
          setIsMobileFilterOpen(false);
        }}
        className="w-full py-2 text-sm text-neutral-500 font-medium hover:text-primary transition-colors border border-neutral-200 rounded-lg mt-4"
      >
        Clear All Filters
      </button>
    </div>
  );

  return (
    <div className="bg-neutral-50 min-h-screen pb-20">
      {/* Header Banner */}
      <div className="bg-white border-b border-neutral-200 py-6 md:py-8 mb-8">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-neutral-900">
                {categoryFilter === 'All' ? 'All Products' : `${categoryFilter} Collection`}
              </h1>
              <p className="text-sm text-neutral-500 mt-1">Showing {filteredProducts.length} items</p>
            </div>
            
            <div className="flex items-center gap-3 w-full md:w-auto">
              <button 
                onClick={() => setIsMobileFilterOpen(true)}
                className="lg:hidden flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-neutral-300 rounded-lg text-sm font-medium text-neutral-700"
              >
                <Filter size={16} /> Filters
              </button>
              
              <div className="relative flex-1 md:flex-none">
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full appearance-none bg-white border border-neutral-300 text-neutral-700 text-sm px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer pr-10"
                >
                  <option value="featured">Sort by: Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Sidebar Filters */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white p-6 rounded-xl border border-neutral-200 sticky top-24">
              <h2 className="text-lg font-bold text-neutral-900 mb-6">Filters</h2>
              <FilterContent />
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
                {Array.from({ length: 8 }).map((_, index) => (
                  <div key={index} className="animate-pulse bg-white">
                    <div className="aspect-[3/4] bg-neutral-200" />
                    <div className="h-4 bg-neutral-200 rounded mt-4 mx-auto w-2/3" />
                    <div className="h-4 bg-neutral-200 rounded mt-2 mx-auto w-1/3" />
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="bg-white p-12 rounded-xl border border-neutral-200 text-center">
                <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4 text-neutral-400">
                  <Filter size={24} />
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">No products found</h3>
                <p className="text-neutral-500 mb-6">Try adjusting your filters to find what you're looking for.</p>
                <button 
                  onClick={() => setSearchParams({})}
                  className="btn-primary inline-flex"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <motion.div 
                layout
                className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6"
              >
                <AnimatePresence mode='popLayout'>
                  {filteredProducts.map((product) => (
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

      {/* Mobile Filter Drawer */}
      <AnimatePresence>
        {isMobileFilterOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileFilterOpen(false)}
              className="fixed inset-0 bg-black/50 z-[60] lg:hidden"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed top-0 right-0 h-full w-[280px] bg-white z-[70] shadow-xl lg:hidden flex flex-col"
            >
              <div className="flex justify-between items-center p-4 border-b border-neutral-100">
                <h2 className="text-lg font-bold text-neutral-900">Filters</h2>
                <button onClick={() => setIsMobileFilterOpen(false)} className="p-2 text-neutral-500 hover:bg-neutral-100 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto flex-1">
                <FilterContent />
              </div>
              
              <div className="p-4 border-t border-neutral-100 bg-neutral-50">
                <button 
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="w-full btn-primary"
                >
                  Apply Filters
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Shop;
