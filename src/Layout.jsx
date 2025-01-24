import { Outlet } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import { useState} from "react";
import { RxCross2, RxPencil2 } from "react-icons/rx";

const Layout = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [priority,setPriority] =useState("low")
  
  // Use useEffect to show the popup when the page changes to "issue"
  

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar onRaiseIncident={() => setShowPopup(true)} />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1">
        {/* Header */}
        <Header />

        {/* Page Content */}
        <main className="flex-1 p-4 overflow-auto relative 
          [&::-webkit-scrollbar]:w-1
            [&::-webkit-scrollbar-track]:rounded-full
            [&::-webkit-scrollbar-track]:bg-[#f5fcf9]
            [&::-webkit-scrollbar-thumb]:rounded-full
            [&::-webkit-scrollbar-thumb]:bg-[#29C472]
        ">
          <Outlet />

          {/* Popup Form */}
          {showPopup && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-96 shadow-lg">
                <div className="flex justify-between">
                  <div className="flex gap-2">
                    <RxPencil2 size={24}/>
                    <h2 className="text-xl font-semibold mb-4">Raise Incident</h2>
                  </div>

                  <div className="cursor-pointer" onClick={()=>{setShowPopup(false)}}>
                    <RxCross2 size={24}/>
                  </div>
                </div>
                <form>
                  <div className="mb-2">
                    <label className="block text-sm font-medium mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded-2xl bg-[#eceded]"
                      placeholder="Enter title"
                    />
                  </div>
                  <div className="mb-2">
                    <label className="block text-sm font-medium mb-1 ">
                      Description
                    </label>
                    <textarea
                      className="w-full p-2 border rounded-2xl bg-[#eceded]"
                      rows="4"
                      placeholder="Enter description"
                    ></textarea>
                  </div>
                  <div className="mb-2">
                    <label className="block text-sm font-medium mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      className="w-full p-2 border rounded-2xl bg-[#eceded]"
                      placeholder="Enter your phone number"
                    />
                  </div>
                  <div className="mb-2">
                    <label className="block text-sm font-medium mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      className="w-full p-2 border rounded-2xl bg-[#eceded]"
                      placeholder="Enter your email"
                    />
                  </div>
                  <div className="mb-2">
                    <label className="block text-sm font-medium mb-1">
                      Priority
                    </label>

                    <div className="rounded-2xl bg-[#eceded] flex justify-between ">
                      <div onClick={()=>setPriority("low")} className={` cursor-pointer rounded-2xl ${priority=="low"?"bg-gradient-to-r from-[#3d9f86] to-[#29C472]":""} px-10 py-2`}>Low</div>
                      <div onClick={()=>setPriority("mid")} className={` cursor-pointer rounded-2xl ${priority=="mid"?"bg-gradient-to-r from-[#3d9f86] to-[#29C472]":""} px-10 py-2`}>Mid</div>
                      <div onClick={()=>setPriority("high")} className={` cursor-pointer rounded-2xl ${priority=="high"?"bg-gradient-to-r from-[#3d9f86] to-[#29C472]":""} px-10 py-2`}>High</div>
                    </div>
                    
                  </div>
                  <div className="flex justify-center">
                   
                    <button
                      type="submit"
                      className="px-4 py-2 bg-gradient-to-r from-[#3d9f86] to-[#29C472] text-white rounded-md hover:bg-blue-700"
                    >
                      Submit
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Layout;
