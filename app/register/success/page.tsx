"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function RegistrationSuccess() {
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    // Get email from localStorage or URL params
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserEmail(user.email);
    }
    
    // Clear registration form data from localStorage if any
    localStorage.removeItem('registrationData');
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <div className="bg-gray-900 text-gray-300 text-sm py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <span>📞 0208000325/326</span>
            <span>✉️ cpsb@nairobi.go.ke</span>
          </div>
        </div>
      </div>

      {/* Header */}
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

      {/* Success Content */}
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 min-h-[60vh]">
        <div className="max-w-md w-full mx-auto">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
            <div className="bg-gradient-to-r from-green-800 to-green-700 px-6 py-8 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-4">
                <span className="text-4xl">🎉</span>
              </div>
              <h2 className="text-2xl font-bold text-white">Registration Successful!</h2>
              <p className="text-green-100 text-sm mt-1">Welcome to the program</p>
            </div>
            
            <div className="p-6 md:p-8">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <span className="text-3xl">✅</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Account Created!</h3>
                <p className="text-gray-600">
                  Your account has been successfully created. You can now log in to access the student dashboard.
                </p>
              </div>
              
              {userEmail && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <p className="text-green-800 text-sm text-center">
                    A confirmation email has been sent to <strong>{userEmail}</strong>
                  </p>
                </div>
              )}
              
              <div className="space-y-3">
                <Link 
                  href="/login" 
                  className="w-full bg-green-700 text-white text-center px-4 py-3 rounded-lg hover:bg-green-800 transition font-medium block"
                >
                  Login to Dashboard
                </Link>
                <Link 
                  href="/" 
                  className="w-full border border-gray-300 text-gray-700 text-center px-4 py-3 rounded-lg hover:bg-gray-50 transition font-medium block"
                >
                  Return to Home
                </Link>
              </div>
            </div>
          </div>
          
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>
              Having trouble? Contact us at{' '}
              <a href="mailto:cpsb@nairobi.go.ke" className="text-green-700 hover:underline">
                cpsb@nairobi.go.ke
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 pt-8 pb-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="border-t border-gray-800 pt-6 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} Nairobi City County Government. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}