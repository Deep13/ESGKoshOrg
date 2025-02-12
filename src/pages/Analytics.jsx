import { useState, useEffect } from 'react';
import { firestore } from '../firebase';
import { getDocs, collection, query, where} from "firebase/firestore";
import LineChart from "../components/LineChart";
import SocialGraph from "../components/SocialGraph";
import BubbleChart from "../components/BubbleChart";
import { useSidebar } from "../context/SidebarContext";
import Spinner from '../components/Spinner';

const Analytics = () => {
  const { module, userData, master } = useSidebar();
  const [year, setYear] = useState();
  const [entityType,setEntityType] = useState("All");
  const [loading,setLoading] = useState(true);
  const [fetchedData, setFetchedData] = useState(null);  // State to store fetched data
  const [yearData,setYearData] = useState();
  const [monthWiseData,setMonthWiseData] = useState();
  const [filterList,setFilterList] = useState(null);
  const [monthFilterList,setMonthFilterList] = useState(null);
  const [showModal,setShowModal] = useState(false); 
  // let monthFilterList=[]
  let yearWiseData;
  let monthData;
  console.log(module);

  
//     const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
//     // Initialize empty array for each month
//     let emissionData = new Array(12).fill(0);

//     // Find the entry for the selected year
//     const yearData = data?.find(entry => entry.year == selectedYear);
//     if (!yearData) return { labels: monthLabels, datasets: [] };

//     // Loop through the months (10, 11, etc.), ensuring numerical keys are considered
//     Object.entries(yearData).forEach(([monthKey, monthData]) => {
//         if (!isNaN(monthKey) && monthKey !== "year" && monthKey !== "type") {
//             const monthIndex = parseInt(monthKey, 10) - 1; // Convert 10 -> 9 (Oct), 11 -> 10 (Nov), etc.
//             if (monthIndex >= 0 && monthIndex < 12) {
//                 let totalEmission = 0;

//                 // Sum up all values in the month data
//                 Object.values(monthData).forEach(locationData => {
//                     Object.entries(locationData).forEach(([key, value]) => {
//                         if (key.includes("Emission")) {
//                             totalEmission += Number(value) || 0;
//                         }
//                     });
//                 });

//                 emissionData[monthIndex] = totalEmission; // Assign total emission to the correct month
//             }
//         }
//     });

//     return {
//         labels: monthLabels,
//         datasets: [
//             {
//                 label: "Emission %",
//                 data: emissionData,
//                 backgroundColor: "#4BA0B6",
//                 borderColor: "#4BA0B6",
//                 borderWidth: 1,
//             }
//         ],
//     };
// };
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
      backgroundColor: getRandomColor(),
      borderColor: getRandomColor(),
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
      backgroundColor: getRandomColor(),
      borderColor: getRandomColor(),
      borderWidth: 1,
    });
  });

  return yearWiseData;
}

  function entityTransform(inputData) {
    const transformedData = {};
    const years = [...new Set(inputData.map(entry => entry.year))].sort(); // Ensure years are sorted in ascending order
    const entityTypes = new Set();
     
    // Process the data
    inputData.forEach(entry => {
        const yearIndex = years.indexOf(entry.year);
        if (yearIndex === -1) return;
     
        Object.keys(entry).forEach(key => {
            if (key !== "year" && key !== "type") {
                const region = entry[key];
                Object.values(region).forEach(location => {
                    if (location.EntityType) {
                        Object.entries(location.EntityType).forEach(([type, counts]) => {
                            entityTypes.add(type);
                            if (!transformedData[type]) {
                                transformedData[type] = { Male: Array(years.length).fill(0), Female: Array(years.length).fill(0), Others: Array(years.length).fill(0) };
                            }
                            Object.entries(counts).forEach(([gender, count]) => {
                                if (transformedData[type][gender]) {
                                    transformedData[type][gender][yearIndex] += count;
                                }
                            });
                        });
                    }
                    
                });
            }
        });
    });
     
    // Ensure EntityTypes are sorted with "All" first
    const sortedEntityTypes = ["All", ...[...entityTypes].filter(type => type !== "All").sort()];
     
    const sortedTransformedData = {};
    sortedEntityTypes.forEach(type => {
        if (transformedData[type]) {
            sortedTransformedData[type] = transformedData[type];
        }
    });
     
    console.log({ transformedData: sortedTransformedData, years, entityTypes: sortedEntityTypes });

    return { labels:years, dataObj:sortedTransformedData, entityTypes:sortedEntityTypes };
}
function monthEntityTransform(inputData, year) {
  const monthLabels = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  const transformedData = {};
  const entityTypes = new Set();

  // Process the data for the given year
  inputData.forEach(entry => {
      if (entry.year !== year) return; // Only process data for the specified year

      Object.keys(entry).forEach(monthKey => {
          if (monthKey !== "year" && monthKey !== "type") {
              const monthIndex = parseInt(monthKey, 10) - 1; // Convert "10" to 9 (0-based index)
              if (monthIndex < 0 || monthIndex > 11) return; // Skip invalid month indexes

              Object.values(entry[monthKey]).forEach(location => {
                  if (location.EntityType) {
                      Object.entries(location.EntityType).forEach(([type, counts]) => {
                          entityTypes.add(type);
                          if (!transformedData[type]) {
                              transformedData[type] = {
                                  Male: Array(12).fill(0),
                                  Female: Array(12).fill(0),
                                  Others: Array(12).fill(0)
                              };
                          }
                          Object.entries(counts).forEach(([gender, count]) => {
                              if (transformedData[type][gender]) {
                                  transformedData[type][gender][monthIndex] += count;
                              }
                          });
                      });
                  }
              });
          }
      });
  });

  // Ensure EntityTypes are sorted with "All" first
  const sortedEntityTypes = ["All", ...[...entityTypes].filter(type => type !== "All").sort()];
  const sortedTransformedData = {};

  sortedEntityTypes.forEach(type => {
      if (transformedData[type]) {
          sortedTransformedData[type] = transformedData[type];
      }
  });

  return { labels: monthLabels, dataObj: sortedTransformedData, entityTypes: sortedEntityTypes };
}

