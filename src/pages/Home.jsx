import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import HeroSection from '../components/HeroSection';
import ProductCard from '../components/ProductCard';
import { ArrowRight, Star, Truck, ShieldCheck, Clock, Ticket } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cachedGet } from '../utils/api';
import toast from 'react-hot-toast';

const Home = () => {
  const [collections, setCollections] = useState([]);
  const [collectionsLoading, setCollectionsLoading] = useState(false);
  const [bestSellers, setBestSellers] = useState([]);
  const [bestSellersLoading, setBestSellersLoading] = useState(false);
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);
  const [showCarouselDots, setShowCarouselDots] = useState(false);
  const [activeCoupons, setActiveCoupons] = useState([]);
  const [copiedCode, setCopiedCode] = useState('');
  const carouselRef = useRef(null);

  const staticCircularCategories = [
    { name: 'Accessories', image: 'https://img.magnific.com/premium-photo/baby-accessories-newborns_73944-7736.jpg?ga=GA1.1.966530005.1777894812&semt=ais_hybrid&w=740&q=80', path: '/shop?category=Accessories' },
    { name: 'Baby Care', image: 'https://img.magnific.com/premium-photo/organic-natural-baby-care-products-such-as-gentle-baby-lotions-natural-diaper-creams_1314467-85408.jpg?ga=GA1.1.966530005.1777894812&semt=ais_hybrid&w=740&q=80', path: '/shop?category=Baby%20Care' },
    { name: 'Baby Gear', image: 'https://img.magnific.com/premium-photo/transporting-newborns-safely-adorable-baby-infant-car-seat-blue-studio-background_1000124-155587.jpg?ga=GA1.1.966530005.1777894812&semt=ais_hybrid&w=740&q=80', path: '/shop?category=Baby%20Gear' },
    { name: 'Bedding', image: 'https://img.magnific.com/free-photo/interior-kids-room-decoration-with-toys_23-2149096072.jpg?ga=GA1.1.966530005.1777894812&semt=ais_hybrid&w=740&q=80', path: '/shop?category=Bedding' },
    { name: 'Sale', image: '/sale.gif', path: '/shop?category=Sale' },
    { name: 'Footwear', image: 'https://img.magnific.com/free-photo/baby-shoes_1203-7012.jpg?t=st=1777968425~exp=1777972025~hmac=bab025c2647b88e055ffd76c9b6a9ea54f6d36a2d0083d5cc9e12c893011fb98&w=1060', path: '/shop?category=Footwear' },
    { name: 'New Arrivals', image: 'new.gif', path: '/shop?category=New%20Arrivals' },
    { name: 'Newborn', image: 'https://img.magnific.com/premium-photo/smiling-newborn-baby-basket-photo-shoot-with-sleeping-pose_1207718-190174.jpg?ga=GA1.1.966530005.1777894812&semt=ais_hybrid&w=740&q=80', path: '/shop?category=Newborn' },
  ];

  const circularCategories = collectionsLoading
    ? Array.from({ length: 8 }, (_, index) => ({ placeholder: true, key: `skeleton-${index}` }))
    : collections.length > 0
      ? collections.slice(0, 8).map((collection) => ({
          name: collection.name,
          image: collection.imageUrl || collection.img,
          path: `/collection/${collection.id}`
        }))
      : staticCircularCategories;
  const shouldCenterCategories = circularCategories.length <= 6;

  const boysGirlsCollections = collections.filter(c => /boys|girls/i.test(c.name));
  const featuredCollections = boysGirlsCollections.length > 0 ? boysGirlsCollections : [
    {
      name: 'Boys Collection',
      imageUrl: 'https://img.magnific.com/free-photo/young-boys-brotherhood_23-2148445748.jpg?ga=GA1.1.966530005.1777894812&semt=ais_hybrid&w=740&q=80'
    },
    {
      name: 'Girls Collection',
      imageUrl: 'https://img.magnific.com/free-photo/young-emotional-woman-black-hat-is-dancing-white-background_231208-2052.jpg?t=st=1777970304~exp=1777973904~hmac=505e59e0aae6e9ccc06cfe9cd38df6bbfaa8db2aef30a9617b883128c80ba571&w=1060'
    }
  ];

  const scrollToCategory = (index) => {
    const carousel = carouselRef.current;
    if (!carousel) return;
    const card = carousel.children[index];
    if (card) {
      card.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
    }
  };

  const handleCategoryScroll = () => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const cards = Array.from(carousel.children);
    const scrollLeft = carousel.scrollLeft;
    let active = 0;

    cards.forEach((card, index) => {
      if (scrollLeft >= card.offsetLeft - 10) {
        active = index;
      }
    });

    setActiveCategoryIndex(active);
  };

  useEffect(() => {
    const updateCarouselDots = () => {
      const carousel = carouselRef.current;
      if (!carousel) return;
      setShowCarouselDots(carousel.scrollWidth > carousel.clientWidth + 4);
    };

    updateCarouselDots();
    window.addEventListener('resize', updateCarouselDots);
    return () => window.removeEventListener('resize', updateCarouselDots);
  }, [circularCategories.length]);

  const handleCopyCoupon = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Coupon code "${code}" copied!`);
    setTimeout(() => {
      setCopiedCode('');
    }, 2000);
  };

  useEffect(() => {
    const fetchCollections = async () => {
      setCollectionsLoading(true);
      try {
        const response = await cachedGet('/collections?limit=8', { cacheTtl: 2 * 60_000 });
        const collectionData = response.data?.data || response.data || [];
        setCollections(Array.isArray(collectionData) ? collectionData : []);
      } catch (error) {
        console.error('Error fetching collections:', error);
      } finally {
        setCollectionsLoading(false);
      }
    };

    const fetchBestSellers = async () => {
      setBestSellersLoading(true);
      try {
        const response = await cachedGet('/products/best-sellers', { cacheTtl: 60_000 });
        setBestSellers(response.data || []);
      } catch (error) {
        console.error('Error fetching best sellers:', error);
      } finally {
        setBestSellersLoading(false);
      }
    };

    const fetchActiveCoupons = async () => {
      try {
        const response = await cachedGet('/coupons/active', { cacheTtl: 5 * 60_000 });
        setActiveCoupons(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error('Error fetching active coupons:', error);
      }
    };

    fetchCollections();
    fetchBestSellers();
    fetchActiveCoupons();
  }, []);

  return (
    <div className="overflow-hidden bg-white">
      <HeroSection />

      {/* Circular Categories Carousel */}
      <section className="py-10 md:py-16 overflow-hidden">
        <div className="container mx-auto px-4">
          <div
            ref={carouselRef}
            onScroll={handleCategoryScroll}
            className={`grid grid-flow-col auto-cols-[minmax(6rem,1fr)] sm:auto-cols-[minmax(8rem,1fr)] items-start gap-6 overflow-x-auto pb-4 scroll-smooth snap-x snap-mandatory hide-scrollbar md:flex md:flex-nowrap md:gap-10 ${
              shouldCenterCategories ? 'md:justify-center' : 'md:justify-start'
            }`}
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {circularCategories.map((cat, i) => (
              cat.placeholder ? (
                <div
                  key={cat.key}
                  className="text-center w-24 md:w-32 snap-start justify-self-center md:flex-shrink-0"
                >
                  <div className="w-20 h-20 md:w-28 md:h-28 rounded-full bg-neutral-200 animate-pulse mb-3 mx-auto" />
                  <div className="h-3 w-16 md:w-20 rounded-full bg-neutral-200 animate-pulse mx-auto" />
                </div>
              ) : (
                <Link 
                  key={cat.name || i} 
                  to={cat.path} 
                  className="group text-center w-24 md:w-32 snap-start justify-self-center md:flex-shrink-0"
                >
                  <div className="w-20 h-20 md:w-28 md:h-28 rounded-full overflow-hidden bg-neutral-50 mb-3 mx-auto border-2 border-transparent group-hover:border-primary transition-all p-1">
                    <img 
                      src={cat.image} 
                      alt={cat.name} 
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                  <span className="text-[11px] md:text-sm font-medium text-neutral-700 group-hover:text-primary transition-colors block">
                    {cat.name}
                  </span>
                </Link>
              )
            ))}
          </div>

          {showCarouselDots && (
            <div className="flex justify-center gap-2 mt-4">
              {circularCategories.map((cat, index) => (
                <button
                  key={cat.name || cat.key || index}
                  type="button"
                  onClick={() => scrollToCategory(index)}
                  className={`w-2.5 h-2.5 rounded-full transition ${activeCategoryIndex === index ? 'bg-primary' : 'bg-neutral-300'}`}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Brand Highlights */}
      <section className="py-10 bg-neutral-50 border-y border-neutral-100">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            <div className="flex flex-col items-center text-center">
              <Truck size={28} className="text-primary mb-3" strokeWidth={1.5} />
              <h4 className="font-bold text-xs md:text-sm uppercase tracking-wider">Free Shipping</h4>
              <p className="text-[10px] md:text-xs text-neutral-500 mt-1">On orders over ₹999</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <ShieldCheck size={28} className="text-primary mb-3" strokeWidth={1.5} />
              <h4 className="font-bold text-xs md:text-sm uppercase tracking-wider">100% Genuine</h4>
              <p className="text-[10px] md:text-xs text-neutral-500 mt-1">Trusted by parents</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <Clock size={28} className="text-primary mb-3" strokeWidth={1.5} />
              <h4 className="font-bold text-xs md:text-sm uppercase tracking-wider">15 Days Return</h4>
              <p className="text-[10px] md:text-xs text-neutral-500 mt-1">Easy exchange policy</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <Star size={28} className="text-primary mb-3" strokeWidth={1.5} />
              <h4 className="font-bold text-xs md:text-sm uppercase tracking-wider">Premium Quality</h4>
              <p className="text-[10px] md:text-xs text-neutral-500 mt-1">Made with love</p>
            </div>
          </div>
        </div>
      </section>

      {/* Best Sellers Section */}
      <section className="py-16 md:py-24 container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-primary tracking-[0.2em] uppercase">Best Sellers</h2>
          <div className="w-12 h-0.5 bg-secondary mx-auto mt-4"></div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10">
          {bestSellersLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-neutral-200 aspect-[4/5] rounded-xl mb-4"></div>
                <div className="h-4 bg-neutral-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-neutral-200 rounded w-1/2"></div>
              </div>
            ))
          ) : bestSellers.length > 0 ? (
            bestSellers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <div className="col-span-full text-center py-10 text-neutral-500">
              No best sellers found.
            </div>
          )}
        </div>
        
        <div className="mt-12 text-center">
          <Link to="/shop">
            <button className="px-10 py-3 border-2 border-primary text-primary font-bold uppercase tracking-widest hover:bg-primary hover:text-white transition-all text-sm">
              View All Products
            </button>
          </Link>
        </div>
      </section>

      {/* Featured Collections Grid */}
      <section className="pb-20 container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {featuredCollections.map((collection) => {
            const collectionPath = collection.id
              ? `/collection/${collection.id}`
              : `/shop?category=${encodeURIComponent(collection.name.replace(/ Collection$/i, ''))}`;

            return (
            <Link
              key={collection.name}
              to={collectionPath}
              className="relative aspect-[4/3] md:aspect-auto md:h-[500px] group overflow-hidden rounded-3xl shadow-xl block focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-4"
            >
              <img 
                src={collection.imageUrl || collection.img || 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1200&q=80'}
                alt={collection.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-all"></div>
              <div className="absolute bottom-10 left-10 text-white">
                <h3 className="text-3xl font-bold mb-4 text-white font-display">{collection.name.toUpperCase()}</h3>
                <span className="inline-block px-6 py-2 bg-white text-primary font-bold text-sm tracking-widest group-hover:bg-neutral-100 transition-colors uppercase">
                  Explore Now
                </span>
              </div>
            </Link>
            );
          })}
        </div>
      </section>

      {/* About Us Summary Section */}
      <section className="py-20 bg-neutral-50">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-6 text-primary">
            Little Styles, <span className="text-secondary">Big Smiles</span>
          </h2>
          <p className="text-neutral-600 text-lg mb-8 leading-relaxed font-medium">
            At Little Threads, we curate trendy and comfortable collections for newborns, infants, toddlers, and growing kids. Our mission is to make online shopping for kids easy, reliable, and enjoyable for every parent.
          </p>
          <Link to="/about">
            <button className="px-8 py-4 bg-primary text-white font-bold uppercase tracking-widest hover:bg-neutral-900 transition-all text-sm rounded-full">
              Read Our Story
            </button>
          </Link>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-20 bg-primary text-white">
        <div className="container mx-auto px-6 text-center max-w-2xl">
          <h2 className="text-3xl font-bold mb-4 font-display text-white">Join the Club</h2>
          <p className="text-white/80 mb-8 tracking-wide">Subscribe to receive updates, access to exclusive deals, and more.</p>
          <form className="flex flex-col sm:flex-row gap-3">
            <input 
              type="email" 
              placeholder="Enter your email" 
              className="flex-1 px-6 py-4 bg-white text-neutral-900 outline-none rounded-none"
            />
            <button className="px-8 py-4 bg-secondary hover:bg-red-700 transition-colors font-bold uppercase tracking-widest">
              Subscribe
            </button>
          </form>
        </div>
      </section>

      {/* WhatsApp Floating Button */}
      <a 
        href="https://wa.me/yournumber" 
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-2xl z-50 hover:scale-110 transition-transform"
      >
        <svg viewBox="0 0 24 24" width="30" height="30" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </a>
    </div>
  );
};

export default Home;
