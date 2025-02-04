import { useState, useEffect } from 'react';
import { firestore } from '../firebase';
import { getDocs, collection, query, where } from "firebase/firestore";
import LineChart from "../components/LineChart";
import SocialGraph from "../components/SocialGraph";
import BubbleChart from "../components/BubbleChart";
import { useSidebar } from "../context/SidebarContext";

const Analytics = () => {
  const { module, userData, master } = useSidebar();
  const [year, setYear] = useState();
  const [entityType,setEntityType] = useState("BOD");
  const [fetchedData, setFetchedData] = useState(null);  // State to store fetched data
  let filterList=[];
  let monthFilterList=[]
  let yearWiseData;
  let monthData;
  console.log(module);

  

const transformMonthWiseData = (data, selectedYear) => {
    const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    // Initialize empty array for each month
    let emissionData = new Array(12).fill(0);

    // Find the entry for the selected year
    const yearData = data?.find(entry => entry.year == selectedYear);
    if (!yearData) return { labels: monthLabels, datasets: [] };

    // Loop through the months (10, 11, etc.), ensuring numerical keys are considered
    Object.entries(yearData).forEach(([monthKey, monthData]) => {
        if (!isNaN(monthKey) && monthKey !== "year" && monthKey !== "type") {
            const monthIndex = parseInt(monthKey, 10) - 1; // Convert 10 -> 9 (Oct), 11 -> 10 (Nov), etc.
            if (monthIndex >= 0 && monthIndex < 12) {
                let totalEmission = 0;

                // Sum up all values in the month data
                Object.values(monthData).forEach(locationData => {
                    Object.entries(locationData).forEach(([key, value]) => {
                        if (key.includes("Emission")) {
                            totalEmission += Number(value) || 0;
                        }
                    });
                });

                emissionData[monthIndex] = totalEmission; // Assign total emission to the correct month
            }
        }
    });

    return {
        labels: monthLabels,
        datasets: [
            {
                label: "Emission %",
                data: emissionData,
                backgroundColor: "#4BA0B6",
                borderColor: "#4BA0B6",
                borderWidth: 1,
            }
        ],
    };
};
function transformDataForGraph(backendData, selectedYear) {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  const monthWiseData = {
    labels: months,
    datasets: []
  };

  // Find the entry for the selected year
  const yearData = backendData?.find(entry => entry.year == selectedYear);
  if (!yearData) return monthWiseData; // Return empty if year not found
  
  const metricsMap = {}; // Store data for each metric

  Object.entries(yearData).forEach(([key, monthData]) => {
    if (key === "year" || key === "type") return;

    const monthIndex = parseInt(key, 10) - 1; // Convert month number to index
    if (isNaN(monthIndex) || monthIndex < 0 || monthIndex >= 12) return;

    Object.values(monthData).forEach((locationData) => {
      Object.entries(locationData).forEach(([metric, value]) => {
        if (!metricsMap[metric]) {
          metricsMap[metric] = new Array(12).fill(0);
        }
        metricsMap[metric][monthIndex] += Number(value) || 0;
      });
    });
  });

  Object.entries(metricsMap).forEach(([metric, data]) => {
    monthWiseData.datasets.push({
      label: metric,
      data: data,
      backgroundColor: "#4BA0B6",
      borderColor: "#4BA0B6",
      borderWidth: 1,
    });
  });

  return monthWiseData;
}
function transformDataForGraphByYear(backendData) {
  const yearWiseData = {
    labels: [],
    datasets: []
  };

  // Create a map to store metrics data by year
  const metricsMap = {};

  // Iterate over all the data to group by year
  backendData?.forEach(yearData => {
    const year = yearData.year;
    if (!yearWiseData.labels.includes(year)) {
      yearWiseData.labels.push(year); // Add year to labels
    }

    // Iterate through each month data
    Object.entries(yearData).forEach(([key, monthData]) => {
      if (key === "year" || key === "type") return;

      Object.values(monthData).forEach(locationData => {
        Object.entries(locationData).forEach(([metric, value]) => {
          if (!metricsMap[metric]) {
            metricsMap[metric] = new Array(yearWiseData.labels.length).fill(0);
          }

          const yearIndex = yearWiseData.labels.indexOf(year);
          metricsMap[metric][yearIndex] += Number(value) || 0;
        });
      });
    });
  });

  // Push data into the datasets
  Object.entries(metricsMap).forEach(([metric, data]) => {
    yearWiseData.datasets.push({
      label: metric,
      data: data,
      backgroundColor: "#4BA0B6",
      borderColor: "#4BA0B6",
      borderWidth: 1,
    });
  });

  return yearWiseData;
}



console.log("A",transformDataForGraph(fetchedData,"2024"))
console.log('B',transformDataForGraphByYear(fetchedData));



  const monthWiseData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    datasets: [
      {
        label: "Emission %",
        data: [25, 90, 60, 70, 60, 80, 85, 60, 70, 95, 75, 30],
        backgroundColor: "#4BA0B6",
        borderColor: "#4BA0B6",
        borderWidth: 1,
      },
      {
        label: "Emission %",
        data: [25, 90, 60, 70, 60, 80, 85, 60, 70, 95, 75, 30],
        backgroundColor: "#4BA0B6",
        borderColor: "#4BA0B6",
        borderWidth: 1,
      },
      {
        label: "Emission %",
        data: [25, 90, 60, 70, 60, 80, 85, 60, 70, 95, 75, 30],
        backgroundColor: "#4BA0B6",
        borderColor: "#4BA0B6",
        borderWidth: 1,
      },
    ],
  };

  function entityTransform(data) {
    const labels = [];
    const dataObj = {};
    const uniqueEntityTypes = new Set();  // To store unique entity types

    // Loop through the data and extract labels and entity type information
    data?.forEach(entry => {
        const year = entry.year;
        if (!labels.includes(year)) labels.push(year);

        const yearData = entry[Object.keys(entry).find(key => key !== 'year' && key !== 'type')];

        // Initialize the arrays for Male, Female, Others for each year
        Object.values(yearData).forEach(locationData => {
            Object.entries(locationData?.EntityType)?.forEach(([entityType, count]) => {
                uniqueEntityTypes.add(entityType);  // Collect unique entity types

                if (!dataObj[entityType]) {
                    // Initialize arrays for Male, Female, Others with default 0 values
                    dataObj[entityType] = { Male: [], Female: [], Others: [] };
                }

                // Add headcount based on gender, grouped by year
                labels.forEach((label, index) => {
                    const genderData = locationData.Gender || {};
                    if (label === year) {
                        // For the current year, add gender counts
                        dataObj[entityType].Male[index] = genderData.Male || 0;
                        dataObj[entityType].Female[index] = genderData.Female || 0;
                        dataObj[entityType].Others[index] = genderData.Others || 0;
                    }
                });
            });
        });
    });

    // Convert the Set to an array
    const entityTypes = Array.from(uniqueEntityTypes);

    return { labels, dataObj, entityTypes };
}
function retentionTransform(data) {
  const transformedData = [];
  const uniqueEmployeeTypes = new Set();

  data?.forEach(entry => {
      const year = entry.year;
      let menCount = 0, womenCount = 0, othersCount = 0;

      // Loop through each month's data
      Object.entries(entry).forEach(([key, monthData]) => {
          if (!isNaN(key)) { // Ensure it's a month key
              Object.values(monthData).forEach(locationData => {
                  if (!locationData.EmployeeType) return;

                  // Collect unique employee types
                  Object.keys(locationData.EmployeeType).forEach(empType => {
                      uniqueEmployeeTypes.add(empType);
                  });

                  const genderData = locationData.Gender || {};
                  menCount += genderData.Male || 0;
                  womenCount += genderData.Female || 0;
                  othersCount += genderData.Others || 0;
              });
          }
      });

      // Push formatted data
      transformedData.push({ year, men: menCount, women: womenCount, others: othersCount });
  });

  return {
      transformedData,
      employeeTypes: Array.from(uniqueEmployeeTypes)
  };
}
function convertMonthData(monthData) {
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Iterate over all months, setting values to 0 if missing
  return months.map((month, index) => {
    const monthNum = index + 1; // Get the month number (1-12)
    const data = monthData[monthNum] || { men: 0, women: 0, others: 0 }; // Default to 0 if data is missing
    return {
      month,
      men: data.men,
      women: data.women,
      others: data.others
    };
  });
}


  // const sampleData = [
  //   { year: 2001, men: 75, women: 50, others: 25 },
  //   { year: 2002, men: 65, women: 55, others: 35 },
  //   { year: 2003, men: 50, women: 60, others: 45 },
  //   { year: 2004, men: 55, women: 65, others: 75 },
  //   { year: 2005, men: 45, women: 70, others: 65 },
  //   { year: 2006, men: 60, women: 65, others: 50 },
  //   { year: 2007, men: 50, women: 55, others: 40 },
  //   { year: 2008, men: 55, women: 50, others: 45 },
  //   { year: 2009, men: 65, women: 45, others: 50 },
  //   { year: 2010, men: 75, women: 35, others: 55 },
  // ];

  const linesConfig = [
    { dataKey: "men", color: "#1E90FF" },
    { dataKey: "women", color: "#FF4500" },
    { dataKey: "others", color: "#800080" },
  ];

  const bubbleData = {
    datasets: [
      {
        label: "Dataset 1",
        data: [
          { x: 10, y: 20, r: 15 },
          { x: 30, y: 10, r: 10 },
          { x: 15, y: 25, r: 20 },
        ],
        backgroundColor: "rgba(54, 162, 235, 0.6)",
      },
      {
        label: "Dataset 2",
        data: [
          { x: 5, y: 15, r: 10 },
          { x: 25, y: 5, r: 15 },
          { x: 20, y: 30, r: 18 },
        ],
        backgroundColor: "rgba(255, 99, 132, 0.6)",
      },
    ],
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!userData || !master) {
        console.log(userData, master);
        return;
      }

      yearWiseData=[]

      try {
        var monthYear = master?.currentReportingCycle;

        // Reference to the Firestore collection
        const collectionRef = collection(firestore, userData?.domain, "AnalyticsData", "Reporting Data");

        // Query documents where the name contains the module
        const q = query(collectionRef, where("type", "==", module));
        // Fetch documents
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          // Iterate through the documents and log them
          querySnapshot.forEach((docSnap) => {
            console.log("Fetched Data here ding ding:", docSnap.data());
          });

          // You can also store this data if you need
          const data = querySnapshot.docs.map(doc => doc.data());
          setFetchedData(data);  // Store the fetched data in state
        } else {
          console.log("No documents matching the query.");
        }
      } catch (error) {
        console.error("Error fetching documents: ", error);
      }
    };
    fetchData(); // ✅ Call async function correctly
  }, [userData, master, module]); // ✅ Dependencies

  useEffect(()=>{
    setYear(null)
    yearWiseData=null;
    monthData=null;
  },[module])

  function monthTransform(data, year) {
    const monthLabels = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun", 
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    const monthDataObj = {}; // To store month data
    const uniqueEntityTypes = new Set(); // To store unique entity types
    
    // If no year is provided (year is null or undefined), return data for all years
    const isYearProvided = year != null;  // Check for null or undefined

    // Loop through the data for each year
    data?.forEach(entry => {
        const Year = entry.year;

        // If year is not provided, process all years. If year is provided, match with the entry's year.
        if (!isYearProvided || Year === year.toString()) {  
            // Loop through the months in the data (keyed by numbers like "10", "11", etc.)
            Object.entries(entry).forEach(([month, monthData]) => {
                if (month !== "year" && month !== "type") {  // Skip "year" and "type" keys
                    const monthIndex = parseInt(month, 10) - 1;  // Convert month number (1-12) to 0-indexed array
                    const monthName = monthLabels[monthIndex]; // Get month name from the array

                    // Initialize monthDataObj for the month if it doesn't exist
                    if (!monthDataObj[monthName]) {
                        monthDataObj[monthName] = { men: 0, women: 0, others: 0 };
                    }

                    // Loop through each location and entity type
                    Object.entries(monthData).forEach(([location, locationData]) => {
                        // Collect gender data for the given month
                        const genderData = locationData.Gender || {};
                        monthDataObj[monthName].men += genderData.Male || 0;
                        monthDataObj[monthName].women += genderData.Female || 0;
                        monthDataObj[monthName].others += genderData.Others || 0;

                        // Collect entity types and counts
                        Object.entries(locationData.EntityType).forEach(([entityType, count]) => {
                            uniqueEntityTypes.add(entityType);  // Collect unique entity types
                        });
                    });
                }
            });
        }
    });

    // Convert the Set to an array for entity types
    const entityTypes = Array.from(uniqueEntityTypes);

    // Prepare the datasets for the chart
    const maleData = [];
    const femaleData = [];
    const othersData = [];

    // Map the monthDataObj to the chart data
    monthLabels.forEach(month => {
        const monthData = monthDataObj[month] || { men: 0, women: 0, others: 0 };
        maleData.push(monthData.men);
        femaleData.push(monthData.women);
        othersData.push(monthData.others);
    });

    // Return the chart-friendly data
    return {
        labels: monthLabels,
        datasets: [
            {
                label: "Male",
                data: maleData,
                backgroundColor: "#2586d6",
                borderColor: "#2586d6",
                borderWidth: 1
            },
            {
                label: "Female",
                data: femaleData,
                backgroundColor: "#d72528",
                borderColor: "#d72528",
                borderWidth: 1
            },
            {
                label: "Others",
                data: othersData,
                backgroundColor: "#8b24d7",
                borderColor: "#8b24d7",
                borderWidth: 1
            }
        ]
    };
}
  
  const ecoPerformanceTransform = (fetchedData) => {
    // Prepare the chart data object with labels for years
    const chartData = {
      labels: [],
      datasets: [
        {
          label: "Total Turnover",
          data: [],
          backgroundColor: "#4ba9dd",
          borderColor: "#4ba9dd",
          borderWidth: 1,
        },
        {
          label: "Direct Economic Value Distributed",
          data: [],
          backgroundColor: "#ffae55",
          borderColor: "#ffae55",
          borderWidth: 1,
        },
        
        {
          label: "Financial Assistance from Governments",
          data: [],
          backgroundColor: "#e34545",
          borderColor: "#e34545",
          borderWidth: 1,
        },
      ],
    };
  
    // Loop through the fetchedData
    fetchedData?.forEach((yearData) => {
      const year = yearData.year; // Get the year
      chartData.labels.push(year); // Add the year to the labels
  
      // Loop through the regions inside each year (10, 11, 01, etc.)
      Object.keys(yearData)?.forEach((regionKey) => {
        // Skip the year and type keys
        if (regionKey === 'year' || regionKey === 'type') return;
  
        // For each region, aggregate the required data
        const region = yearData[regionKey];
  
        let totalTurnover = 0;
        let directEconomicValue = 0;
        // let totalRevenue = 0;
        let financialAssistance = 0;
  
        // Accumulate values from all regions under this year
        Object.keys(region).forEach((regionName) => {
          const regionData = region[regionName]?.data; // Safely access region data
  
          // Check if regionData exists before accessing the properties
          if (regionData) {
            totalTurnover += parseFloat(regionData["Total turnover"]) || 0;
            directEconomicValue += parseFloat(regionData["Direct economic value Distributed"]) || 0;
            // totalRevenue += parseFloat(regionData["Total Revenue"]) || 0;
            financialAssistance += parseFloat(regionData["Financial assistance received from governments"]) || 0;
          }
        });
  
        // Push the accumulated values into the corresponding dataset
        chartData.datasets[0].data.push(totalTurnover);
        chartData.datasets[1].data.push(directEconomicValue);
        // chartData.datasets[2].data.push(totalRevenue);
        chartData.datasets[2].data.push(financialAssistance);
      });
    });
    
    console.log(chartData)
    return chartData;
  };
