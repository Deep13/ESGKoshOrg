import { useSidebar } from "../context/SidebarContext"

const getTitle = (title) => {
    const aTitle = {
      "Fuel": "Fuel",
      "Bioenergy": "Bioenergy",
      "Refrigerant and other": "Refrigerant and Other",
      "Elec heat cooling": "Electricity Heat and Cooling",
      "Owned Vehicles": "Company Owned Vehicle",
      "Materials": "Materials",
      "WTT- fuels": "WTT- Fuels",
      "Waste Disposal": "Waste Disposal",
      "Flight": "Flight",
      "Accommodation": "Accommodation",
      "Business travel - land and sea": "Business Travel - Land and Sea",
      "Freighting goods": "Freighting Goods",
      "Employees commuting": "Employees Commuting",
      "Food": "Food",
      "Home Office": "Home Office",
      "Water": "Water",
      "Employment": "Employment",
      "Leave": "Leave",
      "Retention": "Retention",
      "OH and S": "Occupational Health and Safety",
      "Training and Edu": "Training and Education",
      "Child Labor": "Child Labor",
      "Customer Privacy": "Customer Privacy",
      "Mktg and Labelling": "Marketing and Labelling ",
      "CHS": "Customer Health & Safety",
      "Social Benefits": "Social Benefits",
      "Entity": "Entity",
      "Eco. Performance": "Economic Performance",
      "Market Presence": "Market Presence",
    }
    if (aTitle[title]) {
      return aTitle[title];
    }
    else {
      return title
    }
  }

const Header = () => {
    const {page,userData,master,module} = useSidebar()
    
    const values={
        "admin":"Admin Settings",
        "home":"Dashboard",
        "support":"Incidents",
        "branchwise":"Branch Wise Progress",
        "Environment Overview":module,
        "Social Overview":module,
        "Governance Overview":module,
        "fuels":getTitle(module)
    }
  return (
    <div className='w-full h-16 bg-white text-[#343C6A] flex items-center justify-between px-5'>
        <div className=" font-bold ">
            {values[page]}
        </div>
        <div className="flex gap-2">
            <div>
            {
                master && master.currentReportingCycle ? (
                    master.currentReportingCycle.status ? "Current" : "Last"
                ) + " Reporting Cycle:" : (
                    "No reporting cycle initiated yet"
                )
            }
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
                {userData?.username}
            </div>
        </div>
    </div>
  )
}

export default Header