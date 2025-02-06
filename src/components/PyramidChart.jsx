import React from "react";
import ReactApexChart from "react-apexcharts";

const PyramidChart = ({ data=[], categories=[] }) => {
  const reversedData = [...data].reverse();
  const reversedCategories = [...categories].reverse();

  const chartOptions = {
    chart: {
      type: "bar",
      height: 200,
      dropShadow: { enabled: true },
    },
    plotOptions: {
      bar: {
        borderRadius: 0,
        horizontal: true,
        distributed: true,
        barHeight: "80%",
        isFunnel: true, // Enables pyramid shape
      },
    },
    colors: [
      "#4BC3E6",
      "#62ACEA",
      "#8D95EB",
      "#B57BED",
      "#CA6CD8",
      "#D863B1",
      "#E55A89",
      "#F44F5E",
    ],
    dataLabels: {
      enabled: true,
      // formatter: function (val, opt) {
      //   return opt.w.globals.labels[opt.dataPointIndex];
      // },
      dropShadow: { enabled: true },
      chart: {
        toolbar: {
          show: false
        }
      },
    },
    xaxis: {
      categories: reversedCategories,
    },
    legend: { show: false },
  };

  return (
    <div>
      <ReactApexChart
        options={chartOptions}
        series={[{ name: "", data: reversedData }]}
        type="bar"
        height={200}
      />
    </div>
  );
};

export default PyramidChart;
