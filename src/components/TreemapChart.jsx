import React from "react";
import ReactApexChart from "react-apexcharts";

const TreemapChart = ({ data = [] }) => {
  // console.log("treeData", data);

  const chartData = {
    options: {
      legend: {
        show: true
      },
      chart: {
        height: 350,
        type: "treemap"
      },
      colors: ["#109ad8", "#45bf34", "#f26c35", "#4bc0c0", "#9966ff", "#ff9f40", "#fc8a6d", "#304dff", "#bbdbeb", "#e4acc4", "#ffd0a6", "#9cc079", "#1DE9B6", "#FFD600", "#00E5FF", "#FF4081", "#3D5AFE",
        "#8E24AA", "#AA00FF", "#76FF03", "#C51162", "#6200EA"],
      plotOptions: {
        treemap: {
          distributed: true,
          enableShades: true
        }
      },
      dataLabels: {
        enabled: true,
        formatter: function (text, opts) {
          return `${text} (${opts.value}%)`; // Show category + value in brackets
        },
        style: {
          fontSize: "14px",
          fontWeight: "bold",
          colors: ["#000"] // Set all text to black
        }
      },
      tooltip: {
        y: {
          formatter: function (val) {
            return `${val}%`; // Append % symbol on hover
          }
        }
      }
    }
  };

  return (
    <ReactApexChart options={chartData.options} series={[{ data }]} type="treemap" height={250} />
  );
};

export default TreemapChart;
