import { useSidebar } from "../context/SidebarContext"

const Header = () => {
    const {page,userData,master,module} = useSidebar()
    
    const values={
        "admin":"Admin Settings",
        "home":"Dashboard",
        "support":"Incidents",
        "branchwise":"Branch Wise Progress",
        "Environment Overview":module,
        "Social Overview":module,
        "Government Overview":module,
        "fuels":module
    }
  return (
    <div className='w-full h-16 bg-white text-[#343C6A] flex items-center justify-between px-5'>
        <div className=" font-bold ">
            {values[page]}
        </div>
        <div className="flex gap-2">
            <div>
                {master?.currentReportingCycle.status?"Current":"Last"} Reporting Cycle:
            </div>
            
            <div className="font-semibold">
                {master?.currentReportingCycle?`${master.currentReportingCycle.month}-${master.currentReportingCycle.year}`:"-"}
            </div>
        </div>
        <div className="flex gap-1">
            <div className="font-semibold">
                Welcome,
            </div>
            <div>
                {userData?.email}
            </div>
        </div>
    </div>
  )
}

export default Header