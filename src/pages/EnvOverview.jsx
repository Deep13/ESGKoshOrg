import flight from "../assets/flight.png"
import road from "../assets/Road.png"
import ship from "../assets/ship.png"
import tower from "../assets/tower.png"
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import PieChart from "../components/PieChart";
import PyramidChart from "../components/PyramidChart";
import { firestore } from "../firebase";
import { getDoc,doc } from "firebase/firestore";
import { useSidebar } from "../context/SidebarContext";
import { useEffect, useState } from "react";




const EnvOverview = () => {
  const {userData,master}=useSidebar()
  const [overviewObj,setOverviewObj]=useState()
  const levels = 3
  const wasteData=["Combusted","Recycled","Landfilled"]
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

  const data = [
    { label: "Scope 1", value: 68, color: "text-blue-500", stroke: "stroke-blue-500" },
    { label: "Scope 2", value: 70, color: "text-green-500", stroke: "stroke-green-500" },
    { label: "Scope 3", value: 90, color: "text-red-500", stroke: "stroke-red-500" },
  ];

  const Data = [100, 80, 60, 40, 20]; // Values for each level of the pyramid
  const labels = ["Level 1", "Level 2", "Level 3", "Level 4", "Level 5"];
  const colors = ["#FF4560", "#FEB019", "#00E396", "#008FFB", "#775DD0"];

  console.log(master.currentReportingCycle.year)
  const fetchAnalyticsData = async () => {
    try {
      const docRef = doc(
        firestore,
        userData.domain,
        "AnalyticsData",
        "Reporting Data",
        `Environment-Overview-${master.currentReportingCycle.year}` 
      );
  
      const docSnap = await getDoc(docRef);
  
      if (docSnap.exists()) {
        console.log("Document Data:", docSnap.data());
        setOverviewObj( docSnap.data())
        return docSnap.data(); // Return data for further processing
      } else {
        console.log("No document found!");
        return null;
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      return null;
    }
  };

  useEffect(()=>{
    fetchAnalyticsData()
  },[])

  return (
    <div className='flex flex-col px-3 py-2 gap-2 overflow-x-hidden'>

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
              <div>52344 </div>
              <div>kgCO2e</div>
            </div>
            <div className="flex flex-col justify-center items-center">
              <div className="w-24 h-24">
                <img src={road} alt="flight-img"></img>
              </div>
              <div>Road</div>
              <div>1408</div>
              <div>kgCO2e</div>
            </div>
            <div className="flex flex-col justify-center items-center">
              <div className="w-24 h-24">
                <img src={ship} alt="flight-img"></img>
              </div>
              <div>Sea</div>
              <div>750</div>
              <div>kgCO2e</div>
            </div>
          </div>
        </div>
      </div>
      <div className=" flex gap-3 items-center">
        <div className="bg-white flex-1 h-[19rem] p-2 border rounded-xl">
          <div className="font-semibold text-xl text-[#343C6A] mb-1">EMISSION BY CATEGORIES</div>
          <div className="flex">
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
           
    
          </div>
        </div>
        <div className="bg-white w-[12rem] h-[19rem] overflow-y-hidden p-2 border rounded-xl flex flex-col">
            <div className="font-semibold text-lg text-[#343C6A]">
              EMISSION FROM ELECTRICITY CONSUMPTION
            </div>
            <div className="flex mt-1 items-center">
              <div className=" text-slate-600">
                <div className="">
                  EMISSION <br/> 88919 kWh
                </div>
                {/* <div className="">
                  CONSUMPTION<br/> value
                </div> */}
              </div>
              <div className="">
                <img src={tower} alt="tower"/>
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
              <PieChart data={pieChartData}/>
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

<PyramidChart data={Data} categories={labels} colors={colors} title="Custom Pyramid Chart" />
              
          </div>
        </div>
      </div>
    </div>
  )
}

export default EnvOverview