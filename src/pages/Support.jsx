const Support = () => {

    const tickets = [
        {
          id: "ESGKOSH-",
          idNum:"20241107155407",
          email: "abc@gmail.com",
          phone:" 9876543210",
          title:"Reporting",
          description:"Analytics",
          date: "11/7/2024",
          status:"New",
          priority: "High",
        },
        {
          id: "ESGKOSH-",
          email: "abc@gmail.com",
          phone:" 9876543210",
          title:"Reporting",
          description:"Analytics",
          date: "11/7/2024",
          status:"New",
          priority: "Med",
        },
        {
          id: "ESGKOSH-",
          idNum:"20241107155409",
          email: "abc@gmail.com",
          phone:" 9876543210",
          title:"Reporting",
          description:"Analytics",
          date: "11/7/2024",
          status:"New",
          priority: "Low",
        },
      ];
    
      const getPriorityClass = (priority) => {
        if (priority === "High") return "text-red-500 px-5 border border-red-500";
        if (priority === "Low") return "text-yellow-500 px-5 border border-yellow-500";
        return "text-orange-500 px-5 border border-orange-500";
      };

  return (
    <div className='bg-slate-100 flex flex-col w-full h-screen p-10'>
        <div className="flex gap-3">
            <div className="flex flex-col">
                <div>Priority</div>
                <select placeholder="All" className="text-blue-400 p-3 rounded-xl mt-2 w-52">
                    <option>All</option>
                </select>
            </div>
            <div className="flex flex-col">
                <div>Status</div>
                <select placeholder="All" className="text-[#718EBF] p-3 rounded-xl mt-2 w-52">
                    <option>All</option>
                </select>
            </div>
            <div className=" rounded-xl border border-[#29C472] flex mt-8 my-auto py-2 px-5 cursor-pointer">
                <div className="px-5 text-xl">Reset Filters</div>
            </div>
        </div>

        <div className="rounded-[1rem] mt-5 pb-3 bg-white shadow-lg overflow-hidden">
            <table className="w-full border-collapse rounded-[1rem] py-5">
                <thead>
                    <tr className="text-left text-[#718EBF] text-sm rounded-lg border-b">
                        <th className="py-2 px-3">Incident ID</th>
                        <th className="py-2 px-3">Email</th>
                        <th className="py-2 px-3">Phone</th>
                        <th className="py-2 px-3">Title</th>
                        <th className="py-2 px-3">Description</th>
                        <th className="py-2 px-3">Created Date</th>
                        <th className="py-2 px-3">Status</th>
                        <th className="py-2 px-3">Priority</th> 
                    </tr>
                </thead>
                
                <tbody className="rounded-lg">
                    {tickets.map((ticket, index) => (
                    <tr key={index} className="text-gray-700 text-sm border-b mx-auto px-2">
                        <td className="py-3 px-3">{ticket.id}<br/>{ticket.idNum}</td>
                        <td className="py-3 px-3">{ticket.email}</td>
                        <td className="py-3 px-3">{ticket.phone}</td>
                        <td className="py-3 px-3">{ticket.title}</td>
                        <td className="py-3 px-3">{ticket.description}</td>
                        <td className="py-3 px-3">{ticket.date}</td>
                        <td className="py-3 px-3">{ticket.status}</td>
                        <td className="py-3 px-3">
                            <span
                                className={`px-2 py-1 rounded-full text-sm font-semibold ${getPriorityClass(
                                ticket.priority
                                )}`}
                            >
                                {ticket.priority}
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

export default Support;