function wasteTransform(inputData) {
  const transformedData = {};
const years = [...new Set(inputData.map(entry => entry.year))].sort(); // Ensure years are sorted in ascending order
const entityTypes = new Set();
// Process the data
inputData.forEach(entry => {
    const yearIndex = years.indexOf(entry.year);
    if (yearIndex === -1) return;
    Object.keys(entry).forEach(key => {
        if (key !== "year" && key !== "type") {
            const region = entry[key];
            Object.values(region).forEach(location => {
                if (location.Activity) {
                    Object.entries(location.Activity).forEach(([type, counts]) => {
                        entityTypes.add(type);
                        if (!transformedData[type]) {
                            transformedData[type] = { Recycled: Array(years.length).fill(0), Landfilled: Array(years.length).fill(0), Combusted: Array(years.length).fill(0) };
                        }
                        Object.entries(counts).forEach(([gender, count]) => {
                            if (transformedData[type][gender]) {
                                transformedData[type][gender][yearIndex] += count;
                            }
                        });
                    });
                }
                if (location.Gender) {
                    if (!transformedData.All) {
                        transformedData.All = { Recycled: Array(years.length).fill(0), Landfilled: Array(years.length).fill(0), Combusted: Array(years.length).fill(0) };
                    }
                    Object.entries(location.Gender).forEach(([gender, count]) => {
                        if (transformedData.All[gender]) {
                            transformedData.All[gender][yearIndex] += count;
                        }
                    });
                }
            });
        }
    });
});
// Ensure EntityTypes are sorted with "All" first
const sortedEntityTypes = ["All", ...[...entityTypes].filter(type => type !== "All").sort()];
const sortedTransformedData = {};
sortedEntityTypes.forEach(type => {
    if (transformedData[type]) {
        sortedTransformedData[type] = transformedData[type];
    }
});
console.log({ transformedData: sortedTransformedData, years, entityTypes: sortedEntityTypes });

  return { dataObj: sortedTransformedData, labels:years, entityTypes: sortedEntityTypes }
}
const wasteTransformByMonth = (inputData, selectedYear) => {
  const transformedData = {};
  const allMonths = Array.from({ length: 12 }, (_, i) => (i + 1).toString()); // ["1", "2", ..., "12"]

  // Extract and sort unique months for the selected year
  const months = [...new Set(
    inputData
      .filter(entry => entry.year === selectedYear) // Filter only selected year
      .flatMap(entry => Object.keys(entry).filter(key => !isNaN(parseInt(key)))) // Extract numeric month keys
  )].sort((a, b) => parseInt(a) - parseInt(b)); // Sort numerically

  const activityTypes = new Set();

  // Process the data
  inputData.forEach(entry => {
    if (String(entry.year) !== String(selectedYear)) return; // Skip incorrect years

    allMonths.forEach((monthKey, monthIndex) => { // Iterate over all months
      const monthData = entry[monthKey] || {}; // Use empty object if month data is missing

      Object.keys(monthData).forEach(regionKey => {
        const region = monthData[regionKey];

        if (region.Activity) {
          Object.entries(region.Activity).forEach(([activity, methods]) => {
            activityTypes.add(activity);

            if (!transformedData[activity]) {
              transformedData[activity] = {
                Recycled: Array(12).fill(0),
                Landfilled: Array(12).fill(0),
                Combusted: Array(12).fill(0),
              };
            }

            Object.entries(methods).forEach(([method, value]) => {
              if (transformedData[activity][method]) {
                transformedData[activity][method][monthIndex] += value;
              }
            });
          });
        }
      });
    });
  });

  // Ensure activity types are sorted alphabetically, with "All" first
  const sortedActivityTypes = ["All", ...[...activityTypes].filter(type => type !== "All").sort()];
  const sortedTransformedData = {};
  sortedActivityTypes.forEach(type => {
    if (transformedData[type]) {
      sortedTransformedData[type] = transformedData[type];
    }
  });

  // Convert numeric month labels to full month names (January - December)
  const monthNames = allMonths.map(month => 
    new Date(selectedYear, month - 1).toLocaleString('en-US', { month: 'long' })
  );

  console.log({ transformedData: sortedTransformedData, months: monthNames, activityTypes: sortedActivityTypes });

  return { dataObj: sortedTransformedData, labels: monthNames, activityTypes: sortedActivityTypes };
};




