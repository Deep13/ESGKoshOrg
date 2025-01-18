const RecentTicketsTable = () => {
    const tickets = [
      {
        id: "ESGKOSH-",
        idNum:"20241107155407",
        category: "Reporting",
        category2:" Analytics",
        date: "11/7/2024",
        priority: "High",
      },
      {
        id: "ESGKOSH-",
        idNum:"20241107155408",
        category: "Reporting",
        category2:" Analytics",
        date: "11/8/2024",
        priority: "Med",
      },
      {
        id: "ESGKOSH-",
        idNum:"20241107155409",
        category: "Reporting",
        category2:" Analytics",
        date: "11/9/2024",
        priority: "Low",
      },
    ];
  
    const getPriorityClass = (priority) => {
      if (priority === "High") return "text-red-500 px-5 border border-red-500";
      if (priority === "Low") return "text-yellow-500 px-5 border border-yellow-500";
      return "text-orange-500 px-5 border border-orange-500";
    };
  
    return (
      <div className="bg-white h-[15rem] w-full rounded-lg pl-5">
        <table className="w-full border-collapse">
          
          <tbody>
            {tickets.map((ticket, index) => (
              <tr key={index} className="text-gray-700 text-sm border-b mx-auto">
                <td className="py-5">{ticket.id}<br/>{ticket.idNum}</td>
                <td className="py-2">{ticket.category}</td>
                <td className="py-2">{ticket.category2}</td>
                <td className="py-2">{ticket.date}</td>
                <td className="py-2">
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
    );
  };
  
  export default RecentTicketsTable;
  