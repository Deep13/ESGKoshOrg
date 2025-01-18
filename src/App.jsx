import './App.css'
import { Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Support from './pages/Support'
import BranchWise from './pages/BranchWise'
import Admin from './pages/Admin'

function App() {

  return (
    <>
      <Routes>
        <Route path='/login' element={<Login/>}/>
        <Route path='/' element={<Dashboard/>}/>
        <Route path='/support' element={<Support/>}/>
        <Route path='/branchwise' element={<BranchWise/>}/>
        <Route path='/admin' element={<Admin/>}/>
      </Routes>
    </>
  )
}

export default App
