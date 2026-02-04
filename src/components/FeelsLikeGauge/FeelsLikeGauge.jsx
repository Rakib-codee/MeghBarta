import React from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { motion } from 'framer-motion';
import { formatTemp } from '../../utils/formatters.js';

const FeelsLikeGauge = ({ actualTemp, feelsLikeTemp, unit, weatherData }) => {
  const difference = feelsLikeTemp - actualTemp;
  const maxDifference = 20; // Maximum difference we'll show on the gauge
  
  // Calculate percentage for the gauge (0-100%)
  const percentage = Math.min(Math.abs(difference) / maxDifference * 100, 100);
  
  // Determine which calculation method was used
  const getCalculationMethod = () => {
    const current = weatherData?.current;
    if (!current) return 'Standard';
    
    const tempC = unit === 'C' ? actualTemp : (actualTemp - 32) * 5/9;
    const humidity = current.humidity;
    const windKph = current.wind_kph;
    
    if (tempC >= 27 && humidity >= 40) return 'Heat Index';
    if (tempC <= 10 && windKph > 4.8) return 'Wind Chill';
    if (humidity >= 60) return 'Humidex';
    return 'Adjusted';
  };
  
  // Determine color based on difference
  const getGaugeColor = () => {
    if (difference > 5) return '#ff7aa2'; // Much warmer - red
    if (difference > 2) return '#ffb86c'; // Warmer - orange
    if (difference < -5) return '#62f5d8'; // Much cooler - cyan
    if (difference < -2) return '#4facfe'; // Cooler - blue
    return '#50fa7b'; // Close to actual - green
  };

  const getStatusText = () => {
    if (Math.abs(difference) < 0.5) return 'Very Accurate';
    if (Math.abs(difference) < 1.5) return 'Accurate';
    if (difference > 5) return 'Much Hotter';
    if (difference > 2) return 'Hotter';
    if (difference < -5) return 'Much Cooler';
    if (difference < -2) return 'Cooler';
    return 'Close';
  };

  const gaugeColor = getGaugeColor();
  const statusText = getStatusText();
  const calculationMethod = getCalculationMethod();

  return (
    <motion.div 
      className="feels-like-gauge"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.3, duration: 0.6, type: "spring" }}
    >
      <div className="gauge-header">
        <h3>Feels Like</h3>
        <span className="gauge-subtitle">{calculationMethod} Method</span>
      </div>
      
      <div className="gauge-container">
        <motion.div
          initial={{ rotate: -90 }}
          animate={{ rotate: 0 }}
          transition={{ delay: 0.5, duration: 1, type: "spring" }}
        >
          <CircularProgressbar
            value={percentage}
            text={`${difference > 0 ? '+' : ''}${Math.round(difference)}°`}
            styles={buildStyles({
              pathColor: gaugeColor,
              textColor: gaugeColor,
              trailColor: 'rgba(255, 255, 255, 0.08)',
              textSize: '20px',
              pathTransitionDuration: 1,
            })}
          />
        </motion.div>
      </div>
      
      <motion.div 
        className="gauge-info"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        <div className="actual-temp">
          <span>Actual</span>
          <strong>{formatTemp(actualTemp)}</strong>
        </div>
        <div className="feels-temp">
          <span>Feels</span>
          <strong>{formatTemp(feelsLikeTemp)}</strong>
        </div>
      </motion.div>
      
      <motion.div 
        className="gauge-status"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.5 }}
      >
        <span 
          className="status-badge" 
          style={{ backgroundColor: gaugeColor }}
        >
          {statusText}
        </span>
      </motion.div>
    </motion.div>
  );
};

export default FeelsLikeGauge;