function retentionTransform(inputData,filterType) {
  const transformedData = {};
    const years = [...new Set(inputData.map(entry => entry.year))].sort(); // Ensure years are sorted in ascending order
    const entityTypes = new Set();
     
    // Process the data
    inputData.forEach(entry => {
        const yearIndex = years.indexOf(entry.year);
        if (yearIndex === -1) return;
     
        Object.keys(entry).forEach(key => {
            if (key !== "year" && key !== "type") {
                const region = entry[key];
                Object.values(region).forEach(location => {
                    if (location[filterType]) {
                        Object.entries(location[filterType]).forEach(([type, counts]) => {
                            entityTypes.add(type);
                            if (!transformedData[type]) {
                                transformedData[type] = { Male: Array(years.length).fill(0), Female: Array(years.length).fill(0), Others: Array(years.length).fill(0) };
                            }
                            Object.entries(counts).forEach(([gender, count]) => {
                                if (transformedData[type][gender]) {
                                    transformedData[type][gender][yearIndex] += count;
                                }
                            });
                        });
                    }
                    
                });
            }
        });
    });
     
    // Ensure EntityTypes are sorted with "All" first
    const sortedEntityTypes = ["All", ...[...entityTypes].filter(type => type !== "All").sort()];
     
    const sortedTransformedData = {};
    sortedEntityTypes.forEach(type => {
        if (transformedData[type]) {
            sortedTransformedData[type] = transformedData[type];
        }
    });
     
    console.log({ transformedData: sortedTransformedData, years, entityTypes: sortedEntityTypes });

    return { labels:years, dataObj:sortedTransformedData, entityTypes:sortedEntityTypes };

}
function retentionTransformByMonth(inputData, filterType, selectedYear) {
  const transformedData = {};
  const allMonths = Array.from({ length: 12 }, (_, i) => (i + 1).toString()); // ["1", "2", ..., "12"]

  const entityTypes = new Set();

  // Process the data
  inputData.forEach(entry => {
    if (entry.year !== selectedYear) return; // Process only selected year

    allMonths.forEach((monthKey, monthIndex) => { // Iterate over all 12 months
      const monthData = entry[monthKey] || {}; // Use empty object if month is missing

      Object.entries(monthData).forEach(([regionKey, region]) => {
        if (region[filterType]) {
          Object.entries(region[filterType]).forEach(([type, counts]) => {
            entityTypes.add(type);

            if (!transformedData[type]) {
              transformedData[type] = {
                Male: Array(12).fill(0),
                Female: Array(12).fill(0),
                Others: Array(12).fill(0),
              };
            }

            Object.entries(counts).forEach(([gender, count]) => {
              if (transformedData[type][gender]) {
                transformedData[type][gender][monthIndex] += count;
              }
            });
          });
        }
      });
    });
  });

  // Ensure entity types are sorted alphabetically, with "All" first
  const sortedEntityTypes = ["All", ...[...entityTypes].filter(type => type !== "All").sort()];
  const sortedTransformedData = {};
  sortedEntityTypes.forEach(type => {
    if (transformedData[type]) {
      sortedTransformedData[type] = transformedData[type];
    }
  });

  // Convert numeric month labels to full month names
  const monthNames = allMonths.map(month => 
    new Date(selectedYear, month - 1).toLocaleString('en-US', { month: 'long' })
  );

  console.log({ transformedData: sortedTransformedData, months: monthNames, entityTypes: sortedEntityTypes });

  return { labels: monthNames, dataObj: sortedTransformedData, entityTypes: sortedEntityTypes };
}


  const linesConfig = [
    { dataKey: "men", color: "#1E90FF" },
    { dataKey: "women", color: "#FF4500" },
    { dataKey: "others", color: "#800080" },
  ];


  useEffect(() => {
    const fetchData = async () => {
      if (!userData || !master) {
        console.log(userData, master);
        return;
      }

      setLoading(true);

      yearWiseData=[]

      try {
        var monthYear = master?.currentReportingCycle;
        setYear(monthYear?.year);
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
          
          // setLoading(false)
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
    if(fetchedData){
      updateData()
    }
  },[fetchedData,entityType])



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
          label: "Total Revenue",
          data: [],
          backgroundColor: "#ffae55",
          borderColor: "#ffae55",
          borderWidth: 1,
        },
        
        // {
        //   label: "Financial Assistance from Governments",
        //   data: [],
        //   backgroundColor: "#e34545",
        //   borderColor: "#e34545",
        //   borderWidth: 1,
        // },
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
        let totalRevenue = 0;
        // let totalRevenue = 0;
        // let financialAssistance = 0;
  
        // Accumulate values from all regions under this year
        Object.keys(region).forEach((regionName) => {
          const regionData = region[regionName]?.data; // Safely access region data
  
          // Check if regionData exists before accessing the properties
          if (regionData) {
            totalTurnover += parseFloat(regionData["Total turnover"]) || 0;
            // directEconomicValue += parseFloat(regionData["Direct economic value Distributed"]) || 0;
            totalRevenue += parseFloat(regionData["Total Revenue"]) || 0;
            // financialAssistance += parseFloat(regionData["Financial assistance received from governments"]) || 0;
          }
        });
  
        // Push the accumulated values into the corresponding dataset
        chartData.datasets[0].data.push(totalTurnover);
        // chartData.datasets[1].data.push(directEconomicValue);
        chartData.datasets[1].data.push(totalRevenue);
        // chartData.datasets[2].data.push(financialAssistance);
      });
    });
    
    console.log(chartData)
    return chartData;
  };

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
const transformBubbleChartDataByMonth = (backendDataArray, selectedYear) => {
  const bubbleData = { datasets: [] };

  // Month mapping
  const monthNames = {
      "1": "Jan", "2": "Feb", "3": "Mar", "4": "Apr", "5": "May", "6": "Jun",
      "7": "Jul", "8": "Aug", "9": "Sep", "10": "Oct", "11": "Nov", "12": "Dec"
  };

  // Ensure all 12 months are included
  const allMonths = Object.values(monthNames);

  const segmentMap = new Map();

  // Initialize all segments with zero values for all months
  backendDataArray.forEach(backendData => {
      if (backendData.year !== selectedYear) return;

      Object.keys(backendData).forEach(month => {
          if (!monthNames[month]) return; // Skip invalid month keys

          const monthData = backendData[month] || {}; // Default to empty if missing

          Object.entries(monthData).forEach(([location, locationData]) => {
              if (!locationData.Segment) return;

              Object.entries(locationData.Segment).forEach(([segment, data]) => {
                  const avgHours = data["Avg Hours per batch"] || 0;
                  const headCount = data["Head Count"] || 0;

                  // Ensure the segment has a dataset
                  if (!segmentMap.has(segment)) {
                      segmentMap.set(segment, {
                          label: segment,
                          data: allMonths.map(m => ({ x: m, y: 0, r: 0 })), // Initialize with zero for all months
                          backgroundColor: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.6)`,
                      });
                  }

                  // Find the correct month index and update values
                  const dataset = segmentMap.get(segment);
                  const monthIndex = allMonths.indexOf(monthNames[month]);
                  dataset.data[monthIndex] = { x: monthNames[month], y: avgHours, r: headCount / 10 };
              });
          });
      });
  });

  // Convert segment map to datasets array
  bubbleData.datasets = Array.from(segmentMap.values());

  return bubbleData;
};



const transformOHSChartData = (backendDataArray) => {
  const bubbleData = { datasets: [] };

  backendDataArray?.forEach((backendData) => {
      const year = parseInt(backendData.year); // Extract year for x-axis

      // Iterate over each module (e.g., "10")
      Object.entries(backendData).forEach(([key, locations]) => {
          if (key === "year" || key === "type") return; // Skip metadata

          Object.entries(locations).forEach(([location, locationData]) => {
              if (!locationData.InjuryType) return;

              Object.entries(locationData.InjuryType).forEach(([segment, data]) => {
                  const avgHours = data["Incidents"] || 0;
                  const headCount = data["HeadCount"] || 0;

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
                      r: avgHours, // Scale head count for bubble size
                  });
              });
          });
      });
  });

  return bubbleData;
};
const transformOHSChartDataByMonth = (backendDataArray, selectedYear) => {
  const bubbleData = { datasets: [] };

  // Month mapping
  const monthNames = {
    1: "Jan", 2: "Feb", 3: "Mar", 4: "Apr", 5: "May", 6: "Jun",
    7: "Jul", 8: "Aug", 9: "Sep", 10: "Oct", 11: "Nov", 12: "Dec"
  };

  console.log("Selected Year:", selectedYear);
  console.log("Backend Data Array:", backendDataArray);

  const segmentMap = new Map();

  // Initialize all segments with zero values for all months
  Object.values(monthNames).forEach(monthName => {
    backendDataArray.forEach(backendData => {
      if (String(backendData.year) !== String(selectedYear)) return;

      Object.keys(backendData).forEach(monthKey => {
        const monthNum = parseInt(monthKey);
        if (isNaN(monthNum) || !monthNames[monthNum]) return;

        const monthData = backendData[monthKey] || {}; // Default to empty if missing

        Object.entries(monthData).forEach(([location, locationData]) => {
          if (!locationData.InjuryType) return;

          Object.entries(locationData.InjuryType).forEach(([segment, data]) => {
            const incidents = data["Incidents"] || 0;

            // Ensure the segment has a dataset
            if (!segmentMap.has(segment)) {
              segmentMap.set(segment, {
                label: segment,
                data: Object.values(monthNames).map(m => ({ x: m, y: 0, r: 0 })), // Initialize with zero for all months
                backgroundColor: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.6)`,
              });
            }

            // Find the correct month index and update values
            const dataset = segmentMap.get(segment);
            const monthIndex = Object.values(monthNames).indexOf(monthNames[monthNum]);
            dataset.data[monthIndex] = { x: monthNames[monthNum], y: incidents, r: incidents };
          });
        });
      });
    });
  });

  // Convert segment map to datasets array
  bubbleData.datasets = Array.from(segmentMap.values());

  console.log("Final Transformed Data:", JSON.stringify(bubbleData, null, 2));

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
      { label: "Total Revenue", data: Array(12).fill(0), backgroundColor: "#ffae55", borderColor: "#ffae55", borderWidth: 1 },
      // { label: "Financial Assistance from Governments", data: Array(12).fill(0), backgroundColor: "#e34545", borderColor: "#e34545", borderWidth: 1 },
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
          let financialData = location;
          graphData.datasets[0].data[monthIndex] += parseFloat(financialData["Total turnover"] || 0);
          graphData.datasets[1].data[monthIndex] += parseFloat(financialData["Total Revenue"] || 0);
          // graphData.datasets[2].data[monthIndex] += parseFloat(financialData["Financial assistance received from governments"] || 0);
        });
      }
    });
  });

  return graphData;
}


