import DoughnutChart from '../components/DoughnutChart';
import LineChart from '../components/LineChart'
import MapComponent from '../components/Map'
import { firestore } from "../firebase";
import { getDocs, doc, collection, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useSidebar } from '../context/SidebarContext';
import { useMemo } from 'react';

const sampleData = [
  { year: 2001, men: 75, women: 50, others: 25 },
  { year: 2002, men: 65, women: 55, others: 35 },
  { year: 2003, men: 50, women: 60, others: 45 },
  { year: 2004, men: 55, women: 65, others: 75 },
  { year: 2005, men: 45, women: 70, others: 65 },
  { year: 2006, men: 60, women: 65, others: 50 },
  { year: 2007, men: 50, women: 55, others: 40 },
  { year: 2008, men: 55, women: 50, others: 45 },
  { year: 2009, men: 65, women: 45, others: 50 },
  { year: 2010, men: 75, women: 35, others: 55 },
];

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

const linesConfig = [
  { dataKey: "men", color: "#1E90FF" },
  { dataKey: "women", color: "#FF4500" },
  { dataKey: "others", color: "#800080" },
];

// const data = {
//     labels: ["BOD", "CFO", "CEO"], // Labels for the doughnut segments
//     datasets: [
//       {
//         data: [300, 50, 100], // Values for the doughnut segments
//         backgroundColor: ["#FF5733", "#33AFFF", "#FFEB33"], // Segment colors
//         hoverBackgroundColor: ["#FF5733", "#33AFFF", "#FFEB33"],
//       },
//     ],
//   };
const months = [
  { name: "January", value: 1 }, { name: "February", value: 2 },
  { name: "March", value: 3 }, { name: "April", value: 4 },
  { name: "May", value: 5 }, { name: "June", value: 6 },
  { name: "July", value: 7 }, { name: "August", value: 8 },
  { name: "September", value: 9 }, { name: "October", value: 10 },
  { name: "November", value: 11 }, { name: "December", value: 12 }
];

const dataForDughtNut = (receivedData) => {
  // Extract labels and values
  const labels = Object.keys(receivedData);
  const values = Object.values(receivedData);

  // Define colors (Generate dynamically if more values exist)
  const backgroundColors = ["#109ad8", "#45bf34", "#f26c35", "#4bc0c0", "#9966ff", "#ff9f40", "#fc8a6d", "#304dff", "#bbdbeb", "#e4acc4", "#ffd0a6", "#9cc079"];

  const data = {
    labels: labels, // Labels for the doughnut segments
    datasets: [
      {
        data: values, // Values for the doughnut segments
        backgroundColor: backgroundColors.slice(0, labels.length), // Assign colors dynamically
        hoverBackgroundColor: backgroundColors.slice(0, labels.length),
      },
    ],
  };

  console.log(data);

  return data
}






