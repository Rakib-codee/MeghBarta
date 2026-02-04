import React from 'react';
import { motion } from 'framer-motion';

const SunTimeline = ({ today, sunProgress }) => {
  const sunPercent = Math.round(sunProgress * 100);

  return (
    <motion.section 
      className="panel timeline"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <div className="panel-head">
        <motion.h2
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          Sunrise / Sunset
        </motion.h2>
        <motion.button 
          className="ghost"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Today
        </motion.button>
      </div>
      
      <motion.div 
        className="sun-track"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.7, type: "spring", stiffness: 100 }}
      >
        <div className="sunline"></div>
        <motion.div 
          className="sun-progress" 
          style={{ width: `${sunPercent}%` }}
          initial={{ width: 0 }}
          animate={{ width: `${sunPercent}%` }}
          transition={{ delay: 1, duration: 1.5, ease: "easeOut" }}
        />
        <motion.div 
          className="sun-dot" 
          style={{ left: `${sunPercent}%` }}
          initial={{ left: '0%', scale: 0 }}
          animate={{ 
            left: `${sunPercent}%`,
            scale: 1
          }}
          transition={{ 
            left: { delay: 1, duration: 1.5, ease: "easeOut" },
            scale: { delay: 2, type: "spring", stiffness: 300 }
          }}
          whileHover={{ scale: 1.2 }}
        />
        <motion.div 
          className="sun-labels"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <span>{today?.astro?.sunrise ?? "—"}</span>
          <span>{today?.astro?.sunset ?? "—"}</span>
        </motion.div>
      </motion.div>
    </motion.section>
  );
};

export default SunTimeline;