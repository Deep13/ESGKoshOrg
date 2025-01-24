// SidebarContext.js
import { createContext, useState, useContext } from 'react';

// Create the SidebarContext
const SidebarContext = createContext();

export const SidebarProvider = ({ children }) => {
  const [expanded, setExpanded] = useState(true);
  const [page,setPage] = useState("home");
  const [module,setModule] = useState("");
  const [master, setMaster] = useState();
  const [userData, setUserData] = useState();
  const [sheets,setSheets] = useState();
  
  return (
    <SidebarContext.Provider value={{ expanded, setExpanded,page,setPage,module,setModule,master, sheets,setSheets, setMaster,userData, setUserData}}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => useContext(SidebarContext);
