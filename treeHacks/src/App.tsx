// src/App.tsx
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import './App.css'
import LoginPage from './pages/login' 
import CanvasPage from "./pages/canvas";

function App() {
  return (
    <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/canvas" element={<CanvasPage />} />

          <Route path="/" element={
            <div className="flex flex-col items-center justify-center min-h-screen">
              <h1 className="text-4xl font-bold">Welcome to TreeHacks!</h1>

              <Link to="/login" className="mt-4 text-blue-500 hover:underline">
                Go to Login Page
              </Link>
              
              <Link to="/canvas" className="mt-2 text-blue-500 hover:underline">
                Go to Canvas Page
              </Link>
            </div>
          } />
        </Routes>
    </BrowserRouter>
  )
}

export default App;