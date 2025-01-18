import { useState } from "react";
import { useSidebar } from "../context/SidebarContext"

const Fuels = () => {

    const [tab,setTab]=useState("recorded");

    const tickets = [
        {
          fuels: "Fuel",
          type:"Gaseous Fuel",
          fuels2: "CNG",
          unit:"liters",
        },
        {
            fuels: "Fuel",
            type:"Gaseous Fuel",
            fuels2: "CNG",
            unit:"liters",
          },
          {
            fuels: "Fuel",
            type:"Gaseous Fuel",
            fuels2: "CNG",
            unit:"liters",
          },
          {
            fuels: "Fuel",
            type:"Gaseous Fuel",
            fuels2: "CNG",
            unit:"liters",
          },
          {
            fuels: "Fuel",
            type:"Gaseous Fuel",
            fuels2: "CNG",
            unit:"liters",
          },
          {
            fuels: "Fuel",
            type:"Gaseous Fuel",
            fuels2: "CNG",
            unit:"liters",
          },
      ];

    const {expanded} = useSidebar();
  return (
    <div className="px-5">
        <div className="flex justify-between items-center">
            <div className="flex gap-10">
                <div onClick={()=>setTab('recorded')} className={` cursor-pointer border-b-[3px] ${tab=='recorded'?"border-[#29C472] text-[#29C472]":"text-[#718EBF] border-[#718EBF]"}`}>Records</div>
                <div onClick={()=>setTab('variant')} className={` cursor-pointer border-b-[3px] ${tab=='variant'?"border-[#29C472] text-[#29C472]":"text-[#718EBF] border-[#718EBF]"}`}>Variants</div>
            </div>
            <div className="flex gap-10">
                <div className=" border-2 rounded-xl px-3 py-2">Save as Draft</div>
                <div className=" border rounded-lg px-10 text-white bg-gradient-to-r from-[#3d9f86] to-[#29C472] py-2">Save</div>

            </div>
        </div>
        <div className="flex justify-between mt-5">
            <div>
                <div className="">State/Circle/Zone/Office</div>
                <div className="flex flex-col">
                    <select placeholder="All" className={`text-[#718EBF] p-3 rounded-xl mt-2 ${expanded?"w-40":"w-48"}`}>
                        <option>All</option>
                    </select>
                </div>
            </div>

            <div className="flex gap-2 mt-5">
                <div className="flex flex-col">
                    <select placeholder="All" className={`text-[#718EBF] p-3 rounded-xl mt-2 ${expanded?"w-24":"w-28"}`}>
                        <option>All</option>
                    </select>
                </div>

                <div className="flex flex-col">
                    <select placeholder="All" className={`text-[#718EBF] p-3 rounded-xl mt-2 ${expanded?"w-24":"w-28"}`}>
                        <option>All</option>
                    </select>
                </div>
                <div className="flex flex-col">
                    <select placeholder="All" className={`text-[#718EBF] p-3 rounded-xl mt-2 ${expanded?"w-24":"w-28"}`}>
                        <option>All</option>
                    </select>
                </div>
                <div className="flex flex-col">
                    <select placeholder="All" className={`text-[#718EBF] p-3 rounded-xl mt-2 ${expanded?"w-24":"w-28"}`}>
                        <option>All</option>
                    </select>
                </div>
                <div className="flex flex-col">
                    <select placeholder="All" className={`text-[#718EBF] p-3 rounded-xl mt-2 ${expanded?"w-24":"w-28"}`}>
                        <option>All</option>
                    </select>
                </div>
                <div className="flex flex-col">
                    <select placeholder="All" className={`text-[#718EBF] p-3 rounded-xl mt-2 ${expanded?"w-24":"w-28"}`}>
                        <option>All</option>
                    </select>
                </div>
            </div>
        </div>
        <div className="rounded-[1rem] mt-5 pb-3 px-10 bg-white shadow-lg overflow-hidden">
            <table className="w-full border-collapse rounded-[1rem] py-5">
                <thead>
                    <tr className="text-left text-[#718EBF] text-md rounded-lg border-b">
                        <th className="py-2 px-3">Fuels</th>
                        <th className="py-2 px-3">Type</th>
                        <th className="py-2 px-3">Fuels</th>
                        <th className="py-2 px-3">Unit</th>
                        <th className="py-2 px-3">Amount</th>
                        <th className="py-2 px-3">Factor</th>
                    </tr>
                </thead>
                
                <tbody className="rounded-lg">
                    {tickets.map((ticket, index) => (
                    <tr key={index} className="text-gray-700 text-sm border-b mx-auto px-20">
                        <td className="py-3 px-3">{ticket.fuels}</td>
                        <td className="py-3 px-3">{ticket.type}</td>
                        <td className="py-3 px-3">{ticket.fuels2}</td>
                        <td className="py-3 px-3">{ticket.unit}</td>
                        <td className="py-3 px-3">
                            <input placeholder="Amount" className="border bg-[#eceded] py-2 px-5 rounded-xl text-[#718EBF]"/>
                        </td>
                        <td className="py-3 px-3">
                        <input placeholder="Factor" className="border bg-[#eceded] py-2 px-5 rounded-xl text-[#718EBF]"/>
                        </td>

                    </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
  )
}

export default Fuels