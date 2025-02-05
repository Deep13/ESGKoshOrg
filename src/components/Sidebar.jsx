import logo from '../assets/logo.png';
import { IoIosArrowForward, IoIosArrowBack, IoIosHome, IoIosCall } from 'react-icons/io';
import { RxPencil2 } from "react-icons/rx";
// import { SiFueler } from "react-icons/si";
import { MdLeaderboard, MdLogout } from 'react-icons/md';
import { TbReportAnalytics } from "react-icons/tb";
import { useSidebar } from '../context/SidebarContext';
import {  signOut } from "firebase/auth";
import {auth} from '../firebase';
import { useNavigate } from 'react-router-dom';
import { useState } from "react"; // Import useState
import { AiOutlineIssuesClose } from "react-icons/ai";
import { GoIssueReopened } from "react-icons/go";

export default function Sidebar({ onRaiseIncident }) {
  const { expanded, setExpanded, setPage, page, setModule, module,sheets,userData, setActiveSubmenu, activeSubmenu } = useSidebar(); // Use the hook
  const navigate = useNavigate();

  const [analyticsDropdown, setAnalyticsDropdown] = useState(false); // State for analytics dropdown

  const [reporitngDropdown,setReportingDropdown] = useState(false);

  
  const analyticsDataList={
    "Environment":["Fuel","Bioenergy","Water","WTT- fuels","Freighting goods",
      "Business travel - land and sea","Employees commuting","Materials","Owned Vehicles",
      "Refrigerant and other","Food","Accommodation","Flight","Home Office","Elec heat cooling","Waste Disposal"],
    "Governance":["Entity","Eco. Performance"],
    "Social":["Retention","Training and Edu","Mktg and Labelling","Social Benefits",
      "Employment","CHS","Child Labor","Customer Privacy","OH and S"]   
  }
  console.log("Sheet data",sheets)

  // const dataList={
  //   "Enviorment":[
  //    "Fuel",
  //    "Bioenergy",
  //    "Refrigerant and other",
  //    "Elec heat cooling",
  //    "WTT- fuels",
  //    "Waste Disposal",
  //    "Flight",
  //    "Accommodation",
  //    "Business travel - land and sea",
  //    "Freighting goods",
  //    "Employees commuting",
  //    "Food",
  //    "Home Office",
  //    "Water"
  //   ],
  //   "Social":["Employment", 
  //     "Leave", 
  //     "Retention", 
  //     "OH and S", 
  //     "Training and Edu", 
  //     "Child Labor", 
  //     "Customer Privacy", 
  //     "Mktg and Labelling", 
  //     "CHS", 
  //     "Social Benefits"
  //   ],
  //   "Governance":["Entity", 
  //     "Eco. Performance", 
  //     "Market Presence"
  //   ]
  // }

  const dataList = sheets;
  
  const handleLogout = () => {               
    signOut(auth).then(() => {
    // Sign-out successful.
        // localStorage.removeItem("userDetails")
        setPage("home");
        setAnalyticsDropdown(false);
        
        // navigate("/login");
        console.log("Signed out successfully")
    }).catch((error) => {
    // An error happened.
    console.log(error)
    });
}

  const handleClick = (value, item) => {
    if (value !== "logout") setPage(value);

    switch (value) {
      case "home":
        navigate("/dashboard");
        setAnalyticsDropdown(false);
        setActiveSubmenu("");
        setExpanded(true);
        break;
      case "support":
        navigate("/support");
        setAnalyticsDropdown(false);
        setActiveSubmenu("");
        setExpanded(true);
        break;
      case "branchwise":
        navigate("/analytics");
        setExpanded(true);
        break;
      case "social":
        navigate("/social");
        setExpanded(true);
        break;
      case "enviorment":
        navigate("/enviorment");
        setExpanded(true);
        break;
      case "governance":
        navigate("/governance");
        setExpanded(true);
        break;
      case "admin":
        navigate("/admin");
        setExpanded(true);
        setAnalyticsDropdown(false);
        setActiveSubmenu("");
        break;
      case "fuels":
        setExpanded(true);
        navigate('/reporting')
        
        break;
      case "logout":
        setPage("home");
        setAnalyticsDropdown(false);
        setActiveSubmenu("");
        navigate("/login");
        break;
      default:
        break;
    }
  };

  return (
    <aside className="sm:h-screen">
      <nav className="h-full flex flex-col bg-white border-r shadow-sm max-w-52 ">
        {/* Logo and Collapse Button */}
        <div className="p-4 pb-2 flex justify-center items-center cursor-pointer" >
          <img
            src={logo}
            className={`overflow-hidden transition-all w-10`}
            alt="Logo"
            onClick={()=>{
              navigate('/dashboard')
              setPage('home')
            }}
          />
          <div
            className={`flex justify-between items-center font-bold text-[1rem] text-[#343c6a] overflow-hidden transition-all ${expanded ? "w-28 ml-3" : "w-0"}`}
            onClick={()=>{
              navigate('/dashboard')
              setPage('home')
            }}
          >
            <h4 className="font-semibold">ESG KOSH</h4>
          </div>
          <button
            onClick={() =>{ 
              setExpanded((curr) => !curr)
              setAnalyticsDropdown(false);
              setReportingDropdown(false)
            }}
            className="p-[1rem] rounded-lg hover:bg-gray-100"
          >
            {expanded ? <IoIosArrowBack /> : <IoIosArrowForward />}
          </button>
        </div>

        {/* Sidebar Content */}
        <div className="hidden sm:flex sm:flex-col justify-between flex-1 mt-[-2rem]">
          {/* Main Menu Items */}
          <ul className="mt-10 text-slate-600 flex-1 max-h-[30.5rem] overflow-y-auto text-base
            [&::-webkit-scrollbar]:w-1
            [&::-webkit-scrollbar-track]:rounded-full
            [&::-webkit-scrollbar-track]:bg-[#f5fcf9]
            [&::-webkit-scrollbar-thumb]:rounded-full
            [&::-webkit-scrollbar-thumb]:bg-[#29C472]
            ">
            <li
              onClick={() => handleClick("home")}
              className={`flex items-center py-2 px-3 my-3 font-medium rounded-md cursor-pointer hover:bg-indigo-50 ${
                page === "home" ? "text-[#29C472] bg-[#f5fcf9]" : ""
              } ${expanded ? "justify-start" : "justify-center"}`}
            >
              <IoIosHome className="text-md" size={20} />
              {expanded && <span className="ml-3">Dashboard</span>}
            </li>


            <li
              className={`flex flex-col font-medium rounded-md ${
                expanded ? "justify-center" : "justify-center pl-4"
              }  ${
                  analyticsDropdown? "text-[#29C472] bg-[#f5fcf9]" : ""
                }`}
            >
              <div
                onClick={() => {
                  setAnalyticsDropdown((prev) => !prev)
                  setExpanded(true)
                  setReportingDropdown(false)
                  // setPage("analytics")
                }}
                className={`flex items-center py-2 px-3 mb-3 cursor-pointer hover:bg-indigo-50 ${
                  page === "analytics" ? "text-[#29C472] bg-[#f5fcf9]" : ""
                } ${expanded?"":"ml-6"}`}
              >
                <MdLeaderboard className="text-lg" size={20} />
                {expanded && (
                  <>
                    <span className="ml-3">Analytics</span>
                    <IoIosArrowForward
                      className={`ml-auto transition-transform ${
                        analyticsDropdown ? "rotate-90" : ""
                      }`}
                    />
                  </>
                )}
              </div>
              {analyticsDropdown&& (
                <ul className="ml-5 ">
                  {Object.entries(analyticsDataList).map(([key, values]) => (
                    <li key={key} className="flex flex-col">
                      <div
                        onClick={() => setActiveSubmenu((prev) => (prev === key ? null : key))}
                        className={`py-2 px-3 flex items-center font-medium rounded-md cursor-pointer hover:bg-indigo-50 ${
                          activeSubmenu === key ? "text-[#29C472] bg-[#f5fcf9]" : "text-slate-600"
                        }`}
                      >
                        <span className=''>{key}</span>
                        <IoIosArrowForward
                          className={`ml-auto transition-transform ${activeSubmenu === key ? "rotate-90" : ""}`}
                        />
                      </div>
                      {activeSubmenu === key && (
                        <ul className="px-3 max-h-[9rem] overflow-y-auto [&::-webkit-scrollbar]:w-2
                        [&::-webkit-scrollbar-track]:rounded-full
                        [&::-webkit-scrollbar-track]:bg-[#f5fcf9]
                        [&::-webkit-scrollbar-thumb]:rounded-full
                        [&::-webkit-scrollbar-thumb]:bg-[#29C472]]
                        bg-[#f5fcf9]">
                          <li className={`py-2 font-medium rounded-md cursor-pointer hover:bg-indigo-50 ${
                                module === key.toLowerCase().replace(/\s+/g, "-")
                                  ? "text-[#29C472]"
                                  : "text-slate-600"
                              }`} onClick={()=>{
                                setModule(`${key} Overview`)
                                setPage(`${key} Overview`)
                                console.log(`${key} Overview`)
                                navigate(`/${key.toLowerCase()}`)}} 
                                >Overview</li>
                          {values.map((item) => (
                            <li
                              key={item}
                              onClick={() => {
                                console.log(item)
                                setModule(item);
                                setPage("fuels");
                                navigate('/analytics')
                              }}
                              className={`py-2 font-medium rounded-md cursor-pointer hover:bg-indigo-50 ${
                                module === item
                                  ? "text-[#29C472]"
                                  : "text-slate-600"
                              }`}
                            >
                              {item}
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                  
                </ul>
              )}
            </li>

            {/* Reporting Dropdown */}
            <li
              className={`flex flex-col font-medium rounded-md ${
                expanded ? "justify-center" : "justify-center pl-6"
              }  ${
                  reporitngDropdown? "text-[#29C472] bg-[#f5fcf9]" : ""
                }`}
            >
              <div
                onClick={() => {
                  setReportingDropdown((prev) => !prev)
                  setExpanded(true)
                  setAnalyticsDropdown(false)
                  // setPage("analytics")
                }}
                className={`flex items-center py-2 px-3 cursor-pointer hover:bg-indigo-50 ${
                  page === "analytics" ? "text-[#29C472] bg-[#f5fcf9]" : ""
                } ${expanded?"":"ml-3"}`}
              >
                <TbReportAnalytics className="text-lg" size={20} />
                {expanded && (
                  <>
                    <span className="ml-3">Reporting</span>
                    <IoIosArrowForward
                      className={`ml-auto transition-transform ${
                        reporitngDropdown ? "rotate-90" : ""
                      }`}
                    />
                  </>
                )}
              </div>
              {reporitngDropdown&& (
                <ul className="ml-5 mt-2">
                  {Object.entries(dataList).map(([key, values]) => (
                    <li key={key} className="flex flex-col">
                      <div
                        onClick={() => setActiveSubmenu((prev) => (prev === key ? null : key))}
                        className={`py-2 px-3 flex items-center font-medium rounded-md cursor-pointer hover:bg-indigo-50 ${
                          activeSubmenu === key ? "text-[#29C472] bg-[#f5fcf9]" : "text-slate-600"
                        }`}
                      >
                        <span className=''>{key}</span>
                        <IoIosArrowForward
                          className={`ml-auto transition-transform ${activeSubmenu === key ? "rotate-90" : ""}`}
                        />
                      </div>
                      {activeSubmenu === key && (
                        <ul className="px-3 max-h-[9rem] overflow-y-auto [&::-webkit-scrollbar]:w-2
                        [&::-webkit-scrollbar-track]:rounded-full
                        [&::-webkit-scrollbar-track]:bg-[#f5fcf9]
                        [&::-webkit-scrollbar-thumb]:rounded-full
                        [&::-webkit-scrollbar-thumb]:bg-[#29C472]]
                        bg-[#f5fcf9]">
                          {values.map((item) => (
                            <li
                              key={item}
                              onClick={() => {
                                setModule(item);
                                handleClick("fuels",item);
                              }}
                              className={`py-2 font-medium rounded-md cursor-pointer hover:bg-indigo-50 ${
                                module === item.toLowerCase().replace(/\s+/g, "-") && page === "fuels"
                                  ? "text-[#29C472]"
                                  : "text-slate-600"
                              }`}
                            >
                              {item}
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </li>
            

                {/* {userData?.role=='Admin'&&
                <li
                className={`flex flex-col font-medium rounded-md ${
                expanded ? "justify-center" : "justify-center pl-4"
                }  ${
                adminDropdown ? "text-[#29C472] bg-[#f5fcf9]" : ""
                }`}
              >
                <div
                  onClick={() => {
                  setAdminDropdown((prev) => !prev)
                  setExpanded(true)
                  }}
                  className={`flex items-center py-2 mt-3 px-3 cursor-pointer hover:bg-indigo-50 ${
                  page === "analytics" ? "text-[#29C472] bg-[#f5fcf9]" : ""
                  }  ${expanded?"":"ml-3"}`}
                >
                <FaUser className="text-lg" size={18} />
                {expanded && (
                  <>
                    <span className="ml-3">Admin Settings</span>
                    <IoIosArrowForward
                      className={`ml-auto transition-transform ${
                      adminDropdown ? "rotate-90" : ""
                      }`}
                    />
                </>
              )}
                </div>
                {adminDropdown && (
                  <ul className={`ml-5 mt-2 `}>
                    
                  </ul>
                )}
              </li>
                } */}

                <li
                  onClick={() => handleClick("support")}
                  className={`flex gap-3 items-center py-2 px-3 my-3 font-medium rounded-md cursor-pointer hover:bg-indigo-50 ${
                    page === "support" ? "text-[#29C472] bg-[#f5fcf9]" : ""
                  } ${expanded ? "justify-start" : "justify-center"}`}
                  >
                    <AiOutlineIssuesClose className='text-md' size={22}/>
                      {expanded && <span>Incidents</span>}
                    </li>
                    {userData?.role=='Admin'&&
                      <li
                      onClick={() => handleClick("admin")}
                      className={`flex gap-3 items-center py-2 px-3 my-3 font-medium rounded-md cursor-pointer hover:bg-indigo-50 ${
                        page === "admin" ? "text-[#29C472] bg-[#f5fcf9]" : ""
                      } ${expanded ? "justify-start" : "justify-center"}`}
                    >
                      <GoIssueReopened size={22}/>
                      {expanded && <span className='text-base'>Initiate/Terminate Cycle</span>}
                    </li>
                    }
                    
          
              </ul>


          {/* Footer Menu Items */}
          <ul className="flex justify-evenly items-center border-t py-3">
            {/* Raise Incident */}
            <li
              onClick={onRaiseIncident}
              className="relative group flex flex-col items-center justify-center cursor-pointer"
            >
              <RxPencil2 className="text-lg" size={24} />
              <span className="absolute bottom-8 hidden group-hover:flex bg-gray-800 text-white text-xs rounded-md py-1 px-2">
                Raise Incident
              </span>
            </li>

            {/* Log Out */}
            <li
              onClick={handleLogout}
              className="relative group flex flex-col items-center justify-center cursor-pointer"
            >
              <MdLogout className="text-lg" size={24} />
              <span className="absolute bottom-8 hidden group-hover:flex bg-gray-800 text-white text-xs rounded-md py-1 px-2">
                Log Out
              </span>
            </li>
          </ul>

        </div>
      </nav>
    </aside>
  );
}
