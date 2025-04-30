import { useEffect, useState } from "react"
import QuadrentChart from "../components/QuadrentChart"
import { collection, query, where, getDocs } from "firebase/firestore";
import { firestore } from "../firebase";
import { useSidebar } from "../context/SidebarContext";

const MaterialityAssessment = () => {
  const [year, setYear] = useState("All");
  const [yearList, setYearList] = useState(["All"]);
  const [backendData, setBackendData] = useState();
  const [chartData, setChartData] = useState([]);
  const { userData } = useSidebar();


  const processMaterialityScatterByStakeholder = (rawData, selectedYear = "All") => {
    if (!Array.isArray(rawData)) return [];

    // Filter data by selected year if not "All"
    const filteredData = selectedYear === "All"
      ? rawData
      : rawData.filter(entry => entry.year === Number(selectedYear));

    // Collect unique chartFields
    const chartFieldsSet = new Set();
    filteredData.forEach(entry => entry.chartFields?.forEach(field => chartFieldsSet.add(field)));
    const chartFields = Array.from(chartFieldsSet);

    const result = chartFields.map((field) => {
      let internalTotal = 0, internalCount = 0;
      let externalTotal = 0, externalCount = 0;

      filteredData.forEach(entry => {
        entry.data?.forEach(row => {
          const stakeholder = row.Stakeholder;
          const value = Number(row[field]);

          if (!isNaN(value)) {

            if (stakeholder === "Internal") {
              internalTotal += value;
              internalCount++;
            } else if (stakeholder === "External") {
              externalTotal += value;
              externalCount++;
            }
          }
        });
      });

      const internalAvg = internalCount > 0 ? internalTotal / internalCount : 0;
      const externalAvg = externalCount > 0 ? externalTotal / externalCount : 0;

      return {
        name: field,
        data: [[
          parseFloat((internalAvg).toFixed(2)),
          parseFloat((externalAvg).toFixed(2))
        ]]
        
      };
    });




    setChartData(result);
    return result;
  };

  const getMaterialityData = async () => {
    try {
      const q = query(
        collection(firestore, userData?.domain, "AnalyticsData", "Reporting Data"),
        where("type", "==", "Materiality Assessment")
      );

      const querySnapshot = await getDocs(q);
      const results = [];

      querySnapshot.forEach((doc) => {
        results.push({ id: doc.id, ...doc.data() });
      });

      return results;
    } catch (error) {
      console.error("Error fetching materiality data:", error);
      return [];
    }
  };

  useEffect(() => {
    getMaterialityData().then(data => {
      // console.log("Materiality Assessment Data:", data);
      if (data && data.length > 0) {
        setBackendData(data);
        processMaterialityScatterByStakeholder(data)
        const uniqueYears = [...new Set(data.map(item => item.year))];
        setYearList(["All", ...uniqueYears]);
      }
      else {

      }
    });
  }, []);

  useEffect(() => {
    processMaterialityScatterByStakeholder(backendData, year)
  }, [year])


  return (
    <div className={`flex flex-col w-full h-full items-center bg-white rounded-xl p-2 justify-start `}>
      <div className="w-full flex justify-end">
        <select onChange={(e) => { setYear(e.target.value) }} className="border cursor-pointer rounded-xl border-[#29C472] px-3 py-2" style={{ minWidth: 150 }}>
          {yearList.map((val, index) => {
            return (<option key={index} >{val}</option>)
          })}
        </select>
      </div>
      <div className="w-full mt-[20px]">
        {chartData.length > 0 ? <QuadrentChart series={chartData} /> : <div className="text-center " style={{ fontSize: 20 }}>No data to display</div>}
      </div>
    </div>
  )
}

export default MaterialityAssessment