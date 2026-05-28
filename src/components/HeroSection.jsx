import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const slides = [
  {
    id: 1,
    title: "FIRST FASHION",
    subtitle: "FOR LITTLE MOMENTS",
    bg: "bg-[#F7F3F0]",
    image: "https://img.magnific.com/premium-photo/summer-girl-casual-outfit-flat-lay_136595-23903.jpg?w=1480",
    btnColor: "bg-[#D4814A] hover:bg-[#C27039]"
  },
  {
    id: 2,
    title: "PREMIUM COTTON",
    subtitle: "SOFT & BREATHABLE",
    bg: "bg-[#EBF1F7]",
    image: "https://img.magnific.com/free-photo/set-children-s-stylish-handmade-knitted-clothes-with-various-accessories-boho-style-top-view_169016-4085.jpg?ga=GA1.1.966530005.1777894812&semt=ais_hybrid&w=740&q=80",
    btnColor: "bg-[#D4814A] hover:bg-[#C27039]"
  },
  {
    id: 3,
    title: "BABY ESSENTIALS",
    subtitle: "MADE WITH LOVE",
    bg: "bg-[#FDF4E3]",
    image: "https://img.magnific.com/free-photo/pink-background-with-easter-eggs-yellow-watering-can_23-2147600731.jpg?t=st=1777965695~exp=1777969295~hmac=1efd45f0759a5543dd0d82b930354eb9336d9f5f01ca4ae95927b4fe2b9fb578&w=2000",
    btnColor: "bg-[#D4814A] hover:bg-[#C27039]"
  }
];

const HeroSection = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrent((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));

  return (
    <section className="relative w-full h-[360px] sm:h-[460px] md:h-[550px] lg:h-[650px] overflow-hidden group">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className={`absolute inset-0 w-full h-full ${slides[current].bg}`}
        >
          {/* Background Image */}
          <div
            className="absolute inset-0 w-full h-full bg-contain bg-top bg-no-repeat transition-transform duration-[2000ms] md:bg-cover md:bg-center md:scale-105"
            style={{ backgroundImage: `url(${slides[current].image})` }}
          />

          <div className="container mx-auto px-6 md:px-12 h-full flex items-center relative z-10">
            <div className="w-full md:w-3/5 lg:w-1/2">
              <motion.h2 
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="text-4xl md:text-7xl lg:text-8xl font-bold text-primary mb-2 leading-none tracking-tight font-display"
              >
                {slides[current].title}
              </motion.h2>
              <motion.p 
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="text-lg md:text-2xl text-neutral-600 mb-8 font-light tracking-widest uppercase"
              >
                {slides[current].subtitle}
              </motion.p>
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.6 }}
              >
                <Link to="/shop">
                  <button className={`px-10 py-4 text-white text-lg font-bold rounded shadow-lg transition-all hover:translate-y-[-2px] active:translate-y-[1px] ${slides[current].btnColor}`}>
                    SHOP NOW
                  </button>
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      <button 
        onClick={prevSlide}
        className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/50 hover:bg-white rounded-full flex items-center justify-center text-primary shadow-sm opacity-0 group-hover:opacity-100 transition-all z-20"
      >
        <ChevronLeft size={32} strokeWidth={1.5} />
      </button>
      <button 
        onClick={nextSlide}
        className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/50 hover:bg-white rounded-full flex items-center justify-center text-primary shadow-sm opacity-0 group-hover:opacity-100 transition-all z-20"
      >
        <ChevronRight size={32} strokeWidth={1.5} />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-3 z-20">
        {slides.map((_, index) => (
          <button 
            key={index} 
            onClick={() => setCurrent(index)}
            className={`w-2.5 h-2.5 rounded-full border border-primary transition-all ${current === index ? 'bg-primary' : 'bg-transparent'}`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSection;
