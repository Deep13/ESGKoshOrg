import React, { useRef } from "react";
import { Chart } from "chart.js/auto";
import { Document, Packer, Paragraph, ImageRun } from "docx";
import { saveAs } from "file-saver";
import { useSidebar } from "./context/SidebarContext";
import { firestore } from "./firebase";
import { getDoc, doc, collection, getDocs, setDoc } from "firebase/firestore";
// import { TreemapController, TreemapElement } from 'chartjs-chart-treemap';
// Chart.register(TreemapController, TreemapElement);


const chartConfigs = [
  {
    title: "Training Participation",
    data: {
      labels: ["Overall", "Less than 22", "22 to 35", "35 to 50", "50+"],
      datasets: [
        {
          label: "Onboarding and orientation",
          data: [13, 32, 0, 21, 332],
          backgroundColor: "#3366CC",
        },
        {
          label: "Employee Skill Upgradation Training",
          data: [84, 0, 0, 0, 3],
          backgroundColor: "#DC3912",
        },
        {
          label: "Whistle-blower Policy Training",
          data: [36, 0, 0, 0, 0],
          backgroundColor: "#FF9900",
        },
        {
          label: "Employee health & safety training",
          data: [123, 0, 23, 28, 353],
          backgroundColor: "#109618",
        },
      ],
    },
  },
  {
    title: "Employment Distribution by Gender and Age",
    data: {
      labels: ["Overall", "Less than 22", "22 to 35", "35 to 50", "50+"],
      datasets: [
        {
          label: "Male",
          data: [4324, 1521, 2474, 24386, 5057],
          backgroundColor: "#109ad8",
        },
        {
          label: "Female",
          data: [5407, 2314, 1195, 1557, 994],
          backgroundColor: "#45bf34",
        },
        {
          label: "LGBTQ",
          data: [264, 57, 145, 33, 29],
          backgroundColor: "#f26c35",
        },
      ],
    },
  },
];

