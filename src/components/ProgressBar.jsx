import { useNavigate } from "react-router-dom";
import { useSidebar } from "../context/SidebarContext";

const ProgressBar = ({ total }) => {
  const percentage = parseFloat(total.replace("%","")); // Set the percentage

  const radius = 45; // Radius of the semi-circle
  const stroke = 8; // Stroke width
  const circumference = Math.PI * radius; // Semi-circle circumference
  const strokeDashoffset = circumference - (percentage / 100) * circumference; // Adjust stroke offset based on percentage

  const navigate = useNavigate();
  const {setPage,master} = useSidebar();
  return (
    <div className="bg-white h-[15rem] w-full rounded-lg p-5 flex flex-col justify-between">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h4 className="text-lg text-gray-800">{master?.currentReportingCycle.status?"Current ":"Last "}
             Reporting Cycle
        </h4>
          <p className="text-[1.5rem] font-semibold text-orange-500">10-2024</p>
        </div>
        <span className="bg-blue-500 text-white text-sm px-2 py-1 rounded-full">
          {master?.currentReportingCycle.status?"In Progress":"Closed"}
        </span>
      </div>
      <div className="flex flex-col gap-4 items-center justify-center w-full">
        {/* Semi-Circular Progress Bar */}
        <svg
          width="100%"
          height="120"
          viewBox="0 0 120 60"
          className="overflow-hidden "
        >
          {/* Background Half-Circle */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            stroke="#e0e0e0"
            strokeWidth={stroke}
            fill="none"
          />
          {/* Progress Half-Circle */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            stroke="#29C472"
            strokeWidth={stroke}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform="rotate(180 60 60)" // Rotate the progress bar to start from the left
          />
        </svg>
        {/* Percentage Text */}
        <p className="text-2xl font-bold mt-[-3rem]">{total}</p>
        <p className="text-sm text-blue-400">
          {total=="100.00%"?"Completed":"Incomplete"}
        </p>

        {/* Button */}
        <button onClick={()=>{
          navigate('/branchwise');
          setPage("branchwise")

          }} className="w-full bg-gradient-to-r from-[#3d9f86] to-[#29C472] text-white py-2 px-4 rounded-xl text-sm font-semibold hover:bg-green-600">
          See Branch Wise Progress
        </button>
      </div>
    </div>
  );
};

export default ProgressBar;
