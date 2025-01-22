import { useState } from "react";
import { useSidebar } from "../context/SidebarContext";

const Fuels = () => {
  const [tab, setTab] = useState("recorded");

  // Data configurations based on the fuel type (fuel, bioenergy)
  const fuelData = {
    fuel: [
      { title: "Fuels", editable: false, key: "fuels" },
      { title: "Type", editable: false, key: "type" },
      { title: "Fuel", editable: false, key: "fuels2" },
      { title: "Unit", editable: false, key: "unit" },
      { title: "Amount", editable: true, key: "amount", type: "Number" },
      { title: "Factor", editable: true, key: "factor", type: "Number" },
    ],
    bioenergy: [
      { title: "A", editable: false, key: "A" },
      { title: "B", editable: false, key: "B" },
      { title: "Fuel", editable: false, key: "fuels2" },
      { title: "Unit", editable: false, key: "unit" },
      { title: "Factor", editable: true, key: "factor", type: "Number" },
    ],
  };

  // Table data based on fuel type
  const tableData = {
    fuel: [
      {
        fuels: "Fuel",
        type: "Gaseous Fuel",
        fuels2: "CNG",
        unit: "liters",
        amount: 1000,
        factor: 1.2,
      },
      {
        fuels: "Fuel",
        type: "Gaseous Fuel",
        fuels2: "CNG",
        unit: "liters",
        amount: 1200,
        factor: 1.3,
      },
    ],
    bioenergy: [
      {
        A: "Bioenergy A",
        B: "Bioenergy B",
        fuels2: "Biofuel",
        unit: "tons",
        factor: 1.5,
      },
      {
        A: "Bioenergy C",
        B: "Bioenergy D",
        fuels2: "Biofuel",
        unit: "tons",
        factor: 1.8,
      },
    ],
  };

  // Getting the fuel type from the Sidebar context
  const { expanded, fuel } = useSidebar();

  // Get the columns for the current fuel type
  const getColumns = () => {
    return fuelData[fuel] || [];
  };

  // Get the tickets for the current fuel type
  const tickets = tableData[fuel] || [];

  return (
    <div className="px-5">
      <div className="flex justify-between items-center">
        <div className="flex gap-10">
          <div
            onClick={() => setTab("recorded")}
            className={` cursor-pointer border-b-[3px] ${
              tab === "recorded" ? "border-[#29C472] text-[#29C472]" : "text-[#718EBF] border-[#718EBF]"
            }`}
          >
            Records
          </div>
          <div
            onClick={() => setTab("variant")}
            className={` cursor-pointer border-b-[3px] ${
              tab === "variant" ? "border-[#29C472] text-[#29C472]" : "text-[#718EBF] border-[#718EBF]"
            }`}
          >
            Variants
          </div>
        </div>
        <div className="flex gap-10">
          <div className="border-2 rounded-xl px-3 py-2">Save as Draft</div>
          <div className="border rounded-lg px-10 text-white bg-gradient-to-r from-[#3d9f86] to-[#29C472] py-2">
            Save
          </div>
        </div>
      </div>
      <div className="flex justify-between mt-5">
        <div>
          <div>State/Circle/Zone/Office</div>
          <div className="flex flex-col">
            <select
              placeholder="All"
              className={`text-[#718EBF] p-3 rounded-xl mt-2 ${expanded ? "w-40" : "w-48"}`}
            >
              <option>All</option>
            </select>
          </div>
        </div>
        <div className="flex gap-2 mt-5">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="flex flex-col">
              <select
                placeholder="All"
                className={`text-[#718EBF] p-3 rounded-xl mt-2 ${expanded ? "w-24" : "w-28"}`}
              >
                <option>All</option>
              </select>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-[1rem] flex justify-center mt-5 pb-3 px-5 bg-white shadow-lg overflow-y-auto">
  <table className="w-full border-collapse rounded-[1rem]">
    <thead>
      <tr className="text-left text-[#718EBF] text-md rounded-lg border-b">
        {getColumns().map((column, index) => (
          <th 
            key={index} 
            className={`py-2 px-3 text-left font-medium max-w-[100%] w-[${100 / getColumns().length}%]`}
          >
            {column.title}
          </th>
        ))}
      </tr>
    </thead>

    <tbody>
      {tickets.map((ticket, index) => (
        <tr key={index} className="text-gray-700 text-sm border-b">
          {getColumns().map((column, columnIndex) => (
            <td 
              key={columnIndex} 
              className="py-3 px-3"
              style={{ width: `${100 / getColumns().length}%` }} // Ensure row width matches header
            >
              {column.editable ? (
                <input
                  placeholder={column.title}
                  className="border bg-[#eceded] py-2 px-5 rounded-xl text-[#718EBF] w-full"
                  type={column.type === "Number" ? "number" : "text"}
                />
              ) : (
                ticket[column.key] || "--"
              )}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  </table>
</div>

    </div>
  );
};

export default Fuels;
