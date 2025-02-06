import flight from "../assets/flight.png"
import road from "../assets/Road.png"
import ship from "../assets/ship.png"
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
  const [wasteData,setWasteData] = useState({"data":[],"labels":[]});
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
  const [treeMapData,setTreeMapData] = useState();
  //code by Deepak end////


  const scopeData = [
    { label: "Scope 1", percentage: 96, color: "#2979F2", emission: 2356392 },
    { label: "Scope 2", percentage: 2, color: "#29C472", emission: 53289 },
    { label: "Scope 3", percentage: 2, color: "#FF3D3D", emission: 33982 },
  ];
  const pieChartData = {
    labels: ["Red", "Blue", "Green", "Yellow"], // Labels for pie chart sections
    values: [300, 50, 100, 75], // Data values corresponding to each label
    colors: ["#FF5733", "#33FF57", "#3357FF", "#FFFF33"], // Colors for each slice
  };

  const transformDataForTreemap = (data) => {
    let formattedData = [];
  
    // Iterate through the main object keys
    for (const key in data) {
      if (typeof data[key] === "number") {
        // Push if it's a simple key-value pair
        formattedData.push({ x: key, y: data[key] });
      } else if (typeof data[key] === "object") {
        // Iterate through nested objects
        for (const subKey in data[key]) {
          formattedData.push({ x: `${key} - ${subKey}`, y: data[key][subKey] });
        }
      }
    }
  
    return formattedData;
  };


  const colors = ["#FF4560", "#FEB019", "#00E396", "#008FFB", "#775DD0"];



  //code by Deepak start////

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
    setFilteredOverview(obj)
    console.log(obj)
 
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
 
//   const sumData = (data, accumulator = {}) => {
//     // Iterate through all the keys in the current data
//     for (let key in data) {
//       // Check if the current key's value is an object, and recursively call sumData on it
//       if (typeof data[key] === 'object' && data[key] !== null) {
//         // If it's an object, we recurse into it
//         accumulator[key] = sumData(data[key], accumulator[key] || {});
//       } else {
//         // If it's a number, we sum it up
//         accumulator[key] = (accumulator[key] || 0) + data[key];
//       }
//     }
  
//     return accumulator;
//   };
//   let finalResult = {};

// // Iterate through the array and sum up all data
// data.forEach(item => {
//   for (let year in item) {
//     if (year !== 'year' && year !== 'type') {
//       for (let location in item[year]) {
//         finalResult = sumData(item[year][location], finalResult);
//       }
//     }
//   }
// });

// console.log(JSON.stringify(finalResult));

  useEffect(() => {
    fetchAnalyticsData()


  }, [])

  useEffect(()=>{
    if(lowestlevelData){
      total()
    }
  },[lowestlevelData])

  useEffect(()=>{
    if(filteredOverview && filteredOverview["Waste Method"]){
      setWasteData(
        {"data":Object.values(filteredOverview["Waste Method"]),
          "labels":Object.keys(filteredOverview["Waste Method"])
        }
      )
    }

    setTreeMapData(transformDataForTreemap(filteredOverview))

  },[filteredOverview])

  console.log("data transform",treeMapData)
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

console.log("test", overviewObj)


