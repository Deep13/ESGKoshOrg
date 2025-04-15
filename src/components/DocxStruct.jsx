import { saveAs } from "file-saver";
import { Document, Packer, Paragraph, Table, TableRow, TableCell, BorderStyle, ImageRun } from "docx";
import { collection, getDocs, query, where } from "firebase/firestore";
import { getDoc, doc, setDoc } from "firebase/firestore";
import { firestore } from "../firebase";
import { Chart } from "chart.js/auto";

const scopeData = {
  "Fuel": "Scope 1",
  "Bioenergy": "Scope 1",
  "Refrigerant and other": "Scope 1",
  "Elec heat cooling": "Scope 2",
  "Owned Vehicles": "Scope 1",
  "Materials": "Scope 3",
  "WTT- fuels": "Scope 3",
  "Waste Disposal": "Scope 3",
  "Flight": "Scope 3",
  "Business travel - land and sea": "Scope 3",
  "Freighting goods": "Scope 3",
  "Employees commuting": "Scope 3",
  "Water": "Scope 3",
  "Accommodation": "Scope 3",
  "Food": "Scope 3",
  "Home Office": "Scope 3"
};

// Function to create a horizontal line
const horizontalLine = new Paragraph({
  children: [],
  border: {
    bottom: { style: BorderStyle.SINGLE, size: 3, color: "000000" } // Black line
  },
});

//club child Labor data
const clubChildLaborData = (data) => {
  const result = {
    Low: 0,
    Moderate: 0,
    High: 0,
    Uncertain: 0,
  };

  Object.keys(data || {}).forEach(key => {
    if (key === "year" || key === "type") return;

    const value = data[key];
    if (typeof value !== "object") return;

    // Yearly format — nested structure
    if (Object.values(value)[0] && typeof Object.values(value)[0] === "object") {
      Object.values(value).forEach(location => {
        const types = location["Type"] || {};
        Object.entries(types).forEach(([severity, count]) => {
          if (result.hasOwnProperty(severity)) {
            result[severity] += count;
          } else {
            result[severity] = count;
          }
        });
      });
    } else {
      // Monthly format — flat structure
      const types = value["Type"] || {};
      Object.entries(types).forEach(([severity, count]) => {
        if (result.hasOwnProperty(severity)) {
          result[severity] += count;
        } else {
          result[severity] = count;
        }
      });
    }
  });

  return result;
};
//club CHS data
const clubCHSData = (data) => {
  const result = {
    "No. of non-compliance Incidents": 0,
    "Customers Impacted": 0,
  };

  Object.keys(data || {}).forEach(key => {
    if (key === "year" || key === "type") return;

    const value = data[key];

    if (typeof value !== "object") return;

    // Check if it's a nested location (yearly format)
    if (Object.values(value)[0] && typeof Object.values(value)[0] === "object") {
      // Yearly format
      Object.values(value).forEach(location => {
        Object.entries(location).forEach(([metric, count]) => {
          if (result.hasOwnProperty(metric)) {
            result[metric] += count;
          } else {
            result[metric] = count;
          }
        });
      });
    } else {
      // Monthly format (flat)
      Object.entries(value).forEach(([metric, count]) => {
        if (result.hasOwnProperty(metric)) {
          result[metric] += count;
        } else {
          result[metric] = count;
        }
      });
    }
  });

  return result;
};
//club market data
const clubMarketPresence = (data) => {
  const result = {
    "Values": 0,
    "Markets served by the entity nationally": 0,
    "Markets served by the entity internationally": 0
  };

  Object.keys(data || {}).forEach(key => {
    if (key === "year" || key === "type") return;

    const value = data[key];

    if (typeof value !== "object") return;

    // Yearly format — nested structure
    if (Object.values(value)[0] && typeof Object.values(value)[0] === "object") {
      Object.values(value).forEach(location => {
        result["Values"] += parseFloat(location["Values"] || 0);
        result["Markets served by the entity nationally"] += parseInt(location["Markets served by the entity nationally"] || 0);
        result["Markets served by the entity internationally"] += parseInt(location["Markets served by the entity internationally"] || 0);
      });
    } else {
      // Monthly format — flat structure
      result["Values"] += parseFloat(value["Values"] || 0);
      result["Markets served by the entity nationally"] += parseInt(value["Markets served by the entity nationally"] || 0);
      result["Markets served by the entity internationally"] += parseInt(value["Markets served by the entity internationally"] || 0);
    }
  });

  return result;
};
//club social data
const clubSocialBenefits = (data) => {
  const result = {
    "Expenditure": 0,
    "No. of Beneficiaries": 0
  };

  Object.keys(data || {}).forEach(key => {
    if (key === "year" || key === "type") return;

    const value = data[key];
    if (typeof value !== "object") return;

    // Yearly format — nested structure
    if (Object.values(value)[0] && typeof Object.values(value)[0] === "object") {
      Object.values(value).forEach(location => {
        result["Expenditure"] += parseInt(location["Expenditure"] || 0);
        result["No. of Beneficiaries"] += parseInt(location["No. of Beneficiaries"] || 0);
      });
    } else {
      // Monthly format — flat structure
      result["Expenditure"] += parseInt(value["Expenditure"] || 0);
      result["No. of Beneficiaries"] += parseInt(value["No. of Beneficiaries"] || 0);
    }
  });

  return result;
};
//club all type of environmentdata for table
const clubEmissions = (data, moduleType) => {
  let total = 0;

  Object.keys(data || {}).forEach(key => {
    if (key === "year" || key === "type") return;

    const monthData = data[key];
    if (typeof monthData !== "object") return;

    Object.values(monthData).forEach(locationData => {
      if (typeof locationData === "number") {
        total += locationData;
      } else if (typeof locationData === "object") {
        Object.values(locationData).forEach(category => {
          if (typeof category === "number") {
            total += category;
          } else if (typeof category === "object") {
            Object.values(category).forEach(value => {
              if (typeof value === "number") {
                total += value;
              }
            });
          }
        });
      }
    });
  });

  return {
    total
  };
};
const clubTrainingEducation = (trainingData) => {
  const subGroups = new Set(); // like BOD, Workers, etc.
  const totals = {}; // { "POSH training": total, ... }

  for (const branch in trainingData) {
    const branchTraining = trainingData[branch]?.["Training and Edu"];
    if (!branchTraining) continue;

    for (const group in branchTraining) {
      subGroups.add(group);
      const trainingFields = branchTraining[group];

      for (const training in trainingFields) {
        const count = trainingFields[training];
        if (count !== null && !isNaN(count)) {
          if (!totals[training]) {
            totals[training] = 0;
          }
          totals[training] += count;
        }
      }
    }
  }

  return {
    groups: Array.from(subGroups),
    totals
  };
};



