import React from "react";
import Chart from "react-apexcharts";

const transformDataForApex = (data) => {
  return data.map((dataset) => ({
    name: dataset.label,
    data: dataset.data.map((point) => ({
      x: point?.x?.toString(), // Convert x to string for categorical axis
      y: point.y,
      z: point.r*10, // Scale bubble size and ensure a minimum
    })),
  }));
};

const BubbleChart = ({ data = { datasets: [] }, xLabel, setYear = null }) => {
  const series = transformDataForApex(data.datasets);

  const options = {
    chart: {
      type: "bubble",
      height: 350,
      zoom:{
        enabled:true,
        allowMouseWheelZoom: true,
      },
      tools: {
        show:true,
        download: true,
        selection: true,
        zoom: true,
        zoomin: true,
        zoomout: true,
        pan: true,
        // reset: true | '<img src="/static/icons/reset.png" width="20">',
        customIcons: []
      },
      selection:{enabled:true},
      events: {
        dataPointSelection: (event, chartContext, config) => {
          if (setYear) {
            const selectedYear = config.w.config.series[config.seriesIndex].data[config.dataPointIndex].x;
            setYear(selectedYear);
          }
        },
      },
    },
    xaxis: {
      tickPlacement:"between",
      tickAmount:12,
      type: "category",
      title: {
        text: xLabel,
      },
      labels: {
        rotate: -45,
      },
    },
    yaxis: {
      title: {
        text: "Average Hours",
      },
      min:1,
    },
    
    tooltip: {
      enabled: true,
    },
    legend: {
      position: "top",
    },
    fill: {
      type: 'gradient',
    },
    toolbar:{
      show:true,
      tools: {        download: true,           selection: true,           zoom: true,           zoomin: true,           zoomout: true,           pan: true,           reset: true | '<img src="/static/icons/reset.png" width="20">',           customIcons: []         },
    }
  };

  return (
    <div className="w-full h-[400px]">
      <Chart options={options} series={series} type="bubble" height={400} />
    </div>
  );
};

export default BubbleChart;
