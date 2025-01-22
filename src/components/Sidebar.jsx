import logo from '../assets/logo.png';
import { IoIosArrowForward, IoIosArrowBack, IoIosHome, IoIosCall } from 'react-icons/io';
import { RxPencil2 } from "react-icons/rx";
// import { SiFueler } from "react-icons/si";
import { MdLeaderboard, MdLogout } from 'react-icons/md';
import { FaUser } from 'react-icons/fa';
import { useSidebar } from '../context/SidebarContext';
import {  signOut } from "firebase/auth";
import {auth} from '../firebase';
import { useNavigate } from 'react-router-dom';
import { useState } from "react"; // Import useState

export default function Sidebar({ onRaiseIncident }) {
  const { expanded, setExpanded, setPage, page, setFuel, fuel } = useSidebar(); // Use the hook
  const navigate = useNavigate();

  const [analyticsDropdown, setAnalyticsDropdown] = useState(false); // State for analytics dropdown
  const [envDropdown, setEnvDropdown] = useState(false); // State for nested dropdown
  const [adminDropdown,setAdminDropdown] = useState(false);
  const [socialDropdown, setSocialDropdown] = useState(false);
  const [govDropdown,setGovDropdown] = useState(false);

  const envList=[
     "Fuel",
     "Bioenergy",
     "Refrigerant and other",
     "Elec heat cooling",
     "WTT- fuels",
     "Waste Disposal",
     "Flight",
     "Accommodation",
     "Business travel - land and sea",
     "Freighting goods",
     "Employees commuting",
     "Food",
     "Home Office",
     "Water"
    ]

  const socialList=["Employment", "Leave", "Retention", "OH and S", "Training and Edu", "Child Labor", "Customer Privacy", "Mktg and Labelling", "CHS", "Social Benefits"]
  const governanceList=["Entity", "Eco. Performance", "Market Presence"]

  const handleLogout = () => {               
    signOut(auth).then(() => {
    // Sign-out successful.
        // localStorage.removeItem("userDetails")
        setPage("home");
        setAnalyticsDropdown(false);
        setEnvDropdown(false);
        // navigate("/login");
        console.log("Signed out successfully")
    }).catch((error) => {
    // An error happened.
    console.log(error)
    });
}

  const handleClick = (value) => {
    if (value !== "logout") setPage(value);

    switch (value) {
      case "home":
        navigate("/dashboard");
        setAnalyticsDropdown(false);
        setEnvDropdown(false);
        setExpanded(true);
        break;
      case "support":
        navigate("/support");
        setAnalyticsDropdown(false);
        setEnvDropdown(false);
        setExpanded(true);
        break;
      case "branchwise":
        navigate("/branchwise");
        setExpanded(true);
        break;
      case "admin":
        navigate("/admin");
        setExpanded(true);
        setAnalyticsDropdown(false);
        setEnvDropdown(false);
        break;
      case "fuels":
        setExpanded(true);
        navigate("/fuels");
        break;
      case "logout":
        setPage("home");
        setAnalyticsDropdown(false);
        setEnvDropdown(false);
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
        <div className="p-4 pb-2 flex justify-center items-center">
          <img
            src={logo}
            className={`overflow-hidden transition-all w-10`}
            alt="Logo"
          />
          <div
            className={`flex justify-between items-center font-bold text-[1rem] text-[#343c6a] overflow-hidden transition-all ${expanded ? "w-28 ml-3" : "w-0"}`}
          >
            <h4 className="font-semibold">ESG KOSH</h4>
          </div>
          <button
            onClick={() => setExpanded((curr) => !curr)}
            className="p-1.5 rounded-lg hover:bg-gray-100"
          >
            {expanded ? <IoIosArrowBack /> : <IoIosArrowForward />}
          </button>
        </div>

        {/* Sidebar Content */}
        <div className="hidden sm:flex sm:flex-col flex-1 mt-[-2rem]">
          {/* Main Menu Items */}
          <ul className=" mt-10 text-slate-600 flex-1">
            <li
              onClick={() => handleClick("home")}
              className={`flex items-center py-2 px-3 my-3 font-medium rounded-md cursor-pointer hover:bg-indigo-50 ${
                page === "home" ? "text-[#29C472] bg-[#f5fcf9]" : ""
              } ${expanded ? "justify-start" : "justify-center"}`}
            >
              <IoIosHome className="text-lg" size={24} />
              {expanded && <span className="ml-3">Dashboard</span>}
            </li>
            <li
              onClick={() => handleClick("branchwise")}
              className={`flex items-center py-2 px-3 my-3 font-medium rounded-md cursor-pointer hover:bg-indigo-50 ${
                page === "branchwise" ? "text-[#29C472] bg-[#f5fcf9]" : ""
              } ${expanded ? "justify-start" : "justify-center"}`}
            >
              <IoIosCall className="text-lg" size={24} />
              {expanded && <span className="ml-3">Reporting</span>}
            </li>

            {/* Analytics Dropdown */}
            <li
              className={`flex flex-col font-medium rounded-md ${
                expanded ? "justify-center" : "justify-center pl-4"
              }  ${
                  analyticsDropdown ? "text-[#29C472] bg-[#f5fcf9]" : ""
                }`}
            >
              <div
                onClick={() => {
                  setAnalyticsDropdown((prev) => !prev)
                  setExpanded(true)
                  // setPage("analytics")
                }}
                className={`flex items-center py-2 px-3 cursor-pointer hover:bg-indigo-50 ${
                  page === "analytics" ? "text-[#29C472] bg-[#f5fcf9]" : ""
                }`}
              >
                <MdLeaderboard className="text-lg" size={24} />
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
              {analyticsDropdown && (
                <ul className={`ml-5 mt-2 `}>
                  <li
                    onClick={() => handleClick("branchwise")}
                    className={`py-2 px-3 font-medium rounded-md cursor-pointer hover:bg-indigo-50 ${
                      page === "branchwise" ? "text-[#29C472] bg-[#f5fcf9]" : "text-slate-600"
                    }`}
                  >
                    {expanded && <span>Branchwise</span>}
                  </li>
                  <li
              onClick={() =>{ 
                setEnvDropdown((prev) => !prev)
                setSocialDropdown(false);
                setGovDropdown(false);
              }}
              className={`py-2 px-3 font-medium rounded-md cursor-pointer hover:bg-indigo-50 ${
              envDropdown ? "text-[#29C472] bg-[#f5fcf9]" : "text-slate-600"
              }`}
              >
                <div className="flex items-center gap-2">
                  
                  {expanded && <span>Environment</span>}
                  {expanded && (
                    <IoIosArrowForward
                      className={`ml-auto transition-transform ${
                      envDropdown ? "rotate-90" : ""
                      }`}
                    />
                  )}
                </div>
              </li>
              {envDropdown && (
                  <ul className=" max-h-[10rem] overflow-y-auto [&::-webkit-scrollbar]:w-2
                    [&::-webkit-scrollbar-track]:rounded-full
                    [&::-webkit-scrollbar-track]:bg-[#f5fcf9]
                    [&::-webkit-scrollbar-thumb]:rounded-full
                    [&::-webkit-scrollbar-thumb]:bg-[#29C472]]
                    bg-[#f5fcf9]
                  ">

                  {envList.map((env) => (
                    <li
                      key={env}
                      onClick={() => {
                      handleClick("fuels");
                      setFuel(env.toLowerCase().replace(/\s+/g, "-")); // Format fuel key
                      }}
                      className={`py-2 px-3 ml-2 font-medium rounded-md cursor-pointer hover:bg-indigo-50 ${
                      fuel === env.toLowerCase().replace(/\s+/g, "-") && page === "fuels"
                      ? "text-[#29C472]"
                      : "text-slate-600"
                      }`}
                    >
                      {expanded && <span>{env}</span>}
                    </li>
                  ))}
                  </ul>
              )}

            <li
              onClick={() => {
                setSocialDropdown((prev) => !prev)
                setEnvDropdown(false);
                setGovDropdown(false);
              }}
              className={`py-2 px-3 font-medium rounded-md cursor-pointer hover:bg-indigo-50 ${
              socialDropdown ? "text-[#29C472] bg-[#f5fcf9]" : "text-slate-600"
              }`}
              >
                <div className="flex items-center gap-2">
                  
                  {expanded && <span>Social</span>}
                  {expanded && (
                    <IoIosArrowForward
                      className={`ml-auto transition-transform ${
                      socialDropdown ? "rotate-90" : ""
                      }`}
                    />
                  )}
                </div>
              </li>
              {socialDropdown && (
                  <ul className="max-h-[10rem] overflow-y-auto [&::-webkit-scrollbar]:w-2
                    [&::-webkit-scrollbar-track]:rounded-full
                    [&::-webkit-scrollbar-track]:bg-[#f5fcf9]
                    [&::-webkit-scrollbar-thumb]:rounded-full
                    [&::-webkit-scrollbar-thumb]:bg-[#29C472]]
                    bg-[#f5fcf9]
                  ">

                  {socialList.map((env) => (
                    <li
                      key={env}
                      onClick={() => {
                      handleClick("fuels");
                      setFuel(env.toLowerCase().replace(/\s+/g, "-")); // Format fuel key
                      }}
                      className={`py-2 px-3 ml-2 font-medium rounded-md cursor-pointer hover:bg-indigo-50 ${
                      fuel === env.toLowerCase().replace(/\s+/g, "-") && page === "fuels"
                      ? "text-[#29C472]"
                      : "text-slate-600"
                      }`}
                    >
                      {expanded && <span>{env}</span>}
                    </li>
                  ))}
                  </ul>
              )}

              <li
              onClick={() =>{
                setGovDropdown((prev) => !prev)
                setEnvDropdown(false);
                setSocialDropdown(false);
              }}
              className={`py-2 px-3 font-medium rounded-md cursor-pointer hover:bg-indigo-50 ${
              govDropdown ? "text-[#29C472] bg-[#f5fcf9]" : "text-slate-600"
              }`}
              >
                <div className="flex items-center gap-2">
                  
                  {expanded && <span>Government</span>}
                  {expanded && (
                    <IoIosArrowForward
                      className={`ml-auto transition-transform ${
                      govDropdown ? "rotate-90" : ""
                      }`}
                    />
                  )}
                </div>
              </li>
              {govDropdown && (
                  <ul className=" max-h-[10rem] overflow-y-auto [&::-webkit-scrollbar]:w-2
                    [&::-webkit-scrollbar-track]:rounded-full
                    [&::-webkit-scrollbar-track]:bg-[#f5fcf9]
                    [&::-webkit-scrollbar-thumb]:rounded-full
                    [&::-webkit-scrollbar-thumb]:bg-[#29C472]]
                    bg-[#f5fcf9]
                  ">

                  {governanceList.map((env) => (
                    <li
                      key={env}
                      onClick={() => {
                      handleClick("fuels");
                      setFuel(env.toLowerCase().replace(/\s+/g, "-")); // Format fuel key
                      }}
                      className={`py-2 px-3 ml-2 font-medium rounded-md cursor-pointer hover:bg-indigo-50 ${
                      fuel === env.toLowerCase().replace(/\s+/g, "-") && page === "fuels"
                      ? "text-[#29C472]"
                      : "text-slate-600"
                      }`}
                    >
                      {expanded && <span>{env}</span>}
                    </li>
                  ))}
                  </ul>
              )}
                  
                </ul>
              )}
            </li>
            

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
                    className={`flex items-center py-2 px-3 cursor-pointer hover:bg-indigo-50 ${
                    page === "analytics" ? "text-[#29C472] bg-[#f5fcf9]" : ""
                    }`}
                  >
                  <FaUser className="text-lg" size={22} />
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
                      <li
                        onClick={() => handleClick("support")}
                        className={`py-2 px-3 font-medium rounded-md cursor-pointer hover:bg-indigo-50 ${
                          page === "support" ? "text-[#29C472] bg-[#f5fcf9]" : "text-slate-600"
                        }`}
                      >
                        {expanded && <span>Incidents</span>}
                      </li>
                      <li
                        onClick={() => handleClick("admin")}
                        className={`py-2 px-3 font-medium rounded-md cursor-pointer hover:bg-indigo-50 ${
                          page === "admin" ? "text-[#29C472] bg-[#f5fcf9]" : "text-slate-600"
                        }`}
                      >
                        {expanded && <span>Initiate/Terminate Cycle</span>}
                      </li>
                      
                    </ul>
                  )}
                </li>
          
              </ul>

          {/* Footer Menu Items */}
              <ul className="px-3 text-slate-600">
                <li
                  onClick={onRaiseIncident}
                  className={`flex items-center py-2 px-3 my-3 font-medium rounded-md cursor-pointer hover:bg-indigo-50 ${
                    page === "issue" ? "text-[#29C472]" : ""
                  } ${expanded ? "justify-start" : "justify-center"}`}
                >
                  <RxPencil2 className="text-lg" />
                  {expanded && <span className="ml-3">Raise Incident</span>}
                </li>
                <li
                  onClick={() => handleLogout()}
                  className={`flex items-center py-2 px-3 my-3 font-medium rounded-md cursor-pointer hover:bg-indigo-50 ${
                    expanded ? "justify-start" : "justify-center"
                  }`}
                >
                  <MdLogout className="text-lg" />
                  {expanded && <span className="ml-3">Log Out</span>}
                </li>
                
              </ul>
        </div>
      </nav>
    </aside>
  );
}
