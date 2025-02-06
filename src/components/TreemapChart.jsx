import ReactApexChart from "react-apexcharts";
import React from "react";
const TreemapChart = (data) => {
  const chartData={
    
      series: [data],
      options: {
        legend: {
          show: false
        },
        chart: {
          height: 350,
          type: 'treemap'
        },
        title: {
          text: 'Distibuted Treemap (different color for each cell)',
          align: 'center'
        },
        colors: [
          '#3B93A5',
          '#F7B844',
          '#ADD8C7',
          '#EC3C65',
          '#CDD7B6',
          '#C1F666',
          '#D43F97',
          '#1E5D8C',
          '#421243',
          '#7F94B0',
          '#EF6537',
          '#C0ADDB'
        ],
        plotOptions: {
          treemap: {
            distributed: true,
            enableShades: false
          }
        }
      },
    
    
  };

  

  return (
     <ReactApexChart options={chartData.options} series={chartData.series} type="treemap" height={250} />
  );
}

export default TreemapChart
// const domContainer = document.querySelector('#app');
// ReactDOM.render(<ApexChart />, domContainer);
