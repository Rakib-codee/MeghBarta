import React from 'react';
import { motion } from 'framer-motion';
import { getAQILabel } from '../../utils/formatters.js';

const AirQuality = ({ current }) => {
  const aqiIndex = current?.air_quality?.["us-epa-index"] ?? null;
  const aqiLabel = getAQILabel(aqiIndex);
  const aqiValue = aqiIndex ?? 0;
  const aqiRing = `conic-gradient(var(--accent) 0deg ${
    (aqiValue / 6) * 260
  }deg, rgba(255, 255, 255, 0.08) 0deg)`;

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        staggerChildren: 0.1,
        delay: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 }
  };

  return (
    <motion.section 
      className="panel air"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="panel-head">
        <motion.h2
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          Air Quality
        </motion.h2>
        <motion.button 
          className="ghost"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          View Map
        </motion.button>
      </div>
      
      <div className="air-grid">
        <motion.div 
          className="aqi"
          variants={itemVariants}
        >
          <motion.div 
            className="aqi-ring" 
            style={{ background: aqiRing }}
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.8, type: "spring", stiffness: 300 }}
            >
              {aqiValue || "—"}
            </motion.span>
            <motion.small
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              {aqiLabel}
            </motion.small>
          </motion.div>
        </motion.div>
        
        <motion.div 
          className="air-metrics"
          variants={containerVariants}
        >
          <motion.div 
            className="metric"
            variants={itemVariants}
            whileHover={{ scale: 1.05, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
          >
            <span>PM2.5</span>
            <strong>{current.air_quality?.pm2_5?.toFixed(1) ?? "—"}</strong>
          </motion.div>
          <motion.div 
            className="metric"
            variants={itemVariants}
            whileHover={{ scale: 1.05, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
          >
            <span>PM10</span>
            <strong>{current.air_quality?.pm10?.toFixed(1) ?? "—"}</strong>
          </motion.div>
          <motion.div 
            className="metric"
            variants={itemVariants}
            whileHover={{ scale: 1.05, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
          >
            <span>NO₂</span>
            <strong>{current.air_quality?.no2?.toFixed(1) ?? "—"}</strong>
          </motion.div>
          <motion.div 
            className="metric"
            variants={itemVariants}
            whileHover={{ scale: 1.05, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
          >
            <span>O₃</span>
            <strong>{current.air_quality?.o3?.toFixed(1) ?? "—"}</strong>
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default AirQuality;