function transformEnvDataForGraphByYear(backendData) {
  const transformedData = {
    labels: [],
    datasets: [],
  };

  const metricsMap = {}; // Store fuel type data grouped by year dynamically

  // Extract unique years and sort them before processing
  const uniqueYears = [...new Set(backendData?.map(entry => entry.year))].sort();
  transformedData.labels = uniqueYears;

  backendData?.forEach(yearEntry => {
    const year = yearEntry.year;
    const yearIndex = transformedData.labels.indexOf(year);

    Object.entries(yearEntry).forEach(([key, monthData]) => {
      if (key === "year" || key === "type") return;

      Object.values(monthData).forEach(locationData => {
        if (!locationData.Type) return; // Ensure "Type" exists

        Object.entries(locationData.Type).forEach(([fuelType, value]) => {
          if (!metricsMap[fuelType]) {
            // Initialize with correct length
            metricsMap[fuelType] = new Array(uniqueYears.length).fill(0);
          }

          const numericValue = isNaN(Number(value)) ? 0 : Number(value);
          metricsMap[fuelType][yearIndex] += numericValue;
        });
      });
    });
  });

  // Convert metrics map into datasets dynamically
  Object.entries(metricsMap).forEach(([fuelType, data], index) => {
    const colors = ["#4BA0B6", "#FF6384", "#36A2EB", "#FFCE56", "#8BC34A"]; // Define a color palette

    transformedData.datasets.push({
      label: fuelType,
      data: data, // Already aligned with sorted years
      backgroundColor: colors[index % colors.length], // Assign color dynamically
      borderColor: colors[index % colors.length],
      borderWidth: 1,
    });
  });

  return transformedData;
}

function transformEnvDataForGraphByMonth(backendData, selectedYear) {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const transformedData = {
    labels: months,
    datasets: []
  };

  const metricsMap = {}; // Store fuel type data grouped by month dynamically

  // Find the entry for the selected year
  const yearData = backendData.find(entry => entry.year == selectedYear);
  if (!yearData) return transformedData; // Return empty if year not found

  Object.entries(yearData).forEach(([monthKey, monthData]) => {
    if (monthKey === "year" || monthKey === "type") return;

    const monthIndex = parseInt(monthKey, 10) - 1; // Convert month number to index
    if (isNaN(monthIndex) || monthIndex < 0 || monthIndex >= 12) return;

    Object.values(monthData).forEach(locationData => {
      if (!locationData.Type) return; // Ensure "Type" exists

      Object.entries(locationData.Type).forEach(([fuelType, value]) => {
        if (!metricsMap[fuelType]) {
          metricsMap[fuelType] = new Array(12).fill(0);
        }

        metricsMap[fuelType][monthIndex] += Number(value) || 0;
      });
    });
  });

  // Convert metrics map into datasets dynamically
  Object.entries(metricsMap).forEach(([fuelType, data], index) => {
    const colors = ["#4BA0B6", "#FF6384", "#36A2EB", "#FFCE56", "#8BC34A"]; // Define a color palette
    transformedData.datasets.push({
      label: fuelType,
      data: data,
      backgroundColor: colors[index % colors.length], // Assign color dynamically
      borderColor: colors[index % colors.length],
      borderWidth: 1,
    });
  });

  return transformedData;
}

