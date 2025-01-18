const ProgressBar = () => {
  const percentage = 78; // Set the percentage

  const radius = 45; // radius of the semi-circle
  const stroke = 8; // stroke width
  const strokeDasharray = Math.PI * radius; // the half-circle circumference
  const strokeDashoffset = strokeDasharray - (100 - percentage) / 100 * strokeDasharray; // the stroke offset

  return (
    <div className="bg-white h-[15rem] w-full rounded-lg p-5 flex flex-col justify-between">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h4 className="text-lg text-gray-800">Current Reporting Cycle</h4>
          <p className="text-[1.5rem] font-semibold text-orange-500">10-2024</p>
        </div>
        <span className="bg-blue-500 text-white text-sm px-2 py-1 rounded-full">
          In Progress
        </span>
      </div>
      <div className="flex flex-col gap-4 items-center justify-center w-full">
        {/* Semi-Circular Progress Bar */}
        <svg
          width="100%" // Make SVG fill the available width
          height="120" // Set height to accommodate the full semi-circle
          viewBox="0 0 120 60" // Set viewBox to match the full semi-circle
        >
          {/* Background Half-Circle */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            stroke="#29C472"
            strokeWidth={stroke}
            fill="none"
          />
          {/* Progress Half-Circle */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            stroke="#e0e0e0"
            strokeWidth={stroke}
            fill="none"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform="rotate(90 60 60)" // Rotate to start from the left
          />

          
        </svg>
        {/* Percentage Text */}
        <p className="text-2xl font-bold mt-[-3rem]">{percentage}%</p>
        <p className="text-sm text-blue-400">Completed</p>

        {/* Button */}
        <button className="w-full bg-gradient-to-r from-[#3d9f86] to-[#29C472] text-white py-2 px-4 rounded-xl text-sm font-semibold hover:bg-green-600">
          See Branch Wise Progress
        </button>
      </div>
    </div>
  );
};

export default ProgressBar;
