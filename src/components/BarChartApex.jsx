import { useRef } from "react";
import Chart from "react-apexcharts";
// import { useSidebar } from "../context/SidebarContext";


const BarChartApex = ({ data = { labels: [], datasets: [] }, stacked = false, setYear = null, fill = false, formatkey="" ,  continueDownload = () => {}}) => {
  // Check if there's no data available
  // const {sheets,module}=useSidebar()
  console.log(data,"Employee")
  const hasData = data?.datasets?.length > 0 && data.datasets?.some(dataset => dataset?.data?.length > 0);
  const hasRunRef = useRef(false);
  if (!hasData && setYear === null) {
    return (
      <div className="w-full h-[200px] flex items-center justify-center text-gray-500">
        No data available for analytics
      </div>
    );
  }

  const handleAnimationEnd = () => {
    if (!hasRunRef.current) {
      hasRunRef.current = true; // ✅ mark as run
      continueDownload();        // ✅ run once only
    }
  };

// const moduleName=checkKey(module)

  // Transform data into ApexCharts format
  const series = data?.datasets?.map(dataset => ({
    name: dataset.label,
    data: dataset.data.map(value => (value === null || isNaN(value) ? 0 : value)) // Ensure no NaN values
  }));

  const options = {
    chart: {
      type: "bar",
      id:"EmployeeChart",
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
        animationEnd: handleAnimationEnd, // ✅ controlled trigger
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
      title: {  text: formatkey === "Env" ? "kgCO₂e" : "", },
      labels: {
        formatter: (value) => Math.floor(value), // Ensure only integer values are displayed
      }
    },
    grid: {
      show: false
    },
    legend: { position: "top" },
    plotOptions: {
      bar: {
        borderRadius: 5,
        borderRadiusApplication: "end",
        horizontal: false
      }
    },
    ...(fill && {
      fill: {
        type: 'pattern',
        opacity: 1,
        pattern: {
          style: ['circles', 'slantedLines', 'verticalLines', 'horizontalLines'], // string or array of strings

        }
      }
    }),

    colors: data?.datasets?.map(dataset => dataset.backgroundColor), // Maintain Chart.js colors
    dataLabels: {
      enabled: false // Completely hide numbers inside bars
    },
    tooltip: {
      y: {
        formatter: (value) => {
          const base = Math.floor(value);
          return formatkey === "Env" ? `${base} kgCO₂e` : base;
        }
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