function transformVehicleDataForGraphByYear(backendData) {
  const transformedData = {
    labels: [],
    datasets: []
  };

  const metricsMap = {}; // Store fuel type data grouped by year dynamically

  backendData?.forEach(yearEntry => {
    const year = yearEntry.year;
    if (!transformedData.labels.includes(year)) {
      transformedData.labels.push(year);
    }

    Object.entries(yearEntry).forEach(([key, monthData]) => {
      if (key === "year" || key === "type") return;

      Object.values(monthData).forEach(locationData => {
        if (!locationData.Vehicles) return; // Ensure "Type" exists

        Object.entries(locationData.Vehicles).forEach(([fuelType, value]) => {
          if (!metricsMap[fuelType]) {
            metricsMap[fuelType] = new Array(transformedData.labels.length).fill(0);
          }

          const yearIndex = transformedData.labels.indexOf(year);
          metricsMap[fuelType][yearIndex] += Number(value) || 0;
        });
      });
    });
  });

  // Convert metrics map into datasets dynamically
  Object.entries(metricsMap).forEach(([fuelType, data], index) => {
    const colors = ["#4BA0B6", "#FF6384", "#36A2EB", "#FFCE56", "#8BC34A"]; // Define a color palette
    transformedData.datasets.push({
      label: fuelType,
      data: data,
      backgroundColor: colors[index % colors.length], // Assign color dynamically
      borderColor: colors[index % colors.length],
      borderWidth: 1,
    });
  });

  return transformedData;
}
function transformVehicleDataForGraphByMonth(backendData, selectedYear) {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const transformedData = {
    labels: months,
    datasets: []
  };

  const metricsMap = {}; // Store fuel type data grouped by month dynamically

  // Find the entry for the selected year
  const yearData = backendData.find(entry => entry.year == selectedYear);
  if (!yearData) return transformedData; // Return empty if year not found

  Object.entries(yearData).forEach(([monthKey, monthData]) => {
    if (monthKey === "year" || monthKey === "type") return;

    const monthIndex = parseInt(monthKey, 10) - 1; // Convert month number to index
    if (isNaN(monthIndex) || monthIndex < 0 || monthIndex >= 12) return;

    Object.values(monthData).forEach(locationData => {
      if (!locationData.Vehicles) return; // Ensure "Type" exists

      Object.entries(locationData.Vehicles).forEach(([fuelType, value]) => {
        if (!metricsMap[fuelType]) {
          metricsMap[fuelType] = new Array(12).fill(0);
        }

        metricsMap[fuelType][monthIndex] += Number(value) || 0;
      });
    });
  });

  // Convert metrics map into datasets dynamically
  Object.entries(metricsMap).forEach(([fuelType, data], index) => {
    const colors = ["#4BA0B6", "#FF6384", "#36A2EB", "#FFCE56", "#8BC34A"]; // Define a color palette
    transformedData.datasets.push({
      label: fuelType,
      data: data,
      backgroundColor: colors[index % colors.length], // Assign color dynamically
      borderColor: colors[index % colors.length],
      borderWidth: 1,
    });
  });

  return transformedData;
}

function transformActivityDataForGraphByYear(backendData) {
  const transformedData = {
    labels: [],
    datasets: []
  };

  const metricsMap = {}; // Store fuel type data grouped by year dynamically

  backendData?.forEach(yearEntry => {
    const year = yearEntry.year;
    if (!transformedData.labels.includes(year)) {
      transformedData.labels.push(year);
    }

    Object.entries(yearEntry).forEach(([key, monthData]) => {
      if (key === "year" || key === "type") return;

      Object.values(monthData).forEach(locationData => {
        if (!locationData.Activity) return; // Ensure "Type" exists

        Object.entries(locationData.Activity).forEach(([fuelType, value]) => {
          if (!metricsMap[fuelType]) {
            metricsMap[fuelType] = new Array(transformedData.labels.length).fill(0);
          }

          const yearIndex = transformedData.labels.indexOf(year);
          metricsMap[fuelType][yearIndex] += Number(value) || 0;
        });
      });
    });
  });

  // Convert metrics map into datasets dynamically
  Object.entries(metricsMap).forEach(([fuelType, data], index) => {
    const colors = ["#4BA0B6", "#FF6384", "#36A2EB", "#FFCE56", "#8BC34A"]; // Define a color palette
    transformedData.datasets.push({
      label: fuelType,
      data: data,
      backgroundColor: colors[index % colors.length], // Assign color dynamically
      borderColor: colors[index % colors.length],
      borderWidth: 1,
    });
  });

  return transformedData;
}
function transformActivityDataForGraphByMonth(backendData, selectedYear) {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const transformedData = {
    labels: months,
    datasets: []
  };

  const metricsMap = {}; // Store fuel type data grouped by month dynamically

  // Find the entry for the selected year
  const yearData = backendData.find(entry => entry.year == selectedYear);
  if (!yearData) return transformedData; // Return empty if year not found

  Object.entries(yearData).forEach(([monthKey, monthData]) => {
    if (monthKey === "year" || monthKey === "type") return;

    const monthIndex = parseInt(monthKey, 10) - 1; // Convert month number to index
    if (isNaN(monthIndex) || monthIndex < 0 || monthIndex >= 12) return;

    Object.values(monthData).forEach(locationData => {
      if (!locationData.Activity) return; // Ensure "Type" exists

      Object.entries(locationData.Activity).forEach(([fuelType, value]) => {
        if (!metricsMap[fuelType]) {
          metricsMap[fuelType] = new Array(12).fill(0);
        }

        metricsMap[fuelType][monthIndex] += Number(value) || 0;
      });
    });
  });

  // Convert metrics map into datasets dynamically
  Object.entries(metricsMap).forEach(([fuelType, data], index) => {
    const colors = ["#4BA0B6", "#FF6384", "#36A2EB", "#FFCE56", "#8BC34A"]; // Define a color palette
    transformedData.datasets.push({
      label: fuelType,
      data: data,
      backgroundColor: colors[index % colors.length], // Assign color dynamically
      borderColor: colors[index % colors.length],
      borderWidth: 1,
    });
  });

  return transformedData;
}
function transformLevelDataForGraphByYear(backendData) {
  const transformedData = {
    labels: [],
    datasets: []
  };

  const metricsMap = {}; // Store fuel type data grouped by year dynamically

  backendData?.forEach(yearEntry => {
    const year = yearEntry.year;
    if (!transformedData.labels.includes(year)) {
      transformedData.labels.push(year);
    }

    Object.entries(yearEntry).forEach(([key, monthData]) => {
      if (key === "year" || key === "type") return;

      Object.values(monthData).forEach(locationData => {
        if (!locationData.Level2) return; // Ensure "Type" exists

        Object.entries(locationData.Level2).forEach(([fuelType, value]) => {
          if (!metricsMap[fuelType]) {
            metricsMap[fuelType] = new Array(transformedData.labels.length).fill(0);
          }

          const yearIndex = transformedData.labels.indexOf(year);
          metricsMap[fuelType][yearIndex] += Number(value) || 0;
        });
      });
    });
  });

  // Convert metrics map into datasets dynamically
  Object.entries(metricsMap).forEach(([fuelType, data], index) => {
    const colors = ["#4BA0B6", "#FF6384", "#36A2EB", "#FFCE56", "#8BC34A"]; // Define a color palette
    transformedData.datasets.push({
      label: fuelType,
      data: data,
      backgroundColor: colors[index % colors.length], // Assign color dynamically
      borderColor: colors[index % colors.length],
      borderWidth: 1,
    });
  });

  return transformedData;
}
function transformLevelDataForGraphByMonth(backendData, selectedYear) {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const transformedData = {
    labels: months,
    datasets: []
  };

  const metricsMap = {}; // Store fuel type data grouped by month dynamically

  // Find the entry for the selected year
  const yearData = backendData.find(entry => entry.year == selectedYear);
  if (!yearData) return transformedData; // Return empty if year not found

  Object.entries(yearData).forEach(([monthKey, monthData]) => {
    if (monthKey === "year" || monthKey === "type") return;

    const monthIndex = parseInt(monthKey, 10) - 1; // Convert month number to index
    if (isNaN(monthIndex) || monthIndex < 0 || monthIndex >= 12) return;

    Object.values(monthData).forEach(locationData => {
      if (!locationData.Level2) return; // Ensure "Type" exists

      Object.entries(locationData.Level2).forEach(([fuelType, value]) => {
        if (!metricsMap[fuelType]) {
          metricsMap[fuelType] = new Array(12).fill(0);
        }

        metricsMap[fuelType][monthIndex] += Number(value) || 0;
      });
    });
  });

  // Convert metrics map into datasets dynamically
  Object.entries(metricsMap).forEach(([fuelType, data], index) => {
    const colors = ["#4BA0B6", "#FF6384", "#36A2EB", "#FFCE56", "#8BC34A"]; // Define a color palette
    transformedData.datasets.push({
      label: fuelType,
      data: data,
      backgroundColor: colors[index % colors.length], // Assign color dynamically
      borderColor: colors[index % colors.length],
      borderWidth: 1,
    });
  });

  return transformedData;
}

