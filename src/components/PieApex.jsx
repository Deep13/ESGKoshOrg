import React from "react";
import ReactApexChart from "react-apexcharts";
import paper from "../assets/paper.jpg";
import plastic from "../assets/plastic.jpg";
import construction from "../assets/construction.jpg";

const PieApex = ({data={series:[],labels:[]}}) => {
  const chartData = {
    series: data.series, // Using the correct prop
    options: {
      chart: {
        width: 380,
        type: "pie",
      },
      labels: data.labels, // Ensure labels are passed correctly
      colors: ["#93C3EE", "#E5C6A0", "#669DB5", "#94A74A"], // Ensure enough colors
      fill: {
        type: "image",
        opacity: 0.85,
        image: {
          src: [construction, plastic, paper], // Ensure images match series length
          width: 25,
          imagedHeight: 25,
        },
      },
      stroke: {
        width: 4,
      },
      dataLabels: {
        enabled: true,
        style: {
          colors: ["#111"],
        },
        background: {
          enabled: true,
          foreColor: "#fff",
          borderWidth: 0,
        },
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

  return <ReactApexChart options={chartData.options} series={chartData.series} type="pie" width={320} />;
};

export default PieApex;
