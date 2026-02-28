// src/pages/home.tsx
import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
      <h1 className="text-4xl font-bold text-slate-900 mb-4">
        Welcome to TreeHacks!
      </h1>
      
      {/* Notice we use <Link to="..."> instead of <a href="..."> */}
      <Link 
        to="/login" 
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Go to Login Page
      </Link>
    </div>
  );
}