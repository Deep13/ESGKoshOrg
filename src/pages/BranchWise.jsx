import { useEffect, useState } from "react";
import { useSidebar } from "../context/SidebarContext";
import { firestore } from "../firebase";
import {getDoc, doc} from "firebase/firestore";

const BranchWise = () => {
    const [tableInfo,setTableInfo] = useState();
    const [branchList,setBranchList] = useState();
    const [moduleList,setModuleList] = useState();
    const [subModuleList,setSubModuleList] = useState();
    const [statusList,setStatusList] = useState();

    const [selectedBranch, setSelectedBranch] = useState("All");
    const [selectedModule, setSelectedModule] = useState("All");
    const [selectedSubModule, setSelectedSubModule] = useState("All");
    const [selectedStatus, setSelectedStatus] = useState("All");


    const {expanded,master,userData,sheets} =useSidebar();

    const resetFilter = () => {
        setSelectedBranch("All");
        setSelectedModule("All");
        setSelectedSubModule("All");
        setSelectedStatus("All");
      
    }
    const getData=async(domain,monthYear)=>{
        var branches = userData?.branches;
        
        await getDoc(doc(firestore,domain[1], "TransactionData",monthYear.month+"-"+monthYear.year,"Statistics"))
        .then((doc)=>{
            if (doc.exists) {
                var docData=doc.data();
                console.log(doc.data())
                const tableData = [];
                branches?.forEach(branch => {
                    Object.keys(sheets).forEach(moduleName => {
                        sheets[moduleName].forEach(subModule => {
                            try{
                                const isCompleted = docData[branch?.branch] && docData[branch?.branch][moduleName] && docData[branch?.branch][moduleName].includes(subModule);
                                tableData.push({
                                    branchName: branch.branch,
                                    moduleName: moduleName,
                                    subModule: subModule,
                                    status: isCompleted ? "Completed" : "Incomplete"
                                });
                            }
                            catch{
                                tableData.push({
                                    branchName: branch.branch,
                                    moduleName: moduleName,
                                    subModule: subModule,
                                    status:"Incomplete"
                                })
                            }
                        });
                    });
                });

                const uniqueBranches = ["All", ...new Set(tableData.map(item => item.branchName))].map(branch => ({ branchName: branch }));
                const uniqueModules = ["All", ...new Set(tableData.map(item => item.moduleName))].map(module => ({ moduleName: module }));
                const uniqueSubModules = ["All", ...new Set(tableData.map(item => item.subModule))].map(module => ({ subModule: module }));
                const uniqueStatus = ["All", ...new Set(tableData.map(item => item.status))].map(status => ({ status: status }));

                setBranchList(uniqueBranches);
                setModuleList(uniqueModules);
                setSubModuleList(uniqueSubModules);
                setTableInfo(tableData);
                setStatusList(uniqueStatus)
        }})
    }
    useEffect(()=>{
        if(userData&&master&&sheets){
            var domain = userData?.username.split("@");
            var monthYear = master?.currentReportingCycle;
            getData(domain,monthYear)
        }

    },[userData,master,sheets])

    // console.log(statusList)


      const getPriorityClass = (priority) => {
        if (priority === "Completed") return "text-white bg-[#29C472] px-5";
        if (priority === "Incomplete") return "text-white px-5 bg-red-500";
        return "text-orange-500 px-5 border border-orange-500";
      };

      const filteredData = tableInfo?.filter((item) => {
        const isBranchMatch = selectedBranch === "All" || item.branchName === selectedBranch;
        const isModuleMatch = selectedModule === "All" || item.moduleName === selectedModule;
        const isSubModuleMatch = selectedSubModule === "All" || item.subModule === selectedSubModule;
        const isStatusMatch = selectedStatus === "All" || item.status === selectedStatus;
      
        return isBranchMatch && isModuleMatch && isSubModuleMatch && isStatusMatch;
      });

      const updateModuleList=(filterSelected,value)=>{
        console.log("Update called",filterSelected, value, moduleList)
      }

      const handleBranchChange=(value)=>{
        setSelectedBranch(value)
        setSelectedModule("All");
        setSelectedSubModule("All");
        setSelectedStatus("All");
        updateModuleList("branch",value);
      }
      const handleModuleChange = (value) => {
        setSelectedModule(value);
    
        // Reset lower-level filters
        setSelectedSubModule("All");
        setSelectedStatus("All");
    
        // Filter subModuleList based on the selected module
        if (value === "All") {
            // Show all sub-modules if "All" is selected
            const uniqueSubModules = ["All", ...new Set(tableInfo.map(item => item.subModule))].map(subModule => ({ subModule }));
            setSubModuleList(uniqueSubModules);
        } else {
            // Filter sub-modules relevant to the selected module
            const moduleSubModules = tableInfo
                .filter(item => item.moduleName === value)
                .map(item => item.subModule);
    
            const uniqueModuleSubModules = ["All", ...new Set(moduleSubModules)].map(subModule => ({ subModule }));
            console.log(uniqueModuleSubModules)
            setSubModuleList(uniqueModuleSubModules);
        }
    };
    
      const handleSubModuleChange=(value)=>{
        setSelectedSubModule(value)
        setSelectedStatus("All");
      }
      

  return (
    <div className='bg-slate-100 flex flex-col w-full h-screen p-2'>
        <div className="flex gap-3 justify-between">
            <div className="flex gap-3">
            <div className="flex flex-col">
                <div>Branch Name</div>
                <select
                value={selectedBranch}
                 onChange={(e) => handleBranchChange(e.target.value)}
                 placeholder="All" className={`cursor-pointer text-[#718EBF] p-3 rounded-xl mt-2 ${expanded?"w-40":"w-48"} 
                    [&::-webkit-scrollbar]:w-1
                    [&::-webkit-scrollbar-track]:rounded-full
                    [&::-webkit-scrollbar-track]:bg-[#f5fcf9]
                    [&::-webkit-scrollbar-thumb]:rounded-full
                    [&::-webkit-scrollbar-thumb]:bg-[#29C472]`}>
                   
                    {branchList?.map((branch, index) => (
                        <option key={index} value={branch.branchName}>
                            {branch.branchName}
                        </option>
                    ))}
                </select>
            </div>
            <div className="flex flex-col">
                <div>Module name</div>
                <select
                value={selectedModule}
                 onChange={(e) => handleModuleChange(e.target.value)}
                 placeholder="All" className={`cursor-pointer text-[#718EBF] p-3 rounded-xl mt-2 ${expanded?"w-40":"w-48"} 
                    [&::-webkit-scrollbar]:w-1
                    [&::-webkit-scrollbar-track]:rounded-full
                    [&::-webkit-scrollbar-track]:bg-[#f5fcf9]
                    [&::-webkit-scrollbar-thumb]:rounded-full
                    [&::-webkit-scrollbar-thumb]:bg-[#29C472]`}>
                    {moduleList?.map((module, index) => (
                        <option key={index} value={module.moduleName}>
                            {module.moduleName}
                        </option>
                    ),[moduleList])}
                </select>
            </div>
            <div className="flex flex-col">
                <div>Sub-Module</div>
                <select
                value={selectedSubModule}
                 onChange={(e) => handleSubModuleChange(e.target.value)}
                 placeholder="All"className={`cursor-pointer text-[#718EBF] p-3 rounded-xl mt-2 ${expanded?"w-40":"w-48"} 
                    [&::-webkit-scrollbar]:w-1
                    [&::-webkit-scrollbar-track]:rounded-full
                    [&::-webkit-scrollbar-track]:bg-[#f5fcf9]
                    [&::-webkit-scrollbar-thumb]:rounded-full
                    [&::-webkit-scrollbar-thumb]:bg-[#29C472]
                    `}>
                {subModuleList?.map((subModule, index) => (
                    <option key={index} value={subModule.subModule}>
                        {subModule.subModule}
                    </option>
                ),[subModuleList])}
                </select>
            </div>
            <div className="flex flex-col">
                <div>Status</div>
                <select 
                value={selectedStatus}
                 onChange={(e) => setSelectedStatus(e.target.value)}
                placeholder="All" className={`cursor-pointer text-[#718EBF] p-3 rounded-xl mt-2 ${expanded?"w-40":"w-48"} 
                    [&::-webkit-scrollbar]:w-1
                    [&::-webkit-scrollbar-track]:rounded-full
                    [&::-webkit-scrollbar-track]:bg-[#f5fcf9]
                    [&::-webkit-scrollbar-thumb]:rounded-full
                    [&::-webkit-scrollbar-thumb]:bg-[#29C472]`}>
                {statusList?.map((status, index) => (
                    <option key={index} value={status.status}>
                        {status.status}
                    </option>
                ))}
                </select>
            </div>
            </div>
            <div onClick={()=>resetFilter()} className=" rounded-xl border bg-gradient-to-r from-[#3d9f86] to-[#29C472] text-white flex mt-8 my-auto py-2 px-5 cursor-pointer">
                <div className="px-3 text-xl">Reset Filters</div>
            </div>
        </div>

        <div className="rounded-xl mt-5 pb-3 px-10 bg-white shadow-lg overflow-y-auto
            [&::-webkit-scrollbar]:w-1
            [&::-webkit-scrollbar-track]:rounded-full
            [&::-webkit-scrollbar-track]:bg-[#f5fcf9]
            [&::-webkit-scrollbar-thumb]:rounded-full
            [&::-webkit-scrollbar-thumb]:bg-[#29C472]">
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
                    {/* <tr className="text-gray-700 text-sm border-b mx-auto px-20">
                    <td className="py-3 px-3">branchName</td>
                        <td className="py-3 px-3">moduleName</td>
                        <td className="py-3 px-3">subModule</td>
                        <td className="py-3 px-3">
                            <span className={`px-2 py-1 rounded-full text-sm font-semibold ${getPriorityClass(
                                "Incomplete"
                                )}`}>
                                Incomplete
                            </span>
                            
                        </td>
                    </tr> */}
                    {filteredData?.map((tableData, index) => (
                    <tr key={index} className="text-gray-700 text-sm border-b mx-auto px-20">
                        <td className="py-3 px-3">{tableData.branchName}</td>
                        <td className="py-3 px-3">{tableData.moduleName}</td>
                        <td className="py-3 px-3">{tableData.subModule}</td>
                        <td className="py-3 px-3">
                            <span className={`px-2 py-1 rounded-full text-sm font-semibold ${getPriorityClass(
                                tableData.status
                                )}`}>
                                {tableData.status}
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
