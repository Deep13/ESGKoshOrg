import React from "react";
import Chart from "react-apexcharts";

const DoughnutChart = ({ data = { labels: [], datasets: [] } }) => {
  // Transform Chart.js data format to ApexCharts format
  const series = data.datasets?.length > 0 ? data.datasets?.[0].data : [];
  const labels = data.labels || [];

  const options = {
    chart: {
      type: "donut",
      toolbar: {
        show: true, // Enable the toolbar
        tools: {
          download: true, // Show download button
          selection: false,
          zoom: false,
          zoomin: false,
          zoomout: false,
          pan: false,
          reset: false,
        },
        export: {
          csv: {
            filename: "chart-data",
            columnDelimiter: ",",
            headerCategory: "Category",
            headerValue: "Value",
          },
          svg: {
            filename: "chart-svg",
          },
          png: {
            filename: "chart-png",
          },
        },
      },
    },
    labels: labels,
    legend: {
      position: "bottom",
      horizontalAlign: "center",
      fontSize: "10px",
      markers: {
        width: 12,
        height: 12,
      },
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
        formatter: (value) => value.toLocaleString(), // Format numbers
      },
    },
  };

  return (
    <div className="flex justify-center items-center w-[30rem] h-[15rem]">
      <Chart options={options} series={series} type="donut" height={250} />
    </div>
  );
};

export default DoughnutChart;
