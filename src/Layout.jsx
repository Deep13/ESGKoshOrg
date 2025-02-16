import { Outlet } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import { useState,useEffect } from "react";
import { RxCross2, RxPencil2 } from "react-icons/rx";
import { collection, addDoc } from "firebase/firestore"; 
import { firestore } from "./firebase"; // Import Firestore instance
import { useSidebar } from "./context/SidebarContext";

const Layout = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [priority, setPriority] = useState("Low");
  const {userData} = useSidebar()

  // Form data state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    phone: "",
    email: "",
  });

  useEffect(()=>{
    formData.email=userData?.email
  },[])

  // Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Function to generate a unique incidentID
  const generateIncidentIdWithKeyword = () => {
    const now = new Date();
    const timestamp = [
      now.getFullYear(),
      ("0" + (now.getMonth() + 1)).slice(-2), // Month with leading zero
      ("0" + now.getDate()).slice(-2),       // Day with leading zero
      ("0" + now.getHours()).slice(-2),      // Hours with leading zero
      ("0" + now.getMinutes()).slice(-2),    // Minutes with leading zero
      ("0" + now.getSeconds()).slice(-2)     // Seconds with leading zero
    ].join(""); // Concatenate everything
  
    return `SUSTRACK-${timestamp}`; // Example: 'SUSTRACK-20250203144530'
  };

  // Function to submit form data to Firestore
  const handleSubmit = async (e) => {
    e.preventDefault();

    const incidentID = generateIncidentIdWithKeyword();
    const createdDate = new Date().toLocaleDateString("en-US");

    const newIncident = {
      incidentID,
      title: formData.title,
      description: formData.description,
      phone: formData.phone.toString(),
      email: formData.email,
      priority,
      createdDate,
      status: "New",
      orgName: userData.username.split('@')[0],
      orgID: userData.username.split('@')[1],
    };

    console.log(newIncident)
    try {
      const docRef = await addDoc(collection(firestore, "Incidents"), newIncident);
      console.log("Document written with ID: ", docRef.id);
      setShowPopup(false); // Close the popup after submission
      setFormData({ title: "", description: "", phone: "", email: "" }); // Reset form
      setPriority("Low"); // Reset priority
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

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
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-200">
              <div className="bg-white rounded-lg p-6 w-96 shadow-lg">
                <div className="flex justify-between">
                  <div className="flex gap-2">
                    <RxPencil2 size={24} />
                    <h2 className="text-xl font-semibold mb-4">Raise Incident</h2>
                  </div>
                  <div className="cursor-pointer" onClick={() => setShowPopup(false)}>
                    <RxCross2 size={24} />
                  </div>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="mb-2">
                    <label className="block text-sm font-medium mb-1">Title</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      className="w-full p-2 border rounded-2xl bg-[#eceded]"
                      placeholder="Enter title"
                      required
                    />
                  </div>
                  <div className="mb-2">
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      className="w-full p-2 border rounded-2xl bg-[#eceded]"
                      rows="4"
                      placeholder="Enter description"
                      required
                    ></textarea>
                  </div>
                  <div className="mb-2">
                    <label className="block text-sm font-medium mb-1">Phone Number</label>
                    <input
                      type="number"
                      name="phone"
                      value={formData.phone}
                      onChange={(e) => {
                        const value = e.target.value.slice(0, 10); // Limit length
                        handleChange({ target: { name: "phone", value } });
                      }}
                      className="w-full p-2 border rounded-2xl bg-[#eceded]"
                      placeholder="Enter your phone number"
                      min="1000000000"
                      max="9999999999"
                      required
                    />
                  </div>
                  <div className="mb-2">
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full p-2 border rounded-2xl bg-[#eceded]"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                  <div className="mb-2">
                    <label className="block text-sm font-medium mb-1">Priority</label>
                    <div className="rounded-2xl bg-[#eceded] flex justify-between">
                      <div
                        onClick={() => setPriority("Low")}
                        className={`cursor-pointer rounded-2xl px-10 py-2 ${
                          priority === "Low" ? "bg-gradient-to-r from-[#3d9f86] to-[#29C472]" : ""
                        }`}
                      >
                        Low
                      </div>
                      <div
                        onClick={() => setPriority("Medium")}
                        className={`cursor-pointer rounded-2xl px-10 py-2 ${
                          priority === "Medium" ? "bg-gradient-to-r from-[#3d9f86] to-[#29C472]" : ""
                        }`}
                      >
                        Mid
                      </div>
                      <div
                        onClick={() => setPriority("High")}
                        className={`cursor-pointer rounded-2xl px-10 py-2 ${
                          priority === "High" ? "bg-gradient-to-r from-[#3d9f86] to-[#29C472]" : ""
                        }`}
                      >
                        High
                      </div>
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
