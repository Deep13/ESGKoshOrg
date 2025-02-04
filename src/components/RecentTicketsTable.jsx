import { query, collection, where, getDocs,limit} from "firebase/firestore";
import { useState,useEffect } from "react";
import { firestore } from "../firebase";
import { useSidebar } from "../context/SidebarContext";


const RecentTicketsTable = () => {
  const [tableInfo,setTableInfo] = useState();
  const {userData} =useSidebar();

  const getData = async() => {
    var docRef;
  
    if(userData?.role=="Admin"){
      docRef= query(collection(firestore,"Incidents"),where("orgID", "==", userData.domain),limit(5))
    }
    else{
      docRef= query(collection(firestore,"Incidents"),where("email", "==", userData?.email),limit(5));
    }

    const querySnapshot = await getDocs(docRef);
  
      // Map over the documents and format data as needed
    const fetchedData = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(), // Spread the document data
    }));
  
    console.log("Fetched Data:", fetchedData);
    setTableInfo(fetchedData);
    }
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

    useEffect(()=>{
      getData();
    },[userData])
    
    console.log(tableInfo);
    const getPriorityClass = (priority) => {
      if (priority === "High") return "text-red-500 px-5 border border-red-500";
      if (priority === "Low") return "text-yellow-500 px-5 border border-yellow-500";
      return "text-orange-500 px-5 border border-orange-500";
    };
  
    return (
      <div className="bg-white h-[18rem] w-full rounded-lg pl-5 overflow-y-auto 
            [&::-webkit-scrollbar]:w-1
            [&::-webkit-scrollbar-track]:rounded-full
            [&::-webkit-scrollbar-track]:bg-[#f5fcf9]
            [&::-webkit-scrollbar-thumb]:rounded-full
            [&::-webkit-scrollbar-thumb]:bg-[#29C472]">
        <table className="w-full border-collapse rounded py-5">
          
          <tbody>
            {tableInfo?.map((tableData, index) => (
              <tr key={index} className="text-gray-700 text-sm border-b mx-auto">
                <td className="py-5"> 
                  {tableData.incidentID.split('-')[0]} -
                    <br/>
                  {tableData.incidentID.split('-')[1]}
                </td>
                <td className="py-2">{tableData.title}</td>
                <td className="py-2">{tableData.description}</td>
                <td className="py-2">{tableData.createdAt}</td>
                <td className="py-2">{tableData.status}</td>
                <td className="py-2">
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
    );
  };
  
  export default RecentTicketsTable;
  