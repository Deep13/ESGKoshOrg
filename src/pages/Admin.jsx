import { useState } from "react";
import { useSidebar } from "../context/SidebarContext";

const Admin = () => {
    const [action,setAction]=useState("Initiate")
    const {master} = useSidebar()
    const tickets = [
        {
          monthYear: "01-2024",
          startDate:"11/25/24",
          endDate: "11/25/2024",
        },
        {
            monthYear: "01-2024",
            startDate:"11/25/24",
            endDate: "11/25/2024",
          },
          {
            monthYear: "01-2024",
            startDate:"11/25/24",
            endDate: "11/25/2024",
          },
          {
            monthYear: "01-2024",
            startDate:"11/25/24",
            endDate: "11/25/2024",
          },
          {
            monthYear: "01-2024",
            startDate:"11/25/24",
            endDate: "11/25/2024",
          },
          {
            monthYear: "01-2024",
            startDate:"11/25/24",
            endDate: "11/25/2024",
          },
      ];
    

  return (
    <div className='bg-slate-100 flex flex-col w-full h-screen p-2'>
        
        <div className="mb-3 flex justify-between items-center">
            <div className="flex">
                Current Reporting Cycle:
                <div className="font-semibold ml-3">
                {master.currentReportingCycle?`${master.currentReportingCycle.month}-${master.currentReportingCycle.year}`:"-"}
                </div>
            </div>
            <div className="flex gap-3">
                <button onClick={()=>{setAction("Initiate")}} className={`px-7 py-2 bg-gradient-to-r from-[#3d9f86] to-[#29C472] border rounded-xl ${action=='Initiate'?"opacity-50":""} text-white`} >Inititate</button>
                <button onClick={()=>{setAction("Terminate")}} className={`px-7 py-2 bg-gradient-to-r from-[#3d9f86] to-[#29C472] border rounded-xl ${action=='Terminate'?"opacity-50":""} text-white`} >Terminate</button>
            </div>
        </div>

        <div className="rounded-[1rem] mt-5 pb-3 px-10 bg-white shadow-lg overflow-hidden">
            <table className="w-full border-collapse rounded-[1rem] py-5">
                <thead>
                    <tr className="text-left text-[#718EBF] text-md rounded-lg border-b">
                        <th className="py-2 px-3">Month-Year</th>
                        <th className="py-2 px-3">Start Date</th>
                        <th className="py-2 px-3">End date</th>
                    </tr>
                </thead>
                
                <tbody className="rounded-lg">
                    {tickets.map((ticket, index) => (
                    <tr key={index} className="text-gray-700 text-sm border-b mx-auto px-20">
                        <td className="py-3 px-3">{ticket.monthYear}</td>
                        <td className="py-3 px-3">{ticket.startDate}</td>
                        <td className="py-3 px-3">{ticket.endDate}</td>
                    </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
  )
}

export default Admin;
