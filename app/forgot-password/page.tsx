"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError("Email address is required");
      return;
    }
    
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("Invalid email format");
      return;
    }
    
    setIsLoading(true);
    setError("");
    setMessage("");
    
    try {
      const response = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setIsSubmitted(true);
        setMessage(result.message);
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar and Header (same as login page) */}
      <div className="bg-gray-900 text-gray-300 text-sm py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <span>📞 0208000325/326</span>
            <span>✉️ cpsb@nairobi.go.ke</span>
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-50 bg-white shadow-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3 md:py-4">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-800 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg font-bold">NCC</span>
              </div>
              <div>
                <h1 className="text-base md:text-lg font-bold text-green-800">Nairobi City County</h1>
                <p className="text-xs text-gray-500">Student Attachment Application Portal</p>
              </div>
            </Link>
          </div>
        </div>
      </header>

      {/* Forgot Password Form */}
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
            <div className="bg-gradient-to-r from-green-800 to-green-700 px-6 py-8 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-4">
                <span className="text-4xl">🔑</span>
              </div>
              <h2 className="text-2xl font-bold text-white">Forgot Password?</h2>
              <p className="text-green-100 text-sm mt-1">Reset your password</p>
            </div>
            
            <div className="p-6 md:p-8">
              {!isSubmitted ? (
                <>
                  <p className="text-gray-600 text-sm mb-6 text-center">
                    Enter your email address and we'll send you a link to reset your password.
                  </p>
                  
                  {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                      {error}
                    </div>
                  )}
                  
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="youremail@example.com"
                      />
                    </div>
                    
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-green-700 text-white py-2.5 rounded-lg hover:bg-green-800 transition font-medium disabled:opacity-50"
                    >
                      {isLoading ? "Sending..." : "Send Reset Link"}
                    </button>
                  </form>
                </>
              ) : (
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                    <span className="text-3xl">📧</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Check Your Email</h3>
                  <p className="text-gray-600 text-sm mb-4">{message}</p>
                  <p className="text-gray-500 text-xs">Didn't receive the email? Check your spam folder or try again.</p>
                </div>
              )}
              
              <div className="mt-6 pt-6 border-t border-gray-200 text-center">
                <Link href="/login" className="text-sm text-green-700 hover:text-green-800 font-medium">
                  ← Back to Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-gray-900 text-gray-400 pt-8 pb-6 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="border-t border-gray-800 pt-6 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} Nairobi City County Government. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}