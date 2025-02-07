import Chart from "react-apexcharts";

const TrainingEduChart = ({ trainingData={} }) => {

const allTrainingTypes = Array.from(
    new Set(
      Object.values(trainingData)
        .flatMap((category) => Object.entries(category))
        .filter(([_, v]) => v > 0) // Remove zero values
        .map(([trainingType]) => trainingType)
    )
  );

  // Prepare series data for ApexCharts
  const series = allTrainingTypes.map((training) => ({
    name: training, // Each bar represents a training type
    data: Object.keys(trainingData).map(
      (category) => trainingData[category]?.[training] || 0
    ), // Get values for each category
  }));


  const options = {
    chart: {
      type: "bar",
      stacked: true,
    },
    plotOptions: {
      bar: {
        horizontal: true, // Horizontal bar chart
      },
    },
    xaxis: {
      labels: {
         show: false, // Hide X-axis labels
        },
      categories:Object.keys(trainingData), // Training types on Y-axis
    },
    yaxis: {
    categories:allTrainingTypes,
      title: {
        text: "",
      },
    },
    legend: {
      position: "top",
    },
  };

  return <Chart options={options} series={series} type="bar" height={500} />;
};

export default TrainingEduChart;