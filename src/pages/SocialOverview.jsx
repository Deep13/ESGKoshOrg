import { useState } from "react";
import retention from '../assets/retention.png'
import { Bar } from "react-chartjs-2";
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

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const SocialOverview = () => {
  const [employeeType, setEmployeeType] = useState("Employee Type");

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
    {"BOD":[{"KG":2,"OG":23,"LG":10,"SG":28,"MG":70,"PG":2,},"#4ba9dd"]},
    {"COD":[{"KG":20,"rG":12,"Kr":2,"MG":92,"BG":20,"AG":10,},"#239b62"]},
    {"DOD":[{"KG":10,"5G":20,"ZG":25,"UG":15,"YG":10,"mG":200,},"#ffde52"]},
    {"AOD":[{"KG":20,"4G":20,"2DG":20,"pG":20,"UG":20,"kG":20,},"#e34444"]},
  ]

  dummyData.map((data)=>{
    console.log(Object.keys(data))
    console.log(data[Object.keys(data)[0]][0])
    console.log(data[Object.keys(data)[0]][1])
  })



  return (
    <div className="p-2 flex flex-col gap-3 items-center">
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
                    <SocialGraph data={employeeData}/>
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
              
              {dummyData.map((data, index) => {
                const key = Object.keys(data)[0]; // Get the first key (e.g., "BOD", "COD", etc.)
                const values = data[key][0]; // Get the first object inside the array
                const bgColor=data[key][1];

                return (
                  <div key={index} className="flex items-center gap-[5rem] p-3 my-2 rounded">
                    {/* First key */}
                    <div className="text-slate-500 font-medium mb-2">{key}</div>
                    
                    {/* Key-value pairs */}
                    <div className="flex flex-wrap gap-4">
                      {Object.entries(values).map(([k, v], idx) => (
                        <div style={{ backgroundColor: bgColor }} key={idx} className={`p-2 rounded shadow-sm px-${v}`}>
                          {k},
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
        </div>
    </div>
  );
};

export default SocialOverview;