const GovOverview = () => {
  const [overviewObj, setOverviewObj] = useState()
  const { userData, master } = useSidebar()
  const [doughnutData, setDoughnutData] = useState({ labels: [], datasets: [] });
  const [selectedYear, setSelectedYear] = useState("All");
  const [selectedMonth, setSelectedMonth] = useState("All");
  const [selectedCountry, setSelectedCountry] = useState("All");
  const [selectedState, setSelectedState] = useState("All");
  const [selectedDistrict, setSelectedDistrict] = useState("All");
  const [selectedBlock, setSelectedBlock] = useState("All");
  const [filterlist, setfilterlist] = useState([]);
  const [filteredOverview, setFilteredOverview] = useState([]);
  const [lowestlevelData, setlowestlevelData] = useState(null)
  const [chartData, setChartData] = useState()

  const [areaChart1, setAreaChart1] = useState();
  const [areaChart2, setAreaChart2] = useState();
  const [labelList, setLabelList] = useState([]);
  const [fullLabelList, setFullLabelList] = useState();

  // const {master} = useSidebar();

  // console.log("d",master)
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
    console.log("check", obj)

  }

  const mergeAndSumObjects = (obj1, obj2) => {
    const result = { ...obj1 }; // Clone obj1 to avoid modifying it

    for (const key in obj2) {
      if (obj2.hasOwnProperty(key)) {
        if (typeof obj2[key] === "object" && obj2[key] !== null && !Array.isArray(obj2[key])) {
          // Special case for "Eco. Performance" → Append values as arrays instead of summing
          if (key === "Eco. Performance") {
            result[key] = result[key] || {}; // Initialize if not present
            for (const subKey in obj2[key]) {
              if (obj2[key].hasOwnProperty(subKey)) {
                result[key][subKey] = result[key][subKey] || []; // Ensure it's an array
                result[key][subKey].push(obj2[key][subKey]); // Append value
              }
            }
          } else {
            // If it's another object, recurse
            result[key] = mergeAndSumObjects(result[key] || {}, obj2[key]);
          }
        } else {
          // If value is a number (or primitive), sum it up
          result[key] = (result[key] || 0) + obj2[key];
        }
      }
    }

    return result;
  };




  const fetchAnalyticsData = async () => {
    try {
      // Reference to the Firestore collection
      if (userData) {
        const collectionRef = collection(firestore, userData?.domain, "AnalyticsData", "Reporting Data");

        // Query documents where the name contains the module
        const q = query(collectionRef, where("type", "==", "Governance-Overview"));
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

  function getFormattedDates(data) {
    const dates = [];

    // Loop through each item in the data array
    data.forEach(item => {
      // Extract the year from the item
      const year = item.year;

      // Check the 'type' key to identify the months
      Object.keys(item).forEach(key => {
        if (key !== 'type' && key !== 'year') {
          const month = parseInt(key, 10);  // Get the month number (e.g., 1 for January, 10 for October)

          if (month >= 1 && month <= 12) {
            // Create the month name and append it to the year
            const date = new Date(year, month - 1); // month is 0-indexed in JavaScript Date
            const options = { month: 'short', year: 'numeric' };
            const formattedDate = date.toLocaleDateString('en-US', options);  // Format to "Mon-YYYY"
            dates.push(formattedDate);
          }
        }
      });
    });

    return [...new Set(dates)]; // Return unique values (avoiding duplicates)
  }





  useEffect(() => {
    fetchAnalyticsData()

  }, [])

  useEffect(() => {
    if (selectedYear != "All") {
      setLabelList(fullLabelList.filter((items) => {
        return items.includes(selectedYear)
      }))
    }
    else {
      if (overviewObj) setLabelList(getFormattedDates(overviewObj))
    }
    if (selectedMonth != "All") {
      setLabelList(fullLabelList.filter((items) => {
        return items.includes(selectedMonth)
      }))
    }
    // else{
    //   if(overviewObj)setLabelList(getFormattedDates(overviewObj))
    // }
  }, [selectedYear, selectedMonth])


  useEffect(() => {
    if (overviewObj) setFullLabelList(getFormattedDates(overviewObj))
    if (overviewObj) setLabelList(getFormattedDates(overviewObj))
  }, [overviewObj])

  useEffect(() => {

    if (filteredOverview && filteredOverview["Entity"]) {
      const labels = Object.keys(filteredOverview["Entity"]);
      const data = Object.values(filteredOverview["Entity"]);

      setChartData({
        labels, // Correctly update labels
        datasets: [
          {
            data, // Correctly update data
            backgroundColor: ["#109ad8", "#45bf34", "#f26c35", "#4bc0c0", "#9966ff", "#ff9f40", "#fc8a6d", "#304dff", "#bbdbeb", "#e4acc4", "#ffd0a6", "#9cc079"],
          },
        ],
      });
    }


    if (filteredOverview && filteredOverview["Eco. Performance"]) {
      console.log("labelist", labelList);
      const ecoData = filteredOverview["Eco. Performance"];


      setAreaChart1({
        labels: labelList,
        datasets: [
          {
            label: "Net Worth",
            data: ecoData["Total Revenue"],
            backgroundColor: "#109ad8",
            borderColor: "#0a6a94",
            borderWidth: 1,
            fill: 'origin'
          },
          {
            label: "Total turnover",
            data: ecoData["Total turnover"],
            backgroundColor: "#f26c35",
            borderColor: "#c23e08",
            borderWidth: 1,
            fill: 'origin'
          }
        ],
      })
      setAreaChart2({
        labels: labelList,
        datasets: [
          {
            label: "Direct economic value Distributed",
            data: ecoData["Direct economic value Distributed"],
            backgroundColor: "#109ad8",
            borderColor: "#0a6a94",
            borderWidth: 1,
            fill: 'origin'
          },
          {
            label: "Direct economic value generated",
            data: ecoData["Direct economic value generated"],
            backgroundColor: "#f26c35",
            borderColor: "#c23e08",
            borderWidth: 1,
            fill: 'origin'
          }
        ],
      })
    }



  }, [filteredOverview, labelList]); // Runs only when `filteredOverview` changes
  useEffect(() => {
    if (lowestlevelData) {
      total()
    }
  }, [lowestlevelData])

  console.log(JSON.stringify(chartData))

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

console.log("chart2",areaChart2)
  return (
    <div className='flex flex-col gap-2'>
      <div className="bg-white px-4 py-3 rounded-xl flex gap-4 items-center">
        {/* Branch Filter */}
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

      </div>
      <div className=" flex items-center gap-2 w-full">
        <div className="flex flex-col justify-between rounded-xl p-3 w-[30rem] bg-white">
          <div className='font-semibold text-xl text-[#343C6A]'>ENTITY</div>
          {chartData ?
            <DoughnutChart data={chartData} />
            :
            <div className="h-48 mx-auto flex items-center justify-center">
              No data available for analytics
            </div>
          }
        </div>
        <div className=" bg-white rounded-xl border w-[40rem] h-[18rem] px-3 py-2 flex-1">
          <div className=' font-semibold mb-2 text-xl text-[#343C6A]'>MARKET PRESENCE</div>
          <MapComponent />
        </div>
      </div>
      <div className='bg-white rounded-xl border w-full px-3 py-2 '>
        <div className='font-semibold text-xl text-[#343C6A]'>ECONOMIC PERFORMANCE</div>
        <div className='flex justify-between mt-5'>
          <div className='flex-1 '>
            {/* <div className='flex items-center gap-2 ml-10'>
                    <div className="w-4 h-4 rounded-full bg-[#3d9f86]">
                    </div>
                    <div>Emission %</div>
                </div> */}
            {areaChart1 ?
              <LineChart
                data={areaChart1}
                // lines={linesConfig}
                fillVal={true}
              /> :
              <div className="h-48 mx-auto flex items-center justify-center">
                No Data available for analytics
              </div>
            }
          </div>
          <div className='flex-1'>
            {/* <div className='flex items-center gap-2 ml-10'>
                    <div className="w-4 h-4 rounded-full bg-[#3d9f86]">
                    </div>
                    <div>Emission %</div>
                </div> */}
            {/* <LineChart
                    data={areaChart2}
                    lines={linesConfig}
                    xKey=""
                    yLabel=""
                    fillVal={true}
                /> */}
            {areaChart2 ?
              <LineChart
                data={areaChart2}
                lines={linesConfig}
                xKey=""
                yLabel=""
                fillVal={true}
              /> :
              <div className="h-48 mx-auto flex items-center justify-center">
                No Data available for analytics
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  )
}

export default GovOverview