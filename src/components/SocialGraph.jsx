import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const SocialGraph = ({ data, stacked = false }) => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false, position: "top" },
    },
    scales: {
      y: { 
        beginAtZero: true,
        stacked: stacked, // Apply stacked property based on the `stacked` prop
      },
      x: { 
        grid: { display: false },
        stacked: stacked, // Apply stacked property for x-axis as well
      },
    },
    elements: {
      bar: {
        borderRadius: 10, // Rounded corners for bars
      },
    },
  };

  return (
    <div className="w-full h-[200px]">
      <Bar data={data} options={options} />
    </div>
  );
};

export default SocialGraph;
