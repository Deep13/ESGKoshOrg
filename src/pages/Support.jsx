import { useState, useEffect } from "react";
import { useSidebar } from "../context/SidebarContext";
import { collection, query, where, getDocs } from "firebase/firestore";
import { firestore } from "../firebase";
import Spinner from "../components/Spinner"; // Assuming the spinner is located here

const Support = () => {
  const { userData, master, sheets } = useSidebar();
  const [tableInfo, setTableInfo] = useState();
  const [priority, setPriority] = useState("All");
  const [status, setStatus] = useState("All");
  const [loading, setLoading] = useState(false); // Loading state

  const resetFilter = () => {
    setPriority("All");
    setStatus("All");
  };

  const getData = async () => {
    setLoading(true); // Set loading to true when fetching data
    let queryConstraints = [];

    // Add filters based on the role and selected priority/status
    if (userData.role === "Admin") {
      queryConstraints.push(where("orgID", "==", userData.domain));
    } else {
      queryConstraints.push(where("email", "==", userData?.email));
    }

    // If priority is not "All", add a filter for priority
    if (priority !== "All") {
      queryConstraints.push(where("priority", "==", priority));
    }

    // If status is not "All", add a filter for status
    if (status !== "All") {
      queryConstraints.push(where("status", "==", status));
    }

    const docRef = query(collection(firestore, "Incidents"), ...queryConstraints);

    const querySnapshot = await getDocs(docRef);

    // Map over the documents and format data as needed
    const fetchedData = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(), // Spread the document data
    }));

    setTableInfo(fetchedData);
    setLoading(false); // Set loading to false once data is fetched
  };

  useEffect(() => {
    if (userData && master && sheets) {
      getData();
    }
  }, [userData, master, sheets, priority, status]);

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
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value={"All"}>All</option>
            <option value={"High"}>High</option>
            <option value={"Medium"}>Medium</option>
            <option value={"Low"}>Low</option>
          </select>
        </div>
        <div className="flex flex-col w-full sm:w-auto">
          <label className="text-gray-700">Status</label>
          <select
            placeholder="All"
            className="text-[#718EBF] p-3 rounded-xl mt-2 w-full sm:w-52"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value={"All"}>All</option>
            <option value={"New"}>New</option>
          </select>
        </div>
        <div
          onClick={() => {
            resetFilter();
          }}
          className="px-7 bg-gradient-to-r cursor-pointer flex justify-center items-center h-12 mt-8 from-[#3d9f86] to-[#29C472] border rounded-xl text-white"
        >
          Reset Filters
        </div>
      </div>

      <div className="rounded-[1rem] mt-5 pb-3 bg-white shadow-lg overflow-hidden pl-4">
        {/* Display the spinner while loading */}
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <Spinner />
          </div>
        ) : (
          <div className="overflow-y-auto">
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
                {tableInfo?.map((tableData, index) => (
                  <tr key={index} className="text-gray-700 text-sm border-b">
                    <td className="py-3 px-3 whitespace-nowrap">
                      {tableData.incidentID.split("-")[0]} -
                      <br />
                      {tableData?.incidentID?.split("-")[1]}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">{tableData.email}</td>
                    <td className="py-3 px-3 whitespace-nowrap">{tableData.phone}</td>
                    <td className="py-3 px-3 whitespace-nowrap">{tableData.title}</td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      {tableData.description}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">{tableData.createdDate}</td>
                    <td className="py-3 px-3 whitespace-nowrap">{tableData.status}</td>
                    <td className="py-3 px-3 whitespace-nowrap">
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
          </div>
        )}
      </div>
    </div>
  );
};

export default Support;
