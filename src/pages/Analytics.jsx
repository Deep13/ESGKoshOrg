import { useState, useEffect } from 'react';
import { firestore } from '../firebase';
import { getDocs, collection, query, where } from "firebase/firestore";
import LineChart from "../components/LineChart";
// import SocialGraph from "../components/SocialGraph";
import BubbleChart from "../components/BubbleChart";
import { useSidebar } from "../context/SidebarContext";
import Spinner from '../components/Spinner';
import BarChartApex from '../components/BarChartApex';
import BarStacked from '../components/BarStacked';

const Analytics = () => {
  const { module, userData, master } = useSidebar();
  const [year, setYear] = useState();
  const [entityType, setEntityType] = useState("All");
  const [loading, setLoading] = useState(true);
  const [fetchedData, setFetchedData] = useState(null);  // State to store fetched data
  const [yearData, setYearData] = useState();
  const [monthWiseData, setMonthWiseData] = useState();
  const [filterList, setFilterList] = useState(null);
  const [monthFilterList, setMonthFilterList] = useState(null);
  const [showModal, setShowModal] = useState(false);
  // let monthFilterList=[]
  let yearWiseData;
  let monthData;
  console.log(module);

  useEffect(() => {
    setYear(null) 
    setMonthWiseData({ labels: [], datasets: [] })
  }, [module])

  function transformDataForGraph(backendData, selectedYear) {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const colorMap = {
        "No. of complaints received": "#4ba9dd",
        "No. of complaints solved": "#ffae55",
        "No. of non-compliance Incidents": "#4ba9dd",
        "No. of times regulation violated": "#ffae55",
        "Customers Impacted": "#ffae55",
        "No. of Beneficiaries": "#4ba9dd",
        "Expenditure": "#ffae55"
    };

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
                // Skip non-numeric fields like "Program name"
                if (!(metric in colorMap)) return;

                if (!metricsMap[metric]) {
                    metricsMap[metric] = new Array(12).fill(0);
                }

                // Convert value to a valid number
                const numValue = typeof value === "number" ? value : Number(value) || 0;

                metricsMap[metric][monthIndex] += numValue;
            });
        });
    });

    Object.entries(metricsMap).forEach(([metric, data]) => {
        monthWiseData.datasets.push({
            label: metric,
            data: data,
            backgroundColor: colorMap[metric],
            borderColor: colorMap[metric],
            borderWidth: 1,
        });
    });

    return monthWiseData;
}

  function transformDataForGraphByYear(backendData) {
    const colorMap = {
        "No. of complaints received": "#4ba9dd",
        "No. of complaints solved": "#ffae55",
        "No. of non-compliance Incidents": "#4ba9dd",
        "No. of times regulation violated": "#ffae55",
        "Customers Impacted": "#ffae55",
        "No. of Beneficiaries": "#4ba9dd",
        "Expenditure": "#ffae55"
    };

    const yearWiseData = {
        labels: [],
        datasets: []
    };

    const metricsMap = {}; // Store metric data grouped by year

    // Extract and sort unique years first
    const uniqueYears = [...new Set(backendData?.map(entry => entry.year))].sort();
    yearWiseData.labels = uniqueYears;

    backendData?.forEach(yearData => {
        const year = yearData.year;
        const yearIndex = yearWiseData.labels.indexOf(year);

        Object.entries(yearData).forEach(([key, monthData]) => {
            if (key === "year" || key === "type") return; // Skip metadata fields

            Object.values(monthData).forEach(locationData => {
                Object.entries(locationData).forEach(([metric, value]) => {
                    // Skip non-numeric fields like "Program name"
                    if (!(metric in colorMap)) return;

                    // Ensure dataset alignment
                    if (!metricsMap[metric]) {
                        metricsMap[metric] = new Array(uniqueYears.length).fill(0);
                    }

                    // Convert value to a valid number
                    const numValue = typeof value === "number" ? value : Number(value) || 0;

                    // Assign correct year index
                    metricsMap[metric][yearIndex] += numValue;
                });
            });
        });
    });

    // Convert metricsMap into dataset format
    Object.entries(metricsMap).forEach(([metric, data]) => {
        yearWiseData.datasets.push({
            label: metric,
            data: data, // Aligned with sorted years
            backgroundColor: colorMap[metric],
            borderColor: colorMap[metric],
            borderWidth: 1
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

    return { labels: years, dataObj: sortedTransformedData, entityTypes: sortedEntityTypes };
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

    return { dataObj: sortedTransformedData, labels: years, entityTypes: sortedEntityTypes }
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




  function retentionTransform(inputData, filterType) {
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

    return { labels: years, dataObj: sortedTransformedData, entityTypes: sortedEntityTypes };

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

      yearWiseData = []

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

  useEffect(() => {
    if (fetchedData) {
      updateData()
    }
  }, [fetchedData, entityType])



  const ecoPerformanceTransform = (fetchedData) => {
    // Initialize the chart data structure
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
          label: "Net Worth",
          data: [],
          backgroundColor: "#ffae55",
          borderColor: "#ffae55",
          borderWidth: 1,
        },
      ],
    };

    // Loop through fetched data entries
    fetchedData?.forEach((yearData) => {
      const year = yearData.year; // Extract year
      if (!year) return; // Skip if year is missing

      let totalTurnover = 0;
      let totalRevenue = 0;

      // Loop through the regions inside each year (10, 11, 01, etc.)
      Object.keys(yearData).forEach((regionKey) => {
        if (regionKey === "year" || regionKey === "type") return; // Skip non-region keys

        const region = yearData[regionKey];

        // Process each location inside the region
        Object.values(region).forEach((regionData) => {
          if (regionData) {
            totalTurnover += parseFloat(regionData["Total turnover"]) || 0;
            totalRevenue += parseFloat(regionData["Total Revenue"]) || 0;
          }
        });
      });

      // Push year and aggregated values to chart data
      chartData.labels.push(year);
      chartData.datasets[0].data.push(totalTurnover);
      chartData.datasets[1].data.push(totalRevenue);
    });

    console.log(chartData);
    return chartData;
  };

  const mktPresenceTransform = (fetchedData) => {
    // Initialize the chart data structure
    const chartData = {
      labels: [],
      datasets: [
        {
          label: "Markets served by the entity internationally",
          data: [],
          backgroundColor: "#4ba9dd",
          borderColor: "#4ba9dd",
          borderWidth: 1,
        },
        {
          label: "Markets served by the entity nationally",
          data: [],
          backgroundColor: "#ffae55",
          borderColor: "#ffae55",
          borderWidth: 1,
        },
      ],
    };

    // Loop through fetched data entries
    fetchedData?.forEach((yearData) => {
      const year = yearData.year; // Extract year
      if (!year) return; // Skip if year is missing

      let totalTurnover = 0;
      let totalRevenue = 0;

      // Loop through the regions inside each year (10, 11, 01, etc.)
      Object.keys(yearData).forEach((regionKey) => {
        if (regionKey === "year" || regionKey === "type") return; // Skip non-region keys

        const region = yearData[regionKey];

        // Process each location inside the region
        Object.values(region).forEach((regionData) => {
          if (regionData) {
            totalTurnover += parseFloat(regionData["Markets served by the entity internationally"]) || 0;
            totalRevenue += parseFloat(regionData["Markets served by the entity nationally"]) || 0;
          }
        });
      });

      // Push year and aggregated values to chart data
      chartData.labels.push(year);
      chartData.datasets[0].data.push(totalTurnover);
      chartData.datasets[1].data.push(totalRevenue);
    });

    console.log(chartData);
    return chartData;
  };

  const OHSTransform = (fetchedData) => {
    // Initialize the chart data structure
    const chartData = {
      labels: [],
      datasets: [
        {
          label: "Incidents",
          data: [],
          backgroundColor: "#4ba9dd",
          borderColor: "#4ba9dd",
          borderWidth: 1,
        },
        {
          label: "Headcount",
          data: [],
          backgroundColor: "#ffae55",
          borderColor: "#ffae55",
          borderWidth: 1,
        },
      ],
    };

    // Loop through fetched data entries
    fetchedData?.forEach((yearData) => {
      const year = yearData.year; // Extract year
      if (!year) return; // Skip if year is missing

      let totalTurnover = 0;
      let totalRevenue = 0;

      // Loop through the regions inside each year (10, 11, 01, etc.)
      Object.keys(yearData).forEach((regionKey) => {
        if (regionKey === "year" || regionKey === "type") return; // Skip non-region keys

        const region = yearData[regionKey];

        // Process each location inside the region
        Object.values(region).forEach((regionData) => {
          if (regionData) {
            totalTurnover += parseFloat(regionData["Incidents"]) || 0;
            totalRevenue += parseFloat(regionData["Headcount"]) || 0;
          }
        });
      });

      // Push year and aggregated values to chart data
      chartData.labels.push(year);
      chartData.datasets[0].data.push(totalTurnover);
      chartData.datasets[1].data.push(totalRevenue);
    });

    console.log(chartData);
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
              y: headCount, // Avg hours on y-axis
              r: headCount, // Scale head count for bubble size
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




  const processDataForGraph = (data) => {
    const monthMap = {
      "1": "Jan", "2": "Feb", "3": "Mar", "4": "Apr", "5": "May", "6": "Jun",
      "7": "Jul", "8": "Aug", "9": "Sep", "10": "Oct", "11": "Nov", "12": "Dec"
    };

    // Initialize result structure
    let graphData = {
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      datasets: [
        { label: "Total Turnover", data: Array(12).fill(0), backgroundColor: "#4ba9dd", borderColor: "#4ba9dd", borderWidth: 1 },
        { label: "Net Worth", data: Array(12).fill(0), backgroundColor: "#ffae55", borderColor: "#ffae55", borderWidth: 1 },
        // { label: "Net Worth", data: Array(12).fill(0), backgroundColor: "#ffff55", borderColor: "#ffff55", borderWidth: 1 },
      ]
    };

    console.log("this is what i got", data)

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
            // graphData.datasets[2].data[monthIndex] += parseFloat(financialData["Net Worth"] || 0);
          });
        }
      });
    });

    return graphData;
  }
  const processDataForMktPresence = (data) => {
    const monthMap = {
      "1": "Jan", "2": "Feb", "3": "Mar", "4": "Apr", "5": "May", "6": "Jun",
      "7": "Jul", "8": "Aug", "9": "Sep", "10": "Oct", "11": "Nov", "12": "Dec"
    };

    // Initialize result structure
    let graphData = {
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      datasets: [
        { label: "Markets served by the entity internationally", data: Array(12).fill(0), backgroundColor: "#4ba9dd", borderColor: "#4ba9dd", borderWidth: 1 },
        { label: "Markets served by the entity nationally", data: Array(12).fill(0), backgroundColor: "#ffae55", borderColor: "#ffae55", borderWidth: 1 },
        // { label: "Net Worth", data: Array(12).fill(0), backgroundColor: "#ffff55", borderColor: "#ffff55", borderWidth: 1 },
      ]
    };

    console.log("this is what i got", data)

    // Filter data by year
    const filteredData = data?.filter(entry => entry.year == year);

    filteredData?.forEach(entry => {
      Object.keys(entry).forEach(key => {
        if (monthMap[key]) {
          let monthIndex = parseInt(key) - 1; // Convert to 0-based index

          Object.values(entry[key]).forEach(location => {
            let financialData = location;
            graphData.datasets[0].data[monthIndex] += parseFloat(financialData["Markets served by the entity internationally"] || 0);
            graphData.datasets[1].data[monthIndex] += parseFloat(financialData["Markets served by the entity nationally"] || 0);
            // graphData.datasets[2].data[monthIndex] += parseFloat(financialData["Net Worth"] || 0);
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
      const colors = ["#109ad8", "#45bf34", "#f26c35", "#4bc0c0", "#9966ff", "#ff9f40", "#fc8a6d", "#304dff", "#bbdbeb", "#e4acc4", "#ffd0a6", "#9cc079"]

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

  function OHSDataForGraphByYear(backendData) {
    const transformedData = {
        labels: [],
        datasets: [],
    };

    const metricsMap = {
        "Incidents": [], 
        "HeadCount": []
    };

    // Extract unique years and sort them before processing
    const uniqueYears = [...new Set(backendData?.map(entry => entry.year))].sort();
    transformedData.labels = uniqueYears;

    // Initialize metricsMap with zero arrays for each year
    uniqueYears.forEach(() => {
        metricsMap["Incidents"].push(0);
        metricsMap["HeadCount"].push(0);
    });

    backendData?.forEach(yearEntry => {
        const year = yearEntry.year;
        const yearIndex = transformedData.labels.indexOf(year);

        Object.entries(yearEntry).forEach(([key, monthData]) => {
            if (key === "year" || key === "type") return;

            Object.values(monthData).forEach(locationData => {
                if (!locationData.InjuryType) return;

                Object.values(locationData.InjuryType).forEach(injury => {
                    metricsMap["Incidents"][yearIndex] += injury.Incidents || 0;
                    metricsMap["HeadCount"][yearIndex] += injury.HeadCount || 0;
                });
            });
        });
    });

    // Assign colors for each dataset
    const colors = { 
        "Incidents": "#f26c35", 
        "HeadCount": "#109ad8" 
    };

    // Convert metricsMap into datasets
    Object.entries(metricsMap).forEach(([label, data]) => {
        transformedData.datasets.push({
            label: label,
            data: data,
            backgroundColor: colors[label],
            borderColor: colors[label],
            borderWidth: 1,
        });
    });

    return transformedData;
}

function TrainingDataForGraphByYear(backendData) {
  const transformedData = {
      labels: [],
      datasets: []
  };

  const metricsMap = {
      "Head Count": [],
      "Avg Hours per batch": []
  };

  // Extract unique years and sort them
  const uniqueYears = [...new Set(backendData?.map(entry => entry.year))].sort();
  transformedData.labels = uniqueYears;

  // Initialize metricsMap with zero arrays for each year
  uniqueYears.forEach(() => {
      metricsMap["Head Count"].push(0);
      metricsMap["Avg Hours per batch"].push(0);
  });

  backendData?.forEach(yearEntry => {
      const year = yearEntry.year;
      const yearIndex = transformedData.labels.indexOf(year);

      Object.entries(yearEntry).forEach(([key, monthData]) => {
          if (key === "year" || key === "type") return;

          Object.values(monthData).forEach(locationData => {
              if (!locationData.Segment) return; // Ensure "Segment" exists

              Object.values(locationData.Segment).forEach(segment => {
                  metricsMap["Head Count"][yearIndex] += segment["Head Count"] || 0;
                  metricsMap["Avg Hours per batch"][yearIndex] += segment["Avg Hours per batch"] || 0;
              });
          });
      });
  });

  // Assign colors for each dataset
  const colors = { 
      "Head Count": "#109ad8", 
      "Avg Hours per batch": "#f26c35" 
  };

  // Convert metricsMap into datasets
  Object.entries(metricsMap).forEach(([label, data]) => {
      transformedData.datasets.push({
          label: label,
          data: data,
          backgroundColor: colors[label],
          borderColor: colors[label],
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
      const colors = ["#109ad8", "#45bf34", "#f26c35", "#4bc0c0", "#9966ff", "#ff9f40", "#fc8a6d", "#304dff", "#bbdbeb", "#e4acc4", "#ffd0a6", "#9cc079"]
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

  function OHSDataForGraphByMonth(backendData, selectedYear) {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const transformedData = {
        labels: months,
        datasets: []
    };

    const metricsMap = {
        "Incidents": new Array(12).fill(0),
        "HeadCount": new Array(12).fill(0)
    };

    // Find the entry for the selected year
    const yearData = backendData.find(entry => entry.year == selectedYear);
    if (!yearData) return transformedData; // Return empty if year not found

    Object.entries(yearData).forEach(([monthKey, monthData]) => {
        if (monthKey === "year" || monthKey === "type") return;

        const monthIndex = parseInt(monthKey, 10) - 1; // Convert month number to index
        if (isNaN(monthIndex) || monthIndex < 0 || monthIndex >= 12) return;

        Object.values(monthData).forEach(locationData => {
            if (!locationData.InjuryType) return; // Ensure "InjuryType" exists

            Object.values(locationData.InjuryType).forEach(injury => {
                metricsMap["Incidents"][monthIndex] += injury.Incidents || 0;
                metricsMap["HeadCount"][monthIndex] += injury.HeadCount || 0;
            });
        });
    });

    // Define a color palette
    const colors = {
        "Incidents": "#f26c35",
        "HeadCount": "#109ad8"
    };

    // Convert metrics map into datasets dynamically
    Object.entries(metricsMap).forEach(([label, data]) => {
        transformedData.datasets.push({
            label: label,
            data: data,
            backgroundColor: colors[label],
            borderColor: colors[label],
            borderWidth: 1,
        });
    });

    return transformedData;
}

function TrainingDataForGraphByMonth(backendData, selectedYear) {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const transformedData = {
      labels: months,
      datasets: []
  };

  const metricsMap = {
      "Head Count": new Array(12).fill(0),
      "Financial Investment": new Array(12).fill(0)
  };

  // Find the entry for the selected year
  const yearData = backendData.find(entry => entry.year == selectedYear);
  if (!yearData) return transformedData; // Return empty if the year is not found

  Object.entries(yearData).forEach(([monthKey, monthData]) => {
      if (monthKey === "year" || monthKey === "type") return;

      const monthIndex = parseInt(monthKey, 10) - 1; // Convert month number to index
      if (isNaN(monthIndex) || monthIndex < 0 || monthIndex >= 12) return;

      Object.values(monthData).forEach(locationData => {
          if (!locationData.Segment) return; // Ensure "Segment" exists

          Object.values(locationData.Segment).forEach(segment => {
              metricsMap["Head Count"][monthIndex] += segment["Head Count"] || 0;
              metricsMap["Financial Investment"][monthIndex] += segment["Financial investment"] || 0;
          });
      });
  });

  // Define colors
  const colors = {
      "Head Count": "#109ad8",
      "Financial Investment": "#f26c35"
  };

  // Convert metricsMap into datasets dynamically
  Object.entries(metricsMap).forEach(([label, data]) => {
      transformedData.datasets.push({
          label: label,
          data: data,
          backgroundColor: colors[label],
          borderColor: colors[label],
          borderWidth: 1,
      });
  });

  return transformedData;
}


  function transformVehicleDataForGraphByYear(backendData) {
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
          if (!locationData.Vehicles) return; // Ensure "Vehicles" exists

          Object.entries(locationData.Vehicles).forEach(([fuelType, value]) => {
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
      const colors = ["#109ad8", "#45bf34", "#f26c35", "#4bc0c0", "#9966ff", "#ff9f40", "#fc8a6d", "#304dff", "#bbdbeb", "#e4acc4", "#ffd0a6", "#9cc079"]

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
      const colors = ["#109ad8", "#45bf34", "#f26c35", "#4bc0c0", "#9966ff", "#ff9f40", "#fc8a6d", "#304dff", "#bbdbeb", "#e4acc4", "#ffd0a6", "#9cc079"]
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

  // function transformActivityDataForGraphByYear(backendData) {
  //   const transformedData = {
  //     labels: [],
  //     datasets: []
  //   };

  //   const metricsMap = {}; // Store fuel type data grouped by year dynamically

  //   backendData?.forEach(yearEntry => {
  //     const year = yearEntry.year;
  //     if (!transformedData.labels.includes(year)) {
  //       transformedData.labels.push(year);
  //     }

  //     Object.entries(yearEntry).forEach(([key, monthData]) => {
  //       if (key === "year" || key === "type") return;

  //       Object.values(monthData).forEach(locationData => {
  //         if (!locationData.Activity) return; // Ensure "Type" exists

  //         Object.entries(locationData.Activity).forEach(([fuelType, value]) => {
  //           if (!metricsMap[fuelType]) {
  //             metricsMap[fuelType] = new Array(transformedData.labels.length).fill(0);
  //           }

  //           const yearIndex = transformedData.labels.indexOf(year);
  //           metricsMap[fuelType][yearIndex] += Number(value) || 0;
  //         });
  //       });
  //     });
  //   });

  //   // Convert metrics map into datasets dynamically
  //   Object.entries(metricsMap).forEach(([fuelType, data], index) => {
  //     const colors = ["#4BA0B6", "#FF6384", "#36A2EB", "#FFCE56", "#8BC34A"]; // Define a color palette
  //     transformedData.datasets.push({
  //       label: fuelType,
  //       data: data,
  //       backgroundColor: colors[index % colors.length], // Assign color dynamically
  //       borderColor: colors[index % colors.length],
  //       borderWidth: 1,
  //     });
  //   });

  //   return transformedData;
  // }

  function transformActivityDataForGraphByYear(backendData) {
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
          if (!locationData.Activity) return; // Ensure "Activity" exists

          Object.entries(locationData.Activity).forEach(([fuelType, value]) => {
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
      const colors = ["#109ad8", "#45bf34", "#f26c35", "#4bc0c0", "#9966ff", "#ff9f40", "#fc8a6d", "#304dff", "#bbdbeb", "#e4acc4", "#ffd0a6", "#9cc079"]

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
      const colors = ["#109ad8", "#45bf34", "#f26c35", "#4bc0c0", "#9966ff", "#ff9f40", "#fc8a6d", "#304dff", "#bbdbeb", "#e4acc4", "#ffd0a6", "#9cc079"]
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
          if (!locationData.Level2) return; // Ensure "Type" exists

          Object.entries(locationData.Level2).forEach(([fuelType, value]) => {
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
      const colors = ["#109ad8", "#45bf34", "#f26c35", "#4bc0c0", "#9966ff", "#ff9f40", "#fc8a6d", "#304dff", "#bbdbeb", "#e4acc4", "#ffd0a6", "#9cc079"]

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

  // function transformLevelDataForGraphByYear(backendData) {
  //   const transformedData = {
  //     labels: [],
  //     datasets: [],
  //   };

  //   const metricsMap = {}; // Store fuel type data grouped by year dynamically

  //   backendData?.forEach((yearEntry) => {
  //     const year = yearEntry.year;
  //     if (!transformedData.labels.includes(year)) {
  //       transformedData.labels.push(year);
  //     }

  //     Object.entries(yearEntry).forEach(([key, monthData]) => {
  //       if (key === "year" || key === "type") return;

  //       Object.values(monthData).forEach((locationData) => {
  //         if (!locationData?.Level2) return; // Ensure "Level2" exists

  //         Object.entries(locationData.Level2).forEach(([fuelType, value]) => {
  //           if (value === undefined || value === null || isNaN(Number(value))) {
  //             console.warn(`Skipping invalid value for ${fuelType} in year ${year}:`, value);
  //             return; // Skip invalid values
  //           }

  //           if (!metricsMap[fuelType]) {
  //             metricsMap[fuelType] = new Array(transformedData.labels.length).fill(0);
  //           }

  //           const yearIndex = transformedData.labels.indexOf(year);
  //           const numericValue = value === 0? value : Number(value);
  //           metricsMap[fuelType][yearIndex] += numericValue;
  //         });
  //       });
  //     });
  //   });

  //   // Convert metrics map into datasets dynamically
  //   const colors = ["#4BA0B6", "#FF6384", "#36A2EB", "#FFCE56", "#8BC34A"]; // Define a color palette
  //   Object.entries(metricsMap).forEach(([fuelType, data], index) => {
  //     transformedData.datasets.push({
  //       label: fuelType,
  //       data: data.map((val) => (isNaN(val) ? 0 : val)), // Ensure no NaN values
  //       backgroundColor: colors[index % colors.length], // Assign color dynamically
  //       borderColor: colors[index % colors.length],
  //       borderWidth: 1,
  //     });
  //   });

  //   return transformedData;
  // }

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
      const colors = ["#109ad8", "#45bf34", "#f26c35", "#4bc0c0", "#9966ff", "#ff9f40", "#fc8a6d", "#304dff", "#bbdbeb", "#e4acc4", "#ffd0a6", "#9cc079"]
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
      backgroundColor: "#fc8a6d",
      borderColor: "#fc8a6d",
      borderWidth: 1,
    });

    return transformedData;
  }

  function getRandomColor() {
    return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
  }

  function transformDataForApexCharts(data) {
    const transformedData = {};

    data.forEach(entry => {
        const year = entry.year;
        if (!transformedData[year]) {
            transformedData[year] = { incidents: 0, headcount: 0 };
        }

        Object.values(entry).forEach(region => {
            if (typeof region === "object") {
                Object.values(region).forEach(location => {
                    if (location.InjuryType) {
                        Object.values(location.InjuryType).forEach(injury => {
                            transformedData[year].incidents += injury.Incidents || 0;
                            transformedData[year].headcount += injury.HeadCount || 0;
                        });
                    }
                });
            }
        });
    });

    return {
        categories: Object.keys(transformedData),
        series: [
            {
                name: "Incidents",
                data: Object.values(transformedData).map(entry => entry.incidents)
            },
            {
                name: "Headcount",
                data: Object.values(transformedData).map(entry => entry.headcount)
            }
        ]
    };
}

  const updateData = () => {

    setFilterList(null)
    setMonthFilterList(null)

    if (!fetchedData) {
      console.log("No fetched Data skipping update");
      setShowModal(true);
      // setLoading(false)
      return;
    }
    switch (module) {
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
              backgroundColor: "#109ad8",
              borderColor: "#109ad8",
              borderWidth: 1,
            },
            {
              label: "Female",
              data: dataObj[entityType]?.Female ?? [],
              backgroundColor: "#e4acc4",
              borderColor: "#e4acc4",
              borderWidth: 1,
            },
            {
              label: "Others",
              data: dataObj[entityType]?.Others ?? [],
              backgroundColor: "#f26c35",
              borderColor: "#f26c35",
              borderWidth: 1,
            },
          ],
        };

        // Month-wise data handling
        if (year) {
          console.log("Processing month-wise data...");
          let data = monthEntityTransform(fetchedData, year);
          setFilterList(data.entityTypes)
          let colorMap={"Male":"#109ad8", "Others":"#f26c35", "Female":"#e4acc4"};
          
          monthData = {
            labels: data.labels,
            datasets: Object.keys(data.dataObj[entityType] || {}).map(gender => ({
              label: gender,
              data: data.dataObj[entityType]?.[gender] ?? [],
              backgroundColor:colorMap[gender] ,
              borderColor:colorMap[gender],
              borderWidth: 1,
            }))
          }

        }
        break;
      case "Employment":
        var { labels, dataObj, entityTypes } = retentionTransform(fetchedData, "EmploymentType");
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
              backgroundColor: "#e4acc4",
              borderColor: "#e4acc4",
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
          let data = retentionTransformByMonth(fetchedData, "EmploymentType", year);
          monthData = {
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
        var { labels, dataObj, entityTypes } = retentionTransform(fetchedData, "EmployeeType");
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
              backgroundColor: "#e4acc4",
              borderColor: "#e4acc4",
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
          let data = retentionTransformByMonth(fetchedData, "EmployeeType", year);
          monthData = {
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
        yearWiseData = ecoPerformanceTransform(fetchedData)
        console.log("che", fetchedData)
        var chartData = processDataForGraph(fetchedData);
        console.log(JSON.stringify(chartData), null, 2);
        monthData = chartData;
        break;

      case "Market Presence":
        yearWiseData = mktPresenceTransform(fetchedData)
        console.log("che", fetchedData)
        var chartData = processDataForMktPresence(fetchedData);
        console.log(JSON.stringify(chartData), null, 2);
        monthData = chartData;
        break;

      case "Training and Edu":
        yearWiseData = TrainingDataForGraphByYear(fetchedData)
        if (year) monthData = TrainingDataForGraphByMonth(fetchedData, year)
        console.log("ey", yearWiseData)
        break

      case "Social Benefits":
      case "Customer Privacy":
      case "CHS":
      case "Mktg and Labelling":
        yearWiseData = transformDataForGraphByYear(fetchedData)
        if (year) monthData = transformDataForGraph(fetchedData, year)
        break;

      case "Child Labor":
      case "Bioenergy":
      case "Fuel":
      case "WTT- fuels":
      case "Water":
        yearWiseData = transformEnvDataForGraphByYear(fetchedData)
        console.log("C", yearWiseData)
        if (year) monthData = transformEnvDataForGraphByMonth(fetchedData, year)
        break;
      
      case "OH and S":
        yearWiseData=OHSDataForGraphByYear(fetchedData)
        if (year) monthData = OHSDataForGraphByMonth(fetchedData, year)
        break;

      case "Materials":
      case "Elec heat cooling":
        yearWiseData = transformActivityDataForGraphByYear(fetchedData)
        console.log("C", yearWiseData)
        if (year) monthData = transformActivityDataForGraphByMonth(fetchedData, year)
        break;
      case "Owned Vehicles":
        yearWiseData = transformLevelDataForGraphByYear(fetchedData)
        console.log("C", yearWiseData)
        if (year) monthData = transformLevelDataForGraphByMonth(fetchedData, year)
        break;

      case "Freighting goods":
      case "Employees commuting":
      case "Business travel - land and sea":
        yearWiseData = transformVehicleDataForGraphByYear(fetchedData)
        console.log("C", yearWiseData)
        if (year) monthData = transformVehicleDataForGraphByMonth(fetchedData, year)
        break;

      case "Food":
      case "Refrigerant and other":
      case "Accommodation":
      case "Flight":
      case "Home Office":
        yearWiseData = transformUnfilteredDataForGraphByYear(fetchedData)
        console.log("C", yearWiseData)
        if (year) monthData = transformUnfilteredDataForGraphByMonth(fetchedData, year)
        break;
      
        // yearWiseData = fetchedData
        // if (year) monthData = transformOHSChartDataByMonth(fetchedData, year)

        // console.log(monthData)
        // break;

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
              backgroundColor: "#e4acc4",
              borderColor: "#e4acc4",
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
          let colorMap={
            "Recycled":"#2586d6",
            "Landfilled":"#e4acc4",
            "Combusted":"#8b24d7"
          }
          console.log("Processing month-wise data...");
          let data = wasteTransformByMonth(fetchedData, year);
          monthData = {
            labels: data.labels,
            datasets: Object.keys(data.dataObj[entityType] || {}).map(gender => ({
              label: gender,
              data: data.dataObj[entityType]?.[gender] ?? [],
              backgroundColor: colorMap[gender],
              borderColor: colorMap[gender],
              borderWidth: 1,
            }))
          }


          console.log("A", wasteTransform(fetchedData));

          break;





        }
        break;



      // setLoading(false)


    }
    setYearData(yearWiseData)
    setMonthWiseData(monthData);
  }

  useEffect(() => {
    if (yearData) {
      setLoading(false)
    }
  }, [yearData])

  useEffect(() => {
    updateData()
  }, [year])

  console.log("test ", fetchedData)

  console.log("year", yearData);
  console.log("month", monthWiseData)

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
              <select onChange={(e) => { setEntityType(e.target.value) }} className="border rounded-xl border-[#29C472] px-3 py-2">
                {filterList.map((val, index) => {
                  return (<option key={index} >{val}</option>)
                })}
              </select>
            }
          </div>
        </div>
        {loading ? (
          showModal ? (
            <div className='flex items-center justify-center'>
              No Data available for analytics.
            </div>
          ) : (
            <div className='flex items-center justify-center'>
              <Spinner />
            </div>
          )
        ) : (
          <>
            {module == "Fuel" && <BarChartApex data={yearData} setYear={setYear} />}
            {module == "Bioenergy" && <BarChartApex data={yearData} setYear={setYear} />}
            {module == "WTT- fuels" && <BarChartApex data={yearData} setYear={setYear} />}
            {module == "Water" && <BarChartApex data={yearData} setYear={setYear} />}
            {module == "Food" && <BarChartApex data={yearData} setYear={setYear} fill={true} />}
            {module == "Accommodation" && <BarChartApex data={yearData} setYear={setYear} fill={true} />}
            {module == "Flight" && <BarChartApex data={yearData} setYear={setYear} fill={true}  />}
            {module == "Home Office" && <BarChartApex data={yearData} setYear={setYear} fill={true} />}
            {module == "Refrigerant and other" && <BarChartApex data={yearData} setYear={setYear} fill={true} />}
            {module == "Owned Vehicles" && <BarChartApex data={yearData} setYear={setYear} />}
            {module == "Materials" && <BarChartApex data={yearData} setYear={setYear} />}
            {module == "Freighting goods" && <BarChartApex data={yearData} setYear={setYear} />}
            {module == "Employees commuting" && <BarChartApex data={yearData} setYear={setYear} />}

            {module == "Business travel - land and sea" && <BarChartApex data={yearData} setYear={setYear} />}
            {module == "Retention" && (
              <LineChart data={yearData} lines={linesConfig} xKey="year" yLabel="Number of People" setYear={setYear} />
            )}
            {module == "Employment" && (
              <LineChart data={yearData} lines={linesConfig} xKey="year" yLabel="Number of People" setYear={setYear} />
            )}
            {module == "Entity" && <BarChartApex data={yearData} stacked={false} setYear={setYear} />}
            {module == "Elec heat cooling" && <BarChartApex data={yearData} stacked={false} setYear={setYear} />}
            {module == "Mktg and Labelling" && <BarChartApex data={yearData} stacked={false} setYear={setYear} />}
            {module == "Customer Privacy" && <BarChartApex data={yearData} stacked={false} setYear={setYear} />}
            {module == "Child Labor" && <BarChartApex data={yearData} stacked={false} setYear={setYear} />}
            {module == "CHS" && <BarChartApex data={yearData} stacked={false} setYear={setYear} />}
            {module == "Social Benefits" && <BarChartApex data={yearData} stacked={false} setYear={setYear} />}
            {module == "Eco. Performance" && <BarChartApex data={yearData} setYear={setYear} />}
            {module == "Market Presence" && <BarChartApex data={yearData} setYear={setYear} />}
            {module == "Waste Disposal" && <BarChartApex data={yearData} setYear={setYear} />}
            {module == "Training and Edu" && <BarChartApex data={yearData} setYear={setYear} />}
            {module == "OH and S" && <BarChartApex data={yearData} xLabel={"Years"} setYear={setYear} />}
          </>
        )}
      </div>
      {(monthWiseData?.labels?.length === 0 && monthWiseData?.datasets?.length === 0) ? (
        <div className='flex items-center justify-center'>

        </div>
      ) : (
        <div className=" bg-white rounded-lg w-full p-3">
          <div className="flex justify-between px-3 mb-3">
            <div className="font-bold text-lg text-slate-600">MONTH-WISE-{year}</div>
            <div className="flex gap-24 items-center">
              {/* <div className=" flex gap-3 items-center">
                <div className="w-4 h-4 rounded-full bg-[#3d9f86]"></div>
                <div>Emission %</div>
              </div> */}
              {monthFilterList &&
                <select onChange={(e) => { setEntityType(e.target.value) }} className="border rounded-xl border-[#29C472] px-3 py-2">
                  {monthFilterList.map((val, index) => {
                    return (<option key={index} >{val}</option>)
                  })}
                </select>
              }
            </div>
          </div>
          {module == "Fuel" && <BarChartApex data={monthWiseData} />}
          {module == "Bioenergy" && <BarChartApex data={monthWiseData} />}
          {module == "WTT- fuels" && <BarChartApex data={monthWiseData} />}
          {module == "Water" && <BarChartApex data={monthWiseData} />}
          {module == "Materials" && <BarChartApex data={monthWiseData} />}
          {module == "Freighting goods" && <BarChartApex data={monthWiseData} />}
          {module == "Food" && <BarChartApex data={monthWiseData} fill={true}/>}
          {module == "Accommodation" && <BarChartApex data={monthWiseData} fill={true} />}
          {module == "Flight" && <BarChartApex data={monthWiseData} fill={true} />}
          {module == "Home Office" && <BarChartApex data={monthWiseData} fill={true} />}
          {module == "Refrigerant and other" && <BarChartApex data={monthWiseData} fill={true} />}
          {module == "Employees commuting" && <BarChartApex data={monthWiseData} />}
          {module == "Business travel - land and sea" && <BarChartApex data={monthWiseData} />}
          {module == "Owned Vehicles" && <BarChartApex data={monthWiseData} />}
          {module == "Retention" && (
            <LineChart data={monthWiseData} lines={linesConfig} xKey="month" yLabel="Number of People" />
          )}
          {module == "Employment" && (
            <LineChart data={monthWiseData} lines={linesConfig} xKey="month" yLabel="Number of People" />
          )}
          {module == "Entity" && <BarChartApex data={monthWiseData} stacked={false} />}
          {module == "Waste Disposal" && <BarChartApex data={monthWiseData} stacked={false} />}
          {module == "Elec heat cooling" && <BarChartApex data={monthWiseData} stacked={false} />}
          {module == "Mktg and Labelling" && <BarChartApex data={monthWiseData} stacked={false} />}
          {module == "Customer Privacy" && <BarChartApex data={monthWiseData} stacked={false} />}
          {module == "Child Labor" && <BarChartApex data={monthWiseData} stacked={false} />}
          {module == "CHS" && <BarChartApex data={monthWiseData} stacked={false} />}
          {module == "Social Benefits" && <BarChartApex data={monthWiseData} stacked={false} />}
          {module == "Eco. Performance" && <BarChartApex data={monthWiseData} />}
          {module == "Market Presence" && <BarChartApex data={monthWiseData} />}
          {module == "Training and Edu" && <BarChartApex data={monthWiseData} />}
          {module == "OH and S" && <BarChartApex data={monthWiseData} />}
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
