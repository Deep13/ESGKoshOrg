import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const BarChart = ({ data}) => {
    const chartOptions = {
        responsive: true,
        plugins: {
          legend: {
            position: "top",
            display:false,
            labels: {
                usePointStyle: true, // Makes the legend marker circular
                pointStyle: "circle", // Specifies the circular style
            },
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
                // color: "",
                borderDashOffset: 0, // Adjust dash offset (if necessary)
              },
              beginAtZero: true,
              max: 100,
            },
          },
          elements: {
            bar: {
              borderRadius: 10, // Rounded corners for bars
            },
          },
      };
    
  return(
    <div className="w-full">
        {/* <div>{title}</div> */}
        <Bar data={data} options={chartOptions} />
    </div>
  ) 
};

export default BarChart;