//   const ecoPerformanceTransform = (fetchedData) => {
//     if (!fetchedData || fetchedData.length === 0) return { labels: [], datasets: [] };

//     const chartData = {
//         labels: [],
//         datasets: [],
//     };

//     const allKeys = new Set();

//     // Collect all unique keys dynamically from the dataset
//     fetchedData.forEach((yearData) => {
//         Object.keys(yearData).forEach((monthKey) => {
//             if (monthKey !== "year" && monthKey !== "type") {
//                 Object.values(yearData[monthKey]).forEach((regionData) => {
//                     if (typeof regionData === "object") {
//                         Object.keys(regionData).forEach((key) => allKeys.add(key));
//                     }
//                 });
//             }
//         });
//     });

//     // Convert unique keys into dataset structures
//     allKeys.forEach((key) => {
//         chartData.datasets.push({
//             label: key,
//             data: [],
//             backgroundColor: getRandomColor(),
//             borderColor: getRandomColor(),
//             borderWidth: 1,
//         });
//     });

//     // Populate data dynamically year-wise
//     fetchedData.forEach((yearData) => {
//         chartData.labels.push(yearData.year); // Add year label

//         // Initialize an object to store aggregated values for this year
//         const aggregatedValues = {};
//         allKeys.forEach((key) => (aggregatedValues[key] = 0));

