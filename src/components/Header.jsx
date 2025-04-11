import { FaExclamationCircle } from "react-icons/fa";
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
        "fuels":getTitle(module),
        "materialityAssessment":"Materiality Assessment"
    }

    const tooltipData={
      "Fuel":"Combustion of fuels in owned or controlled stationary equipment such as boilers, furnaces, Turbines, heaters, incinerators, engines, flares, etc. \n\nDo not Include here the combustion of fuels in transportation devices such as automobiles, trucks, buses, trains, airplanes, boats, ships, barges, vessels, etc.",
      "Bioenergy":"Combustion of fuels produced from recently living sources at a site or in assets under the direct control of the reporting organization.",
      "Refrigerant and other": "From leakage from air-conditioning and refrigeration units or the release to the atmosphere of other gases that have a Global Warming Potential.",
      "WTT- fuels":"Emissions associated with extraction, refining, and transportation of raw fuel sources to an organization’s site (or asset) before their combustion.",
      "Materials":"All materials consumed in the reporting period cover the extraction, primary processing, manufacturing, and transporting of materials to the point of sale.",
      "Waste Disposal":"All waste disposed of in the reporting months",
      "Business travel - land and sea":" Travel for business purposes in assets not owned or directly operated by business. This includes mileage for business purposes in, for example, cars owned by employees, public transport, and hire cars.",
      "Freighting goods":"Shipment of goods over land, by air through a third–party company.",
      "Employees commuting":"Employees travel between their homes and their workplace.",
      "Home Office":"The emission factors consider the energy consumption for the workstation, lighting, and cooling or heating.",
      "Food":"Provided by the organization",
      "Owned Vehicles":"Travel in cars or motorcycles owned or controlled by the reporting organization.",
      "Elec heat cooling":"Unit of energy used from Purchased electricity, heat, steam, or cooling .",
    }
  return (
    <div className='w-full h-16 bg-white text-[#343C6A] flex items-center justify-between px-5'>
        <div className=" font-bold ">
            
            {                 
                (tooltipData[module] && page=="fuels")? (
                  <div className="flex gap-2 items-center">
                    {values[page]}
                    <div className="group cursor-pointer">
                      <FaExclamationCircle size={12}/>
                      <div className="hidden group-hover:block z-40 absolute w-80 p-2 bg-black opacity-85 text-white rounded-lg whitespace-pre-wrap">
                          {tooltipData[module]}
                      </div>

                    </div>
                  </div>
                ):(
                <div>
                  {values[page]}
                </div>
                )
             
            }
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