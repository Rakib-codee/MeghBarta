import React from 'react';
import { motion } from 'framer-motion';
import { formatTemp } from '../../utils/formatters.js';

const DailyForecast = ({ forecast, unit }) => {
  const isC = unit === 'C';

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const dayVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: { x: 0, opacity: 1 }
  };

  if (!forecast || forecast.length === 0) {
    return null;
  }

  return (
    <div className="panel">
      <div className="panel-head">
        <motion.h2
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          3‑Day Outlook
        </motion.h2>
        <motion.button 
          className="ghost"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Details
        </motion.button>
      </div>
      
      <motion.div 
        className="daily"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {forecast.map((day, index) => {
          const dayName = new Date(day.date).toLocaleDateString(undefined, { 
            weekday: "short" 
          });
          const isToday = index === 0;
          
          return (
            <motion.div 
              className="day" 
              key={day.date_epoch}
              variants={dayVariants}
              whileHover={{ 
                scale: 1.02,
                backgroundColor: 'rgba(255, 255, 255, 0.08)'
              }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <motion.strong
                whileHover={{ color: 'var(--accent)' }}
              >
                {isToday ? 'Today' : dayName}
              </motion.strong>
              <span className="condition">{day.day.condition.text}</span>
              <motion.span
                className="temp-range"
                whileHover={{ scale: 1.05 }}
              >
                {formatTemp(isC ? day.day.maxtemp_c : day.day.maxtemp_f)} / {formatTemp(
                  isC ? day.day.mintemp_c : day.day.mintemp_f
                )}
              </motion.span>
              {day.day.daily_chance_of_rain > 0 && (
                <motion.span 
                  className="rain-chance"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  🌧 {day.day.daily_chance_of_rain}%
                </motion.span>
              )}
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
};

export default DailyForecast;