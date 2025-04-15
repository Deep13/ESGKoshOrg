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
            ],
            points: [
              {
                x: 3.75,
                y: 3.75,
                marker: { size: 0 },
                label: {
                  text: "Quadrant 1",
                  borderColor: "transparent",  // removes the grey border
                  borderWidth: 0,
                  style: {
                    color: "#000",
                    fontSize: "18px",
                    background: "transparent",
                    fontWeight: "bold",
                  }
                }
              },
              {
                x: 1.25,
                y: 3.75,
                marker: { size: 0 },
                label: {
                  text: "Quadrant 2",
                  borderColor: "transparent",
                  borderWidth: 0,
                  style: {
                    color: "#000",
                    fontSize: "18px",
                    background: "transparent",
                    fontWeight: "bold",
                  }
                }
              },
              {
                x: 1.25,
                y: 1.25,
                marker: { size: 0 },
                label: {
                  text: "Quadrant 3",
                  borderColor: "transparent",
                  borderWidth: 0,
                  style: {
                    color: "#000",
                    fontSize: "18px",
                    background: "transparent",
                    fontWeight: "bold",
                  }
                }
              },
              {
                x: 3.75,
                y: 1.25,
                marker: { size: 0 },
                label: {
                  text: "Quadrant 4",
                  borderColor: "transparent",
                  borderWidth: 0,
                  style: {
                    color: "#000",
                    fontSize: "18px",
                    background: "transparent",
                    fontWeight: "bold",
                  }
                }
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
