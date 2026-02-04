import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { formatTime } from '../../utils/formatters.js';

const TemperatureChart = ({ hourlyData, unit }) => {
  if (!hourlyData || hourlyData.length === 0) {
    return null;
  }

  // Prepare chart data from hourly forecast
  const chartData = hourlyData.slice(0, 12).map((hour) => ({
    time: formatTime(new Date(hour.time)),
    temp: unit === 'C' ? hour.temp_c : hour.temp_f,
    feelsLike: unit === 'C' ? hour.feelslike_c : hour.feelslike_f,
    humidity: hour.humidity,
    rawTime: hour.time
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <motion.div 
          className="chart-tooltip"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          <p className="chart-tooltip-label">{`Time: ${label}`}</p>
          <p className="chart-tooltip-temp">
            <span style={{ color: '#62f5d8' }}>
              Temperature: {Math.round(payload[0].value)}°{unit}
            </span>
          </p>
          {payload[1] && (
            <p className="chart-tooltip-feels">
              <span style={{ color: '#ffb86c' }}>
                Feels like: {Math.round(payload[1].value)}°{unit}
              </span>
            </p>
          )}
          {payload[2] && (
            <p className="chart-tooltip-humidity">
              <span style={{ color: '#ff7aa2' }}>
                Humidity: {payload[2].value}%
              </span>
            </p>
          )}
        </motion.div>
      );
    }
    return null;
  };

  return (
    <motion.div 
      className="temperature-chart"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.6 }}
    >
      <div className="chart-header">
        <h3>Temperature Trend</h3>
        <span className="chart-subtitle">Next 12 hours</span>
      </div>
      
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <XAxis 
              dataKey="time" 
              tick={{ fontSize: 12, fill: 'rgba(247, 248, 255, 0.7)' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: 'rgba(247, 248, 255, 0.7)' }}
              axisLine={false}
              tickLine={false}
              domain={['dataMin - 2', 'dataMax + 2']}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="temp" 
              stroke="#62f5d8" 
              strokeWidth={3}
              dot={{ r: 4, fill: '#62f5d8' }}
              activeDot={{ r: 6, fill: '#62f5d8', stroke: '#0a0f1f', strokeWidth: 2 }}
            />
            <Line 
              type="monotone" 
              dataKey="feelsLike" 
              stroke="#ffb86c" 
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              activeDot={{ r: 4, fill: '#ffb86c' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="chart-legend">
        <div className="legend-item">
          <div className="legend-line solid" style={{ backgroundColor: '#62f5d8' }}></div>
          <span>Temperature</span>
        </div>
        <div className="legend-item">
          <div className="legend-line dashed" style={{ backgroundColor: '#ffb86c' }}></div>
          <span>Feels like</span>
        </div>
      </div>
    </motion.div>
  );
};

export default TemperatureChart;