function transformUnfilteredDataForGraphByYear(backendData) {
  const transformedData = {
    labels: [],
    datasets: []
  };

  const yearMap = {}; // Store total value per year

  backendData?.forEach(entry => {
    const year = entry.year;
    if (!yearMap[year]) {
      yearMap[year] = 0;
    }

    Object.entries(entry).forEach(([key, monthData]) => {
      if (key === "year" || key === "type") return;

      Object.values(monthData).forEach(value => {
        yearMap[year] += Number(value) || 0;
      });
    });
  });

  // Convert yearMap to chart format
  transformedData.labels = Object.keys(yearMap);
  transformedData.datasets.push({
    label: "Total Emissions",
    data: Object.values(yearMap),
    backgroundColor: "#4BA0B6",
    borderColor: "#4BA0B6",
    borderWidth: 1,
  });

  return transformedData;
}
function transformUnfilteredDataForGraphByMonth(backendData, selectedYear) {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const transformedData = {
    labels: months,
    datasets: []
  };

  const monthMap = new Array(12).fill(0); // Store total value per month

  // Find the entry for the selected year
  const yearData = backendData?.find(entry => entry.year == selectedYear);
  if (!yearData) return transformedData; // Return empty if year not found

  Object.entries(yearData).forEach(([monthKey, monthData]) => {
    if (monthKey === "year" || monthKey === "type") return;

    const monthIndex = parseInt(monthKey, 10) - 1; // Convert month number to index
    if (isNaN(monthIndex) || monthIndex < 0 || monthIndex >= 12) return;

    Object.values(monthData).forEach(value => {
      monthMap[monthIndex] += Number(value) || 0;
    });
  });

  // Convert monthMap to chart format
  transformedData.datasets.push({
    label: "Total Emissions",
    data: monthMap,
    backgroundColor: "#4BA0B6",
    borderColor: "#4BA0B6",
    borderWidth: 1,
  });

  return transformedData;
}

