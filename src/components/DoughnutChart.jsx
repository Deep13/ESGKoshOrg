import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title,
} from "chart.js";

// Register the necessary Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, Title);

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: "bottom", // Move legend below the chart
      align: "center", // Align legend items in a single line
      labels: {
        boxWidth: 20, // Adjust box size for better spacing
        font: {
          size: 10, // Improve readability
        },
      },
    },
    title: {
      display: false,
      text: "Sales Distribution",
    },
  },
};

const DoughnutChart = ({ data={labels:[],datasets:[]}}) => {
  return (
    <div className="flex justify-center items-center w-[30rem] h-[15rem]">
      <Doughnut data={data} options={options}/>
    </div>
  );
};

export default DoughnutChart;
