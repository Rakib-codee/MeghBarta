import React from 'react';
import { motion } from 'framer-motion';

const LoadingSkeleton = () => {
  const shimmer = {
    hidden: { opacity: 0.6 },
    visible: { 
      opacity: 1,
      transition: {
        repeat: Infinity,
        repeatType: "reverse",
        duration: 1.2,
        ease: "easeInOut"
      }
    }
  };

  return (
    <motion.div 
      className="loading-skeleton"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Hero Skeleton */}
      <div className="skeleton-hero">
        <div className="skeleton-hero-left">
          <motion.div 
            className="skeleton skeleton-eyebrow"
            variants={shimmer}
            animate="visible"
          />
          <motion.div 
            className="skeleton skeleton-temp"
            variants={shimmer}
            animate="visible"
            style={{ animationDelay: '0.1s' }}
          />
          <motion.div 
            className="skeleton skeleton-meta"
            variants={shimmer}
            animate="visible"
            style={{ animationDelay: '0.2s' }}
          />
          <motion.div 
            className="skeleton skeleton-highlow"
            variants={shimmer}
            animate="visible"
            style={{ animationDelay: '0.3s' }}
          />
        </div>
        <div className="skeleton-hero-right">
          <motion.div 
            className="skeleton skeleton-ring"
            variants={shimmer}
            animate="visible"
            style={{ animationDelay: '0.4s' }}
          />
          <div className="skeleton-stats">
            {[1, 2, 3].map((i) => (
              <motion.div 
                key={i}
                className="skeleton skeleton-stat"
                variants={shimmer}
                animate="visible"
                style={{ animationDelay: `${0.5 + i * 0.1}s` }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Strip Cards Skeleton */}
      <div className="skeleton-strip">
        {[1, 2, 3].map((i) => (
          <motion.div 
            key={i}
            className="skeleton skeleton-strip-card"
            variants={shimmer}
            animate="visible"
            style={{ animationDelay: `${0.8 + i * 0.1}s` }}
          />
        ))}
      </div>

      {/* Panels Skeleton */}
      <div className="skeleton-panels">
        <div className="skeleton-panel">
          <motion.div 
            className="skeleton skeleton-panel-header"
            variants={shimmer}
            animate="visible"
            style={{ animationDelay: '1.1s' }}
          />
          <div className="skeleton-hourly">
            {[...Array(6)].map((_, i) => (
              <motion.div 
                key={i}
                className="skeleton skeleton-hour"
                variants={shimmer}
                animate="visible"
                style={{ animationDelay: `${1.2 + i * 0.05}s` }}
              />
            ))}
          </div>
        </div>

        <div className="skeleton-panel">
          <motion.div 
            className="skeleton skeleton-panel-header"
            variants={shimmer}
            animate="visible"
            style={{ animationDelay: '1.5s' }}
          />
          <div className="skeleton-daily">
            {[...Array(3)].map((_, i) => (
              <motion.div 
                key={i}
                className="skeleton skeleton-day"
                variants={shimmer}
                animate="visible"
                style={{ animationDelay: `${1.6 + i * 0.1}s` }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Sun Timeline Skeleton */}
      <motion.div 
        className="skeleton skeleton-timeline"
        variants={shimmer}
        animate="visible"
        style={{ animationDelay: '1.9s' }}
      />

      {/* Air Quality Skeleton */}
      <motion.div 
        className="skeleton skeleton-air"
        variants={shimmer}
        animate="visible"
        style={{ animationDelay: '2.0s' }}
      />
    </motion.div>
  );
};

export default LoadingSkeleton;