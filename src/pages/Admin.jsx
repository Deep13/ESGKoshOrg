import { useState, useEffect } from "react";
import { useSidebar } from "../context/SidebarContext";
import { firestore } from "../firebase";
import { getDoc, doc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const Admin = () => {
  const [action, setAction] = useState("Terminate");
  const [tableInfo, setTableInfo] = useState();
  const [showModal, setShowModal] = useState(false); // State to control modal visibility
  const [terminateModal, setTerminateModal] = useState(false);
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const { master, userData, sheets } = useSidebar();

  const getData = async (domain) => {
    try {
      console.log(domain);
      const docRef = doc(firestore, domain[1], "Master Data", "Reporting Cycle", "All Cycle");
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log("Document Data:", data);

        // Convert the data into an array of objects with the required structure
        const formattedData = Object.values(data).map((entry) => ({
          monthYear: `${entry.month}-${entry.year}`,
          startDate: new Date(entry.startedAt.seconds * 1000).toLocaleDateString(),
          endDate: new Date(entry.closedAt.seconds * 1000).toLocaleDateString(),
        }));

        // Set the formatted data to tableInfo
        setTableInfo(formattedData);
      } else {
        console.log("No such document!");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const navigate = useNavigate();

  useEffect(() => {
    if (userData && master && sheets) {
      if(userData.role!="Admin"){
        navigate('/loading');
      }
      const domain = userData?.username.split("@");
      getData(domain);
    }
  }, [userData, master, sheets]);

  console.log("Table Info", tableInfo);

  const handleInitiate = () => {
    console.log("Initiating cycle with:", { year, month });
    // Add your logic for initiating a new cycle here
    setAction("Initiate")
    setShowModal(false); // Close the modal after submitting
  };

  const handleTerminate = () => {
    setAction("Terminate");
    setTerminateModal(false);
  }

  return (
    <div className="bg-slate-100 flex flex-col w-full h-screen p-2">
      <div className="mb-3 flex justify-between items-center">
        <div className="flex">
          {master?.currentReportingCycle?.status ? "Current" : "Last"} Reporting Cycle:
          <div className="font-semibold ml-3">
            {master?.currentReportingCycle
              ? `${master?.currentReportingCycle?.month}-${master?.currentReportingCycle?.year}`
              : "-"}
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowModal(true)} // Show modal on click
            className={`px-7 py-2 bg-gradient-to-r from-[#3d9f86] to-[#29C472] border rounded-xl ${
              action === "Initiate" ? "opacity-50" : ""
            } text-white`}
          >
            Initiate
          </button>
          <button
            onClick={() => setTerminateModal(true)}
            className={`px-7 py-2 bg-gradient-to-r from-[#3d9f86] to-[#29C472] border rounded-xl ${
              action === "Terminate" ? "opacity-50" : ""
            } text-white`}
          >
            Terminate
          </button>
        </div>
      </div>

      <div
        className="rounded-[1rem] mt-5 pb-3 px-10 bg-white shadow-lg overflow-y-auto
            [&::-webkit-scrollbar]:w-1
            [&::-webkit-scrollbar-track]:rounded-full
            [&::-webkit-scrollbar-track]:bg-[#f5fcf9]
            [&::-webkit-scrollbar-thumb]:rounded-full
            [&::-webkit-scrollbar-thumb]:bg-[#29C472]"
      >
        <table className="w-full border-collapse rounded-[1rem] py-5">
          <thead>
            <tr className="text-left text-[#718EBF] text-md rounded-lg border-b">
              <th className="py-2 px-3">Month-Year</th>
              <th className="py-2 px-3">Start Date</th>
              <th className="py-2 px-3">End date</th>
            </tr>
          </thead>

          <tbody className="rounded-lg">
            {tableInfo?.map((tableData, index) => (
              <tr key={index} className="text-gray-700 text-sm border-b mx-auto px-20">
                <td className="py-3 px-3">{tableData.monthYear}</td>
                <td className="py-3 px-3">{tableData.startDate}</td>
                <td className="py-3 px-3">{tableData.endDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96">
            <h2 className="text-lg font-semibold mb-4">Initiate New Cycle</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
              <input
                type="text"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full border rounded px-3 py-2"
                placeholder="Enter Year (e.g., 2025)"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
              <input
                type="text"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-full border rounded px-3 py-2"
                placeholder="Enter Month (e.g., 01)"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-200 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleInitiate}
                className="px-4 py-2 bg-gradient-to-r from-[#3d9f86] to-[#29C472] text-white rounded-lg"
              >
                Initiate
              </button>
            </div>
          </div>
        </div>
      )}

      {terminateModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96">
            <h2 className="text-lg font-semibold mb-2">Terminate Existing Cycle</h2>
            {/* <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
              <input
                type="text"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full border rounded px-3 py-2"
                placeholder="Enter Year (e.g., 2025)"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
              <input
                type="text"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-full border rounded px-3 py-2"
                placeholder="Enter Month (e.g., 01)"
              />
            </div> */}
            <div className="mb-4">
              Are you sure you wan to close the existing cycle ?
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setTerminateModal(false)}
                className="px-4 py-2 bg-gray-200 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleTerminate}
                className="px-4 py-2 bg-gradient-to-r from-[#3d9f86] to-[#29C472] text-white rounded-lg"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
