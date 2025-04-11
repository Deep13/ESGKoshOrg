import { useRef } from "react";
import Chart from "react-apexcharts";

const TrainingEduChart = ({
  trainingData = {},
  chartId = "TrainingChart",
  continueDownload = () => {},
}) => {
  const hasRunRef = useRef(false); // 🧠 Track if the function already ran

  const allTrainingTypes = Array.from(
    new Set(
      Object.values(trainingData)
        .flatMap((category) => Object.entries(category))
        .filter(([_, v]) => v > 0)
        .map(([trainingType]) => trainingType)
    )
  );

  const series = allTrainingTypes.map((training) => ({
    name: training,
    data: Object.keys(trainingData).map(
      (category) => trainingData[category]?.[training] || 0
    ),
  }));

  const handleAnimationEnd = () => {
    if (!hasRunRef.current) {
      hasRunRef.current = true; // ✅ mark as run
      continueDownload();        // ✅ run once only
    }
  };
console.log(series)
  const options = {
    chart: {
      id: chartId,
      type: "bar",
      stacked: true,
      animations: { enabled: true },
      events: {
        animationEnd: handleAnimationEnd, // ✅ controlled trigger
      },
    },
    colors: [
      "#109ad8", "#45bf34", "#f26c35", "#4bc0c0",
      "#9966ff", "#ff9f40", "#fc8a6d", "#304dff",
      "#bbdbeb", "#e4acc4", "#ffd0a6", "#9cc079"
    ],
    plotOptions: {
      bar: {
        horizontal: true,
      },
    },
    xaxis: {
      labels: { show: false },
      categories: Object.keys(trainingData),
    },
    yaxis: {
      categories: allTrainingTypes,
      title: { text: "" },
    },
    legend: {
      position: "top",
    },
  };

  return <Chart options={options} series={series} type="bar" height={500} />;
};

export default TrainingEduChart;
