const ProgressBar = () => {
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
          <div className="flex flex-col items-center justify-center">
            <p className="text-2xl fonts-bold">78%</p>
            <p className="text-sm text-blue-400">Completed</p>
          </div>
          <button className="w-full bg-gradient-to-r from-[#3d9f86] to-[#29C472] text-white py-2 px-4 rounded-xl text-sm font-semibold hover:bg-green-600">
            See Branch Wise Progress
          </button>
        </div>
      </div>
    );
  };
  
  export default ProgressBar;
  