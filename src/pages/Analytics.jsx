import BarChart from "../components/BarChart";
import LineChart from "../components/LineChart";

const Analytics = () => {
    const yearWiseData = {
        labels: ["2001", "2002", "2003", "2004", "2005", "2007", "2008", "2009", "2010", "2011"],
        datasets: [
          {
            label: "Emission %",
            data: [25, 75, 50, 60, 80, 65, 70, 90, 75, 30],
            backgroundColor: "#3d9f86",
            borderColor: "#3d9f86",
            borderWidth: 1,
          },
        ],
      };
    
    const monthWiseData = {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        datasets: [
          {
            label: "Emission %",
            data: [25, 90, 60, 70, 60, 80, 85, 60, 70, 95, 75, 30],
            backgroundColor: "#4BA0B6",
            borderColor: "#4BA0B6",
            borderWidth: 1,
          },
        ],
      };
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

    const linesConfig = [
    { dataKey: "men", color: "#1E90FF" },
    { dataKey: "women", color: "#FF4500" },
    { dataKey: "others", color: "#800080" },
      ];

    

      return (
        <div className="flex flex-col justify-center items-center p-5 gap-5">
            <div className=" bg-white rounded-lg w-full p-3">
                <div className="flex justify-between px-3 mb-3">
                    <div className="font-bold text-lg text-slate-600">
                        YEAR-WISE
                    </div>
                    <div className="flex gap-24 items-center">
                        <div className=" flex gap-3 items-center">
                            <div className="w-4 h-4 rounded-full bg-[#3d9f86]">
                            </div>
                            <div>Emission %</div>
                        </div>
                        <select className=" border rounded-xl border-[#29C472] px-3 py-2">
                           <option> Dropdown</option>
                           <option> Dropdown</option>
                           <option> Dropdown</option>
                           <option> Dropdown</option>
                        </select>
                    </div>
                </div>
                <BarChart data={yearWiseData} title={"Year-Wise Emissions"} />
            </div>
            <div className=" bg-white rounded-lg w-full p-3">
                <div className="flex justify-between px-3 mb-3">
                    <div className="font-bold text-lg text-slate-600">
                    MONTH-WISE
                    </div>
                    <div className=" flex gap-3 items-center">
                        <div className="w-4 h-4 rounded-full bg-[#4BA0B6]">
                        </div>
                        <div>Emission %</div>
                    </div>
                </div>
                <BarChart data={monthWiseData} title= {"Month-Wise Emission" } />
            </div>
            <div className=" bg-white rounded-lg w-full p-3">
                <div className="flex justify-between px-3 mb-3">
                    <div className="font-bold text-lg text-slate-600">
                        YEAR-WISE
                    </div>
                    <div className="flex gap-24 items-center">
                        <div className=" flex gap-3 items-center">
                            <div className="w-4 h-4 rounded-full bg-[#3d9f86]">
                            </div>
                            <div>Emission %</div>
                        </div>
                        <select className=" border rounded-xl border-[#29C472] px-3 py-2">
                           <option> Dropdown</option>
                           <option> Dropdown</option>
                           <option> Dropdown</option>
                           <option> Dropdown</option>
                        </select>
                    </div>
                </div>
                <LineChart
                    data={sampleData}
                    lines={linesConfig}
                    xKey="year"
                    yLabel="Number of People"
                />
            </div>
          
        </div>
      );
    };
    

export default Analytics