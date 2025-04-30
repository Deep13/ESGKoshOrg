import React from "react";
import Chart from "react-apexcharts";

const DoughnutChart = ({ data = { labels: [], datasets: [] } }) => {
  const series = data.datasets?.length > 0 ? data.datasets?.[0].data : [];
  const labels = data.labels || [];

  // console.log(data);
  const options = {
    chart: {
      type: "donut",
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: false,
          zoom: false,
          zoomin: false,
          zoomout: false,
          pan: false,
          reset: false,
        },
      },
    },
    labels: labels,
    legend: {
      position: "bottom",
      horizontalAlign: "center",
      fontSize: "10px",
      offsetY: 35,
    },
    responsive: [
      {
        breakpoint: 600,
        options: {
          chart: { width: "100%" },
          legend: { position: "bottom" },
        },
      },
    ],
    tooltip: {
      enabled: true,
      y: {
        formatter: (value) => value.toLocaleString(),
      },
    },

    plotOptions: {
      pie: {
        startAngle: 0,
        endAngle: 360,
        expandOnClick: true,
        offsetX: 0,
        offsetY: 30,
        customScale: 1,
        dataLabels: {
          offset: 35,
        },
      },
    },
    dataLabels: {
      enabled: true, // Ensure labels are visible
      style: {
        fontSize: "14px",
        fontWeight: "bold",
        colors: ["#000"], // Set text color to black
      },
      dropShadow: {
        enabled: false, // Remove shadows for better visibility
      },
    },
  };

  return (
    <div className="flex justify-center items-center flex-1">
      <Chart options={options} series={series} type="donut" height={300} width="100%" />
    </div>
  );
};

export default DoughnutChart;
