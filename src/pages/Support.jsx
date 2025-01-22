const Support = () => {
    const tickets = [
      {
        id: "ESGKOSH-",
        idNum: "20241107155407",
        email: "abc@gmail.com",
        phone: "9876543210",
        title: "Reporting",
        description: "Analytics",
        date: "11/7/2024",
        status: "New",
        priority: "High",
      },
      {
        id: "ESGKOSH-",
        email: "abc@gmail.com",
        phone: "9876543210",
        title: "Reporting",
        description: "Analytics",
        date: "11/7/2024",
        status: "New",
        priority: "Med",
      },
      {
        id: "ESGKOSH-",
        idNum: "20241107155409",
        email: "abc@gmail.com",
        phone: "9876543210",
        title: "Reporting",
        description: "Analytics",
        date: "11/7/2024",
        status: "New",
        priority: "Low",
      },
    ];
  
    const getPriorityClass = (priority) => {
      if (priority === "High") return "text-red-500 px-5 border border-red-500";
      if (priority === "Low") return "text-yellow-500 px-5 border border-yellow-500";
      return "text-orange-500 px-5 border border-orange-500";
    };
  
    return (
      <div className="bg-slate-100 flex flex-col w-full min-h-screen p-2">
        <div className="flex flex-wrap gap-3">
          <div className="flex flex-col w-full sm:w-auto">
            <label className="text-gray-700">Priority</label>
            <select
              placeholder="All"
              className="text-[#718EBF] p-3 rounded-xl mt-2 w-full sm:w-52"
            >
              <option>All</option>
            </select>
          </div>
          <div className="flex flex-col w-full sm:w-auto">
            <label className="text-gray-700">Status</label>
            <select
              placeholder="All"
              className="text-[#718EBF] p-3 rounded-xl mt-2 w-full sm:w-52"
            >
              <option>All</option>
            </select>
          </div>
          <div className="px-7 bg-gradient-to-r cursor-pointer flex justify-center items-center h-12 mt-8 from-[#3d9f86] to-[#29C472] border rounded-xl text-white">
            Reset Filters
          </div>
          
        </div>
  
        <div className="rounded-[1rem] mt-5 pb-3 bg-white shadow-lg overflow-hidden pl-4">
          {/* Scrollable Table Wrapper */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse rounded-[1rem]">
              <thead>
                <tr className="text-left text-[#718EBF] text-sm rounded-lg border-b ">
                  <th className="py-2 px-3 whitespace-nowrap">Incident ID</th>
                  <th className="py-2 px-3 whitespace-nowrap">Email</th>
                  <th className="py-2 px-3 whitespace-nowrap">Phone</th>
                  <th className="py-2 px-3 whitespace-nowrap">Title</th>
                  <th className="py-2 px-3 whitespace-nowrap">Description</th>
                  <th className="py-2 px-3 whitespace-nowrap">Created Date</th>
                  <th className="py-2 px-3 whitespace-nowrap">Status</th>
                  <th className="py-2 px-3 whitespace-nowrap">Priority</th>
                </tr>
              </thead>
  
              <tbody>
                {tickets.map((ticket, index) => (
                  <tr
                    key={index}
                    className="text-gray-700 text-sm border-b"
                  >
                    <td className="py-3 px-3 whitespace-nowrap">
                      {ticket.id}
                      <br />
                      {ticket.idNum}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">{ticket.email}</td>
                    <td className="py-3 px-3 whitespace-nowrap">{ticket.phone}</td>
                    <td className="py-3 px-3 whitespace-nowrap">{ticket.title}</td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      {ticket.description}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">{ticket.date}</td>
                    <td className="py-3 px-3 whitespace-nowrap">{ticket.status}</td>
                    <td className="py-3 px-3 whitespace-nowrap">
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
      </div>
    );
  };
  
  export default Support;
  