//get All Needed values
const getData = async (year, userData, type, month) => {
  const dataResult = {};
  try {
    const domain = userData?.username.split("@");
    const basePath = [domain[1], "AnalyticsData", "Reporting Data"];

    const collectionRef = collection(firestore, ...basePath);
    const q = query(collectionRef, where("year", "==", year));
    const querySnapshot = await getDocs(q);

    for (const docSnap of querySnapshot.docs) {
      const docData = docSnap.data();
      const module = docData?.type;
      let processedData = null;

      const isEmissionModule = scopeData.hasOwnProperty(module);

      if (type === "year") {
        let allMonthsData = {};

        for (let m = 1; m <= 12; m++) {
          if (docData[m]) {
            allMonthsData = {
              ...allMonthsData,
              ...docData[m],
            };
          }
        }

        if (isEmissionModule) {
          processedData = clubEmissions(docData, module);
        } else {
          switch (module) {
            case "Child Labor":
              processedData = clubChildLaborData(allMonthsData);
              break;
            case "CHS":
              processedData = clubCHSData(allMonthsData);
              break;
            case "Market Presence":
              processedData = clubMarketPresence(allMonthsData);
              break;
            case "Social Benefits":
              processedData = clubSocialBenefits(allMonthsData);
              break;
            case "Social-Overview": {
              let trainingEduData = {};

              for (let m = 1; m <= 12; m++) {
                const monthData = docData?.[m];
                if (!monthData) continue;

                for (const branch in monthData) {
                  const branchData = monthData[branch];
                  const monthTraining = branchData?.["Training and Edu"];
                  if (!monthTraining) continue;

                  // Initialize if branch not seen before
                  if (!trainingEduData[branch]) {
                    trainingEduData[branch] = { "Training and Edu": {} };
                  }

                  const existing = trainingEduData[branch]["Training and Edu"];

                  for (const group in monthTraining) {
                    if (!existing[group]) {
                      existing[group] = {};
                    }

                    const trainingFields = monthTraining[group];

                    for (const field in trainingFields) {
                      const value = trainingFields[field];
                      if (!existing[group][field]) {
                        existing[group][field] = 0;
                      }
                      if (value !== null && !isNaN(value)) {
                        existing[group][field] += value;
                      }
                    }
                  }
                }
              }

              if (Object.keys(trainingEduData).length > 0) {
                const processedTraining = clubTrainingEducation(trainingEduData);
                if (processedTraining && Object.keys(processedTraining).length > 0) {
                  dataResult["Training and Edu"] = processedTraining;
                }
              }
              continue;
            }

          }
        }

      } else {
        // Monthly type === "month"
        const monthData = docData?.[month];
        if (!monthData || Object.keys(monthData).length === 0) continue;

        if (isEmissionModule) {
          processedData = clubEmissions(docData, module);
        } else {
          switch (module) {
            case "Child Labor":
              processedData = clubChildLaborData(monthData);
              break;
            case "CHS":
              processedData = clubCHSData(monthData);
              break;
            case "Market Presence":
              processedData = clubMarketPresence(monthData);
              break;
            case "Social Benefits":
              processedData = clubSocialBenefits(monthData);
              break;
            case "Social-Overview": {
              let trainingEduData = {};

              for (const branch in monthData) {
                const branchData = monthData[branch];
                if (branchData?.["Training and Edu"]) {
                  trainingEduData[branch] = {
                    "Training and Edu": branchData["Training and Edu"],
                  };
                }
              }

              if (Object.keys(trainingEduData).length > 0) {
                const processedTraining = clubTrainingEducation(trainingEduData);
                if (processedTraining && Object.keys(processedTraining).length > 0) {
                  dataResult["Training and Edu"] = processedTraining;
                }
              }

              continue;
            }
          }
        }
      }

      if (processedData && Object.keys(processedData).length > 0) {
        dataResult[module] = processedData;
      }
    }

    return dataResult;
  } catch (error) {
    console.error("Error fetching data:", error);
    return {};
  }
};





