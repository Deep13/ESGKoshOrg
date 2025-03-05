import flight from "../assets/flight_orange.png"
import road from "../assets/Road_green.png"
import ship from "../assets/ship_blue.png"
import dustbin from "../assets/dustbin.png"
import tower from "../assets/tower.png"
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import PieChart from "../components/PieChart";
import PyramidChart from "../components/PyramidChart";
import { firestore } from "../firebase";
import { getDocs, doc, collection, query, where } from "firebase/firestore";
import { useSidebar } from "../context/SidebarContext";
import { useEffect, useState, useMemo } from "react";
import TreemapChart from '../components/TreemapChart'
import PieApex from "../components/PieApex";
import DoughnutChart from '../components/DoughnutChart';
//code by Deepak start////
const monthNames = {
  "01": "Jan",
  "02": "Feb",
  "03": "Mar",
  "04": "Apr",
  "05": "May",
  "06": "Jun",
  "07": "Jul",
  "08": "Aug",
  "09": "Sep",
  "10": "Oct",
  "11": "Nov",
  "12": "Dec",
};
//code by Deepak end////

const data = [
  {
    x: 'India',
    value: 500,
    color: '#ff7c7c',
  },
  {
    x: 'China',
    value: 700,
    color: '#ff7f50',
  },
  {
    x: 'USA',
    value: 900,
    color: '#7c8ff7',
  },
  {
    x: 'Germany',
    value: 400,
    color: '#9a4e8d',
  },
  {
    x: 'UK',
    value: 300,
    color: '#67d2a2',
  },
  // Add more entries here...
];

