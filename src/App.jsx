import './App.css'
import { Routes, Route, useNavigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Support from './pages/Support'
import BranchWise from './pages/BranchWise'
import Admin from './pages/Admin'
import Fuels from './pages/Fuels'
import Layout from './Layout' // Import Layout Component
import { useEffect } from 'react'
import { auth} from './firebase'
import Loading from './pages/Loading'
import Analytics from './pages/Analytics'
import SocialOverview from './pages/SocialOverview'
import EnvOverview from './pages/EnvOverview'
import GovOverview from './pages/GovOverview'
import MaterialityAssessment from './pages/MaterialityAssessment'


function App() {
  const navigate =useNavigate();

  useEffect(()=>{
    auth.onAuthStateChanged(async (user) => {
      if (user) {
        console.log("Document data:", user);
        localStorage.setItem("userDetails",JSON.stringify(user));
        navigate('/');
        
        }
      else{
        navigate('/login');
        localStorage.removeItem("userDetails")
      }
      });
    
    
    
        // ...
  },[])
    
  return (
    <>
      <Routes>
        {/* Login Route without Layout */}
        <Route path='/login' element={<Login />} />
        <Route path='/' element={<Loading/>}/>

        {/* All other routes wrapped with Layout */}
        <Route element={<Layout />}>
          <Route path='/dashboard' element={<Dashboard />} />
          <Route path='/support' element={<Support />} />
          <Route path='/branchwise' element={<BranchWise />} />
          <Route path='/admin' element={<Admin />} />
          <Route path='/reporting' element={<Fuels/>}/>
          <Route path='/analytics' element={<Analytics/>} />
          <Route path='/social' element={<SocialOverview/>} />
          <Route path='/environment' element={<EnvOverview/>}/>
          <Route path='/governance' element={<GovOverview/>}/>
          <Route path='/materialityAssessment' element={<MaterialityAssessment/>}/>
        </Route>
      </Routes>
    </>
  )
}

export default App
