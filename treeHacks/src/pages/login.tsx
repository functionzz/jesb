// src/pages/LoginPage.tsx
import { Button } from "@/components/ui/button"

export default function LoginPage() {
  const handleLogin = () => {
    console.log("Logging in...");
    // Logic for auth goes here
  };

  return (
    <div className="flex items-center justify-center">
      
      {/* The Login Card */}
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-8 flex flex-col gap-6">
          
        {/* Header Section */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">TreeHacks</h1>
          <p className="text-slate-400 text-sm">
            Welcome back! Please enter your details.
          </p>
        </div>

        {/* Form Section */}
        <div className="flex flex-col gap-4">
          
          {/* Email Input Group */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-300">Email</label>
            <input 
              type="email" 
              placeholder="name@example.com" 
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors" 
            />
          </div>

          {/* Password Input Group */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-300">Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors" 
            />
          </div>

          {/* Extra Options (Remember Me / Forgot Password) */}
          <div className="flex items-center justify-between text-sm mt-1">
            <label className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-slate-300">
              <input type="checkbox" className="rounded border-slate-700 bg-slate-950 accent-white" />
              <span>Remember me</span>
            </label>
            <a href="#" className="text-slate-300 hover:text-white hover:underline transition-colors">
              Forgot password?
            </a>
          </div>

          {/* Login Button */}
          <Button 
            onClick={handleLogin} 
            className="w-full mt-4 bg-white text-black hover:bg-slate-200 py-6 rounded-lg font-semibold text-md transition-colors"
          >
            Sign in
          </Button>

        </div>

        {/* Footer Section */}
        <p className="text-center text-sm text-slate-400 mt-2">
          Don't have an account?{' '}
          <a href="#" className="text-white font-medium hover:underline">
            Sign up
          </a>
        </p>

      </div>
    </div>
  );
}