const EnvOverview = () => {
  const { userData, master } = useSidebar()
  const [overviewObj, setOverviewObj] = useState([])
  const [wasteData, setWasteData] = useState({ "data": [], "labels": [] });
  //code by Deepak start////

  const [selectedYear, setSelectedYear] = useState("All");
  const [selectedMonth, setSelectedMonth] = useState("All");
  const [selectedCountry, setSelectedCountry] = useState("All");
  const [selectedState, setSelectedState] = useState("All");
  const [selectedDistrict, setSelectedDistrict] = useState("All");
  const [selectedBlock, setSelectedBlock] = useState("All");
  const [filterlist, setfilterlist] = useState([]);
  const [filteredOverview, setFilteredOverview] = useState([]);
  const [lowestlevelData, setlowestlevelData] = useState(null)
  const [treeMapData, setTreeMapData] = useState();
  const [pieChartData, setPieChartData] = useState();
  const [scopeData, setscopeData] = useState([]);
  //code by Deepak end////



  // const pieChartData = {
  //   labels: ["Red", "Blue", "Green", "Yellow"], // Labels for pie chart sections
  //   values: [300, 50, 100, 75], // Data values corresponding to each label
  //   colors: ["#FF5733", "#33FF57", "#3357FF", "#FFFF33"], // Colors for each slice
  // };

  const transformDataForTreemap = (data) => {
    let formattedData = [{ x: 0, y: 0 }];
    if (data && Object.keys(data).length > 0) {
      // Iterate through the main object keys
      delete data["Owned Vehicles ScopeWise"];
      delete data["Waste Activity"];
      delete data["Waste Method"];
      delete data["land"];
      delete data["sea"];
      console.log(JSON.stringify(data));
      const total = Object.values(data).reduce((sum, value) => sum + value, 0);

      // Convert to required format with percentage calculation
      formattedData = Object.entries(data).map(([key, value]) => ({
        x: key,
        y: parseFloat(((value / total) * 100).toFixed(2)) // Percentage calculation
      }));
      // formattedData = [];

      // for (const key in data) {
      //   if (typeof data[key] === "number") {
      //     // Push if it's a simple key-value pair
      //     formattedData.push({ x: key, y: data[key] });
      //   } else if (typeof data[key] === "object") {
      //     // Iterate through nested objects
      //     for (const subKey in data[key]) {
      //       formattedData.push({ x: `${key} - ${subKey}`, y: data[key][subKey] });
      //     }
      //   }
      // }
    }


    return formattedData;
  };


  const colors = ["#109ad8", "#45bf34", "#f26c35", "#4bc0c0", "#9966ff", "#ff9f40", "#fc8a6d", "#304dff", "#bbdbeb", "#e4acc4", "#ffd0a6", "#9cc079"];

  //waste emission pie chart gov eco performance social

  //code by Deepak start////
  // Function to sum values based on scope category
  const sumScopeValues = (data, mapping) => {
    const scopeColors = {
      "Scope 1": "#109ad8",
      "Scope 2": "#45bf34",
      "Scope 3": "#f26c35"
    };
    // Initialize Scope categories
    const scopeTotals = {
      "Scope 1": 0,
      "Scope 2": 0,
      "Scope 3": 0
    };
    for (const key in data) {
      if (typeof data[key] === "object" && data[key] !== null) {
        // If "Owned Vehicles ScopeWise", process directly (ignore "Owned Vehicles")
        if (key === "Owned Vehicles ScopeWise") {
          scopeTotals["Scope 1"] += data["Scope 1"] || 0;
          scopeTotals["Scope 2"] += data["Scope 2"] || 0;
        } else {
          sumScopeValues(data[key], mapping); // Recursive call for other nested objects
        }
      } else {
        if (key !== "Owned Vehicles") { // Ignore direct "Owned Vehicles"
          const scopeCategory = mapping[key]; // Get scope category
          if (scopeCategory) {
            scopeTotals[scopeCategory] += data[key];
          }
        }
      }
    }

    const totalEmissions = scopeTotals["Scope 1"] + scopeTotals["Scope 2"] + scopeTotals["Scope 3"];

    // Convert to required format
    const scopeDataObj = Object.keys(scopeTotals).map(scope => ({
      label: scope,
      percentage: totalEmissions ? ((scopeTotals[scope] / totalEmissions) * 100).toFixed(2) : 0,
      color: scopeColors[scope],
      emission: Math.round(scopeTotals[scope]) // Rounding emissions for cleaner output
    }))

    return scopeDataObj;

  };
  const total = (selection) => {
    var obj = {};
    if (lowestlevelData) {
      Object.keys(lowestlevelData).map(item => {
        if (selection) {
          if (item.includes(selection)) {
            obj = mergeAndSumObjects(obj, lowestlevelData[item])
          }
        }
        else {
          obj = mergeAndSumObjects(obj, lowestlevelData[item])
        }
      })
    }

    const scopeData = {
      "Fuel": "Scope 1",
      "Bioenergy": "Scope 1",
      "Refrigerant and other": "Scope 1",
      "Elec heat cooling": "Scope 2",
      // "Owned Vehicles": "Scope 1", // REMOVE THIS (We ignore direct "Owned Vehicles" value)
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





    // Sum values into their respective scopes
    var scopeWiseData = sumScopeValues(obj, scopeData);
    setscopeData(scopeWiseData)
    setFilteredOverview(obj)
    console.log(obj)
    var tempObj = { ...obj }

    if (tempObj && tempObj["Waste Method"]) {
      const sortedData = Object.fromEntries(
        Object.entries(tempObj["Waste Method"]).sort((a, b) => a[1] - b[1])
      );
      setWasteData(
        {
          "data": Object.values(sortedData),
          "labels": Object.keys(sortedData)
        }
      )
    }
    else {
      setWasteData(
        {
          "data": [],
          "labels": ['N/A']
        }
      )
    }

    if (tempObj && Object.keys(tempObj).length > 0) {
      setPieChartData(transformWasteDataForPieChart(tempObj))
      setTreeMapData(transformDataForTreemap(tempObj))
    }



  }

  const mergeAndSumObjects = (obj1, obj2) => {
    const result = { ...obj1 }; // Clone obj1 to avoid modifying it

    for (const key in obj2) {
      if (obj2.hasOwnProperty(key)) {
        if (typeof obj2[key] === "object" && obj2[key] !== null && !Array.isArray(obj2[key])) {
          // If value is an object, recurse
          result[key] = mergeAndSumObjects(result[key] || {}, obj2[key]);
        } else {
          // If value is a number (or primitive), sum it up
          result[key] = (result[key] || 0) + obj2[key];
        }
      }
    }

    return result;
  }

  const fetchAnalyticsData = async () => {
    try {
      // Reference to the Firestore collection
      if (userData) {
        const collectionRef = collection(firestore, userData?.domain, "AnalyticsData", "Reporting Data");

        // Query documents where the name contains the module
        const q = query(collectionRef, where("type", "==", "Environment-Overview"));
        // Fetch documents
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          // You can also store this data if you need
          const data = querySnapshot.docs.map(doc => doc.data());
          // getFilters(data)
          setOverviewObj(data);  // Store the fetched data in state
          var branches = {};
          data.map(item => {
            var yearMonth = item.year;
            Object.keys(item).map(item2 => {
              if (item2 !== "type" && item2 !== "year") {
                Object.keys(item[item2]).map(item3 => {

                  branches[yearMonth + "-" + monthNames[(item2 < 10) ? '0' + item2.toString() : item2.toString()] + "-" + item3] = item[item2][item3]


                })
              }

            })


          })
          setlowestlevelData(branches)
          console.log("branches", branches)
          const parsedData = Object.keys(branches).map(entry => {
            const [year, month, country, state, district, block] = entry.split("-");
            return {
              year,
              month, // Convert to month name
              country,
              state,
              district,
              block,
            };
          });
          setfilterlist(parsedData)
          console.log("parsedData", parsedData)

          console.log("Analytics", data);

          // setLoading(false)
        } else {
          console.log("No documents matching the query.");
        }
      }
    } catch (error) {
      console.error("Error fetching documents: ", error);
    }


  };


  useEffect(() => {
    fetchAnalyticsData()


  }, [])

  useEffect(() => {
    if (lowestlevelData) {
      total()
    }
  }, [lowestlevelData])



  const transformWasteDataForPieChart = (backendData) => {
    const wasteActivity = backendData["Waste Activity"];

    if (!wasteActivity) return { labels: [], series: [] };

    // Extract individual waste categories (excluding "All")
    const transformedData = Object.entries(wasteActivity)
      .filter(([key]) => key !== "All") // Exclude "All"
      .map(([key, value]) => ({
        label: key,
        value: value
      }));

    console.log("transformation", transformedData)
    const sortedData = transformedData.sort((a, b) => a.label.localeCompare(b.label));
    return {
      labels: sortedData.map(item => item.label),
      datasets: [
        {
          data: sortedData.map(item => item.value), // Correctly update data
          backgroundColor: ["#109ad8", "#45bf34", "#f26c35", "#4bc0c0", "#9966ff", "#ff9f40", "#fc8a6d", "#304dff", "#bbdbeb", "#e4acc4", "#ffd0a6", "#9cc079"],
        },
      ]
    };
  };


  // Extract unique filter options
  const years = useMemo(() => ["All", ...new Set(filterlist.map(entry => entry.year))], [filterlist]);

  const months = useMemo(() => {
    if (selectedYear === "All") return ["All"];
    const yearData = filterlist.find(entry => entry.year === selectedYear);
    if (!yearData) return ["All"];
    return ["All", ...new Set(filterlist.filter(entry => entry.year === selectedYear).map(entry => entry.month))];
  }, [filterlist, selectedYear]);

  const countries = useMemo(() => {
    if (selectedYear === "All" || selectedMonth === "All") return ["All"];

    return ["All", ...new Set(filterlist.filter(entry => entry.year === selectedYear && entry.month === selectedMonth).map(entry => entry.country))];
  }, [filterlist, selectedYear, selectedMonth]);

  const states = useMemo(() => {
    if (selectedYear === "All" || selectedMonth === "All" || selectedCountry === "All") return ["All"];

    return ["All", ...new Set(filterlist.filter(entry => entry.year === selectedYear && entry.month === selectedMonth && entry.country === selectedCountry).map(entry => entry.state))];
  }, [filterlist, selectedYear, selectedMonth, selectedCountry]);

  const districts = useMemo(() => {
    if (selectedYear === "All" || selectedMonth === "All" || selectedCountry === "All" || selectedState === "All") return ["All"];

    return ["All", ...new Set(filterlist.filter(entry => entry.year === selectedYear && entry.month === selectedMonth && entry.country === selectedCountry && entry.state === selectedState).map(entry => entry.district))];
  }, [filterlist, selectedYear, selectedMonth, selectedCountry, selectedState]);

  const blocks = useMemo(() => {
    if (selectedYear === "All" || selectedMonth === "All" || selectedCountry === "All" || selectedState === "All" || selectedDistrict === "All") return ["All"];

    return ["All", ...new Set(filterlist.filter(entry => entry.year === selectedYear && entry.month === selectedMonth && entry.country === selectedCountry && entry.state === selectedState && entry.district === selectedDistrict).map(entry => entry.block))];
  }, [filterlist, selectedYear, selectedMonth, selectedCountry, selectedState, selectedDistrict]);
  //code by Deepak end////



  console.log("does it work?", filteredOverview)
  // const [treeData,setTreeData]=useState(data);
  // setTreeData(data);
  console.log("test2", filteredOverview)

  console.log("pie", wasteData)
  return (
    <div className='flex flex-col px-3 py-2 gap-2 overflow-x-hidden'>

      {/* //code by Deepak start//// */}

      <div className="flex justify-end mb-[20px]" >
        <select value={selectedYear} onChange={(event) => {
          setSelectedYear(event.target.value);
          if (event.target.value == "All") {
            total();
            return;
          }
          total(event.target.value)
        }} className="border rounded-xl border-[#29C472] px-3 py-2 w-[120px] mr-[10px]">
          {years.map((val, index) => {
            return (<option key={index} >{val}</option>)
          })}
        </select>
        <select value={selectedMonth} onChange={(event) => {
          setSelectedMonth(event.target.value);
          if (event.target.value == "All") {
            total(selectedYear);
            return;
          }
          total(selectedYear + '-' + event.target.value)
        }} className="border rounded-xl border-[#29C472] px-3 py-2 w-[120px] mr-[10px]">
          {months.map((val, index) => {
            return (<option key={index} >{val}</option>)
          })}
        </select>
        <select value={selectedCountry} onChange={(event) => {
          setSelectedCountry(event.target.value);
          if (event.target.value == "All") {
            total(selectedYear + '-' + selectedMonth);
            return;
          }
          total(selectedYear + '-' + selectedMonth + '-' + event.target.value)
        }} className="border rounded-xl border-[#29C472] px-3 py-2 w-[120px] mr-[10px]">
          {countries.map((val, index) => {
            return (<option key={index} >{val}</option>)
          })}
        </select>
        <select value={selectedState} onChange={(event) => {
          setSelectedState(event.target.value);
          if (event.target.value == "All") {
            total(selectedYear + '-' + selectedMonth + '-' + selectedCountry);
            return;
          }
          total(selectedYear + '-' + selectedMonth + '-' + selectedCountry + '-' + event.target.value)
        }} className="border rounded-xl border-[#29C472] px-3 py-2 w-[120px] mr-[10px]">
          {states.map((val, index) => {
            return (<option key={index} >{val}</option>)
          })}
        </select>
        <select value={selectedDistrict} onChange={(event) => {
          setSelectedDistrict(event.target.value);
          if (event.target.value == "All") {
            total(selectedYear + '-' + selectedMonth + '-' + selectedCountry + '-' + selectedState);
            return;
          }
          total(selectedYear + '-' + selectedMonth + '-' + selectedCountry + '-' + selectedState + '-' + event.target.value)
        }} className="border rounded-xl border-[#29C472] px-3 py-2 w-[120px] mr-[10px]">
          {districts.map((val, index) => {
            return (<option key={index} >{val}</option>)
          })}
        </select>
        <select value={selectedBlock} onChange={(event) => {
          setSelectedBlock(event.target.value);
          if (event.target.value == "All") {
            total(selectedYear + '-' + selectedMonth + '-' + selectedCountry + '-' + selectedState + '-' + selectedDistrict);
            return;
          }
          total(selectedYear + '-' + selectedMonth + '-' + selectedCountry + '-' + selectedState + '-' + selectedDistrict + '-' + event.target.value)
        }} className="border rounded-xl border-[#29C472] px-3 py-2 w-[120px] mr-[10px]">
          {blocks.map((val, index) => {
            return (<option key={index} >{val}</option>)
          })}
        </select>
      </div>

      {/* //code by Deepak end//// */}

      {overviewObj && <>
        <div className="flex items-center gap-5">

          <div className="bg-white rounded-xl flex-1 p-3 w-full h-[15rem]">
            <h2 className="text-lg font-semibold mb-4">SCOPE-WISE EMISSION</h2>
            <div className="flex justify-between">
              {scopeData.length > 0 ? (
                scopeData.map((scope, index) => (
                  <div key={index} className="flex flex-col items-center w-1/3">
                    {/* Progress Bar */}
                    <div className="w-24">
                      <CircularProgressbar
                        value={scope.percentage}
                        text={`${scope.percentage}%`}
                        styles={buildStyles({
                          textSize: "18px",
                          pathColor: scope.color,
                          textColor: "#866969",
                          trailColor: "#E5E7EB",
                          strokeLinecap: "round",
                          pathTransitionDuration: 0.5,
                          strokeWidth: 40,
                          pathTransition: "none",
                          strokeDasharray: `${scope.percentage * 2.8}, 200`,
                        })}
                      />
                    </div>

                    {/* Labels */}
                    <p className="text-sm font-bold mt-2">{scope.label}</p>
                    <p className="text-sm font-semibold text-gray-700">{scope.emission}</p>
                    <p className="text-sm font-semibold text-gray-700">kgCO2e</p>
                  </div>
                ))
              ) : (
                <div className="flex justify-center items-center w-full h-32 text-gray-500 text-lg font-medium">
                  No data available for analytics
                </div>
              )}

            </div>
          </div>

          <div className="flex flex-col w-[26rem] h-[15rem] p-2 border rounded-xl bg-[#fff] text-black">
            <div className="text-lg font-semibold">
              EMISSION FROM BUISNESS TRAVEL
            </div>
            <div className=" mt-3 flex items-center justify-between text-black">
              <div className="flex flex-col justify-center items-center">
                <div className="w-24 h-24">
                  <img src={flight} alt="flight-img"></img>
                </div>
                <div className='font-bold'>Flight</div>
                <div>{filteredOverview?.Flight?.toFixed(2) || "NA"}</div>
                <div>kgCO2e</div>
              </div>
              <div className="flex flex-col justify-center items-center">
                <div className="w-24 h-24">
                  <img src={road} alt="flight-img"></img>
                </div>
                <div className='font-bold'>Road</div>
                <div>{filteredOverview?.land?.toFixed(2) || "NA"}</div>
                <div>kgCO2e</div>
              </div>
              <div className="flex flex-col justify-center items-center">
                <div className="w-24 h-24">
                  <img src={ship} alt="flight-img"></img>
                </div>
                <div className='font-bold'>Sea</div>
                <div>{filteredOverview?.sea?.toFixed(2) || "NA"}</div>
                <div>kgCO2e</div>
              </div>
            </div>
          </div>
        </div>
        <div className=" flex gap-3 items-center">
          <div className="bg-white flex-1 p-2 border rounded-xl">
            <div className="font-semibold text-lg mb-1">EMISSION BY CATEGORIES</div>
            {/* {treeMapData?
           <TreemapChart data={treeMapData} />
           :
           <div className="flex justify-center items-center w-full h-32 text-gray-500 text-lg font-medium">
            No data available for analytics
            </div>
           } */}
            <TreemapChart data={treeMapData} />
          </div>

        </div>
        <div className="flex items-stretch gap-5">
          <div className="bg-white w-[12rem] overflow-y-hidden p-2 border rounded-xl flex flex-col">
            <div className="font-semibold text-lg h-[100%]">
              EMISSION FROM ELECTRICITY CONSUMPTION
            </div>
            <div className="flex mt-1 items-center">
              <div className=" text-slate-600">
                <div className="">
                  {filteredOverview?.["Elec heat cooling"]?.toFixed(2) || "NA"} kgCO2e
                </div>
                {/* <div className="">
                  CONSUMPTION<br/> value
                </div> */}
              </div>
              <div className="">
                <img src={tower} alt="tower" />
              </div>
            </div>
          </div>
          <div className="bg-white flex-1 flex flex-col p-2 border rounded-xl">
            <div className="font-semibold text-lg mb-1"> WASTE EMISSION SOURCES</div>
            <div className="flex justify-between items-center px-2">
              <div className=""></div>
              <div className=" flex items-center justify-center w-full">
                {/* <PieApex data={pieChartData} /> */}
                {pieChartData?.series?.length != 0 ?
                  // <PieApex data={pieChartData} />
                  <div style={{ position: 'relative' }} className="flex">
                    <div
                      style={{
                        position: "absolute",
                        top: "45%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                      }}
                    >
                      <img src={dustbin} alt="Icon" width="70" height="70" />
                    </div>
                    <DoughnutChart data={pieChartData} />
                  </div>
                  :
                  <div className="flex justify-center items-center w-full h-64 text-gray-500 text-lg font-medium">
                    No data available for analytics
                  </div>
                }
              </div>
            </div>
          </div>
          <div className="bg-white flex flex-col w-[25rem] p-2 border rounded-xl ">
            <div className="font-semibold text-lg mb-6"> WASTE DISPOSAL</div>
            <div className=" mt-1 flex flex-col items-center justify- p-3 gap-[0.1rem]">
              {/* {Array.from({ length: levels }, (_, i) => (
          <div
            key={i}
            className="bg-gradient-to-r from-[#feae54] to-[#fedebb] rounded-lg text-center py-[0.3rem]"
            style={{
              width: `${(i + 1) * 100}px`, // Increase width progressively
            }}
          >
            {wasteData[i]}
          </div>
        ))} */}

              {wasteData?.data.length != 0 ?
                <PyramidChart data={wasteData.data} categories={wasteData.labels} colors={colors} title="Custom Pyramid Chart" />
                :
                <div className="flex justify-center items-center w-full h-52 text-gray-500 text-lg font-medium">
                  No data available for analytics
                </div>
              }

            </div>
          </div>
        </div>
      </>}
    </div>
  )
}

export default EnvOverview
