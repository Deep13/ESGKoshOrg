import { useSidebar } from "../context/SidebarContext";

const BranchWise = () => {

    const {expanded} =useSidebar();

    const tickets = [
        {
          branchName: "India-Assam-Cachar-Narsingpur",
          moduleName:"Enviorment",
          subModule: "Fuel",
          status:"Completed",
        },
        {
            branchName: "India-Assam-Cachar-Narsingpur",
            moduleName:"Enviorment",
            subModule: "Fuel",
            status:"Completed",
          },
          {
            branchName: "India-Assam-Cachar-Narsingpur",
            moduleName:"Enviorment",
            subModule: "Fuel",
            status:"Completed",
          },
          {
            branchName: "India-Assam-Cachar-Narsingpur",
            moduleName:"Enviorment",
            subModule: "Fuel",
            status:"Completed",
          },
          {
            branchName: "India-Assam-Cachar-Narsingpur",
            moduleName:"Enviorment",
            subModule: "Fuel",
            status:"Completed",
          },
          {
            branchName: "India-Assam-Cachar-Narsingpur",
            moduleName:"Enviorment",
            subModule: "Fuel",
            status:"Completed",
          },
      ];
    
      const getPriorityClass = (priority) => {
        if (priority === "Completed") return "text-white bg-[#29C472] px-5";
        if (priority === "Low") return "text-yellow-500 px-5 border border-yellow-500";
        return "text-orange-500 px-5 border border-orange-500";
      };

  return (
    <div className='bg-slate-100 flex flex-col w-full h-screen p-10'>
        <div className="flex gap-3 justify-between">
            <div className="flex gap-3">
            <div className="flex flex-col">
                <div>Branch Name</div>
                <select placeholder="All" className={`text-[#718EBF] p-3 rounded-xl mt-2 ${expanded?"w-40":"w-48"}`}>
                    <option>All</option>
                </select>
            </div>
            <div className="flex flex-col">
                <div>Module name</div>
                <select placeholder="All" className={`text-[#718EBF] p-3 rounded-xl mt-2 ${expanded?"w-40":"w-48"}`}>
                    <option>All</option>
                </select>
            </div>
            <div className="flex flex-col">
                <div>Sub-Module</div>
                <select placeholder="All"className={`text-[#718EBF] p-3 rounded-xl mt-2 ${expanded?"w-40":"w-48"}`}>
                    <option>All</option>
                </select>
            </div>
            <div className="flex flex-col">
                <div>Status</div>
                <select placeholder="All" className={`text-[#718EBF] p-3 rounded-xl mt-2 ${expanded?"w-40":"w-48"}`}>
                    <option>All</option>
                </select>
            </div>
            </div>
            <div className=" rounded-xl border border-[#718EBF] flex mt-8 my-auto py-2 px-5 cursor-pointer">
                <div className="px-5 text-xl">Reset Filters</div>
            </div>
        </div>

        <div className="rounded-[1rem] mt-5 pb-3 px-10 bg-white shadow-lg overflow-hidden">
            <table className="w-full border-collapse rounded-[1rem] py-5">
                <thead>
                    <tr className="text-left text-[#718EBF] text-md rounded-lg border-b">
                        <th className="py-2 px-3">Branch Name</th>
                        <th className="py-2 px-3">Module Name</th>
                        <th className="py-2 px-3">Sub-module</th>
                        <th className="py-2 px-3">Completion Status</th>
                    </tr>
                </thead>
                
                <tbody className="rounded-lg">
                    {tickets.map((ticket, index) => (
                    <tr key={index} className="text-gray-700 text-sm border-b mx-auto px-20">
                        <td className="py-3 px-3">{ticket.branchName}</td>
                        <td className="py-3 px-3">{ticket.moduleName}</td>
                        <td className="py-3 px-3">{ticket.subModule}</td>
                        <td className="py-3 px-3">
                            <span className={`px-2 py-1 rounded-full text-sm font-semibold ${getPriorityClass(
                                ticket.status
                                )}`}>
                                {ticket.status}
                            </span>
                            
                        </td>
                    </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
  )
}

export default BranchWise;
