import ReactApexChart from "react-apexcharts";
import React from "react";
const TreemapChart = (data = []) => {
  console.log("treeData", data)
  const chartData = {
    options: {
      legend: {
        show: true
      },
      chart: {
        height: 350,
        type: 'treemap'
      },
      colors: [
        "#F2A900", "#F22E63", "#7D3CFF", "#00C3FF", "#FF7A00",
        "#00E676", "#D500F9", "#FF1744", "#FF9100", "#651FFF",
        "#1DE9B6", "#FFD600", "#00E5FF", "#FF4081", "#3D5AFE",
        "#8E24AA", "#AA00FF", "#76FF03", "#C51162", "#6200EA"
        ],
      plotOptions: {
        treemap: {
          distributed: true,
          enableShades: true
        }
      }
    },
 
 
  };
 
 
 
  return (<>
    <ReactApexChart options={chartData.options} series={[data]} type="treemap" height={250} />
  </>
  );
}
 
export default TreemapChart
// const domContainer = document.querySelector('#app');
// ReactDOM.render(<ApexChart />, domContainer);
 
 