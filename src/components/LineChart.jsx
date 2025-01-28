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
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const LineChart = ({ data, lines, xKey, yLabel }) => {
  // Prepare datasets for Chart.js
  const datasets = lines.map((line) => ({
    label: line.label,
    data: data.map((item) => item[line.dataKey]),
    borderColor: line.color,
    backgroundColor: line.color,
    tension: 0.4,
    fill: false,
  }));

  const chartData = {
    labels: data.map((item) => item[xKey]),
    datasets: datasets,
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display:false,
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
                text:xKey
              },
            },
            y: {
              grid: {
                drawOnChartArea: true, // show gridlines
                borderDash: [8, 4], // Dotted line style
                text:yLabel,
                borderDashOffset: 0, // Adjust dash offset (if necessary)
              },
              beginAtZero: true,
              max: 100,
            },
          },
  };

  return (
    <div className="p-4 rounded-2xl bg-white">
      {/* <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">{title}</h2>
        {dropdownOptions && (
          <select className="border border-gray-300 rounded-md px-2 py-1">
            {dropdownOptions.map((option, index) => (
              <option key={index} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )}
      </div> */}
      <Line data={chartData} options={chartOptions} />
    </div>
  );
};

export default LineChart;
