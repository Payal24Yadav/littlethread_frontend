import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Heart, Truck, Star } from 'lucide-react';

const About = () => {
  return (
    <div className="pt-6 pb-12 bg-white font-sans text-[#1d2432]">
      <div className="container mx-auto px-4 max-w-6xl">

        {/* Main Header Banner */}
        <div className="text-center mb-8 max-w-2xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight mb-2 text-primary"
          >
            Where Little Styles <br />
            <span className="text-[#f4989e] relative inline-block">
              Create Big Smiles
              <span className="absolute left-0 bottom-0.5 w-full h-1 bg-[#7fbba6]/20 -z-10 rounded"></span>
            </span>
          </motion.h1>
          <div className="w-16 h-0.5 bg-gradient-to-r from-[#f08375] via-[#a187b4] to-[#f9b254] mx-auto rounded-full mt-3"></div>
        </div>

        {/* Story Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="lg:col-span-5 h-72 lg:h-80 w-full rounded-2xl overflow-hidden shadow-sm border border-neutral-100"
          >
            <img
              src="https://images.unsplash.com/photo-1519689680058-324335c77eba?q=80&w=1000&auto=format&fit=crop"
              alt="Kids Clothing"
              className="w-full h-full object-cover"
            />
          </motion.div>

          <div className="lg:col-span-7 space-y-3 lg:pl-2">
            <div className="inline-block px-3 py-1 bg-[#a187b4]/10 text-[#a187b4] rounded-full text-[11px] font-bold uppercase tracking-wider">
              Our Journey
            </div>
            <h2 className="text-2xl font-bold tracking-tight">
              Our <span className="text-[#a187b4]">Story</span>
            </h2>
            <div className="space-y-3 text-neutral-600 text-xs md:text-sm leading-relaxed font-medium">
              <p>
                Welcome to Little Threads — your trusted online shopping destination for premium kids clothing, baby essentials, toys, footwear, accessories, and more.
              </p>
              <p>
                At Little Threads, we understand that parents want the perfect combination of comfort, quality, style, and affordability when shopping for their little ones. That’s why we carefully curate trendy and comfortable collections for newborns, infants, toddlers, and growing kids — all available conveniently through our online store.
              </p>
              <p>
                From everyday wear and festive outfits to educational toys, stylish accessories, and baby essentials, we bring together everything your child needs in one place. Our mission is to make online shopping for kids easy, reliable, and enjoyable for every parent.
              </p>
            </div>
          </div>
        </div>

        {/* Unique Feature Grid with Rainbow Colors Accent */}
        <div className="bg-[#fcfbfa] border border-neutral-100 rounded-2xl p-6 md:p-10 mb-12 shadow-sm">
          <div className="text-center mb-8">
            <h2 className="text-xl md:text-2xl font-bold tracking-tight">
              We Focus <span className="text-[#7fbba6]">On</span>
            </h2>
            <p className="text-neutral-500 text-xs mt-0.5">Delivering nothing but the best for your bundles of joy</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: <Heart size={18} />, title: 'High-quality and kid-friendly fabrics', color: '#f08375', bg: 'rgba(240, 131, 117, 0.05)', border: 'rgba(240, 131, 117, 0.15)' },
              { icon: <Star size={18} />, title: 'Trendy kids fashion for every season', color: '#a187b4', bg: 'rgba(161, 135, 180, 0.05)', border: 'rgba(161, 135, 180, 0.15)' },
              { icon: <ShieldCheck size={18} />, title: 'Affordable prices with exciting offers', color: '#7fbba6', bg: 'rgba(127, 187, 166, 0.05)', border: 'rgba(127, 187, 166, 0.15)' },
              { icon: <ShieldCheck size={18} />, title: 'Safe, durable, and comfortable products', color: '#f9b254', bg: 'rgba(249, 178, 84, 0.05)', border: 'rgba(249, 178, 84, 0.15)' },
              { icon: <Truck size={18} />, title: 'Fast and hassle-free online shopping', color: '#f4989e', bg: 'rgba(244, 152, 158, 0.05)', border: 'rgba(244, 152, 158, 0.15)' },
              { icon: <Star size={18} />, title: 'Stylish collections for boys, girls, and babies', color: '#7fbba6', bg: 'rgba(127, 187, 166, 0.05)', border: 'rgba(127, 187, 166, 0.15)' }
            ].map((feature, i) => (
              <div
                key={i}
                className="flex gap-3 items-center bg-white p-4 rounded-xl border transition-all duration-300 hover:shadow-sm"
                style={{ borderColor: feature.border }}
              >
                <div
                  className="p-2.5 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: feature.bg, color: feature.color }}
                >
                  {feature.icon}
                </div>
                <p className="font-semibold text-[#1d2432] text-xs leading-snug">{feature.title}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Goal Hero Block with Cloud Dark Navy Dynamic */}
        <section className="py-10 bg-[#1d2432] rounded-2xl p-6 md:p-10 text-center text-white overflow-hidden relative shadow-sm">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#f4989e] rounded-full blur-[80px]"></div>
          </div>

          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4 relative z-10 text-[#f4989e]">
            Our Goal
          </h2>
          <div className="space-y-4 relative z-10 max-w-3xl mx-auto text-xs md:text-sm font-normal text-neutral-300 leading-relaxed">
            <p>
              Whether you’re shopping for cute baby clothes, party wear frocks, kids footwear, toys, or everyday essentials, Little Threads offers a wide range of products designed to keep your little ones happy and comfortable.
            </p>
            <p>
              Our goal is to become a trusted brand for parents looking for fashionable, affordable, and quality kids products online. With new arrivals, exciting deals, and carefully selected collections, Little Threads is here to make every childhood moment extra special.
            </p>
            <div className="pt-2">
              <p className="text-sm md:text-base font-bold text-[#f4989e] tracking-wide">
                Shop online with confidence at Little Threads!
              </p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default About;