"use client";

import { useState, useEffect } from 'react';

interface InactivityWarningModalProps {
  isOpen: boolean;
  timeLeft: number;
  onStayLoggedIn: () => void;
  onLogout: () => void;
}

export default function InactivityWarningModal({ 
  isOpen, 
  timeLeft, 
  onStayLoggedIn, 
  onLogout 
}: InactivityWarningModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <div className="text-center">
          <div className="text-5xl mb-4">⏰</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Session Expiring Soon</h3>
          <p className="text-gray-600 mb-4">
            Your session will expire in <span className="font-bold text-red-600">{timeLeft}</span> second{timeLeft !== 1 ? 's' : ''} due to inactivity.
          </p>
          <div className="flex gap-3">
            <button
              onClick={onLogout}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Logout Now
            </button>
            <button
              onClick={onStayLoggedIn}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              Stay Logged In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}