//         // Loop through months (10, 11, etc.)
//         Object.keys(yearData).forEach((monthKey) => {
//             if (monthKey !== "year" && monthKey !== "type") {
//                 Object.values(yearData[monthKey]).forEach((regionData) => {
//                     if (typeof regionData === "object") {
//                         Object.keys(regionData).forEach((key) => {
//                             if (allKeys.has(key)) {
//                                 aggregatedValues[key] += parseFloat(regionData[key]) || 0;
//                             }
//                         });
//                     }
//                 });
//             }
//         });

//         // Push aggregated values into the corresponding dataset
//         chartData.datasets.forEach((dataset) => {
//             dataset.data.push(aggregatedValues[dataset.label]);
//         });
//     });
//     console.log("hoi",chartData)
//     return chartData;
// };

// // Function to generate random colors for datasets
// const getRandomColor = () => {
//     const colors = ["#4BA0B6", "#FFAE55", "#E34545", "#4BA9DD", "#A55EEA", "#45D68D"];
//     return colors[Math.floor(Math.random() * colors.length)];
// };


  const transformBubbleChartData = (backendDataArray) => {
    const bubbleData = { datasets: [] };

    backendDataArray?.forEach((backendData) => {
        const year = parseInt(backendData.year); // Extract year for x-axis

        // Iterate over each module (e.g., "10")
        Object.entries(backendData).forEach(([key, locations]) => {
            if (key === "year" || key === "type") return; // Skip metadata

            Object.entries(locations).forEach(([location, locationData]) => {
                if (!locationData.Segment) return;

                Object.entries(locationData.Segment).forEach(([segment, data]) => {
                    const avgHours = data["Avg Hours per batch"] || 0;
                    const headCount = data["Head Count"] || 0;

                    // Ensure the segment has a dataset
                    let dataset = bubbleData.datasets.find(ds => ds.label === segment);
                    if (!dataset) {
                        dataset = {
                            label: segment,
                            data: [],
                            backgroundColor: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.6)`,
                        };
                        bubbleData.datasets.push(dataset);
                    }

                    // Add data point
                    dataset.data.push({
                        x: year, // Year on x-axis
                        y: avgHours, // Avg hours on y-axis
                        r: headCount / 10, // Scale head count for bubble size
                    });
                });
            });
        });
    });

    return bubbleData;
};

const processDataForGraph= (data)=> {
  const monthMap = {
    "01": "Jan", "02": "Feb", "03": "Mar", "04": "Apr", "05": "May", "06": "Jun",
    "07": "Jul", "08": "Aug", "09": "Sep", "10": "Oct", "11": "Nov", "12": "Dec"
  };

  // Initialize result structure
  let graphData = {
    labels:  ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    datasets: [
      { label: "Total Turnover", data: Array(12).fill(0), backgroundColor: "#4ba9dd", borderColor: "#4ba9dd", borderWidth: 1 },
      { label: "Direct Economic Value Distributed", data: Array(12).fill(0), backgroundColor: "#ffae55", borderColor: "#ffae55", borderWidth: 1 },
      { label: "Financial Assistance from Governments", data: Array(12).fill(0), backgroundColor: "#e34545", borderColor: "#e34545", borderWidth: 1 },
    ]
  };

  console.log("this is what i got",data)

  // Filter data by year
  const filteredData = data?.filter(entry => entry.year == year);

  filteredData?.forEach(entry => {
    Object.keys(entry).forEach(key => {
      if (monthMap[key]) {
        let monthIndex = parseInt(key) - 1; // Convert to 0-based index

        Object.values(entry[key]).forEach(location => {
          let financialData = location.data;
          graphData.datasets[0].data[monthIndex] += parseFloat(financialData["Total turnover"] || 0);
          graphData.datasets[1].data[monthIndex] += parseFloat(financialData["Direct economic value generated"] || 0);
          graphData.datasets[2].data[monthIndex] += parseFloat(financialData["Financial assistance received from governments"] || 0);
        });
      }
    });
  });

  return graphData;
}

function retentionByMonth(data, targetYear) {
  const groupedData = [];

  data?.forEach(entry => {
      if (entry.year === targetYear) {
          const year = entry.year;
          
          // Initialize month-based counters
          const monthData = {};
          
          // Loop through each month's data
          Object.entries(entry).forEach(([key, monthDataObj]) => {
              if (!isNaN(key)) { // Ensure it's a month key
                  const month = key; // month number as string
                  let menCount = 0, womenCount = 0, othersCount = 0;

                  Object.values(monthDataObj).forEach(locationData => {
                      if (!locationData.EmployeeType) return;

                      const genderData = locationData.Gender || {};
                      menCount += genderData.Male || 0;
                      womenCount += genderData.Female || 0;
                      othersCount += genderData.Others || 0;
                  });

                  // Store the aggregated data for this month
                  monthData[month] = { men: menCount, women: womenCount, others: othersCount };
              }
          });

          // Push the year and month-level data
          groupedData.push({ year, monthData });
      }
  });

  return groupedData;
}

const groupByMonthBubble = (data) => {
  const monthlyData = {};
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Initialize empty datasets for all months
  monthNames.forEach(month => {
    monthlyData[month] = [];
  });

  // Iterate through the data to process each entry for the given year
  data.forEach(item => {
    if (item.year === year.toString()) {
      Object.keys(item).forEach(key => {
        const locationData = item[key];

        // Iterate over the locations and check if 'Segment' exists
        Object.keys(locationData).forEach(location => {
          const segmentData = locationData[location].Segment;

          if (!segmentData) return; // Skip if no segment data

          // Now iterate over each segment and group by month
          Object.keys(segmentData).forEach(segment => {
            const segmentInfo = segmentData[segment];

            const avgHours = segmentInfo["Avg Hours per batch"];
            const headCount = segmentInfo["Head Count"];

            const month = key; // This should now directly be the month number (e.g., '10' for October)
            const monthName = monthNames[parseInt(month) - 1];

            if (!monthName) return;

            // Add data for the month, if available, else keep default (0)
            monthlyData[monthName].push({
              x: monthName, // Month name as x-axis value (e.g., "October")
              y: avgHours || 0,   // Avg Hours per batch as y-axis value
              r: headCount || 0   // Head Count as radius value
            });
          });
        });
      });
    }
  });

  // Format the data for Bubble Chart
  const bubbleData = {
    datasets: []
  };

  // Convert monthlyData to dataset for bubble chart (group by month)
  Object.keys(monthlyData).forEach(month => {
    bubbleData.datasets.push({
      label: month, // Use the full month name as the label
      data: monthlyData[month],
      backgroundColor: "rgba(97, 234, 227, 0.6)", // Example color
    });
  });

  return bubbleData;
};
  switch(module){
    case "Entity":
      console.log(entityTransform(fetchedData))
    console.log(monthTransform(fetchedData))
    var {labels,dataObj,entityTypes}=entityTransform(fetchedData)
    filterList=entityTypes
    if(dataObj){
      console.log(dataObj[entityType])
    }
    yearWiseData={
      labels:labels,
      datasets:[
        {
          label: "Male",
          data: dataObj[entityType]?.Male ?? [],
          backgroundColor: "#2586d6",
          borderColor: "#2586d6",
          borderWidth: 1,
        },
        {
          label: "Female",
          data: dataObj[entityType]?.Female ?? [],
          backgroundColor: "#d72528",
          borderColor: "#d72528",
          borderWidth: 1,
        },
        {
          label: "Others",
          data: dataObj[entityType]?.Others ?? [],
          backgroundColor: "#8b24d7",
          borderColor: "#8b24d7",
          borderWidth: 1,
        },

      ]
    }
    if(year){
    monthData=monthTransform(fetchedData,year)
    }
    console.log(monthData)
    break
    case "Employment":
    case "Retention":
      var data=retentionTransform(fetchedData)
      yearWiseData=data.transformedData
      filterList=data.employeeTypes
      console.log("hi",yearWiseData)
      if(year)
      {
        // console.log(JSON.stringify(retentionByMonth(fetchedData,year).find(entry => entry.year === year).monthData))
      monthData=convertMonthData(retentionByMonth(fetchedData,year)?.find(entry => entry.year === year)?.monthData)}
      break
    case "Eco. Performance":
      yearWiseData=ecoPerformanceTransform(fetchedData)
      console.log("che",fetchedData)
      var chartData = processDataForGraph(fetchedData);
      console.log(JSON.stringify(chartData),null,2);
      monthData=chartData;
      break
    case "Training and Edu":
      yearWiseData=transformBubbleChartData(fetchedData)
      if(year)monthData=groupByMonthBubble(fetchedData)
      console.log("ey",yearWiseData)
      break

    case "Social Benefits":
    case "Customer Privacy":
    case "Child Labor":
    case "CHS":
    case "Mktg and Labelling":
      yearWiseData=transformDataForGraphByYear(fetchedData)
      if(year)monthData=transformDataForGraph(fetchedData,year)
      break;
    

  }

  console.log(fetchedData)

  console.log("check",filterList)

  console.log("mon",monthData)

  
  console.log(transformMonthWiseData(fetchedData,"2024"));


  
  return (
    <div className="flex flex-col justify-center items-center p-5 gap-5">
      <div className=" bg-white rounded-lg w-full p-3">
        <div className="flex justify-between px-3 mb-3">
          <div className="font-bold text-lg text-slate-600">YEAR-WISE</div>
          <div className="flex gap-24 items-center">
            {/* <div className=" flex gap-3 items-center">
              <div className="w-4 h-4 rounded-full bg-[#3d9f86]"></div>
              <div>Emission %</div>
            </div> */}
            {filterList.length>0 && 
            <select onChange={(e)=>{setEntityType(e.target.value)}} className="border rounded-xl border-[#29C472] px-3 py-2">
              {filterList.map((val,index)=>{
                return(<option key={index} >{val}</option>)
              })}
            </select>
            }
          </div>
        </div>
        {/* Display charts based on fetched data */}
        {module == "Fuel" && <SocialGraph data={monthWiseData} setYear={setYear} />}
        {module == "Retention" && (
          <LineChart data={yearWiseData} lines={linesConfig} xKey="year" yLabel="Number of People" setYear={setYear} />
        )}
        {module == "Employment" && (
          <LineChart data={yearWiseData} lines={linesConfig} xKey="year" yLabel="Number of People" setYear={setYear} />
        )}
        {module == "Entity" && <SocialGraph data={yearWiseData} stacked={true} setYear={setYear} />}
        {module == "Mktg and Labelling" && <SocialGraph data={yearWiseData} stacked={true} setYear={setYear} />}
        {module == "Customer Privacy" && <SocialGraph data={yearWiseData} stacked={true} setYear={setYear} />}
        {module == "Child Labor" && <SocialGraph data={yearWiseData} stacked={true} setYear={setYear} />}
        {module == "CHS" && <SocialGraph data={yearWiseData} stacked={true} setYear={setYear} />}
        {module == "Social Benefits" && <SocialGraph data={yearWiseData} stacked={true} setYear={setYear} />}
        {module == "Eco. Performance" && <SocialGraph data={yearWiseData} setYear={setYear} />}
        {module == "Training and Edu" && <BubbleChart data={yearWiseData} setYear={setYear} />}
      </div>
      {year && (
        <div className=" bg-white rounded-lg w-full p-3">
          <div className="flex justify-between px-3 mb-3">
            <div className="font-bold text-lg text-slate-600">MonthWise</div>
            <div className="flex gap-24 items-center">
              {/* <div className=" flex gap-3 items-center">
                <div className="w-4 h-4 rounded-full bg-[#3d9f86]"></div>
                <div>Emission %</div>
              </div> */}
               {monthFilterList.length>0 && 
                <select onChange={(e)=>{setEntityType(e.target.value)}} className="border rounded-xl border-[#29C472] px-3 py-2">
                  {monthFilterList.map((val,index)=>{
                    return(<option key={index} >{val}</option>)
                  })}
                </select>
                }
            </div>
          </div>
          {module == "Fuel" && <SocialGraph data={monthWiseData} />}
          {module == "Retention" && (
            <LineChart data={monthData} lines={linesConfig} xKey="month" yLabel="Number of People" />
          )}
          {module == "Employment" && (
            <LineChart data={monthData} lines={linesConfig} xKey="month" yLabel="Number of People" />
          )}
          {module == "Entity" && <SocialGraph data={monthData} stacked={true} />}
          {module == "Mktg and Labelling" && <SocialGraph data={monthData} stacked={true} />}
          {module == "Customer Privacy" && <SocialGraph data={monthData} stacked={true} />}
          {module == "Child Labor" && <SocialGraph data={monthData} stacked={true} />}
          {module == "CHS" && <SocialGraph data={monthData} stacked={true} />}
          {module == "Social Benefits" && <SocialGraph data={monthData} stacked={true} />}
          {module == "Eco. Performance" && <SocialGraph data={monthData} />}
          {module == "Training and Edu" && <BubbleChart data={monthData} />}
        </div>
      )}
    </div>
  );
};

export default Analytics;