const formatTrainingAndEduData = (data, type, month) => {
  const roles = ["BOD", "Employees", "Others", "Workers", "Personalles"];
  const result = {
    BOD: {},
    Employees: {},
    Others: {},
    Workers: {},
    Personalles: {},
  };

  for (const monthKey in data) {
    if (type === "month" && monthKey !== String(Number(month))) return;
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
    if (type === "month" && monthKey !== String(Number(month))) return;
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

function formatTop5EmissionsForBarChart(dataObj, type, month) {
  const emissions = {};

  const keysToInclude = [
    "Fuel", "Accommodation", "Refrigerant and other", "Business travel - land and sea",
    "Employees commuting", "Owned Vehicles", "Water", "Home Office", "WTT- fuels",
    "Freighting goods", "Materials", "Food", "Bioenergy", "Waste Disposal",
    "Elec heat cooling", "Flight"
  ];

  const processMonthData = (monthData) => {
    for (const region in monthData) {
      const regionData = monthData[region];

      for (const key of keysToInclude) {
        const value = regionData[key];
        if (typeof value === "number") {
          emissions[key] = (emissions[key] || 0) + value;
        }
      }
    }
  };

  if (type === "month") {
    const selectedMonthData = dataObj[month];
    if (selectedMonthData) {
      processMonthData(selectedMonthData);
    }
  } else if (type === "year") {
    for (const m in dataObj) {
      const monthData = dataObj[m];
      if (monthData) {
        processMonthData(monthData);
      }
    }
  }

  // Get top 5 emissions categories
  const sorted = Object.entries(emissions)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const labels = sorted.map(([key]) => key);
  const values = sorted.map(([, val]) => +(val / 1_000_000).toFixed(4)); // Normalize to millions

  return {
    labels,
    datasets: [
      {
        label: "Top 5 Emission Categories (in million tons)",
        data: values,
        backgroundColor: [ "#109ad8", "#45bf34", "#f26c35", "#4bc0c0","#9966ff"],
        borderColor: [ "#109ad8", "#45bf34", "#f26c35", "#4bc0c0","#9966ff"],
        borderWidth: 1
      }
    ]
  };
}



const formatNetWorthVsTurnoverData = (data, type, month) => {
  let netWorthData = 0;
  let turnoverData = 0;

  if (type === "month" && month) {
    // Only one month is needed for the comparison
    const monthData = data[month];
    if (monthData) {
      let totalNetWorth = 0;
      let totalTurnover = 0;

      Object.values(monthData).forEach(entry => {
        const eco = entry["Eco. Performance"] || {};
        totalNetWorth += parseFloat(eco["Total Revenue"] || 0);
        totalTurnover += parseFloat(eco["Total turnover"] || 0);
      });

      netWorthData = totalNetWorth;
      turnoverData = totalTurnover;
    }
  } else if (type === "year") {
    // Aggregate data for the whole year
    Object.values(data).forEach(monthData => {
      if (monthData) {
        let totalNetWorth = 0;
        let totalTurnover = 0;

        Object.values(monthData).forEach(entry => {
          const eco = entry["Eco. Performance"] || {};
          totalNetWorth += parseFloat(eco["Total Revenue"] || 0);
          totalTurnover += parseFloat(eco["Total turnover"] || 0);
        });

        netWorthData += totalNetWorth;
        turnoverData += totalTurnover;
      }
    });
  }

  return {
    labels: ["Net Worth", "Total Turnover"], // Only 2 bars
    datasets: [
      {
        label: "Net Worth vs Total Turnover",
        data: [netWorthData, turnoverData], // Data for each bar
        backgroundColor: ["#109ad8", "#f26c35"], // Color for the bars
        borderColor: ["#0a6a94", "#c23e08"],
        borderWidth: 1
      }
    ]
  };
};
const formatDirectValueChartData = (data, type, month) => {
  let distributedData = 0;
  let generatedData = 0;

  if (type === "month" && month) {
    // Only one month is needed for the comparison
    const monthData = data[month];
    if (monthData) {
      let totalDistributed = 0;
      let totalGenerated = 0;

      Object.values(monthData).forEach(entry => {
        const eco = entry["Eco. Performance"] || {};
        totalDistributed += parseFloat(eco["Direct economic value Distributed"] || 0);
        totalGenerated += parseFloat(eco["Direct economic value generated"] || 0);
      });

      distributedData = totalDistributed;
      generatedData = totalGenerated;
    }
  } else if (type === "year") {
    // Aggregate data for the whole year
    Object.values(data).forEach(monthData => {
      if (monthData) {
        let totalDistributed = 0;
        let totalGenerated = 0;

        Object.values(monthData).forEach(entry => {
          const eco = entry["Eco. Performance"] || {};
          totalDistributed += parseFloat(eco["Direct economic value Distributed"] || 0);
          totalGenerated += parseFloat(eco["Direct economic value generated"] || 0);
        });

        distributedData += totalDistributed;
        generatedData += totalGenerated;
      }
    });
  }

  return {
    labels: ["Direct Economic Value Distributed", "Direct Economic Value Generated"], // Only 2 bars
    datasets: [
      {
        label: "Direct Economic Value Comparison",
        data: [distributedData, generatedData], // Data for each bar
        backgroundColor: ["#4caf50", "#ff9800"], // Color for the bars
        borderColor: ["#357a38", "#e65100"],
        borderWidth: 1
      }
    ]
  };
};



const formatScopeDoughnutData = (data) => {
  // Check if data or scopeData are null or undefined
  if (!data || !scopeData) {
    console.error("Data or scopeData is null or undefined");
    return { // Return empty structure if either data or scopeData is undefined or null
      labels: ["Scope 1", "Scope 2", "Scope 3"],
      datasets: [{ label: "Emissions by Scope (in Millions)", data: [0, 0, 0], backgroundColor: ["#f44336", "#2196f3", "#4caf50"], borderColor: ["#b71c1c", "#0d47a1", "#1b5e20"], borderWidth: 1 }]
    };
  }

  const scopeSums = {
    "Scope 1": 0,
    "Scope 2": 0,
    "Scope 3": 0
  };

  // Log both data and scopeData to confirm their structure
  console.log("Data:", data);
  console.log("ScopeData:", scopeData);

  // Safely loop through scopeData and calculate emissions
  Object.entries(scopeData).forEach(([key, scope]) => {
    const total = data?.[key]?.total;

    // Log the total value for each key
    console.log(`Key: ${key}, Scope: ${scope}, Total: ${total}`);

    // Only add to scopeSums if total is a number
    if (typeof total === "number") {
      scopeSums[scope] += total;
    }
  });

  // Log scopeSums after calculation
  console.log("Scope Sums:", scopeSums);

  return {
    labels: ["Scope 1", "Scope 2", "Scope 3"],
    datasets: [
      {
        label: "Emissions by Scope (in Millions)",
        data: [
          +(scopeSums["Scope 1"] / 1_000_000).toFixed(2),
          +(scopeSums["Scope 2"] / 1_000_000).toFixed(2),
          +(scopeSums["Scope 3"] / 1_000_000).toFixed(2)
        ],
        backgroundColor: ["#f44336", "#2196f3", "#4caf50"],
        borderColor: ["#b71c1c", "#0d47a1", "#1b5e20"],
        borderWidth: 1
      }
    ]
  };
};
const generateScopeDoughnutChart = async (data) => {
  // Format the data using your formatter (make sure it's adjusted for bar chart formatting)
  const chartData = formatScopeDoughnutData(data, scopeData); // Same structure should work

  // Create a hidden canvas to draw the bar chart
  const canvas = document.createElement("canvas");
  canvas.width = 600;
  canvas.height = 400;
  canvas.style.display = "none";
  document.body.appendChild(canvas);

  // Assign random colors if not already in chartData
  chartData.datasets.forEach((dataset) => {
    dataset.backgroundColor = dataset.backgroundColor || dataset.data.map(() => 
      `hsl(${Math.floor(Math.random() * 360)}, 70%, 60%)`
    );
  });

  // Generate the bar chart
  new Chart(canvas, {
    type: "bar",
    data: chartData,
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: false,
        },
        title: {
          display: true,
          text: chartData.datasets[0].label || "Scope Emissions",
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: "Category",
          },
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "Emissions (kg CO₂)",
          },
        },
      },
    },
  });

  // Wait for chart rendering
  await new Promise((resolve) => setTimeout(resolve, 300));

  // Capture the chart as base64 image
  const dataUrl = canvas.toDataURL("image/png");
  const base64 = dataUrl.split(",")[1];

  // Remove the canvas
  canvas.remove();

  // Return as a docx paragraph with image
  return [
    new Paragraph({
      children: [
        new ImageRun({
          data: Uint8Array.from(atob(base64), (c) => c.charCodeAt(0)),
          transformation: {
            width: 500,
            height: 350,
          },
        }),
      ],
    }),
  ];
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

  // Get top 5 by value
  const top5Data = [...data].sort((a, b) => b.y - a.y).slice(0, 5);

  const colorPalette = [
    "#109ad8", "#45bf34", "#f26c35", "#4bc0c0", "#9966ff",
    "#ff9f40", "#fc8a6d", "#304dff", "#bbdbeb", "#e4acc4",
    "#ffd0a6", "#9cc079", "#1DE9B6", "#FFD600", "#00E5FF",
    "#FF4081", "#3D5AFE", "#8E24AA", "#AA00FF", "#76FF03", "#C51162", "#6200EA"
  ];

  const canvas = document.createElement("canvas");
  canvas.width = 800;
  canvas.height = 400;
  canvas.style.display = "none";
  document.body.appendChild(canvas);

  const chart = new Chart(canvas.getContext("2d"), {
    type: "treemap",
    data: {
      datasets: [{
        label: "Treemap",
        tree: top5Data,
        key: "y",
        groups: ["x"],
        spacing: 0,
        padding: 0,
        borderWidth: 0,
        backgroundColor: (ctx) => colorPalette[ctx.index % colorPalette.length],
      }]
    },
    options: {
      plugins: {
        title: {
          display: true,
          text: "Top 5 Emission Categories",
          font: { size: 20, weight: "bold" }
        },
        legend: {
          display: false
        },
        treemap: {
          labels: {
            display: true,
            color: "#000",
            font: {
              size: 14,
              weight: "bold"
            },
            formatter: (ctx) => {
              const percent = ((ctx.raw.y / top5Data.reduce((sum, d) => sum + d.y, 0)) * 100).toFixed(1);
              return `${ctx.raw.x} (${percent}%)`;
            }
          }
        },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const val = ctx.raw?.y;
              const percent = ((val / top5Data.reduce((sum, d) => sum + d.y, 0)) * 100).toFixed(1);
              return `${ctx.raw.x}: ${val} (${percent}%)`;
            }
          }
        }
      }
    }
  });

  await new Promise((resolve) => setTimeout(resolve, 500));

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
    new Paragraph("")
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
    type: "bar", // Bar chart
    data: {
      labels: labels,
      datasets: datasets.map(dataset => ({
        ...dataset,
        tension: 0.4, // smooth curves
        fill: false, // Bar chart doesn't require fill
        borderWidth: 1,
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
            text: "Category", // Label for x-axis
          },
        },
        y: {
          title: {
            display: true,
            text: "Amount (INR)", // Label for y-axis
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

const generateBarChartImage = async ({ labels, datasets, xLabel = "Emissions", yLabel = "Value" }) => {
  const paragraphs = [];

  const canvas = document.createElement("canvas");
  canvas.width = 800;
  canvas.height = 400;
  document.body.appendChild(canvas);
  canvas.style.display = "none"; // Hide during rendering

  const chart = new Chart(canvas.getContext("2d"), {
    type: "bar",
    data: {
      labels,
      datasets: datasets.map(dataset => ({
        ...dataset,
        tension: 0.4,
        fill: false,
        borderWidth: 1,
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
            text: xLabel,
          },
        },
        y: {
          title: {
            display: true,
            text: yLabel,
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

  // Assign distinct colors to each bar
  const backgroundColors = labels.map((_, index) =>
    `hsl(${(index * 360) / labels.length}, 70%, 60%)`
  );

  // Create hidden canvas
  const canvas = document.createElement("canvas");
  canvas.width = 500;
  canvas.height = 400;
  canvas.style.display = "none";
  document.body.appendChild(canvas);

  // Generate the Bar Chart
  new Chart(canvas, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Entity Roles",
          data: values,
          backgroundColor: backgroundColors,
        },
      ],
    },
    options: {
      responsive: false,
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: "Entity Role Distribution",
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "Count",
          },
        },
        x: {
          title: {
            display: true,
            text: "Role",
          },
        },
      },
    },
  });

  // Wait for rendering
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


const fetchData = async (userData, year, month, type) => {
  const domain = userData?.username.split("@");
  const env = `Environment-Overview-${year}`;
  const social = `Social-Overview-${year}`;
  const gov = `Governance-Overview-${year}`;

  const docRef = doc(firestore, domain[1], "AnalyticsData", "Reporting Data", env);
  const docRef2 = doc(firestore, domain[1], "AnalyticsData", "Reporting Data", social);
  const docRef3 = doc(firestore, domain[1], "AnalyticsData", "Reporting Data", gov);

  const docSnapshot = await getDoc(docRef);
  const docSnapshot2 = await getDoc(docRef2);
  const docSnapshot3 = await getDoc(docRef3);

  const envData = docSnapshot.data() || {};
  const socialData = docSnapshot2.data() || {};
  const govData = docSnapshot3.data() || {};

  const formattedTrainingData = formatTrainingAndEduData(socialData, type, month);
  const formattedTreeMapData = formatTop5EmissionsForBarChart(envData, type, month);
  const formattedAreaData1 = formatNetWorthVsTurnoverData(govData, type, month);
  const formattedAreaData2 = formatDirectValueChartData(govData, type, month);
  const doughNutData = transformEntityData(govData, type, month);

  const treePara = await generateBarChartImage({
    labels: formattedTreeMapData.labels,
    datasets: formattedTreeMapData.datasets,
    xLabel: "Emission Type",
    yLabel: "Emissions (Million Tons)"
  });
  
  const allTrainingTypes = Array.from(
    new Set(
      formattedTrainingData
        ? Object.values(formattedTrainingData)
          .flatMap(category => Object.entries(category))
          .filter(([_, value]) => value > 0)
          .map(([trainingType]) => trainingType)
        : []
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

  const trainingParagraphs = allTrainingTypes.length > 0
    ? await generateTrainingChart(series, allTrainingTypes)
    : [];

  const { labels, datasets } = formatEmploymentData(socialData, "year");
  const employmentParagraphs = datasets.length > 0
    ? await generateEmploymentChart(datasets, labels)
    : [];

  // const treeParagraphs = formattedTreeMapData.length > 0
  //   ? await generateTreemapChart(formattedTreeMapData)
  //   : [];

  const area1Paragraphs = formattedAreaData1.datasets?.length > 0
    ? await generateNetWorthVsTurnoverChart(formattedAreaData1.datasets, formattedAreaData1.labels)
    : [];

  const area2Paragraphs = formattedAreaData2.datasets?.length > 0
    ? await generateNetWorthVsTurnoverChart(formattedAreaData2.datasets, formattedAreaData2.labels)
    : [];

  const entityChartSection = Object.keys(doughNutData).length > 0 > 0
    ? await generateEntityChart(doughNutData)
    : [];

  return {
    entity: entityChartSection,
    training: trainingParagraphs,
    employment: employmentParagraphs,
    tree: treePara,
    area1: area1Paragraphs,
    area2: area2Paragraphs,
  };
};



const generateDocx = async (master, year, userData, type = "year", month = 1) => {
  const DataObj = await getData(year, userData, type, Number(month));
  const imgObj = await fetchData(userData, year, month, type);
  const scopeChart = await generateScopeDoughnutChart(DataObj);

  const docContent = [
    new Paragraph({ text: "ESG Report", heading: "Title" }),
    new Paragraph({ text: "Organization Details", heading: "Heading1" }),
    new Paragraph(`Name of the Organization: ${master.organisationName}`),
    new Paragraph(`Year: ${year}`),
    new Paragraph(`Country: ${master?.country}`),
    new Paragraph(`Framework: ${master?.reportingType?.join(", ")}`),

    new Paragraph(""),
    horizontalLine,
    new Paragraph(""),

    new Paragraph({ text: "Environmental Data (E)", heading: "Heading1", bold: true }),
    new Paragraph(""),
  ];

  docContent.push(
    new Paragraph({ text: "Emissions by Scope", heading: "Heading2", bold: true }),
    ...scopeChart,
    new Paragraph("")
  );

  if (imgObj.tree?.length > 0) {
    docContent.push(
      new Paragraph({ text: "Emission by Category", heading: "Heading2", bold: true }),
      ...imgObj.tree,
      new Paragraph("")
    );
  }

  docContent.push(
    new Table({
      width: { size: 100, type: "pct" },
      columnWidths: [2000, 5000, 3000],
      rows: [
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph("Scopes")] }),
            new TableCell({ children: [new Paragraph("Category")] }),
            new TableCell({ children: [new Paragraph("Emission (kg CO₂)")] }),
          ],
        }),
        ...Object.entries(DataObj)
          .filter(([category]) => scopeData.hasOwnProperty(category))
          .map(([category, val]) =>
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph(scopeData[category] || "Unknown Scope")] }),
                new TableCell({ children: [new Paragraph(category)] }),
                new TableCell({ children: [new Paragraph(val.total.toFixed(4))] }),
              ],
            })
          ),
      ],
    }),
    new Paragraph("")
  );

  docContent.push(new Paragraph({ text: "Social Data (S)", heading: "Heading1", bold: true }));
  docContent.push(new Paragraph(""));

  if (imgObj.employment?.length > 0) {
    docContent.push(
      new Paragraph({ text: "Employment", heading: "Heading2", bold: true }),
      ...imgObj.employment,
      new Paragraph("")
    );
  }

  if (DataObj["Training and Edu"] && imgObj.training?.length > 0) {
    const trainingData = DataObj["Training and Edu"];
    const totalTrainings = Object.values(trainingData.totals).reduce((sum, val) => sum + val, 0);
    const nonZeroTopics = Object.entries(trainingData.totals)
      .filter(([_, val]) => val > 0)
      .map(([topic]) => topic.toLowerCase());
    const topicsSentence = nonZeroTopics.join(", ");

    docContent.push(
      new Paragraph({ text: "Training and Education", heading: "Heading2", bold: true }),
      new Paragraph(
        `The company places a strong emphasis on training for all members of the organization, including the Board of Directors, employees, and workers. It strives to conduct as many training sessions as possible within each reporting period. A total of ${totalTrainings} training sessions were conducted during the reporting period, focusing on topics such as ${topicsSentence}.`
      ),
      new Paragraph(""),
      ...imgObj.training,
      new Paragraph("")
    );
  }

  if (DataObj["Child Labor"]) {
    const child = DataObj["Child Labor"];
    const childText = Object.entries(child)
      .filter(([_, val]) => val > 0)
      .map(([level, count]) => `${count} ${level.toLowerCase()} level`)
      .join(", ");

    if (childText) {
      docContent.push(
        new Paragraph({ text: "Child Labor", heading: "Heading2", bold: true }),
        new Paragraph(
          `There were ${childText} cases of child labour identified, highlighting the need for stricter monitoring and compliance with labour laws to uphold ethical supply chain practices.`
        ),
        new Paragraph("")
      );
    }
  }

  if (DataObj["CHS"]) {
    const chs = DataObj["CHS"];
    docContent.push(
      new Paragraph({ text: "Customer Health and Safety", heading: "Heading2", bold: true }),
      new Paragraph(
        `During the reporting period, a total of ${chs["No. of non-compliance Incidents"] || 0} non-compliance incidents related to customer health and safety were recorded, affecting ${chs["Customers Impacted"] || 0} customers. This underscores the importance of continuous improvement in safeguarding consumer interests.`
      ),
      new Paragraph("")
    );
  }

  if (DataObj["Social Benefits"]) {
    const social = DataObj["Social Benefits"];
    docContent.push(
      new Paragraph({ text: "Social Benefits", heading: "Heading2", bold: true }),
      new Paragraph("The company provides various social benefits, reinforcing its commitment to employee welfare and community development."),
      new Paragraph(
        `With an investment of ₹${social["Expenditure"]}, the initiative has successfully impacted ${social["No. of Beneficiaries"]} individuals, fostering tangible improvements and driving meaningful progress in the area.`
      ),
      new Paragraph("")
    );
  }

  docContent.push(new Paragraph({ text: "Governance Data (G)", heading: "Heading1" }), new Paragraph(""));

  if (imgObj.area1?.length > 0) {
    docContent.push(
      new Paragraph({ text: "Economic Performance", heading: "Heading2", bold: true }),
      ...imgObj.area1,
      new Paragraph("")
    );
  }

  if (imgObj.area2?.length > 0) {
    docContent.push(
      ...imgObj.area2,
      new Paragraph("")
    );
  }

  if (imgObj.entity?.length > 0) {
    docContent.push(
      new Paragraph({ text: "Entity", heading: "Heading2", bold: true }),
      ...imgObj.entity,
      new Paragraph("")
    );
  }

  if (DataObj["Market Presence"]) {
    const mp = DataObj["Market Presence"];
    docContent.push(
      new Paragraph({ text: "Market Presence", heading: "Heading2", bold: true }),
      new Paragraph(
        `Markets served by the entity: ${mp["Markets served by the entity nationally"] || 0} nationally, ${mp["Markets served by the entity internationally"] || 0} internationally.`
      ),
      new Paragraph("")
    );
  }

  const doc = new Document({
    sections: [{ children: docContent }],
  });

  Packer.toBlob(doc).then((blob) => {
    saveAs(blob, "ESG_Report.docx");
  });
};






export default generateDocx;
