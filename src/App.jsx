import './App.css'
import { Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Support from './pages/Support'
import BranchWise from './pages/BranchWise'
import Admin from './pages/Admin'
import Layout from './Layout' // Import Layout Component

function App() {
  return (
    <>
      <Routes>
        {/* Login Route without Layout */}
        <Route path='/login' element={<Login />} />

        {/* All other routes wrapped with Layout */}
        <Route element={<Layout />}>
          <Route path='/' element={<Dashboard />} />
          <Route path='/support' element={<Support />} />
          <Route path='/branchwise' element={<BranchWise />} />
          <Route path='/admin' element={<Admin />} />
        </Route>
      </Routes>
    </>
  )
}

export default App
