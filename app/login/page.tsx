"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Check if already logged in
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn === 'true') {
      router.push('/dashboard');
    }
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setErrors({});
    
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Store user data
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('user', JSON.stringify(result.user));
        localStorage.setItem('userEmail', formData.email);
        
        // Redirect to dashboard
        router.push('/dashboard');
      } else {
        setErrors({ submit: result.error || "Invalid email or password. Please try again." });
      }
    } catch (error) {
      setErrors({ submit: "Network error. Please check your connection." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Bar */}
      <div className="bg-gray-900 text-gray-300 text-sm py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <span>📞 0208000325/326</span>
            <span>✉️ cpsb@nairobi.go.ke</span>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/faq" className="hover:text-white">FAQ</Link>
            <Link href="/contact" className="hover:text-white">Contact</Link>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white shadow-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3 md:py-4">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-12 h-12 bg-green-800 rounded-lg flex items-center justify-center shadow-md group-hover:bg-green-700 transition">
                <span className="text-white text-lg font-bold">NCC</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-base md:text-lg font-bold text-green-800 leading-tight">
                  Nairobi City County
                </h1>
                <p className="text-xs text-gray-500">
                  Student Attachment Application Portal
                </p>
              </div>
            </Link>
            
            <nav className="hidden md:flex space-x-6 lg:space-x-8">
              <Link href="/" className="text-gray-700 hover:text-green-700 font-medium transition">
                Home
              </Link>
              <Link href="/opportunities" className="text-gray-700 hover:text-green-700 font-medium transition">
                Opportunities
              </Link>
              <Link href="/register" className="text-gray-700 hover:text-green-700 font-medium transition">
                Register
              </Link>
              <Link href="/login" className="text-green-700 font-medium border-b-2 border-green-700 transition">
                Login
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Login Form Section */}
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          {/* Login Card */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
            <div className="bg-gradient-to-r from-green-800 to-green-700 px-6 py-8 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-4">
                <span className="text-4xl">🔐</span>
              </div>
              <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
              <p className="text-green-100 text-sm mt-1">Sign in to continue to your dashboard</p>
            </div>
            
            <div className="p-6 md:p-8">
              {errors.submit && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-start gap-2">
                  <span>⚠️</span>
                  <span>{errors.submit}</span>
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-400">📧</span>
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-3 py-2.5 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition`}
                      placeholder="youremail@example.com"
                      autoComplete="email"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-400">🔒</span>
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-12 py-2.5 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition`}
                      placeholder="••••••••"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? "🙈" : "👁️"}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                  )}
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 text-green-700 focus:ring-green-500 rounded border-gray-300" />
                    <span className="text-sm text-gray-600">Remember me</span>
                  </label>
                  <Link 
                    href="/forgot-password" 
                    className="text-sm text-green-700 hover:text-green-800 font-medium hover:underline"
                  >
                    Forgot Password?
                  </Link>
                </div>
                
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-green-700 text-white py-2.5 rounded-lg hover:bg-green-800 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </button>
              </form>
              
              <div className="mt-6 pt-6 border-t border-gray-200 text-center">
                <p className="text-sm text-gray-600">
                  Don't have an account?{' '}
                  <Link href="/register" className="text-green-700 font-medium hover:text-green-800 hover:underline">
                    Register here
                  </Link>
                </p>
              </div>
            </div>
          </div>
          
          {/* Help Text */}
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>
              Having trouble logging in?{' '}
              <a href="mailto:cpsb@nairobi.go.ke" className="text-green-700 hover:underline">
                Contact Support
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 pt-8 pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="border-t border-gray-800 pt-6 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} Nairobi City County Government. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}