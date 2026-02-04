import React from 'react';
import { motion } from 'framer-motion';
import { formatTemp } from '../../utils/formatters.js';
import FeelsLikeGauge from '../FeelsLikeGauge/FeelsLikeGauge.jsx';

const WeatherHero = ({ 
  data, 
  unit, 
  displayTemp, 
  displayHigh, 
  displayLow, 
  feelTemp, 
  wind, 
  visibility 
}) => {
  const { current, location } = data;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  const ringVariants = {
    hidden: { scale: 0.8, rotate: -180, opacity: 0 },
    visible: { 
      scale: 1, 
      rotate: 0, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        delay: 0.3
      }
    }
  };

  return (
    <motion.section 
      className="hero"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="hero-card">
        <motion.div className="hero-left" variants={itemVariants}>
          <motion.p 
            className="eyebrow"
            variants={itemVariants}
          >
            Right now
          </motion.p>
          <motion.h1 
            className="temp"
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
          >
            {formatTemp(displayTemp)}
          </motion.h1>
          <motion.div className="meta" variants={itemVariants}>
            <span>{location.name}</span>
            <span className="divider">•</span>
            <span>{current.condition.text}</span>
          </motion.div>
          <motion.div className="highlow" variants={itemVariants}>
            <span>H {formatTemp(displayHigh)}</span>
            <span>L {formatTemp(displayLow)}</span>
          </motion.div>
        </motion.div>
        
        <motion.div className="hero-right" variants={itemVariants}>
          <motion.div 
            className="ring"
            variants={ringVariants}
          >
            <motion.div 
              className="sun"
              animate={{ 
                rotate: 360,
                scale: [1, 1.1, 1]
              }}
              transition={{
                rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }
              }}
            />
            <div className="orbit"></div>
          </motion.div>
          <motion.div className="stats" variants={itemVariants}>
            <motion.div 
              className="stat"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <p>Humidity</p>
              <strong>{current.humidity}%</strong>
            </motion.div>
            <motion.div 
              className="stat"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <p>Wind</p>
              <strong>{wind}</strong>
            </motion.div>
            <motion.div 
              className="stat"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <p>Visibility</p>
              <strong>{visibility}</strong>
            </motion.div>
          </motion.div>
        </motion.div>
        
        {/* New Feels Like Gauge */}
        <motion.div className="hero-gauge" variants={itemVariants}>
          <FeelsLikeGauge 
            actualTemp={displayTemp}
            feelsLikeTemp={feelTemp}
            unit={unit}
            weatherData={data}
          />
        </motion.div>
      </div>

      <motion.div 
        className="hero-strip"
        variants={itemVariants}
      >
        <motion.div 
          className="strip-card"
          whileHover={{ scale: 1.02, y: -2 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          <p>UV Index</p>
          <strong>{current.uv}</strong>
          <span className="tag">{current.uv <= 5 ? "Moderate" : "High"}</span>
        </motion.div>
        <motion.div 
          className="strip-card"
          whileHover={{ scale: 1.02, y: -2 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          <p>Pressure</p>
          <strong>{current.pressure_mb} hPa</strong>
          <span className="tag">Stable</span>
        </motion.div>
        <motion.div 
          className="strip-card"
          whileHover={{ scale: 1.02, y: -2 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          <p>Dew Point</p>
          <strong>{unit === 'C' ? Math.round(current.dewpoint_c) : Math.round(current.dewpoint_f)}°</strong>
          <span className="tag">Normal</span>
        </motion.div>
      </motion.div>
    </motion.section>
  );
};

export default WeatherHero;