// SidebarContext.js
import { createContext, useState, useContext } from 'react';

// Create the SidebarContext
const SidebarContext = createContext();

export const SidebarProvider = ({ children }) => {
  const [expanded, setExpanded] = useState(true);
  const [page,setPage] =useState("home");
  
  return (
    <SidebarContext.Provider value={{ expanded, setExpanded,page,setPage }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => useContext(SidebarContext);
