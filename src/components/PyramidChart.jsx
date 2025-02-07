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
    colors: [
      '#F44F5E',
      '#E55A89',
      '#D863B1',
      '#CA6CD8',
      '#B57BED',
      '#8D95EB',
      '#62ACEA',
      '#4BC3E6',
    ],
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
 
 