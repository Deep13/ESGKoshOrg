import { Bubble } from "react-chartjs-2";
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  Title, 
  Tooltip, 
  Legend 
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, Title, Tooltip, Legend);

const BubbleChart = ({ data, setYear }) => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false, position: "top" },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Average Hours',
        },
      },
      x: {
        type: 'category', // Ensure that x-axis is treated as categorical
        offset:0.5,
        labels: Array.from(new Set(data.datasets.flatMap(dataset => dataset.data.map(item => item.x)))), // Dynamically fetch the years
        beginAtZero:false,
        title: {
          display: true,
          text: 'Years',
        },
        ticks: {
          autoSkip: false, // Disable auto skip to ensure all years are displayed
        },
      },
    },
    onClick: (event, elements) => {
      if (elements.length > 0) {
        const clickedIndex = elements[0].index; // Get index of clicked point
        console.log(data.datasets[clickedIndex].data[0].x)
        const selectedYear = data.datasets[clickedIndex].data[0].x; // Get x-axis value (year) based on index
        setYear(selectedYear); // Update state with selected year
      }
    },
  };

  return (
    <div className="w-full h-[300px]">
      <Bubble data={data} options={options} />
    </div>
  );
};

export default BubbleChart;
