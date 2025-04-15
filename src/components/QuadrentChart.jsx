import ApexCharts from "react-apexcharts";

const QuadrentChart = ({ series }) => {


  const options = {
    chart: {
      type: 'scatter',
      height: 350,
      zoom: { enabled: true }
    },
    title: {
      text: '',
    },
    colors: [
      "#109ad8", "#45bf34", "#f26c35", // your starting colors
      "#8e44ad", "#e67e22", "#16a085", "#c0392b", "#2c3e50",
      "#f39c12", "#1abc9c", "#3498db", "#9b59b6", "#34495e",
      "#27ae60", "#e74c3c", "#2980b9", "#d35400", "#7f8c8d",
      "#95a5a6", "#2ecc71", "#e84393", "#fd79a8", "#6c5ce7",
      "#00b894", "#00cec9", "#fdcb6e", "#fab1a0", "#e17055",
      "#ffeaa7", "#a29bfe", "#b2bec3", "#d63031", "#0984e3",
      "#e84393", "#636e72", "#f1c40f", "#58b19f", "#ff7675",
      "#6ab04c", "#4834d4"
    ],
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
          colors: [
            "#109ad8"], // All dots will use this
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
        },
      ],
      yaxis: [
        {
          y: 2.5,
          borderColor: "#ff9f40",
          strokeDashArray: 4,
        }
      ],
      points: [{
        x: 1.2,
        y: 3.2,
        marker: {
          size: 0,
        },
        label: {
          borderWidth: 0,
          text: "Quadrant 2",
          style: {
            color: 'rgba(0,0,0,0.5)',
            fontSize: '15px',
            fontWeight: 400,
          }
        }
      },
      {
        x: 1.2,
        y: 1.2,
        marker: {
          size: 0,
        },
        label: {
          borderWidth: 0,
          text: "Quadrant 3",
          style: {
            color: 'rgba(0,0,0,0.5)',
            fontSize: '15px',
            fontWeight: 400,
          }
        }
      }, {
        x: 3.2,
        y: 3.2,
        marker: {
          size: 0,
        },
        label: {
          borderWidth: 0,
          text: "Quadrant 1",
          style: {
            color: 'rgba(0,0,0,0.5)',
            fontSize: '15px',
            fontWeight: 400,
          }
        }
      }, {
        x: 3.2,
        y: 1.2,
        marker: {
          size: 0,
        },
        label: {
          borderWidth: 0,
          text: "Quadrant 4",
          style: {
            color: 'rgba(0,0,0,0.5)',
            fontSize: '15px',
            fontWeight: 400,
          }
        }
      }]
    }
  };
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
