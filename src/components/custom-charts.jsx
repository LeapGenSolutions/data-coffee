import React from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export function LineChart({ data, height, options }) {
  return (
    <div style={{ height: height ? `${height}px` : '300px' }}>
      <Line data={data} options={options} />
    </div>
  );
}

export function BarChart({ data, height, options }) {
  return (
    <div style={{ height: height ? `${height}px` : '300px' }}>
      <Bar data={data} options={options} />
    </div>
  );
}