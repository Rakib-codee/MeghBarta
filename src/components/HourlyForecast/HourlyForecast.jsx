import React from 'react';
import { motion } from 'framer-motion';
import { formatTemp, formatTime } from '../../utils/formatters.js';
import TemperatureChart from '../TemperatureChart/TemperatureChart.jsx';

const HourlyForecast = ({ today, unit }) => {
  const isC = unit === 'C';

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const hourVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  if (!today?.hour) {
    return null;
  }

  // Get current hour and next 12 hours
  const currentHour = new Date().getHours();
  const hourlyData = today.hour.slice(currentHour, currentHour + 12);

  return (
    <div className="panel hourly-panel">
      <div className="panel-head">
        <motion.h2
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          Hourly Forecast
        </motion.h2>
        <motion.button 
          className="ghost"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Next 24h
        </motion.button>
      </div>

      {/* Temperature Chart */}
      <TemperatureChart 
        hourlyData={hourlyData} 
        unit={unit}
      />
      
      <motion.div 
        className="hourly"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {hourlyData.map((hour, index) => (
          <motion.div 
            className="hour" 
            key={hour.time_epoch}
            variants={hourVariants}
            whileHover={{ 
              scale: 1.05,
              backgroundColor: 'rgba(255, 255, 255, 0.1)'
            }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <span>{formatTime(new Date(hour.time))}</span>
            <motion.strong
              whileHover={{ scale: 1.1, color: 'var(--accent)' }}
            >
              {formatTemp(isC ? hour.temp_c : hour.temp_f)}
            </motion.strong>
            <span className="condition">{hour.condition.text}</span>
            {hour.chance_of_rain > 0 && (
              <motion.span 
                className="rain-chance"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 + index * 0.08 }}
              >
                {hour.chance_of_rain}%
              </motion.span>
            )}
            <div className="hour-details">
              <span className="wind-speed">💨 {isC ? hour.wind_kph : hour.wind_mph} {isC ? 'km/h' : 'mph'}</span>
              <span className="humidity">💧 {hour.humidity}%</span>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default HourlyForecast;