console.log("does it work?",filteredOverview)
// const [treeData,setTreeData]=useState(data);
// setTreeData(data);

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
            <h2 className="text-lg font-semibold text-gray-700 mb-4">SCOPE-WISE EMISSION</h2>
            <div className="flex justify-between">
              {scopeData.map((scope, index) => (
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
                        strokeWidth: 40, // Adjust stroke width for better visibility
                        pathTransition: "none", // Removes animation delay
                        strokeDasharray: `${scope.percentage * 2.8}, 200`, // Creates a dashed effect (4px line, 4px gap)
                      })}
                    />
                  </div>


                  {/* Labels */}
                  <p className="text-sm font-medium mt-2">{scope.label}</p>
                  {/* <p className="text-xs text-gray-500">Emission</p> */}
                  <p className="text-sm font-semibold text-gray-700">{scope.emission}</p>
                  <p className="text-sm font-semibold text-gray-700">kgCO2e</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white flex flex-col w-[26rem] h-[15rem] p-2 border rounded-xl bg-gradient-to-r from-[#3d9f86] to-[#29C472] text-white">
            <div className="">
              EMISSION FROM BUISNESS TRAVEL
            </div>
            <div className=" mt-3 flex items-center justify-between">
              <div className="flex flex-col justify-center items-center">
                <div className="w-24 h-24">
                  <img src={flight} alt="flight-img"></img>
                </div>
                <div>Flight</div>
                <div>{filteredOverview?.Flight?.toFixed(2)||"NA"}</div>
                <div>kgCO2e</div>
              </div>
              <div className="flex flex-col justify-center items-center">
                <div className="w-24 h-24">
                  <img src={road} alt="flight-img"></img>
                </div>
                <div>Road</div>
                <div>{filteredOverview?.land?.toFixed(2)||"NA"}</div>
                <div>kgCO2e</div>
              </div>
              <div className="flex flex-col justify-center items-center">
                <div className="w-24 h-24">
                  <img src={ship} alt="flight-img"></img>
                </div>
                <div>Sea</div>
                <div>{filteredOverview?.sea?.toFixed(2) ||"NA"}</div>
                <div>kgCO2e</div>
              </div>
            </div>
          </div>
        </div>
        <div className=" flex gap-3 items-center">
          <div className="bg-white flex-1 h-[19rem] p-2 border rounded-xl">
            <div className="font-semibold text-xl text-[#343C6A] mb-1">EMISSION BY CATEGORIES</div>
            {/* <div className="flex">
              <div className=" w-1/3">
                <div className="flex">
                  <div className="bg-gradient-to-r from-[#3d9f86] to-[#29C472] text-white flex flex-col px-5 py-10 rounded-md w-[10rem] items-center justify-center">
                    <div>Household</div>
                    <div>70%</div>
                  </div>
                  <div className="bg-gradient-to-r from-[#3d9f86] to-[#29C472] text-white flex flex-col px-5 py-10 rounded-md w-[10rem] items-center justify-center">
                    <div>Agriculture</div>
                    <div>70%</div>
                  </div>
                </div>
                <div className="flex justify-between items-center bg-gradient-to-r from-[#3d9f86] to-[#29C472] text-white px-5 py-[2.85rem] rounded-md">
                  <div className="text-3xl font-semibod">
                    90%
                  </div>
                  <div>Industries</div>
                </div>
              </div>
              <div className="w-2/3 flex flex-col gap-[0.1rem]">
                <div className="flex ">
                  <div className="w-1/3 flex flex-col gap-[0.1rem]">
                    <div className='flex gap-[0.1rem]'>
                      <div className="rounded-md bg-[#E34444] text-white w-1/2 flex flex-col justify-center items-center py-[1.1rem]">
                        <div>Agriculture</div>
                        <div>80%</div>
                      </div>
                      <div className="rounded-md bg-[#E34444] text-white w-1/2 flex flex-col justify-center items-center py-[1.1rem]">
                        <div>Agriculture</div>
                        <div>80%</div>
                      </div>
                    </div>
                    <div className='flex gap-[0.1rem]'>
                      <div className="rounded-md bg-[#E34444] text-white w-1/2 flex flex-col justify-center items-center py-[1.1rem]">
                        <div>Agriculture</div>
                        <div>80%</div>
                      </div>
                      <div className="rounded-md bg-[#E34444] text-white w-1/2 flex flex-col justify-center items-center py-[1.1rem]">
                        <div>Agriculture</div>
                        <div>80%</div>
                      </div>
                    </div>


                  </div>
                  <div className="w-1/3 flex flex-col gap-[0.1rem]">
                    <div className='flex gap-[0.1rem]'>
                      <div className="rounded-md bg-[#ffdeba]  w-1/2 flex flex-col justify-center items-center py-[1.1rem]">
                        <div>Agriculture</div>
                        <div>80%</div>
                      </div>
                      <div className="rounded-md bg-[#ffdeba]  w-1/2 flex flex-col justify-center items-center py-[1.1rem]">
                        <div>Agriculture</div>
                        <div>80%</div>
                      </div>
                    </div>
                    <div className='flex gap-[0.1rem]'>
                      <div className="rounded-md bg-[#ffdeba]  w-1/2 flex flex-col justify-center items-center py-[1.1rem]">
                        <div>Agriculture</div>
                        <div>80%</div>
                      </div>
                      <div className="rounded-md bg-[#ffdeba]  w-1/2 flex flex-col justify-center items-center py-[1.1rem]">
                        <div>Agriculture</div>
                        <div>80%</div>
                      </div>
                    </div>


                  </div>
                  <div className="w-1/3 flex flex-col gap-[0.1rem]">
                    <div className='flex gap-[0.1rem]'>
                      <div className="rounded-md bg-[#fef2bb]  w-1/2 flex flex-col justify-center items-center py-[1.1rem]">
                        <div>Agriculture</div>
                        <div>80%</div>
                      </div>
                      <div className="rounded-md bg-[#fef2bb]  w-1/2 flex flex-col justify-center items-center py-[1.1rem]">
                        <div>Agriculture</div>
                        <div>80%</div>
                      </div>
                    </div>
                    <div className='flex gap-[0.1rem]'>
                      <div className="rounded-md bg-[#fef2bb]  w-1/2 flex flex-col justify-center items-center py-[1.1rem]">
                        <div>Agriculture</div>
                        <div>80%</div>
                      </div>
                      <div className="rounded-md bg-[#fef2bb] w-1/2 flex flex-col justify-center items-center py-[1.1rem]">
                        <div>Agriculture</div>
                        <div>80%</div>
                      </div>
                    </div>


                  </div>
                </div>
                <div className=" flex">
                  <div className=" flex-1 bg-[#4AA9DC] text-white rounded-md p-5 flex flex-col items-center justify-center">
                    <div>Household</div>
                    <div>90%</div>
                  </div>
                  <div className="flex-1 bg-[#4AA9DC] text-white rounded-md p-5 flex flex-col items-center justify-center">
                    <div>Household</div>
                    <div>90%</div>
                  </div>
                  <div className="flex-1 bg-[#4AA9DC] text-white rounded-md p-5 flex flex-col items-center justify-center">
                    <div>Household</div>
                    <div>90%</div>
                  </div>
                </div>
              </div>


            </div> */}
            <TreemapChart data={treeMapData}/>
          </div>
          <div className="bg-white w-[12rem] h-[19rem] overflow-y-hidden p-2 border rounded-xl flex flex-col">
            <div className="font-semibold text-lg text-[#343C6A]">
              EMISSION FROM ELECTRICITY CONSUMPTION
            </div>
            <div className="flex mt-1 items-center">
              <div className=" text-slate-600">
                <div className="">
                  EMISSION <br /> {filteredOverview?.["Elec heat cooling"]?.toFixed(2) ||"NA"} kWh
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
        </div>
        <div className="flex items-center gap-5">
          <div className="bg-white flex-1 flex flex-col h-[15rem] p-2 border rounded-xl">
            <div className="font-semibold text-xl text-[#343C6A] mb-1"> WASTE EMISSION SOURCES</div>
            <div className="flex justify-between items-center px-2">
              <div className=""></div>
              <div className="">
                <PieChart data={pieChartData} />
              </div>
            </div>
          </div>
          <div className="bg-white flex flex-col w-[26rem] p-2 border rounded-xl ">
            <div className="font-semibold text-xl text-[#343C6A] mb-6"> WASTE DISPOSAL</div>
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

              <PyramidChart data={wasteData.data} categories={wasteData.labels} colors={colors} title="Custom Pyramid Chart" />

            </div>
          </div>
        </div>
      </>}
    </div>
  )
}

export default EnvOverview