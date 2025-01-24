import { useEffect } from 'react'
import Spinner from '../components/Spinner';
import logo from '../assets/logo.png'
import { useNavigate } from 'react-router-dom';

import { auth,firestore } from '../firebase'
import { collection, getDoc, getDocs, query, doc, where } from "firebase/firestore";
import { useSidebar } from '../context/SidebarContext'


var isMobileDevice = /Mobi|Android|iPhone|iPad|iPod|BlackBerry|Windows Phone/i.test(navigator.userAgent);

const Loading = () => {
    const navigate = useNavigate()
    useEffect(()=>{
        let user=localStorage.getItem("userDetails");
        if(user){
            user=JSON.parse(user);
        }
               

        if(!isMobileDevice){
            if(user && user.email){
                var domain = user.email.split("@");
                getDoc(doc(firestore,domain[1],"Master Data"))
                .then(async (docSnapshot)=>{               
                  if(docSnapshot.data()){
                    console.log(docSnapshot.data());
                    setMaster(docSnapshot.data());
                    
                    navigate('/dashboard')
                    await getDocs(query(collection(firestore,domain[1], "Master Data","Employees"),where("userId","==",user.uid)))
                      .then((querySnapshot)=>{
                       if( querySnapshot.size>0 ){
                        querySnapshot.forEach((doc)=>{
                          console.log("data",doc.data())
                          setUserData(doc.data());
                        })              
                      }
                        else{
                          console.log("No Employee found");
                          navigate('/login');
                        }
                      
                    })
                      .catch((error)=>{
                        console.log(error);
                        navigate('/login');
                      })
                    await getDoc(doc(firestore,domain[1], "Master Data","Reporting Master Data","ReportingSheets"))
                      .then((doc)=>{
                        if (doc.exists) {
                          var data = doc.data();
                          var Environment = [];
                          var Social = [];
                          var Governance = [];
           
                          // Iterate through the data array
                          data.complianceData.forEach(function (item) {
                            // Check if enabled is true, and push the sheetName to the respective array based on complianceType
                            if (item.enabled) {
                            if (item.complianceType === "Environment") {
                              Environment.push(item.sheetName);
                            } else if (item.complianceType === "Social") {
                              Social.push(item.sheetName);
                            } else if (item.complianceType === "Governance") {
                              Governance.push(item.sheetName);
                            }
                            }
                          });
                          const reportingSheets = { Environment, Social, Governance }
                          setSheets(reportingSheets)
                          // return resolve(that.reportingSheets)
                        } else {
                          setSheets(undefined)
                          // return resolve(that.reportingSheets)
                        }
                        
                          // setSheets(doc);
                                                   
                                 
                      
                    })
                      .catch((error)=>{
                        console.log(error);
                        navigate('/login');
                      })
                      
                      
                  } 
                  else{
                    navigate('/login');
                    console.log("No Master Data found");
                  }
                  
    
                    
                })
                .catch((error)=>{
                  console.log(error);
                  navigate('/login');
                })
            }
            else{
                
                navigate('/login')
            }
        }
      },[])

      const {setMaster,setUserData,setSheets, sheets} = useSidebar()

      console.log(sheets)

  return (
    <div className='bg-loginBg bg-cover bg-center w-full h-screen flex'>
        <div className='flex flex-col justify-center items-center mx-auto my-auto px-5 text-xl text-center h-24'>
            <img
            src={logo}
            alt='logo'
            className=' mb-5 w-36'
            />
            {isMobileDevice?
            <span className='text-white font-semibold bg-[rgba(0,0,0,0.7)] p-3 rounded-[6px]'>
                Application Not Supported on Mobile Devices, Please open this application on a laptop or desktop for the best experience.
                <br/>
                Please visit <a className='text-blue-500 cursor-pointer' href='https://www.koshishindia.in/'>https://www.koshishindia.in/</a>
            </span>
            :<Spinner/>}
            
        </div>
    </div>
  )
}

export default Loading