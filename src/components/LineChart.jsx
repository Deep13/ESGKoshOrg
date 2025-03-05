import React from "react";
import Chart from "react-apexcharts";

const LineChart = ({ data = { labels: [], datasets: [] }, setYear = null, fillVal = false }) => {
  // Ensure data exists
  if (!data || !data.datasets || data.datasets.length === 0) {
    return (
      <div className="h-48 mx-auto flex items-center justify-center">
        No Data available for analytics
      </div>
    );
  }

  // Convert Chart.js format to ApexCharts format
  const series = data.datasets.map(dataset => ({
    name: dataset.label || "Dataset",
    data: dataset.data.map(value => {
      // Convert empty strings or non-numeric values to null
      const numValue = parseFloat(value);
      return isNaN(numValue) ? null : numValue;
    }) // Ensure valid numbers
  }));

  const options = {
    chart: {
      type: fillVal ? "area" : "line",
      toolbar: { show: true },
      zoom: { enabled: false },
      selection: { enabled: false },
      animations: { enabled: true },
      events: {
        click: (event, chartContext, config) => {
          console.log("Chart Clicked", { event, config });
        },
        markerClick: (event, chartContext, { seriesIndex, dataPointIndex }) => {
          if (dataPointIndex !== undefined) {
            const selectedYear = data.labels[dataPointIndex];
            if (setYear) setYear(selectedYear);
          }
        },
        dataPointSelection: (event, chartContext, { seriesIndex, dataPointIndex }) => {
          if (dataPointIndex !== undefined) {
            const selectedYear = data.labels[dataPointIndex];
            if (setYear) setYear(selectedYear);
          }
        }
      }
    },
    fill: {
      type: fillVal ? "solid" : "none",
      opacity: fillVal ? 0.3 : 1
    },
    stroke: {
      curve: "smooth"
    },
    markers: {
      size: 6,
      hover: { size: 8 }
    },
    xaxis: {
      categories: data.labels,
      labels: {
        rotate: -45
      },
      axisBorder: { show: false }, // Hides x-axis border
      axisTicks: { show: false } // Hides x-axis ticks
    },
    yaxis: {
      labels: {
        formatter: (value) => Math.floor(value)
      },
      axisBorder: { show: false }, // Hides y-axis border
      axisTicks: { show: false } // Hides y-axis ticks
    },
    grid: {
      show: false // Completely hides grid lines
    }
  };
  

  return (
    <div className="w-full h-[300px]">
      <Chart options={options} series={series} type={fillVal ? "area" : "line"} height={300} />
    </div>
  );
};

export default LineChart;
