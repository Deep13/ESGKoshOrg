import logo from '../assets/logo.png';
import { IoIosArrowForward, IoIosArrowBack, IoIosHome, IoIosCall } from 'react-icons/io';
import { RxPencil2 } from "react-icons/rx";
import { SiFueler } from "react-icons/si";
import { MdLeaderboard, MdLogout } from 'react-icons/md';
import { FaUser } from 'react-icons/fa';
import { useSidebar } from '../context/SidebarContext';
import { useNavigate } from 'react-router-dom';

export default function Sidebar({onRaiseIncident}) {
  const { expanded, setExpanded, setPage, page } = useSidebar(); // Use the hook
  const navigate = useNavigate();

  const handleClick = (value) => {

    if(value!="logout")setPage(value);

    if (value === "home") {
      navigate('/');
    } else if (value === "support") {
      navigate('/support');
    } else if (value === "analytics") {
      navigate('/branchwise');
    } else if (value === "admin") {
      navigate('/admin');
    } else if (value === "fuels") {
      navigate('/fuels');
    }else if (value==="logout") {
      setPage("home")
      navigate('/login')
    }
  };

  return (
    <aside className="h-screen">
      <nav className="h-full flex flex-col bg-white border-r shadow-sm">
        {/* Logo and Collapse Button */}
        <div className="p-4 pb-2 flex justify-center items-center">
          <img
            src={logo}
            className={`overflow-hidden transition-all w-10`}
            alt="Logo"
          />
          <div
            className={`flex justify-between items-center font-bold text-[1rem] text-[#343c6a]
            overflow-hidden transition-all ${expanded ? 'w-40 ml-3' : 'w-0'}`}
          >
            <h4 className="font-semibold">ESG KOSH</h4>
          </div>
          <button
            onClick={() => setExpanded((curr) => !curr)}
            className="p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100"
          >
            {expanded ? <IoIosArrowBack /> : <IoIosArrowForward />}
          </button>
        </div>

        {/* Sidebar Content */}
        <div className="flex flex-col flex-1">
          {/* Main Menu Items */}
          <ul className="px-3 mt-10 text-slate-600 flex-1">
            <li
              onClick={() => handleClick("home")}
              className={`flex items-center py-2 px-3 my-3 font-medium rounded-md cursor-pointer hover:bg-indigo-50 ${page === "home" ? "text-[#29C472]" : ""} ${
                expanded ? "justify-start" : "justify-center"
              }`}
            >
              <IoIosHome className="text-lg" />
              {expanded && <span className="ml-3">Reporting</span>}
            </li>
            <li
              onClick={() => handleClick("support")}
              className={`flex items-center py-2 px-3 my-3 font-medium rounded-md cursor-pointer hover:bg-indigo-50 ${page === "support" ? "text-[#29C472]" : ""} ${
                expanded ? "justify-start" : "justify-center"
              }`}
            >
              <IoIosCall className="text-lg" />
              {expanded && <span className="ml-3">Support</span>}
            </li>
            <li
              onClick={() => handleClick("analytics")}
              className={`flex items-center py-2 px-3 my-3 font-medium rounded-md cursor-pointer hover:bg-indigo-50 ${page === "analytics" ? "text-[#29C472]" : ""} ${
                expanded ? "justify-start" : "justify-center"
              }`}
            >
              <MdLeaderboard className="text-lg" />
              {expanded && <span className="ml-3">Analytics</span>}
            </li>
            <li
              onClick={() => handleClick("admin")}
              className={`flex items-center py-2 px-3 my-1 font-medium rounded-md cursor-pointer hover:bg-indigo-50 ${page === "admin" ? "text-[#29C472]" : ""} ${
                expanded ? "justify-start" : "justify-center"
              }`}
            >
              <FaUser className="text-lg" />
              {expanded && <span className="ml-3">Admin Settings</span>}
            </li>
            <li
              onClick={() => handleClick("fuels")}
              className={`flex items-center py-2 px-3 my-1 font-medium rounded-md cursor-pointer hover:bg-indigo-50 ${page === "fuels" ? "text-[#29C472]" : ""} ${
                expanded ? "justify-start" : "justify-center"
              }`}
            >
              <SiFueler className="text-lg" />
              {expanded && <span className="ml-3">Fuels</span>}
            </li>
          </ul>

          {/* Footer Menu Items */}
          <ul className="px-3 text-slate-600">
            <li
              onClick={onRaiseIncident}
              className={`flex items-center py-2 px-3 my-3 font-medium rounded-md cursor-pointer hover:bg-indigo-50 ${page=="issue"?"text-[#29C472]":""} ${
                expanded ? "justify-start" : "justify-center"
              }`}
            >
              <RxPencil2 className="text-lg" />
              {expanded && <span className="ml-3">Raise Incident</span>}
            </li>
            <li
              onClick={() => handleClick("logout")}
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
