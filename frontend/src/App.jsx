import { useState } from 'react'
import './App.css'
import { Routes } from 'react-router-dom'
import { Route } from 'react-router-dom'
import SignUp from './pages/SignUp'
import SignIn from './pages/SignIn'
import ForgotPassword from './pages/ForgotPassword'
import Nav from './components/Nav'
import useGetCity from './hooks/useGetCity'
import CreateEditShop from './pages/createEditShop'
import OwnerDashboard from './components/UserDashboard'

export const serverUrl = "http://localhost:8000"

function App() {
  

  return (
   
      <div>
        <Routes>
          <Route path ='/signup' element={<SignUp/>}/>
          <Route path ='/signin' element={<SignIn/>}/>
          <Route path ='/forgotPassword' element={<ForgotPassword/>}/>
           <Route path ='/Nav' element={<Nav/>}/>
           <Route path ='/createshop' element={<CreateEditShop/>}/>
           <Route path ='ownerdashboard' element={<OwnerDashboard/>}></Route>
        </Routes>
        
        </div>

    
  )
}

export default App