function getRandomColor() {
  return `#${Math.floor(Math.random()*16777215).toString(16)}`;
}

 const updateData=()=>{

 setFilterList(null)
 setMonthFilterList(null)

 if(!fetchedData){
  console.log("No fetched Data skipping update");
  setShowModal(true);
  // setLoading(false)
  return;
 }
  switch(module){
    case "Entity":
    var { labels, dataObj, entityTypes } = entityTransform(fetchedData);
    setFilterList(entityTypes);

    if (dataObj) {
        console.log(dataObj[entityType]);
    }

    // Year-wise data structure
    yearWiseData = {
        labels: labels,
        datasets: [
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
        ],
    };

    // Month-wise data handling
    if (year) {
        console.log("Processing month-wise data...");
        let data= monthEntityTransform(fetchedData, year);
        setFilterList(data.entityTypes)
        monthData ={
            labels: data.labels,
            datasets: Object.keys(data.dataObj[entityType] || {}).map(gender => ({
                label: gender,
                data: data.dataObj[entityType]?.[gender] ?? [],
                backgroundColor: getRandomColor(),
                borderColor: getRandomColor(),
                borderWidth: 1,
            }))
        }
       
    }
    break;
    case "Employment":
      var { labels, dataObj, entityTypes } = retentionTransform(fetchedData,"EmploymentType");
      setFilterList(entityTypes);
  
      if (dataObj) {
          console.log(dataObj[entityType]);
      }
  
      // Year-wise data structure
      yearWiseData = {
          labels: labels,
          datasets: [
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
          ],
      };
  
      // Month-wise data handling
      if (year) {
          console.log("Processing month-wise data...");
          let data= retentionTransformByMonth(fetchedData,"EmploymentType", year);
          monthData ={
              labels: data.labels,
              datasets: Object.keys(data.dataObj[entityType] || {}).map(gender => ({
                  label: gender,
                  data: data.dataObj[entityType]?.[gender] ?? [],
                  backgroundColor: getRandomColor(),
                  borderColor: getRandomColor(),
                  borderWidth: 1,
              }))
          }
         
      }
      break;
    case "Retention":
      var { labels, dataObj, entityTypes } = retentionTransform(fetchedData,"EmployeeType");
      setFilterList(entityTypes);
  
      if (dataObj) {
          console.log(dataObj[entityType]);
      }
  
      // Year-wise data structure
      yearWiseData = {
          labels: labels,
          datasets: [
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
          ],
      };
  
      // Month-wise data handling
      if (year) {
          console.log("Processing month-wise data...");
          let data= retentionTransformByMonth(fetchedData,"EmployeeType", year);
          monthData ={
              labels: data.labels,
              datasets: Object.keys(data.dataObj[entityType] || {}).map(gender => ({
                  label: gender,
                  data: data.dataObj[entityType]?.[gender] ?? [],
                  backgroundColor: getRandomColor(),
                  borderColor: getRandomColor(),
                  borderWidth: 1,
              }))
          }
         
      }
      break;
    case "Eco. Performance":
      yearWiseData=ecoPerformanceTransform(fetchedData)
      console.log("che",fetchedData)
      var chartData = processDataForGraph(fetchedData);
      console.log(JSON.stringify(chartData),null,2);
      monthData=chartData;
      break
    case "Training and Edu":
      yearWiseData=transformBubbleChartData(fetchedData)
      if(year)monthData=transformBubbleChartDataByMonth(fetchedData,year)
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
    case "Bioenergy":
    case "Fuel":
    case "WTT- fuels":
    case "Water":
      yearWiseData=transformEnvDataForGraphByYear(fetchedData)
      console.log("C",yearWiseData)
      if(year)monthData=transformEnvDataForGraphByMonth(fetchedData,year)
      break;
    
    case "Materials": 
    case "Elec heat cooling":
      yearWiseData=transformActivityDataForGraphByYear(fetchedData)
      console.log("C",yearWiseData)
      if(year)monthData=transformActivityDataForGraphByMonth(fetchedData,year)
      break;  
    case "Owned Vehicles":
      yearWiseData=transformLevelDataForGraphByYear(fetchedData)
      console.log("C",yearWiseData)
      if(year)monthData=transformLevelDataForGraphByMonth(fetchedData,year)
      break;

    case "Freighting goods":
    case "Employees commuting":
    case "Business travel - land and sea":
      yearWiseData=transformVehicleDataForGraphByYear(fetchedData)
      console.log("C",yearWiseData)
      if(year)monthData=transformVehicleDataForGraphByMonth(fetchedData,year)
      break;

    case "Food":
    case "Refrigerant and other":
    case "Accommodation":
    case "Flight":
    case "Home Office":
      yearWiseData=transformUnfilteredDataForGraphByYear(fetchedData)
      console.log("C",yearWiseData)
      if(year)monthData=transformUnfilteredDataForGraphByMonth(fetchedData,year)
      break;
    case "OH and S":
      yearWiseData=transformOHSChartData(fetchedData)
      if(year)monthData=transformOHSChartDataByMonth(fetchedData,year)

      console.log(monthData)
      break;

    case "Waste Disposal":
      var { labels, dataObj, entityTypes } = wasteTransform(fetchedData);
      setFilterList(entityTypes);
  
      if (dataObj) {
          console.log(dataObj[entityType]);
      }
  
      // Year-wise data structure
      yearWiseData = {
          labels: labels,
          datasets: [
              {
                  label: "Recycled",
                  data: dataObj[entityType]?.Recycled ?? [],
                  backgroundColor: "#2586d6",
                  borderColor: "#2586d6",
                  borderWidth: 1,
              },
              {
                  label: "Landfilled",
                  data: dataObj[entityType]?.Landfilled ?? [],
                  backgroundColor: "#d72528",
                  borderColor: "#d72528",
                  borderWidth: 1,
              },
              {
                  label: "Combusted",
                  data: dataObj[entityType]?.Combusted ?? [],
                  backgroundColor: "#8b24d7",
                  borderColor: "#8b24d7",
                  borderWidth: 1,
              },
          ],
      };
  
      // Month-wise data handling
      if (year) {
          console.log("Processing month-wise data...");
          let data= wasteTransformByMonth(fetchedData, year);
          monthData ={
              labels: data.labels,
              datasets: Object.keys(data.dataObj[entityType] || {}).map(gender => ({
                  label: gender,
                  data: data.dataObj[entityType]?.[gender] ?? [],
                  backgroundColor: getRandomColor(),
                  borderColor: getRandomColor(),
                  borderWidth: 1,
              }))
          }
        

  console.log("A",wasteTransform(fetchedData));
  
  break;

    
  
    

  }
  break;



  // setLoading(false)


 }
 setYearData(yearWiseData)
 setMonthWiseData(monthData);
}

useEffect(()=>{
  if(yearData){
    setLoading(false)
  }
},[yearData])

useEffect(()=>{
  updateData()
},[year])

