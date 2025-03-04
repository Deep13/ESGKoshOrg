import React from "react";
import Chart from "react-apexcharts";

const BarStacked = ({ data = [] }) => {
  // Extract unique years (x-axis)
  const categories = [...new Set(data?.flatMap(item => item.data?.map(point => point.x)))];

  // Convert backend data into ApexCharts format
  const series = data?.map(item => ({
    name: item.label,
    data: categories.map(year => {
      const point = item?.data?.find(p => p.x === year);
      return point ? point.y : 0; // Fill missing years with 0
    }),
  }));

  const options = {
    chart: {
      type: "bar",
      stacked: true,
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        borderRadius: 4,
        dataLabels: { position: "top" },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val) => (val > 0 ? val : ""), // Show labels only if > 0
    },
    xaxis: {
      categories: categories,
      title: { text: "Year" },
    },
    yaxis: {
      title: { text: "Number of Incidents" },
    },
    legend: {
      position: "bottom",
    },
    fill: {
      opacity: 1,
    },
  };

  return (
    <div className="w-full h-[400px]">
      <Chart options={options} series={series} type="bar" height={400} />
    </div>
  );
};

export default BarStacked;
