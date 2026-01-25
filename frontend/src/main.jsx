import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {BrowserRouter, Route, Routes} from "react-router"
import './index.css'
import App from './App.jsx'
import Api from './pages/Api.jsx'

createRoot(document.getElementById('root')).render(
  <BrowserRouter> 
    <Routes>  
      <Route path="/" element={<App />} /> 
      <Route path="/api" element={<Api/>}/>
    </Routes> 
  </BrowserRouter> 
)
