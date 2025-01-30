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
        label: "Category A",
        data: [25, 40, 35, 10, 15, 30, 40, 20],
        backgroundColor: "#2563EB",
      },
      {
        label: "Category B",
        data: [30, 45, 40, 10, 10, 35, 45, 25],
        backgroundColor: "#DC2626",
      },
    ],
  };

  return (
    <div className="p-2 flex flex-col gap-3 items-center">
        <div className=" flex items-center gap-2 w-ful">
            <div className=" bg-white rounded-xl border w-[40rem] px-3 py-2">
                <div className="flex justify-between items-center">
                    <div className="font-semibold text-[#343C6A]">EMPLOYEE</div>
                    <select className="bg-transparent">
                        <option className="text-black">A</option>
                        <option className="text-black">A</option>
                        <option className="text-black">A</option>
                    </select>
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
                <div className=" w-full rounded-lg p-3 border flex items-center justify-between">
                    <div>Type</div>
                    <select className="bg-transparent">
                        <option className="text-black">A</option>
                        <option className="text-black">A</option>
                        <option className="text-black">A</option>
                    </select>
                </div>
            </div>
        </div>
        <div className="bg-white rounded-xl w-full h-[15rem] px-3 py-2">
            <div className=" font-semibold text-[#343C6A]">
                TRAINING AND EDUCATION
            </div>
        </div>
    </div>
  );
};

export default SocialOverview;
