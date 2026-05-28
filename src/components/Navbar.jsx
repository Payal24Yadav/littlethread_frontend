import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Heart, Menu, X, Search, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext.jsx';
import { cachedGet } from '../utils/api';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [announcementIndex, setAnnouncementIndex] = useState(0);
  const [categories, setCategories] = useState([]);
  const { cartCount, wishlist } = useCart();
  const { user } = useAuth();
  const location = useLocation();
  const navRef = useRef(null);

  const announcements = [
    "🚚 Ships across India | 🛍 Trusted by 1,00,000+ parents | 💯 15 Days Easy Exchange",
    "✨ Free Shipping above Rs 999",
    "🎂 500 Bonus Points on Baby's Birthday"
  ];

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 30);
    const interval = setInterval(() => {
      setAnnouncementIndex((prev) => (prev + 1) % announcements.length);
    }, 4000);
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(interval);
    };
  }, []);

  // Fetch categories from backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await cachedGet('/categories', { cacheTtl: 5 * 60_000 });
        const cats = res.data?.data || res.data || [];
        setCategories(cats);
      } catch (err) {
        console.error('Failed to fetch categories', err);
        // Fallback static links
        setCategories([
          { name: 'New Arrivals' }, { name: 'Newborn' }, { name: 'Boys' },
          { name: 'Girls' }, { name: 'Accessories' }, { name: 'Baby Care' },
          { name: 'Bedding' }, { name: 'Footwear' },
        ]);
      }
    };
    fetchCategories();
  }, []);

  // Build nav links: fixed + dynamic categories
  const fixedLinks = [
    { name: 'Home', path: '/' },
    { name: 'About Us', path: '/about' },
    ...(user ? [{ name: 'My Orders', path: '/my-orders' }] : []),
    { name: 'Track Order', path: '/track' },
  ];

  const categoryLinks = categories.map(cat => ({
    name: cat.name,
    path: `/shop?category=${encodeURIComponent(cat.name)}`,
  }));

  const allNavLinks = [...fixedLinks, ...categoryLinks];

  return (
    <>
      {/* Top Announcement Bar */}
      <div className="bg-primary text-white text-[10px] md:text-xs py-2 px-4 text-center font-medium tracking-wide">
        <AnimatePresence mode="wait">
          <motion.div
            key={announcementIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5 }}
          >
            {announcements[announcementIndex]}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Main Navbar */}
      <nav
        ref={navRef}
        className={`relative sticky top-0 left-0 w-full z-50 bg-white transition-all duration-300 ${
          isScrolled ? 'shadow-md py-1' : 'border-b border-neutral-100 py-3'
        }`}
      >
        <div className="container mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-between">

            {/* Mobile Toggle & Logo */}
            <div className="flex items-center gap-3 lg:gap-0">
              <button
                className="lg:hidden p-1 text-neutral-800 z-50 relative"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <Link to="/" className="flex items-center" onClick={() => setIsMobileMenuOpen(false)}>
                <img src="/logo.png" alt="Little Threads" className="h-16 w-auto" />
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center space-x-5 xl:space-x-7">
              {allNavLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`text-[13px] font-medium transition-colors hover:text-secondary ${
                    location.pathname + location.search === link.path ? 'text-secondary' : 'text-neutral-600'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Icons */}
            <div className="flex items-center space-x-1 md:space-x-4">
              <Link to={user ? '/profile' : '/login'} className="p-2 text-neutral-800 hover:text-primary transition-colors flex items-center gap-2">
                <User size={22} strokeWidth={1.5} />
                <span className="hidden md:inline text-xs font-semibold uppercase tracking-[0.15em]">{user ? user.name.split(' ')[0] : 'Login'}</span>
              </Link>
              <button className="p-2 text-neutral-800 hover:text-primary transition-colors hidden sm:block">
                <Search size={22} strokeWidth={1.5} />
              </button>
              <Link to="/wishlist" className="p-2 text-neutral-800 hover:text-primary transition-colors relative">
                <Heart size={22} strokeWidth={1.5} />
                {wishlist.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 bg-secondary text-white text-[9px] font-bold min-w-4 h-4 px-1 flex items-center justify-center rounded-full">
                    {wishlist.length > 99 ? '99+' : wishlist.length}
                  </span>
                )}
              </Link>
              <Link to="/cart" className="p-2 text-neutral-800 hover:text-primary transition-colors relative">
                <ShoppingBag size={22} strokeWidth={1.5} />
                {cartCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 bg-secondary text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile Menu — slides from left, starts BELOW the navbar */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/30 z-40 lg:hidden"
                onClick={() => setIsMobileMenuOpen(false)}
              />
              {/* Drawer — positioned to start right below nav */}
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 220 }}
                className="absolute left-0 top-full w-full z-50 lg:hidden bg-white overflow-y-auto shadow-2xl pt-6"
              >
                {/* Close button inside drawer */}
                <button
                  className="absolute top-4 right-4 p-2 text-neutral-500 hover:text-neutral-900"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <X size={20} />
                </button>

                <div className="px-6 pb-6">
                  <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-4">Menu</p>
                  <div className="flex flex-col space-y-1">
                    {allNavLinks.map((link) => (
                      <Link
                        key={link.name}
                        to={link.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`text-base font-semibold py-3 border-b border-neutral-100 transition-colors hover:text-primary ${
                          location.pathname + location.search === link.path ? 'text-primary' : 'text-neutral-800'
                        }`}
                      >
                        {link.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
};

export default Navbar;
