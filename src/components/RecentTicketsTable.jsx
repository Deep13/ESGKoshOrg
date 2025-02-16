import { query, collection, where, getDocs, limit } from "firebase/firestore";
import { useState, useEffect } from "react";
import { firestore } from "../firebase";
import { useSidebar } from "../context/SidebarContext";

const RecentTicketsTable = () => {
  const [tableInfo, setTableInfo] = useState();
  const { userData } = useSidebar();
  const [selectedIncident, setSelectedIncident] = useState(null); // State for popup

  const getData = async () => {
    let docRef;

    if (userData?.role === "Admin") {
      docRef = query(
        collection(firestore, "Incidents"),
        where("orgID", "==", userData.domain),
        limit(5)
      );
    } else {
      docRef = query(
        collection(firestore, "Incidents"),
        where("email", "==", userData?.email),
        limit(5)
      );
    }

    const querySnapshot = await getDocs(docRef);

    // Map over the documents and format data as needed
    const fetchedData = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(), // Spread the document data
    }));

    setTableInfo(fetchedData);
  };

  useEffect(() => {
    getData();
  }, [userData]);

  const getPriorityClass = (priority) => {
    if (priority === "High") return "text-red-500 px-5 border border-red-500";
    if (priority === "Low") return "text-yellow-500 px-5 border border-yellow-500";
    return "text-orange-500 px-5 border border-orange-500";
  };

  return (
    <div className="bg-white h-[20rem] w-full rounded-lg pl-5 overflow-y-auto 
          relative 
          [&::-webkit-scrollbar]:w-1
          [&::-webkit-scrollbar-track]:rounded-full
          [&::-webkit-scrollbar-track]:bg-[#f5fcf9]
          [&::-webkit-scrollbar-thumb]:rounded-full
          [&::-webkit-scrollbar-thumb]:bg-[#29C472]">
      
      {/* Table */}
      <table className="w-full border-collapse rounded py-5">
        <tbody>
          {tableInfo?.map((tableData, index) => (
            <tr
              key={index}
              className="text-gray-700 text-sm border-b mx-auto cursor-pointer"
              onClick={() => setSelectedIncident(tableData)}
            >
              <td className="py-5">
                {tableData.incidentID.split("-")[0]} -
                <br />
                {tableData.incidentID.split("-")[1]}
              </td>
              <td className="py-3 px-3 max-w-[120px] overflow-hidden text-ellipsis whitespace-nowrap">{tableData.title}</td>
              <td className="py-3 px-3 max-w-[140px] overflow-hidden text-ellipsis whitespace-nowrap">{tableData.description}</td>
              <td className="py-3 px-3 max-w-[120px] overflow-hidden text-ellipsis whitespace-nowrap">{tableData.createdAt}</td>
              <td className="py-3 px-3 max-w-[120px] overflow-hidden text-ellipsis whitespace-nowrap">{tableData.status}</td>
              <td className="py-3 px-3 max-w-[120px] overflow-hidden text-ellipsis whitespace-nowrap">
                <span
                  className={`px-2 py-1 rounded-full text-sm font-semibold ${getPriorityClass(
                    tableData.priority
                  )}`}
                >
                  {tableData.priority}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Popup inside table area */}
      {selectedIncident && (
        <div className="absolute inset-0 bg-white shadow-lg rounded-lg p-2 z-10">
          {/* <h2 className="text-xl font-semibold mb-3">Incident Details</h2> */}

          <div className="space-y-2 text-sm">
            <p><strong>ID:</strong> {selectedIncident.incidentID}</p>
            <p><strong>Email:</strong> {selectedIncident.email}</p>
            <p><strong>Phone:</strong> {selectedIncident.phone}</p>
            <p><strong>Title:</strong> {selectedIncident.title}</p>

            {/* Scrollable Description */}
            <div className="max-h-20 overflow-y-auto border p-2 rounded-md [&::-webkit-scrollbar]:w-1
            [&::-webkit-scrollbar-track]:rounded-full
            [&::-webkit-scrollbar-track]:bg-[#f5fcf9]
            [&::-webkit-scrollbar-thumb]:rounded-full
            [&::-webkit-scrollbar-thumb]:bg-[#29C472]">
              <p><strong>Description:</strong> {selectedIncident.description}</p>
            </div>

            <p><strong>Status:</strong> {selectedIncident.status}</p>
            <p><strong>Priority:</strong> {selectedIncident.priority}</p>
          </div>

          {/* Close Button */}
          <button
            onClick={() => setSelectedIncident(null)}
            className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg w-full"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};

export default RecentTicketsTable;
