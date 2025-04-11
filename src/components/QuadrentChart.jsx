import ApexCharts from "react-apexcharts";

const QuadrentChart = ({series}) => {

    const options = {
        chart: {
          type: 'scatter',
          height: 350,
          zoom: { enabled: true }
        },
        xaxis: {
          min: 0,
          max: 5,
          tickAmount: 5,
          title: { text: 'Importance to Business' },
          annotations: {
            position: 'back'
          }
        },
        plotOptions: {
            scatter: {
              markers: {
                size: 8,
                colors: ["#45bf34"], // All dots will use this
                strokeColor: '#000',
                strokeWidth: 1
              }
            }
          },
        yaxis: {
          min: 0,
          max: 5,
          tickAmount: 5,
          title: { text: 'Importance to Stakeholders' }
        },
        annotations: {
          xaxis: [
            {
              x: 2.5,
              borderColor: "#ff9f40",
              strokeDashArray: 4,
            }
          ],
          yaxis: [
            {
              y: 2.5,
              borderColor: "#ff9f40",
              strokeDashArray: 4,
            }
          ]
        }
      };
      
    //   const series = [
    //     {
    //       name: 'Data Points',
    //       data: [
    //         [1.5, 1],
    //         [2, 3],
    //         [3, 2],
    //         [4, 4]
    //       ]
    //     }
    //   ];
      
  return (
    <ApexCharts
      options={options}
      series={series}
      type="scatter"
      height={550}
    />
  );
};

export default QuadrentChart;
