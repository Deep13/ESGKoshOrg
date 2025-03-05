import React from "react";
import Chart from "react-apexcharts";

const BarChartApex = ({ data = { labels: [], datasets: [] }, stacked = false, setYear = null }) => {
  // Check if there's no data available
  const hasData = data?.datasets?.length > 0 && data.datasets?.some(dataset => dataset?.data?.length > 0);
  
  if (!hasData && setYear === null) {
    return (
      <div className="w-full h-[200px] flex items-center justify-center text-gray-500">
        No data available for analytics
      </div>
    );
  }

  // Transform data into ApexCharts format
  const series = data?.datasets?.map(dataset => ({
    name: dataset.label,
    data: dataset.data.map(value => (value === null || isNaN(value) ? 0 : value)) // Ensure no NaN values
  }));

  const options = {
    chart: {
      type: "bar",
      stacked: stacked,
      toolbar: {
        show: true, // Enables the toolbar
        tools: {
          download: true, // Enable download button
          selection: true,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
          reset: true
        },
        export: {
          csv: {
            filename: "chart-data", // Name of the CSV file
            columnDelimiter: ",",
            headerCategory: "Year", // Header for x-axis
            headerValue: "Value", // Header for y-axis values
            dateFormatter: (timestamp) => new Date(timestamp).toLocaleDateString() // Format date if needed
          },
          svg: {
            filename: "chart-image" // Filename for SVG export
          },
          png: {
            filename: "chart-image" // Filename for PNG export
          }
        }
      },
      events: {
        dataPointSelection: (event, chartContext, config) => {
          const selectedIndex = config.dataPointIndex;
          const selectedYear = data.labels[selectedIndex]; // Get clicked year
          if (setYear) setYear(selectedYear);
        }
      }
    },
    xaxis: {
      categories: data.labels,
      title: { text: "" }
    },
    yaxis: {
      title: { text: "" },
      labels: {
        formatter: (value) => Math.floor(value), // Ensure only integer values are displayed
      }
    },
    legend: { position: "top" },
    plotOptions: {
      bar: {
        borderRadius: 5,
        borderRadiusApplication: "end",
        horizontal: false
      }
    },
    colors: data?.datasets?.map(dataset => dataset.backgroundColor), // Maintain Chart.js colors
    dataLabels: {
      enabled: false // Completely hide numbers inside bars
    },
    tooltip: {
      y: {
        formatter: (value) => Math.floor(value) // Tooltip values as integers
      }
    }
  };

  return (
    <div className="w-full h-[200px]">
      <Chart options={options} series={series} type="bar" height={200} />
    </div>
  );
};

export default BarChartApex;
