import React from "react";
import ReactApexChart from "react-apexcharts";

const PyramidChart = ({ data = [], categories = [] }) => {

  const chartOptions = {
    chart: {
      type: 'bar',
      height: 350,
      dropShadow: {
        enabled: true,
      },
    },
    plotOptions: {
      bar: {
        borderRadius: 0,
        horizontal: true,
        distributed: true,
        barHeight: '80%',
        isFunnel: true,
      },
    },
    colors: ["#109ad8", "#45bf34", "#f26c35", "#4bc0c0", "#9966ff", "#ff9f40", "#fc8a6d", "#304dff", "#bbdbeb", "#e4acc4", "#ffd0a6", "#9cc079"],
    dataLabels: {
      enabled: true,
      formatter: function (val, opt) {
        return opt.w.globals.labels[opt.dataPointIndex]
      },
      dropShadow: {
        enabled: true,
      },
    },
    xaxis: {
      categories: categories,
    },
    legend: {
      show: false,
    },
  };

  return (
    <div>
      <ReactApexChart
        options={chartOptions}
        series={[
          {
            name: "",
            data: data,
          },
        ]}
        type="bar"
        height={200}
      />
    </div>
  );
};

export default PyramidChart;