console.log("test ",transformEnvDataForGraphByYear(fetchedData))
  
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
            {filterList && 
            <select onChange={(e)=>{setEntityType(e.target.value)}} className="border rounded-xl border-[#29C472] px-3 py-2">
              {filterList.map((val,index)=>{
                return(<option key={index} >{val}</option>)
              })}
            </select>
            }
          </div>
        </div>
        {loading?(
          showModal?(
            <div className='flex items-center justify-center'>
              No Data available for analytics.
          </div>
          ):(
            <div className='flex items-center justify-center'>
            <Spinner/>
          </div>
          )
        ):(
            <>
            {module == "Fuel" && <SocialGraph data={yearData} setYear={setYear} />}
            {module == "Bioenergy" && <SocialGraph data={yearData} setYear={setYear} />}
            {module == "WTT- fuels" && <SocialGraph data={yearData} setYear={setYear} />}
            {module == "Water" && <SocialGraph data={yearData} setYear={setYear} />}
            {module == "Food" && <SocialGraph data={yearData} setYear={setYear} />}
            {module == "Accommodation" && <SocialGraph data={yearData} setYear={setYear} />}
            {module == "Flight" && <SocialGraph data={yearData} setYear={setYear} />}
            {module == "Home Office" && <SocialGraph data={yearData} setYear={setYear} />}
            {module == "Refrigerant and other" && <SocialGraph data={yearData} setYear={setYear} />}
            {module == "Owned Vehicles" && <SocialGraph data={yearData} setYear={setYear} />}
            {module == "Materials" && <SocialGraph data={yearData} setYear={setYear} />}
            {module == "Freighting goods" && <SocialGraph data={yearData} setYear={setYear} />}
            {module == "Employees commuting" && <SocialGraph data={yearData} setYear={setYear} />}

            {module == "Business travel - land and sea" && <SocialGraph data={yearData} setYear={setYear} />}
            {module == "Retention" && (
              <LineChart data={yearData} lines={linesConfig} xKey="year" yLabel="Number of People" setYear={setYear} />
            )}
            {module == "Employment" && (
              <LineChart data={yearData} lines={linesConfig} xKey="year" yLabel="Number of People" setYear={setYear} />
            )}
            {module == "Entity" && <SocialGraph data={yearData} stacked={false} setYear={setYear} />}
            {module == "Elec heat cooling" && <SocialGraph data={yearData} stacked={false} setYear={setYear} />}
            {module == "Mktg and Labelling" && <SocialGraph data={yearData} stacked={false} setYear={setYear} />}
            {module == "Customer Privacy" && <SocialGraph data={yearData} stacked={true} setYear={setYear} />}
            {module == "Child Labor" && <SocialGraph data={yearData} stacked={true} setYear={setYear} />}
            {module == "CHS" && <SocialGraph data={yearData} stacked={false} setYear={setYear} />}
            {module == "Social Benefits" && <SocialGraph data={yearData} stacked={false} setYear={setYear} />}
            {module == "Eco. Performance" && <SocialGraph data={yearData} setYear={setYear} />}
            {module == "Waste Disposal" && <SocialGraph data={yearData} setYear={setYear} />}
            {module == "Training and Edu" && <BubbleChart data={yearData} xLabel={"Years"} setYear={setYear} />}
            {module == "OH and S" && <BubbleChart data={yearData} xLabel={"Years"} setYear={setYear} />}
          </>
        )}
      </div>
      {year && (
        <div className=" bg-white rounded-lg w-full p-3">
          <div className="flex justify-between px-3 mb-3">
            <div className="font-bold text-lg text-slate-600">MONTH-WISE-{year}</div>
            <div className="flex gap-24 items-center">
              {/* <div className=" flex gap-3 items-center">
                <div className="w-4 h-4 rounded-full bg-[#3d9f86]"></div>
                <div>Emission %</div>
              </div> */}
               {monthFilterList&& 
                <select onChange={(e)=>{setEntityType(e.target.value)}} className="border rounded-xl border-[#29C472] px-3 py-2">
                  {monthFilterList.map((val,index)=>{
                    return(<option key={index} >{val}</option>)
                  })}
                </select>
                }
            </div>
          </div>
          {module == "Fuel" && <SocialGraph data={monthWiseData} />}
          {module == "Bioenergy" && <SocialGraph data={monthWiseData} />}
          {module == "WTT- fuels" && <SocialGraph data={monthWiseData} />}
          {module == "Water" && <SocialGraph data={monthWiseData} />}
          {module == "Materials" && <SocialGraph data={monthWiseData} />}
          {module == "Freighting goods" && <SocialGraph data={monthWiseData} />}
          {module == "Food" && <SocialGraph data={monthWiseData} />}
          {module == "Accommodation" && <SocialGraph data={monthWiseData} />}
          {module == "Flight" && <SocialGraph data={monthWiseData} />}
          {module == "Home Office" && <SocialGraph data={monthWiseData} />}
          {module == "Refrigerant and other" && <SocialGraph data={monthWiseData} />}
          {module == "Employees commuting" && <SocialGraph data={monthWiseData} />}
          {module == "Business travel - land and sea" && <SocialGraph data={monthWiseData} />}
          {module == "Owned Vehicles" && <SocialGraph data={monthWiseData} />}
          {module == "Retention" && (
            <LineChart data={monthWiseData} lines={linesConfig} xKey="month" yLabel="Number of People" />
          )}
          {module == "Employment" && (
            <LineChart data={monthWiseData} lines={linesConfig} xKey="month" yLabel="Number of People" />
          )}
          {module == "Entity" && <SocialGraph data={monthWiseData} stacked={false} />}
          {module == "Waste Disposal" && <SocialGraph data={monthWiseData} stacked={false} />}
           {module == "Elec heat cooling" && <SocialGraph data={monthWiseData} stacked={false} />}
          {module == "Mktg and Labelling" && <SocialGraph data={monthWiseData} stacked={false} />}
          {module == "Customer Privacy" && <SocialGraph data={monthWiseData} stacked={true} />}
          {module == "Child Labor" && <SocialGraph data={monthWiseData} stacked={true} />}
          {module == "CHS" && <SocialGraph data={monthWiseData} stacked={false} />}
          {module == "Social Benefits" && <SocialGraph data={monthWiseData} stacked={false} />}
          {module == "Eco. Performance" && <SocialGraph data={monthWiseData} />}
          {module == "Training and Edu" && <BubbleChart data={monthWiseData} xLabel={"Months"} />}
          {module == "OH and S" && <BubbleChart data={monthWiseData} xLabel={"Months"} />}
        </div>
      )}

      {/* {showModal&&(
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96 flex flex-col items-center justify-center">
                          
            <div className="mb-5 flex gap-5 jusify-center items-center">
              <img src={modalIcon} alt="modal Icon" className="h-10"/>
              Their is no data to display for analytics.
            </div>
              
                          
            <button onClick={()=>{
              setShowModal(false)}
              } className="px-3 py-2 rounded-lg mx-auto bg-gradient-to-r from-[#3d9f86] to-[#29C472] text-white">
              Ok
            </button>
                          
          </div>
        </div>
      )
      } */}
    </div>
  );
};

export default Analytics;
