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

const LineChart = ({ data={labels:[],datasets:[]}, lines, xKey, yLabel, fillVal = false,setYear }) => {
  // Prepare datasets for Chart.js
  // const datasets = lines.map((line) => ({
  //   label: line.label,
  //   data: data.map((item) => item[line.dataKey]),
  //   borderColor: line.color,
  //   backgroundColor: fillVal ? `${line.color}80` : 'transparent', // Use transparent if no fill
  //   tension: 0.4,
  //   fill: fillVal ? 'origin' : false, // Use 'origin' for area chart, false for line chart
  // }));

  // const chartData = {
  //   labels: data.map((item) => item[xKey]),
  //   datasets: datasets,
  // };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display:true, position: "top" },
    },
    scales: {
      y: { 
        beginAtZero: true,
        stacked: false, 
      },
      x: { 
        grid: { display: false },
        stacked: false, 
      },
    },
    elements: {
      bar: {
        borderRadius: 10, 
      },
    },
    onClick: (event, elements) => {
      if (elements.length > 0) {
        const index = elements[0].index; // Get clicked bar index
        const xValue = data.labels[index]; // Get x-axis value
        setYear(xValue); // Update year state
      }
    }
  };

  return (
    <div className="p-4 rounded-2xl bg-white w-full h-[300px]">
      <Line data={data} options={chartOptions}/>
    </div>
  );
};

export default LineChart;
