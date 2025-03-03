import seeding from '../assets/seeding_black.png';
import social from '../assets/social.png';
import governance from '../assets/governance.png';
// import { FaArrowRight } from 'react-icons/fa';
import ProgressBar from '../components/ProgressBar';
import RecentTicketsTable from '../components/RecentTicketsTable';
import { useSidebar } from '../context/SidebarContext';
import { useEffect } from 'react';
import { getDoc, doc } from "firebase/firestore";
import { firestore } from '../firebase';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const { expanded, userData, master, sheets, fullTotalPercentage, setFullTotalPercentage } = useSidebar();

  const [avgEmissionsPercentage, setAvgEmissionsPercentage] = useState("");
  const [avgSocialPercentage, setAvgSocialPercentage] = useState("");
  const [avgGovernancePercentage, setAvgGovernancePercentage] = useState("");


  const calculateCompletion = (statistics, reports, branches) => {
    console.log("stats here", statistics, "and branch", branches)
    let result = {};
    let totalPercentage = 0;
    let totalCategories = 0;

    let totalEmissionsPercentage = 0;
    let totalSocialPercentage = 0;
    let totalGovernancePercentage = 0;

    let branchesWithData = 0;

    // Loop through only the branches present in the provided branch array
    branches?.forEach(branchObj => {
      let location = branchObj.branch; // Access the branch key
      // If branch does not exist in statistics, it will have 0% for all categories
      if (statistics[location]) {
        let locationData = statistics[location];
        let locationResult = {};
        let locationPercentageSum = 0;
        let categoryCount = 0;

        // Loop through categories: Emissions, Social, Governance
        Object.keys(reports).forEach(category => {
          let statCategory = locationData[category] || [];
          let reportCategory = reports[category];

          // Calculate the number of matches
          let matches = statCategory.filter(item => reportCategory.includes(item)).length;
          let totalInReport = reportCategory.length;

          // Calculate the percentage
          let percentage = (matches / totalInReport) * 100;
          locationResult[category] = percentage.toFixed(2) + "%";

          // Accumulate percentage for the location
          locationPercentageSum += percentage;
          categoryCount++;

          // Track category-specific percentages
          if (category === "Environment") {
            totalEmissionsPercentage += percentage;
          } else if (category === "Social") {
            totalSocialPercentage += percentage;
          } else if (category === "Governance") {
            totalGovernancePercentage += percentage;
          }
        });

        // Calculate total percentage for the location
        let locationTotalPercentage = (locationPercentageSum / categoryCount).toFixed(2) + "%";
        locationResult["Total"] = locationTotalPercentage;

        // Add to overall percentage calculation
        totalPercentage += locationPercentageSum;
        totalCategories += categoryCount;
        branchesWithData++;

        result[location] = locationResult;
      } else {
        // If location is missing from statistics, set all categories to 0%
        let locationResult = {
          "Environment": "0.00%",
          "Social": "0.00%",
          "Governance": "0.00%",
          "Total": "0.00%"
        };
        result[location] = locationResult;
        totalCategories += 3;  // 3 categories: Environment, Social, Governance
      }
    });

    // Calculate full total percentage across all branches
    let fullTotalPercentage = (totalPercentage / totalCategories).toFixed(2) + "%";

    // Calculate overall category-specific percentages
    let avgEmissionsPercentage = (totalEmissionsPercentage / branchesWithData).toFixed(2) + "%";
    let avgSocialPercentage = (totalSocialPercentage / branchesWithData).toFixed(2) + "%";
    let avgGovernancePercentage = (totalGovernancePercentage / branchesWithData).toFixed(2) + "%";

    return {
      result,
      fullTotalPercentage,
      avgEmissionsPercentage,
      avgSocialPercentage,
      avgGovernancePercentage
    };
  }

  console.log("user", userData)

  const getCalculatedPercentage = async (domain, monthYear) => {
    await getDoc(doc(firestore, domain[1], "TransactionData", monthYear.month + "-" + monthYear.year, "Statistics"))
      .then((doc) => {
        if (doc.exists && doc.data()) {
          var calculations = calculateCompletion(doc.data(), sheets, userData.branches);

          // Update state with calculated values
          setFullTotalPercentage(calculations.fullTotalPercentage);
          setAvgEmissionsPercentage(calculations.avgEmissionsPercentage);
          setAvgSocialPercentage(calculations.avgSocialPercentage);
          setAvgGovernancePercentage(calculations.avgGovernancePercentage);


          //console.log("Statistics",result, fullTotalPercentage, avgEmissionsPercentage, avgSocialPercentage, avgGovernancePercentage);
        } else {
          // console.log("error")
          setFullTotalPercentage("0.00%");
          setAvgEmissionsPercentage("0.00%");
          setAvgSocialPercentage("0.00%");
          setAvgGovernancePercentage("0.00%");

        }

        // setSheets(doc);



      })
      .catch((error) => {
        console.log(error);
        navigate('/login');
      })
  }


  useEffect(() => {
    var domain = userData?.username.split("@");
    var monthYear = master?.currentReportingCycle;
    if (domain && monthYear && sheets) {
      getCalculatedPercentage(domain, monthYear)
    }
  }, [userData, master, sheets])


  console.log("avg ", avgEmissionsPercentage)

  return (
    <div className="p-5 w-full h-screen bg-slate-100">
      <div>
        <div className="font-semibold mb-3">My Cards</div>
        <div className={`flex flex-wrap gap-3 ${expanded ? 'justify-cenetr' : 'justify-between'}`}>
          {/* Card 1 */}
          <div
            className={`${expanded ? 'w-full sm:w-[19.5rem]' : 'w-full sm:w-[20rem]'
              } h-[11rem] border rounded-xl text-white p-5  bg-gradient-to-r from-[#fff] to-[#fff] hover:from-[#3d9f86]   hover:to-[#29C472]`}
          >
            <div className="flex justify-between items-center">
              <span className="text-xl font-semibold text-[#000]">Environment</span>
              <div>
                <img src={seeding} alt="seeding icon" />
              </div>
            </div>
            <div className="mt-2 text-[2.5rem] text-[#000]">
              {avgEmissionsPercentage ?
                (avgEmissionsPercentage.split('.')[0] + "%") :
                ("_")
              }
            </div>
          </div>

          {/* Card 2 */}
          <div
            className={`${expanded ? 'w-full sm:w-[19.5rem]' : 'w-full sm:w-[20rem]'
              } h-[11rem] border rounded-xl p-5 bg-gradient-to-r from-[#fff] to-[#fff] hover:from-[#3d9f86]   hover:to-[#29C472]`}
          >
            <div className="flex justify-between items-center">
              <span className="text-xl font-semibold text-[#000]">Social</span>
              <div>
                <img src={social} alt="social icon" />
              </div>
            </div>
            <div className="mt-2 text-[2.5rem]">
              {avgSocialPercentage ? (
                avgSocialPercentage.split('.')[0] + "%") :
                ("_")
              }
            </div>
            {/* <div
              className={` flex justify-between items-center rounded-b-[1rem] border-t text-[#718EBF] p-3 ml-[-1.25rem]`}
            >
              <span>Enter Reports</span>
              <FaArrowRight />
            </div> */}
          </div>

          {/* Card 3 */}
          <div
            className={`${expanded ? 'w-full sm:w-[19.5rem]' : 'w-full sm:w-[20rem]'
              } h-[11rem] border rounded-xl p-5 bg-gradient-to-r from-[#fff] to-[#fff] hover:from-[#3d9f86]   hover:to-[#29C472]`}
          >
            <div className="flex justify-between items-center">
              <span className="text-xl font-semibold text-[#000]">Governance</span>
              <div>
                <img src={governance} alt="governance icon" />
              </div>
            </div>
            <div className="mt-2 text-[2.5rem]">
              {avgGovernancePercentage ? (
                avgGovernancePercentage.split('.')[0] + "%"
              ) : (
                "_"
              )
              }
            </div>
            {/* <div
              className={`flex justify-between items-center rounded-b-[1rem] border-t text-[#718EBF] p-3 ml-[-1.25rem]`}
            >
              <span>Enter Reports</span>
              <FaArrowRight />
            </div> */}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap mt-5 gap-5">
        {/* Reporting Section */}
        <div className="w-full sm:w-[45%] lg:w-[35%] rounded-lg">
          <div className="mb-3 font-semibold">Reporting</div>
          <div className="bg-white h-[20rem] w-full rounded-lg mb-5">
            <ProgressBar total={fullTotalPercentage} />
          </div>
        </div>

        {/* Recent Tickets Section */}
        <div className={`${expanded ? 'w-full sm:w-[60%]' : 'w-full sm:w-[63%]'} rounded-lg`}>
          <div className='flex justify-between items-center pr-1'>
            <div className="mb-3 font-semibold">Recent Tickets</div>
            <button onClick={() => {
              navigate('/support')
              setPage('support')
            }} className='bg-gradient-to-r from-[#3d9f86] to-[#29C472] text-white px-2 py-1 mb-2 rounded-lg'>
              View All
            </button>
          </div>

          <div className="bg-white h-[20rem] w-full rounded-lg">
            <RecentTicketsTable />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
