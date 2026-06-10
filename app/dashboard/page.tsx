"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import InactivityWarningModal from "@/components/InactivityWarningModal";
import ProfileManagement from "@/components/dashboard/ProfileManagement";
import OpportunitiesList from "@/components/dashboard/OpportunitiesList";
import ApplicationManagement from "@/components/dashboard/ApplicationManagement";
import DocumentsRequired from "@/components/dashboard/DocumentsRequired";

export default function DashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("profile");
  const [user, setUser] = useState<any>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [showWarning, setShowWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [warningTimerRef, setWarningTimerRef] = useState<NodeJS.Timeout | null>(null);
  const [countdownRef, setCountdownRef] = useState<NodeJS.Timeout | null>(null);
  const [stats, setStats] = useState({
    applications: 0,
    pending: 0,
    shortlisted: 0,
    accepted: 0,
    rejected: 0
  });

  // Auto logout handler
  const handleAutoLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('user');
      localStorage.removeItem('userEmail');
      router.push('/login');
    }
  };

  // Reset timers
  const resetTimers = () => {
    if (warningTimerRef) {
      clearTimeout(warningTimerRef);
      setWarningTimerRef(null);
    }
    if (countdownRef) {
      clearInterval(countdownRef);
      setCountdownRef(null);
    }
    setShowWarning(false);
    setTimeLeft(60);
  };

  // Set up inactivity timer
  useEffect(() => {
    let inactivityTimer: NodeJS.Timeout;
    
    const startInactivityTimer = () => {
      if (inactivityTimer) clearTimeout(inactivityTimer);
      
      inactivityTimer = setTimeout(() => {
        setShowWarning(true);
        const countdown = setInterval(() => {
          setTimeLeft(prev => {
            if (prev <= 1) {
              clearInterval(countdown);
              handleAutoLogout();
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        setCountdownRef(countdown);
      }, 50 * 1000); // 50 seconds
      
      setWarningTimerRef(inactivityTimer);
    };
    
    const handleActivity = () => {
      resetTimers();
      startInactivityTimer();
    };
    
    startInactivityTimer();
    
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click', 'mousemove'];
    events.forEach(event => {
      window.addEventListener(event, handleActivity);
    });
    
    return () => {
      if (inactivityTimer) clearTimeout(inactivityTimer);
      resetTimers();
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, []);

  const handleStayLoggedIn = () => {
    resetTimers();
    const startTimer = () => {
      const timer = setTimeout(() => {
        setShowWarning(true);
        const countdown = setInterval(() => {
          setTimeLeft(prev => {
            if (prev <= 1) {
              clearInterval(countdown);
              handleAutoLogout();
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        setCountdownRef(countdown);
      }, 50 * 1000);
      setWarningTimerRef(timer);
    };
    startTimer();
  };

  // Check authentication on mount
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const userData = localStorage.getItem('user');
    
    if (!isLoggedIn || isLoggedIn !== 'true') {
      router.push('/login');
      return;
    }
    
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setUserId(parsedUser.id);
    } else {
      router.push('/login');
      return;
    }
    
    setLoading(false);
  }, [router]);

  // Fetch stats when userId is available
  useEffect(() => {
    if (userId) {
      fetchDashboardStats();
    }
  }, [userId]);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch(`/api/dashboard/stats?userId=${userId}`);
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStats({
        applications: 0,
        pending: 0,
        shortlisted: 0,
        accepted: 0,
        rejected: 0
      });
    }
  };

  const handleLogout = async () => {
    resetTimers();
    try {
      await fetch('/api/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('user');
      localStorage.removeItem('userEmail');
      router.push('/login');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <InactivityWarningModal 
        isOpen={showWarning}
        timeLeft={timeLeft}
        onStayLoggedIn={handleStayLoggedIn}
        onLogout={handleAutoLogout}
      />
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Top Bar */}
        <div className="bg-gray-900 text-gray-300 text-sm py-2">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <span>📞 0208000325/326</span>
              <span>✉️ cpsb@nairobi.go.ke</span>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <span className="text-green-400">Welcome, {user?.name || user?.firstName || 'Student'}</span>
              <button onClick={handleLogout} className="hover:text-white transition">
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Header */}
        <header className="sticky top-0 z-50 bg-white shadow-md border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-3 md:py-4">
              <Link href="/dashboard" className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-800 rounded-lg flex items-center justify-center">
                  <span className="text-white text-lg font-bold">NCC</span>
                </div>
                <div>
                  <h1 className="text-base md:text-lg font-bold text-green-800">Nairobi City County</h1>
                  <p className="text-xs text-gray-500">Student Dashboard</p>
                </div>
              </Link>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-green-800 to-green-700 rounded-xl p-6 mb-8 text-white">
            <h2 className="text-2xl font-bold mb-2">Welcome, {user?.name || user?.firstName || 'Student'}!</h2>
            <p className="text-green-100">
              Apply and track your attachment applications, manage your profile, and discover new opportunities.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 text-center">
              <div className="text-2xl mb-1">📊</div>
              <div className="text-2xl font-bold text-gray-800">{stats.applications}</div>
              <div className="text-sm text-gray-500">Total Applications</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm text-center">
              <div className="text-2xl mb-1">⏳</div>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <div className="text-sm text-gray-500">Pending</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm text-center">
              <div className="text-2xl mb-1">⭐</div>
              <div className="text-2xl font-bold text-blue-600">{stats.shortlisted}</div>
              <div className="text-sm text-gray-500">Shortlisted</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm text-center">
              <div className="text-2xl mb-1">✅</div>
              <div className="text-2xl font-bold text-green-600">{stats.accepted}</div>
              <div className="text-sm text-gray-500">Accepted</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm text-center">
              <div className="text-2xl mb-1">❌</div>
              <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
              <div className="text-sm text-gray-500">Rejected</div>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="flex flex-wrap gap-4">
              <button
                onClick={() => setActiveTab("profile")}
                className={`px-4 py-2 font-medium transition ${
                  activeTab === "profile"
                    ? "text-green-700 border-b-2 border-green-700"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                👤 Profile Management
              </button>
              <button
                onClick={() => setActiveTab("opportunities")}
                className={`px-4 py-2 font-medium transition ${
                  activeTab === "opportunities"
                    ? "text-green-700 border-b-2 border-green-700"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                📋 Attachment Opportunities
              </button>
              <button
                onClick={() => setActiveTab("documents")}
                className={`px-4 py-2 font-medium transition ${
                  activeTab === "documents"
                    ? "text-green-700 border-b-2 border-green-700"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                📎 Documents Required
              </button>
              <button
                onClick={() => setActiveTab("applications")}
                className={`px-4 py-2 font-medium transition ${
                  activeTab === "applications"
                    ? "text-green-700 border-b-2 border-green-700"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                📝 Application Management
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div>
            {activeTab === "profile" && <ProfileManagement user={user} userId={userId} onUpdate={fetchDashboardStats} />}
            {activeTab === "opportunities" && <OpportunitiesList user={user} userId={userId} onApply={fetchDashboardStats} />}
            {activeTab === "documents" && <DocumentsRequired userId={userId} onUpdate={fetchDashboardStats} />}
            {activeTab === "applications" && <ApplicationManagement user={user} userId={userId} onUpdate={fetchDashboardStats} />}
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
    </>
  );
}