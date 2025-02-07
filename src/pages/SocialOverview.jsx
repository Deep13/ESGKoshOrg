import { useState } from "react";
import retention from '../assets/retention.png'
import { useMemo,useEffect } from "react";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import SocialGraph from "../components/SocialGraph";
import { firestore } from "../firebase";
import { getDocs, doc, collection, query, where } from "firebase/firestore";
import { useSidebar } from "../context/SidebarContext";
import BarApex from "../components/BarApex";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const SocialOverview = () => {
  const [employeeChart, setEmployeeChart] = useState();
  const [overviewObj, setOverviewObj] = useState([])
  
  const {userData} =useSidebar()

  const [selectedYear, setSelectedYear] = useState("All");
  const [selectedMonth, setSelectedMonth] = useState("All");
  const [selectedCountry, setSelectedCountry] = useState("All");
  const [selectedState, setSelectedState] = useState("All");
  const [selectedDistrict, setSelectedDistrict] = useState("All");
  const [selectedBlock, setSelectedBlock] = useState("All");
  const [filterlist, setfilterlist] = useState([]);
  const [filteredOverview, setFilteredOverview] = useState([]);
  const [lowestlevelData, setlowestlevelData] = useState(null);
  const [barData,setBarData] = useState();

   useEffect(() => {
      fetchAnalyticsData()
  
  
    }, [])
  
    useEffect(()=>{
      if(lowestlevelData){
        total()
      }
    },[lowestlevelData])

    useEffect(()=>{
      if(filteredOverview && filteredOverview["Employment"]){
        const labels=Object.keys(filteredOverview["Employment"])
        const maleData = labels.map(ageGroup => filteredOverview["Employment"][ageGroup].Male || 0);
        const femaleData = labels.map(ageGroup => filteredOverview["Employment"][ageGroup].Female || 0); 
        const monthWiseData = {
    labels: Object.keys(filteredOverview["Employment"]),
    datasets: [
      {
        label: "Male",
        data: maleData,
        backgroundColor: "#2563EB",
        borderColor: "#2563EB",
        borderWidth: 1,
      },
      {
        label: "Female",
        data: femaleData,
        backgroundColor: "#DC2626",
        borderColor: "#DC2626",
        borderWidth: 1,
      }
    ],
  
   
  };

  console.log("a",JSON.stringify(monthWiseData))
  setEmployeeChart(monthWiseData)

      }

      if(filteredOverview && filteredOverview["Training and Edu"]){
        setBarData(filteredOverview["Training and Edu"])
      }
      
    },[filteredOverview])
  
    console.log("e",employeeChart)

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

  // function calculateRetention(data, country, state, district, branch) {
  //     // Find data for the current year and selected month
  //     const currentYearData = data.find(entry => entry.year === selectedYear);
  //     if (!currentYearData) {
  //         console.log("No data for selected year:", selectedYear);
  //         return;
  //     }
  
  //     const currentMonthData = currentYearData[selectedMonth];
  //     if (!currentMonthData || !currentMonthData[country] || !currentMonthData[country][state] || !currentMonthData[country][state][district] || !currentMonthData[country][state][district][branch]) {
  //         console.log("No data for selected country, state, district, or branch");
  //         return;
  //     }
  
  //     const currentBranchData = currentMonthData[country][state][district][branch];
  //     const currentRetention = currentBranchData.Retention;
  
  //     // Find data for the previous year and selected month
  //     const previousYearData = data.find(entry => entry.year === (selectedYear - 1));
  //     if (!previousYearData) {
  //         console.log("No data for previous year:", selectedYear - 1);
  //         return 100;  // If no previous year data exists, set retention to 100%
  //     }
  
  //     const previousMonthData = previousYearData[selectedMonth];
  //     if (!previousMonthData || !previousMonthData[country] || !previousMonthData[country][state] || !previousMonthData[country][state][district] || !previousMonthData[country][state][district][branch]) {
  //         console.log("No data for previous year, selected country, state, district, or branch");
  //         return 100;  // If no data for the previous year or month, set retention to 100%
  //     }
  
  //     const previousBranchData = previousMonthData[country][state][district][branch];
  //     const previousRetention = previousBranchData.Retention;
  
  //     // Calculate Retention Percentage
  //     const retentionPercentage = ((currentRetention - previousRetention) / previousRetention) * 100;
  //     console.log(`Retention Percentage for ${branch} in ${district}, ${state}, ${country}, ${selectedMonth} ${selectedYear}: ${retentionPercentage}%`);
  //     return retentionPercentage;
  // }
  
  
  // Generate random colors
  const getRandomColor = () => {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  const employeeData = {
    labels: ["60%", "40%", "20%", "0%", "20%", "40%", "60%", "60%"],
    datasets: [
      {
        label: "Male",
        data: [25, 40, 35, 10, 15, 30, 40, 20],
        backgroundColor: "#2563EB",
      },
      {
        label: "Female",
        data: [30, 45, 40, 10, 10, 35, 45, 25],
        backgroundColor: "#DC2626",
      },
    ],
  };

  const dummyData=[
    {"BOD":[{"KG":2,"OG":23,"LG":10,"SG":28,"MG":70,"PG":2,},"#4ba9dd",["full name","fullname",]]},
    {"COD":[{"KG":20,"rG":12,"Kr":2,"MG":92,"BG":20,"AG":10,},"#239b62"]},
    {"DOD":[{"KG":10,"5G":20,"ZG":25,"UG":15,"YG":10,"mG":200,},"#ffde52"]},
    {"AOD":[{"KG":20,"4G":20,"2DG":20,"pG":20,"UG":20,"kG":20,},"#e34444"]},
  ]

  dummyData.map((data)=>{
    console.log(Object.keys(data))
    console.log(data[Object.keys(data)[0]][0])
    console.log(data[Object.keys(data)[0]][1])
  })

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
        const q = query(collectionRef, where("type", "==", "Social-Overview"));
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

  // useEffect(()=>{

  // },[overviewObj,selectedYear])

  console.log("a",filteredOverview)

  return (
    <div className="p-2 flex flex-col gap-3 items-center">
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
        <div className=" flex items-center justify-between gap-2 w-full">
            <div className=" bg-white rounded-xl border w-[40rem] px-3 py-2 flex-1">
                <div className="flex justify-between items-center">
                    <div className="font-semibold text-[#343C6A]">EMPLOYEE</div>
                    {/* <select className="bg-transparent">
                        <option className="text-black">A</option>
                        <option className="text-black">A</option>
                        <option className="text-black">A</option>
                    </select> */}
                </div>
                <div className="mt-2">
                    <SocialGraph data={employeeChart}/>
                </div>
            </div>
            <div className="flex flex-col justify-between rounded-xl p-2 w-[23rem] h-[15.5rem] bg-gradient-to-r from-[#43729F] to-[#008397] text-white">
                <div className=" flex justify-center items-center gap-5">
                    <div className=" flex flex-col justify-between items-center gap-[3rem]">
                        <div className="font-bold text-2xl">Retention</div>
                        <di className="text-4xl">80%</di>
                    </div>
                    <div className="ml-3">
                        <img src={retention} alt="retention Icon"/>
                    </div>
                </div>
                {/* <div className=" w-full rounded-lg p-3 border flex items-center justify-between">
                    <div>Type</div>
                    <select className="bg-transparent">
                        <option className="text-black">A</option>
                        <option className="text-black">A</option>
                        <option className="text-black">A</option>
                    </select>
                </div> */}
            </div>
        </div>
        <div className="bg-white rounded-xl w-full px-3 py-2">
            <div className=" font-semibold text-[#343C6A]">
                TRAINING AND EDUCATION
            </div>

            <div className="w-full flex flex-col px-3 py-2">
              
            {/* {Object.entries(filteredOverview["Training and Edu"]).map(([key, values], index) => {
  const bgColor = getRandomColor(); // Default background color, modify if needed

  return (
    <div key={index} className="flex items-center gap-[5rem] p-3 my-2 rounded">
      First key (Category like Employees, Workers, etc.)
      <div className="text-slate-500 font-medium mb-2">{key}</div>

      
      <div className="flex flex-wrap gap-4">
        {Object.entries(values)
          .filter(([_, v]) => v !== 0 && v !== null) // Skip 0 and null values
          .map(([k, v], idx) => (
            <div key={idx} className="group ">
              <div
              
              style={{ backgroundColor: bgColor, paddingLeft: `${v * 0.5}rem`, paddingRight: `${v * 0.5}rem`  }}
              className={`rounded shadow-sm`}
             
            >
              {k[0]}{ k[1]}
              
            </div>

            <div className="hidden group-hover:flex cursor-pointer px-2 py-3 opacity-75 bg-black text-white">
                {k}: {v}
            </div>
            </div>

            
          ))}
      </div>
    </div>
  );
})} */}

                  <BarApex trainingData={barData}/>


            </div>
        </div>
    </div>
  );
};

export default SocialOverview;
