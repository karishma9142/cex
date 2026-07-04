import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import './index.css'
import LandingPage from './pages/LandingPage'
import { AuthProvider } from './context/AuthContext'
import MarketPage from './pages/MarketPage'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
      <Routes>
        <Route path='/' element = {<LandingPage/>}/>
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        {/* <Route path='/market' element={<MarketPage/>}/> */}
        {/* <Route path="*"         element={<Navigate to="/login" replace />} /> */}
      </Routes>
    </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
)
