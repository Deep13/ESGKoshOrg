import React from "react";
import ReactApexChart from "react-apexcharts";

const PieApex = ({ data = { series: [], labels: [] } }) => {
  const chartData = {
    series: data.series, // Using the correct prop
    options: {
      chart: {
        width: 500,
        type: "pie",
      },
      labels: data.labels, // Ensure labels are passed correctly
      colors: [
        "#4ba9dd", "#ffae55", "#94A74A", "#E94E77", "#A239CA", "#FEC601", "#3D348B"
      ], // Added more distinct colors
      stroke: {
        width: 2,
        colors: ["#fff"], // White border for better visibility
      },
      dataLabels: {
        enabled: true,
        style: {
          colors: ["#111"], // Dark text for readability
        },
        background: {
          enabled: true,
          foreColor: "#fff",
          borderWidth: 0,
        },
      },
      legend: {
        position: "bottom",
      },
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: 200,
            },
            legend: {
              position: "bottom",
            },
          },
        },
      ],
    },
  };

  return <ReactApexChart options={chartData.options} series={chartData.series} type="pie" width={300} />;
};

export default PieApex;
