import { Bar,Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const SocialGraph = ({ data={labels:[],datasets:[]}, stacked = false, setYear=null }) => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display:true, position: "top" },
    },
    scales: {
      y: { 
        beginAtZero: true,
        stacked: stacked, 
      },
      x: { 
        grid: { display: false },
        stacked: stacked, 
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
    <div className="w-full h-[200px]">
      {/* <Bar data={data} options={options} /> */}
      <Bar data={data} options={options} />
    </div>
  );
};

export default SocialGraph;