const ChartToDocxExporter = () => {
  const canvasRefs = useRef([]);
  const { userData } = useSidebar()

  const formatTrainingAndEduData = (data, type) => {
    const roles = ["BOD", "Employees", "Others", "Workers", "Personalles"];
    const result = {
      BOD: {},
      Employees: {},
      Others: {},
      Workers: {},
      Personalles: {},
    };

    for (const monthKey in data) {
      if (type === "month" && monthKey !== month) continue;
      const branches = data[monthKey];
      for (const branchKey in branches) {
        const branch = branches[branchKey];
        const trainingEdu = branch["Training and Edu"];
        if (trainingEdu) {
          roles.forEach((role) => {
            const roleData = trainingEdu[role];
            if (roleData) {
              for (const [trainingType, value] of Object.entries(roleData)) {
                const numericValue = Number(value);
                result[role][trainingType] =
                  (result[role][trainingType] || 0) +
                  (isNaN(numericValue) ? 0 : numericValue);
              }
            }
          });
        }
      }
    }

    return result;
  };

  function formatEmploymentData(rawData, type, month) {
    const genders = ["Male", "Female", "LGBTQ"];
    const genderColors = {
      Male: "#109ad8",
      Female: "#45bf34",
      LGBTQ: "#f26c35",
    };

    const genderDataByAge = {
      Male: {},
      Female: {},
      LGBTQ: {},
    };

    const ageSet = new Set();
    const monthsToProcess = type === "month" ? { [month]: rawData[month] } : rawData;

    for (const monthKey in monthsToProcess) {
      const monthData = monthsToProcess[monthKey];
      for (const branchKey in monthData) {
        const branch = monthData[branchKey];
        const employment = branch.Employment || {};
        for (const ageKey in employment) {
          ageSet.add(ageKey);
          const ageData = employment[ageKey];
          genders.forEach((gender) => {
            const value = Number(ageData[gender]) || 0;
            genderDataByAge[gender][ageKey] =
              (genderDataByAge[gender][ageKey] || 0) + value;
          });
        }
      }
    }

    const sortedAgeLabels = Array.from(ageSet).sort((a, b) => {
      // Attempt numeric sort if possible
      const aNum = parseInt(a, 10);
      const bNum = parseInt(b, 10);
      return isNaN(aNum) || isNaN(bNum) ? a.localeCompare(b) : aNum - bNum;
    });

    const chartLabels = ["Overall", ...sortedAgeLabels];

    const datasets = genders.map((gender) => {
      const ageData = genderDataByAge[gender];
      const dataArray = sortedAgeLabels.map((age) => ageData[age] || 0);
      const overall = dataArray.reduce((sum, val) => sum + val, 0);

      return {
        label: gender,
        data: [overall, ...dataArray],
        backgroundColor: genderColors[gender],
        borderColor: genderColors[gender],
        borderWidth: 1,
      };
    });

    return {
      labels: chartLabels,
      datasets: datasets,
    };
  }

  function formatForTreemap(dataObj) {
    const topLevel = dataObj["10"];
    const emissions = {};

    const keysToInclude = [
      "Fuel", "Accommodation", "Refrigerant and other", "Business travel - land and sea",
      "Employees commuting", "Owned Vehicles", "Water", "Home Office", "WTT- fuels",
      "Freighting goods", "Materials", "Food", "Bioenergy", "Waste Disposal",
      "Elec heat cooling", "Flight"
    ];

    // Sum all values for selected keys
    for (const region in topLevel) {
      const regionData = topLevel[region];

      for (const key of keysToInclude) {
        let value = regionData[key];

        if (typeof value === "number") {
          emissions[key] = (emissions[key] || 0) + value;
        }
      }
    }

    // Convert raw values to normalized format (millions of units or %)
    const result = Object.entries(emissions).map(([key, val]) => ({
      x: key,
      y: +(val / 1_000_000).toFixed(4)  // Adjust as needed (e.g., millions)
    }));

    return result;
  }

  const formatNetWorthVsTurnoverData = (data) => {
    const monthMap = {
      "1": "Jan", "2": "Feb", "3": "Mar", "4": "Apr", "5": "May", "6": "Jun",
      "7": "Jul", "8": "Aug", "9": "Sep", "10": "Oct", "11": "Nov", "12": "Dec"
    };

    const monthKeys = Object.keys(monthMap);
    const labels = monthKeys.map(k => monthMap[k]);
    const netWorthData = [];
    const turnoverData = [];

    monthKeys.forEach(monthNum => {
      const monthData = data[monthNum];
      if (monthData) {
        let totalNetWorth = 0;
        let totalTurnover = 0;

        Object.values(monthData).forEach(entry => {
          const eco = entry["Eco. Performance"] || {};
          totalNetWorth += parseFloat(eco["Total Revenue"] || 0);
          totalTurnover += parseFloat(eco["Total turnover"] || 0);
        });

        netWorthData.push(totalNetWorth);
        turnoverData.push(totalTurnover);
      } else {
        // Fill 0 if data doesn't exist for that month
        netWorthData.push(0);
        turnoverData.push(0);
      }
    });

    return {
      labels,
      datasets: [
        {
          label: "Net Worth",
          data: netWorthData,
          backgroundColor: "#109ad8",
          borderColor: "#0a6a94",
          borderWidth: 1,
          fill: "origin"
        },
        {
          label: "Total Turnover",
          data: turnoverData,
          backgroundColor: "#f26c35",
          borderColor: "#c23e08",
          borderWidth: 1,
          fill: "origin"
        }
      ]
    };
  };

  const formatDirectValueChartData = (data) => {
    const monthMap = {
      "1": "Jan", "2": "Feb", "3": "Mar", "4": "Apr", "5": "May", "6": "Jun",
      "7": "Jul", "8": "Aug", "9": "Sep", "10": "Oct", "11": "Nov", "12": "Dec"
    };

    const monthKeys = Object.keys(monthMap);
    const labels = monthKeys.map(k => monthMap[k]);
    const distributedData = [];
    const generatedData = [];

    monthKeys.forEach(monthNum => {
      const monthData = data[monthNum];
      if (monthData) {
        let totalDistributed = 0;
        let totalGenerated = 0;

        Object.values(monthData).forEach(entry => {
          const eco = entry["Eco. Performance"] || {};
          totalDistributed += parseFloat(eco["Direct economic value Distributed"] || 0);
          totalGenerated += parseFloat(eco["Direct economic value generated"] || 0);
        });

        distributedData.push(totalDistributed);
        generatedData.push(totalGenerated);
      } else {
        distributedData.push(0);
        generatedData.push(0);
      }
    });

    return {
      labels,
      datasets: [
        {
          label: "Direct Economic Value Distributed",
          data: distributedData,
          backgroundColor: "#4caf50",
          borderColor: "#357a38",
          borderWidth: 1,
          fill: "origin"
        },
        {
          label: "Direct Economic Value Generated",
          data: generatedData,
          backgroundColor: "#ff9800",
          borderColor: "#e65100",
          borderWidth: 1,
          fill: "origin"
        }
      ]
    };
  };

  const transformEntityData = (govData) => {
    const entityTotals = {};

    Object.keys(govData).forEach((monthKey) => {
      if (isNaN(monthKey)) return;

      const monthData = govData[monthKey];

      Object.values(monthData).forEach((locationData) => {
        const entity = locationData["Entity"] || {};

        Object.entries(entity).forEach(([role, count]) => {
          const numericCount = Number(count || 0);
          if (numericCount > 0) {
            entityTotals[role] = (entityTotals[role] || 0) + numericCount;
          }
        });
      });
    });

    return entityTotals;
  };





  const generateTrainingChart = async (data, labels) => {
    const paragraphs = [];


    // for (let i = 0; i < chartConfigs.length; i++) {

    // }
    const canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 400;
    document.body.appendChild(canvas);
    canvas.style.display = "none"; // Keep canvas hidden

    const chart = new Chart(canvas.getContext("2d"), {
      type: "bar",
      data: { labels: labels, datasets: data },
      options: {
        responsive: true,
        scales: {
          x: {
            stacked: true,
          },
          y: {
            stacked: true
          }
        },
        indexAxis: "y",
        plugins: {
          legend: {
            display: true,
          },
          title: {
            display: true,
            text: "Training",
          },
        },

      },
    });

    await new Promise((resolve) => setTimeout(resolve, 500)); // wait for chart to render

    const base64Image = chart.toBase64Image();

    paragraphs.push(
      new Paragraph({
        children: [
          new ImageRun({
            data: base64Image.split(",")[1],
            transformation: { width: 600, height: 300 },
            mimeType: "image/png",
          }),
        ],
      }),
      new Paragraph({}) // Spacer
    );

    chart.destroy();
    canvas.remove();

    // const doc = new Document({
    //     sections: [{ children: paragraphs }],
    // });

    // const blob = await Packer.toBlob(doc);
    // saveAs(blob, "Hidden_Charts_Report.docx");
    return paragraphs
  };
  const generateEmploymentChart = async (data, labels) => {
    const paragraphs = [];

    const canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 400;
    document.body.appendChild(canvas);
    canvas.style.display = "none"; // Keep canvas hidden

    const chart = new Chart(canvas.getContext("2d"), {
      type: "bar",
      data: {
        labels: labels,
        datasets: data,
      },
      options: {
        responsive: true,
        indexAxis: "x", // vertical bar chart (default)
        scales: {
          x: {
            stacked: false,
          },
          y: {
            stacked: false,
          },
        },
        plugins: {
          legend: {
            display: true,
            position: "top",
          },
          title: {
            display: true,
            text: "Employment by Gender and Age",
          },
        },
      },
    });

    await new Promise((resolve) => setTimeout(resolve, 500)); // wait for chart to render

    const base64Image = chart.toBase64Image();

    paragraphs.push(
      new Paragraph({
        children: [
          new ImageRun({
            data: base64Image.split(",")[1],
            transformation: { width: 600, height: 300 },
            mimeType: "image/png",
          }),
        ],
      }),
      new Paragraph({}) // Spacer
    );

    chart.destroy();
    canvas.remove();

    return paragraphs;
  };
  const generateTreemapChart = async (data) => {
    const paragraphs = [];

    const canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 400;
    document.body.appendChild(canvas);
    canvas.style.display = "none"; // Hide canvas

    const chart = new Chart(canvas.getContext("2d"), {
      type: "treemap",
      data: {
        datasets: [{
          label: "Environmental Impact Treemap",
          tree: data, // your array of { x, y }
          key: "y",
          groups: ["x"],

          spacing: 0,
          padding: 0,

          backgroundColor: (ctx) => {
            const value = ctx?.raw?.y ?? 0;
            const alpha = 0.6 + Math.min(value / 100, 0.4);
            return `rgba(0, 123, 255, ${alpha})`;
          },
          borderWidth: 1,
          borderColor: "#fff",
        }]
      },
      options: {
        plugins: {
          treemap: {
            labels: {
              display: true,
              formatter: (ctx) => ctx.raw.x,
              color: "#ffffff",
              font: {
                size: 12,
                weight: 'bold'
              }
            }
          },
          title: {
            display: true,
            text: "Environmental Impact Treemap"
          }
        }
      }
    });


    await new Promise((resolve) => setTimeout(resolve, 500)); // Allow time for rendering

    const base64Image = chart.toBase64Image();

    paragraphs.push(
      new Paragraph({
        children: [
          new ImageRun({
            data: base64Image.split(",")[1],
            transformation: { width: 600, height: 300 },
            mimeType: "image/png",
          }),
        ],
      }),
      new Paragraph({}) // Spacer
    );

    chart.destroy();
    canvas.remove();

    return paragraphs;
  };

  const generateNetWorthVsTurnoverChart = async (datasets, labels) => {
    const paragraphs = [];

    const canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 400;
    document.body.appendChild(canvas);
    canvas.style.display = "none"; // hide during rendering

    const chart = new Chart(canvas.getContext("2d"), {
      type: "line",
      data: {
        labels: labels,
        datasets: datasets.map(dataset => ({
          ...dataset,
          tension: 0.4, // smooth curves
          fill: "origin", // area fill
          pointRadius: 3,
          pointHoverRadius: 6
        })),
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: true,
            position: "top",
          },
          title: {
            display: true,
            text: "Net Worth vs Total Turnover",
            font: { size: 18 },
          },
          tooltip: {
            mode: "index",
            intersect: false,
          },
        },
        interaction: {
          mode: "nearest",
          axis: "x",
          intersect: false,
        },
        scales: {
          x: {
            title: {
              display: true,
              text: "Month",
            },
          },
          y: {
            title: {
              display: true,
              text: "Amount (INR)",
            },
            beginAtZero: true,
          },
        },
      },
    });

    await new Promise((resolve) => setTimeout(resolve, 500)); // allow rendering

    const base64Image = chart.toBase64Image();

    paragraphs.push(
      new Paragraph({
        children: [
          new ImageRun({
            data: base64Image.split(",")[1],
            transformation: { width: 600, height: 300 },
            mimeType: "image/png",
          }),
        ],
      }),
      new Paragraph({}) // Spacer
    );

    chart.destroy();
    canvas.remove();

    return paragraphs;
  };


  const generateEntityChart = async (entityData) => {
    const labels = Object.keys(entityData);
    const values = Object.values(entityData);

    // Create hidden canvas
    const canvas = document.createElement("canvas");
    canvas.width = 500;
    canvas.height = 500;
    canvas.style.display = "none";
    document.body.appendChild(canvas);

    // Generate the Chart
    new Chart(canvas, {
      type: "doughnut",
      data: {
        labels,
        datasets: [
          {
            label: "Entity Roles",
            data: values,
            backgroundColor: [
              "#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0",
              "#9966FF", "#FF9F40", "#8dd3c7", "#ffffb3"
            ],
          },
        ],
      },
      options: {
        plugins: {
          legend: {
            position: "bottom",
          },
          title: {
            display: true,
            text: "Entity Role Distribution",
          },
        },
      },
    });

    // Wait briefly for rendering
    await new Promise((resolve) => setTimeout(resolve, 300));

    const dataUrl = canvas.toDataURL("image/png");
    const base64 = dataUrl.split(",")[1];
    document.body.removeChild(canvas);

    return [
      new Paragraph({
        children: [
          new ImageRun({
            data: Uint8Array.from(atob(base64), (c) => c.charCodeAt(0)),
            transformation: {
              width: 500,
              height: 400,
            },
          }),
        ],
      }),
    ];
  };





  const fetchData = async () => {
    const domain = userData?.username.split("@");
    const env = `Environment-Overview-2024`;
    const social = `Social-Overview-2024`;
    const gov = `Governance-Overview-2024`;

    const docRef = doc(firestore, domain[1], "AnalyticsData", "Reporting Data", env);
    const docRef2 = doc(firestore, domain[1], "AnalyticsData", "Reporting Data", social);
    const docRef3 = doc(firestore, domain[1], "AnalyticsData", "Reporting Data", gov);

    const docSnapshot = await getDoc(docRef);
    const docSnapshot2 = await getDoc(docRef2);
    const docSnapshot3 = await getDoc(docRef3);

    const envData = docSnapshot.data() || {};
    const socialData = docSnapshot2.data() || {};
    const govData = docSnapshot3.data() || {};
    const formattedTrainingData = formatTrainingAndEduData(socialData, "year");
    const formattedTreeMapData = formatForTreemap(envData);
    const formattedAreaData1 = formatNetWorthVsTurnoverData(govData);
    const formattedAreaData2 = formatDirectValueChartData(govData);
    const doughNutData = transformEntityData(govData);
    // console.log(formattedTrainingData)
    console.log("gov", govData)
    const allTrainingTypes = Array.from(
      new Set(
        Object.values(formattedTrainingData)
          .flatMap((category) => Object.entries(category))
          .filter(([_, v]) => v > 0)
          .map(([trainingType]) => trainingType)
      )
    );
    const colors = [
      "#109ad8", "#45bf34", "#f26c35", "#4bc0c0",
      "#9966ff", "#ff9f40", "#fc8a6d", "#304dff",
      "#bbdbeb", "#e4acc4", "#ffd0a6", "#9cc079"
    ];
    const series = allTrainingTypes.map((training, index) => ({
      label: training,
      data: Object.keys(formattedTrainingData).map(
        (category) => formattedTrainingData[category]?.[training] || 0
      ),
      backgroundColor: colors[index],
    }));
    console.log("series", series)
    const trainingParagraphs = await generateTrainingChart(series, allTrainingTypes)
    const { labels, datasets } = formatEmploymentData(socialData, "year"); // or "month", monthNumber

    const employmentParagraphs = await generateEmploymentChart(datasets, labels);
    const treeParagraphs = await generateTreemapChart(formattedTreeMapData);
    const area1Paragraphs = await generateNetWorthVsTurnoverChart(formattedAreaData1.datasets, formattedAreaData1.labels);
    const area2Paragraphs = await generateNetWorthVsTurnoverChart(formattedAreaData2.datasets, formattedAreaData2.labels);
    const entityChartSection = await generateEntityChart(doughNutData);
    await generateDocxFromParagraphs([
      trainingParagraphs,
      employmentParagraphs,
      treeParagraphs,
      area1Paragraphs,
      area2Paragraphs,
      entityChartSection
    ]);

  }

  const handleDownload = async () => {
    const paragraphs = [];


    for (let i = 0; i < chartConfigs.length; i++) {
      const canvas = document.createElement("canvas");
      canvas.width = 800;
      canvas.height = 400;
      document.body.appendChild(canvas);
      canvas.style.display = "none"; // Keep canvas hidden

      const chart = new Chart(canvas.getContext("2d"), {
        type: "bar",
        data: chartConfigs[i].data,
        options: {
          responsive: false,
          plugins: {
            legend: {
              display: true,
            },
            title: {
              display: true,
              text: chartConfigs[i].title,
            },
          },
        },
      });

      await new Promise((resolve) => setTimeout(resolve, 500)); // wait for chart to render

      const base64Image = chart.toBase64Image();

      paragraphs.push(
        new Paragraph({
          children: [
            new ImageRun({
              data: base64Image.split(",")[1],
              transformation: { width: 600, height: 300 },
              mimeType: "image/png",
            }),
          ],
        }),
        new Paragraph({}) // Spacer
      );

      chart.destroy();
      canvas.remove();
    }

    const doc = new Document({
      sections: [{ children: paragraphs }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, "Hidden_Charts_Report.docx");
  };

  const generateDocxFromParagraphs = async (sections = []) => {
    // Flatten the nested paragraph arrays (e.g., [[p1, p2], [p3], [p4, p5]] => [p1, p2, p3, p4, p5])
    const allParagraphs = sections.flat();

    const doc = new Document({
      sections: [
        {
          children: allParagraphs,
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, "Analytics_Report.docx");
  };


  return (
    <div>
      <button onClick={fetchData}>
        Generate DOCX with Hidden Charts
      </button>
    </div>
  );
};

export default ChartToDocxExporter;
