import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const CategoryCard = ({ title, image, path, size = 'small' }) => {
  return (
    <Link to={path} className={`relative overflow-hidden rounded group ${size === 'large' ? 'h-[600px]' : 'h-[300px]'}`}>
      <motion.img 
        src={image} 
        alt={title}
        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
      
      <div className="absolute bottom-8 left-8">
        <h3 className="text-2xl font-medium text-white tracking-wide mb-2 group-hover:text-primary transition-colors">
          {title}
        </h3>
        <motion.div 
          className="w-8 h-[2px] bg-white group-hover:w-full group-hover:bg-primary transition-all duration-500"
          initial={{ width: "2rem" }}
          whileHover={{ width: "100%" }}
        />
      </div>
    </Link>
  );
};

export default CategoryCard;
