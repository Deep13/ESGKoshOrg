import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,  // Import the Filler plugin
} from "chart.js";

// Register all components, including Filler
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler // Register the Filler plugin
);

const LineChart = ({ data, lines, xKey, yLabel, fillVal = false }) => {
  // Prepare datasets for Chart.js
  const datasets = lines.map((line) => ({
    label: line.label,
    data: data.map((item) => item[line.dataKey]),
    borderColor: line.color,
    backgroundColor: fillVal ? `${line.color}80` : 'transparent', // Use transparent if no fill
    tension: 0.4,
    fill: fillVal ? 'origin' : false, // Use 'origin' for area chart, false for line chart
  }));

  const chartData = {
    labels: data.map((item) => item[xKey]),
    datasets: datasets,
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
        position: "top",
      },
      title: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: {
          drawOnChartArea: false, // hide gridlines
        },
      },
      y: {
        grid: {
          drawOnChartArea: true, // show gridlines
          borderDash: [8, 4], // Dotted line style
        },
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: yLabel,
        },
      },
    },
  };

  return (
    <div className="p-4 rounded-2xl bg-white w-full h-[300px]">
      <Line data={chartData} options={chartOptions}/>
    </div>
  );
};

export default LineChart;
