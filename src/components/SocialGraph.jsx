import { Bar, Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const SocialGraph = ({ data = { labels: [], datasets: [] }, stacked = false, setYear = null }) => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: "top" },
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

  const cleanedData = {
    ...data,
    datasets: data.datasets.map(dataset => ({
      ...dataset,
      data: dataset.data.map(value =>
        value === null || isNaN(value) ? 0 : value // Replace null/NaN with 0
      ),
    })),
  };

  // console.log("Original Data:", data);
  // console.log("Transformed Data:", cleanedData);

  return (
    <div className="w-full h-[200px]">
      {/* <Bar data={data} options={options} /> */}
      <Bar data={cleanedData} options={options} />
    </div>
  );
};

export default SocialGraph;
