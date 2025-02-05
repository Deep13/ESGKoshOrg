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
  plugins: {
    legend: {
      display: true,
      position: "bottom",
    },
    title: {
      display: false,
      text: "Sales Distribution",
    },
  },
};

const DoughnutChart = ({ data }) => {
  return (
    <div className="flex justify-center items-center">
      <div className="w-[12rem] h-[12rem]">
        <Doughnut data={data} options={options} />
      </div>
    </div>
  );
};

export default DoughnutChart;
