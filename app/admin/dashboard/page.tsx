"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/context/ToastContext";
import InactivityWarningModal from "@/components/InactivityWarningModal";
import ApplicationsManager from "@/components/admin/ApplicationsManager";
import PositionsManager from "@/components/admin/PositionsManager";
import ReportsManager from "@/components/admin/ReportsManager";

// Sidebar Menu Component - Updated with Attachment Letters menu
function Sidebar({ activeMenu, onMenuChange }: { activeMenu: string; onMenuChange: (menu: string) => void }) {
  const menuItems = [
    { id: "dashboard", name: "Dashboard", icon: "📊" },
    { id: "applications", name: "Applications", icon: "📋" },
    { id: "documents", name: "Documents", icon: "📎" },
    { id: "attachment-letters", name: "Attachment Letters", icon: "📜" },
    { id: "reports", name: "Reports", icon: "📊" },
    { id: "positions", name: "Positions", icon: "📌" },
  ];

  return (
    <aside className="w-64 bg-gradient-to-b from-green-800 to-green-700 shadow-lg min-h-screen flex-shrink-0">
      <div className="p-4 border-b border-green-600">
        <h2 className="text-xl font-bold text-white">ADMIN DASHBOARD</h2>
      </div>
      <nav className="p-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onMenuChange(item.id)}
            className={`w-full text-left px-4 py-3 rounded-lg mb-1 transition flex items-center gap-3 ${
              activeMenu === item.id
                ? "bg-white/20 text-white"
                : "text-green-100 hover:bg-white/10 hover:text-white"
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span>{item.name}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}

// Stats Card Component
function StatCard({ title, value, icon, color }: { title: string; value: number; icon: string; color: string }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-5 border-l-4 border-l-green-600">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-500 text-sm mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-800">{value}</p>
        </div>
        <div className={`text-3xl ${color}`}>{icon}</div>
      </div>
    </div>
  );
}

// Dashboard Overview Component
function DashboardOverview({ stats, currentDate, setActiveMenu }: { stats: any; currentDate: string; setActiveMenu: (menu: string) => void }) {
  return (
    <div className="space-y-6">
      {/* Stats Grid - Top Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <StatCard title="Total Students" value={stats.totalStudents} icon="👥" color="text-blue-500" />
        <StatCard title="Total Applications" value={stats.totalApplications} icon="📝" color="text-purple-500" />
        <StatCard title="Total Positions" value={stats.totalPositions} icon="💼" color="text-orange-500" />
        <StatCard title="Open Positions" value={stats.openPositions} icon="🔓" color="text-green-500" />
      </div>

      {/* Stats Grid - Application Status */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
        <StatCard title="Pending" value={stats.pendingApplications} icon="⏳" color="text-yellow-500" />
        <StatCard title="Shortlisted" value={stats.shortlistedApplications} icon="⭐" color="text-blue-500" />
        <StatCard title="Accepted" value={stats.acceptedApplications} icon="✅" color="text-green-500" />
        <StatCard title="Rejected" value={stats.rejectedApplications} icon="❌" color="text-red-500" />
        <StatCard title="Departments" value={15} icon="🏛️" color="text-indigo-500" />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button onClick={() => setActiveMenu("applications")} className="bg-green-50 text-green-700 p-4 rounded-lg text-center hover:bg-green-100 transition">
            <div className="text-2xl mb-2">📋</div>
            <div className="font-medium">View Applications</div>
          </button>
          <button onClick={() => setActiveMenu("positions")} className="bg-blue-50 text-blue-700 p-4 rounded-lg text-center hover:bg-blue-100 transition">
            <div className="text-2xl mb-2">📌</div>
            <div className="font-medium">Post Positions</div>
          </button>
          <button onClick={() => setActiveMenu("documents")} className="bg-purple-50 text-purple-700 p-4 rounded-lg text-center hover:bg-purple-100 transition">
            <div className="text-2xl mb-2">📎</div>
            <div className="font-medium">View Documents</div>
          </button>
          <button onClick={() => setActiveMenu("reports")} className="bg-orange-50 text-orange-700 p-4 rounded-lg text-center hover:bg-orange-100 transition">
            <div className="text-2xl mb-2">📊</div>
            <div className="font-medium">Export Reports</div>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600">📝</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">New applications received</p>
              <p className="text-xs text-gray-500">{stats.pendingApplications} pending review</p>
            </div>
            <span className="text-xs text-gray-400">Today</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600">⭐</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Shortlisted candidates</p>
              <p className="text-xs text-gray-500">{stats.shortlistedApplications} candidates shortlisted</p>
            </div>
            <span className="text-xs text-gray-400">This week</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-purple-600">📌</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Open positions</p>
              <p className="text-xs text-gray-500">{stats.openPositions} positions accepting applications</p>
            </div>
            <span className="text-xs text-gray-400">Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Documents Viewer Component
function DocumentsViewer() {
  const { success, error: toastError, info } = useToast();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loadingDocs, setLoadingDocs] = useState(false);

  useEffect(() => {
    fetchApplicationsWithDocuments();
  }, []);

  const fetchApplicationsWithDocuments = async () => {
    try {
      const response = await fetch('/api/admin/applications?includeDocuments=true');
      const data = await response.json();
      if (data.success) {
        setApplications(data.applications);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      toastError('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async (userId: number, studentName: string) => {
    setLoadingDocs(true);
    setSelectedApp({ user_id: userId, student_name: studentName });
    setShowModal(true);
    
    try {
      const response = await fetch(`/api/admin/documents?userId=${userId}`);
      const data = await response.json();
      if (data.success) {
        setDocuments(data.documents);
        if (data.documents.length === 0) {
          info(`No documents found for ${studentName}`);
        }
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
      toastError('Failed to fetch documents');
      setDocuments([]);
    } finally {
      setLoadingDocs(false);
    }
  };

  const downloadDocument = (filePath: string, fileName: string) => {
    const baseUrl = window.location.origin;
    const fileUrl = `${baseUrl}${filePath}`;
    window.open(fileUrl, '_blank');
    success(`Downloading: ${fileName}`);
  };

  const getDocumentIcon = (docType: string) => {
    const icons: Record<string, string> = {
      'introduction_letter': '📄',
      'application_letter': '📝',
      'cv': '📑',
      'insurance': '🛡️',
      'id_card': '🪪',
      'police_clearance': '👮',
      'transcripts': '📊'
    };
    return icons[docType] || '📎';
  };

  const getDocumentDisplayName = (docType: string): string => {
    const displayNames: Record<string, string> = {
      'introduction_letter': '📄 Introduction Letter from School',
      'application_letter': '📝 Application Letter (Cover Letter)',
      'cv': '📑 Curriculum Vitae (CV)',
      'insurance': '🛡️ Personal Accident/Medical Insurance Cover',
      'id_card': '🪪 National ID or Passport',
      'police_clearance': '👮 Police Clearance Certificate',
      'transcripts': '📊 Exam Transcripts'
    };
    return displayNames[docType] || docType;
  };

  if (loading) {
    return <div className="text-center py-8">Loading applications...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b bg-gray-50">
          <h3 className="text-lg font-semibold">Student Applications & Documents</h3>
          <p className="text-sm text-gray-500">Click "View Documents" to see uploaded files</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">Student Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Position</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Documents</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {applications.map((app) => (
                <tr key={app.application_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium">{app.student_name}</div>
                    <div className="text-xs text-gray-500">{app.student_email}</div>
                    <div className="text-xs text-gray-400">{app.student_phone}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium">{app.position_title}</div>
                    <div className="text-xs text-gray-500">{app.department_name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded ${
                      app.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                      app.status === 'Shortlisted' ? 'bg-blue-100 text-blue-800' :
                      app.status === 'Accepted' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {app.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-500">📎 {app.documents_count || 0} document(s)</span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => fetchDocuments(app.user_id, app.student_name)}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                    >
                      View Documents
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {applications.length === 0 && (
          <div className="text-center py-8 text-gray-500">No applications found</div>
        )}
      </div>

      {/* Documents Modal */}
      {showModal && selectedApp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[85vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h3 className="text-xl font-bold">Documents: {selectedApp.student_name}</h3>
              <button onClick={() => { setShowModal(false); setDocuments([]); }} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
            </div>
            <div className="p-4">
              {loadingDocs ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700 mx-auto"></div>
                  <p className="mt-2 text-gray-500">Loading documents...</p>
                </div>
              ) : documents.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">📂</div>
                  <p className="text-gray-500">No documents uploaded by this student</p>
                  <p className="text-xs text-gray-400 mt-2">Make sure the student has uploaded documents from their dashboard</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {documents.map((doc) => (
                    <div key={doc.document_id} className="border rounded-lg p-4 flex justify-between items-center hover:bg-gray-50 transition">
                      <div className="flex items-start gap-3">
                        <div className="text-3xl">{getDocumentIcon(doc.document_type)}</div>
                        <div>
                          <div className="font-medium text-gray-800">{getDocumentDisplayName(doc.document_type)}</div>
                          <div className="text-sm text-gray-500">File: {doc.document_name}</div>
                          <div className="text-xs text-gray-400">Uploaded: {new Date(doc.uploaded_at).toLocaleString()}</div>
                          {doc.file_size && <div className="text-xs text-gray-400">Size: {(doc.file_size / 1024).toFixed(2)} KB</div>}
                        </div>
                      </div>
                      <button onClick={() => downloadDocument(doc.file_path, doc.document_name)} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition flex items-center gap-2">
                        📥 Download
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Attachment Letters Viewer Component - No popup message
// Attachment Letters Viewer Component - No popup message
function AttachmentLettersViewer() {
  const { success, error: toastError } = useToast();
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [departments, setDepartments] = useState<string[]>([]);

  useEffect(() => {
    fetchStudentsWithLetters();
  }, []);

  const fetchStudentsWithLetters = async () => {
    try {
      const response = await fetch('/api/admin/attachment-letters/students');
      const data = await response.json();
      if (data.success) {
        setStudents(data.students);
        // Extract unique departments for filter with proper typing
        const depts = Array.from(
          new Set(data.students.map((s: any) => String(s.department_name)))
        ) as string[];
        setDepartments(depts);
        // Removed the info toast notification - no popup message
      }
    } catch (error) {
      console.error('Error fetching students with letters:', error);
      toastError('Failed to load attachment letters');
    } finally {
      setLoading(false);
    }
  };

  const downloadAttachment = (filePath: string, fileName: string) => {
    const baseUrl = window.location.origin;
    const fileUrl = `${baseUrl}${filePath}`;
    window.open(fileUrl, '_blank');
    success(`📥 Downloading: ${fileName}`);
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Shortlisted': 'bg-blue-100 text-blue-800',
      'Accepted': 'bg-green-100 text-green-800',
      'Rejected': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const filteredStudents = students.filter(student => {
    const matchSearch = student.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        student.student_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        student.position_title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchDepartment = filterDepartment === "all" || student.department_name === filterDepartment;
    return matchSearch && matchDepartment;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b bg-gray-50">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div>
              <h3 className="text-lg font-semibold">📜 Attachment Letters Issued</h3>
              <p className="text-sm text-gray-500">
                Showing {filteredStudents.length} of {students.length} students with attachment letters
              </p>
            </div>
            <div className="flex gap-3 flex-wrap">
              <input
                type="text"
                placeholder="Search by name, email or position..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-2 border rounded-lg w-64 text-sm"
              />
              <select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="px-4 py-2 border rounded-lg text-sm"
              >
                <option value="all">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {filteredStudents.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📜</div>
            <p className="text-gray-500">No attachment letters have been issued yet.</p>
            <p className="text-sm text-gray-400 mt-1">
              When you accept a student's application, you can upload their attachment letter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Student</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Position</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Department</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Letter Uploaded</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredStudents.map((student) => (
                  <tr key={student.application_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{student.student_name}</div>
                      <div className="text-sm text-gray-500">{student.student_email}</div>
                      <div className="text-xs text-gray-400">{student.student_phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-800">{student.position_title}</div>
                      <div className="text-xs text-gray-500">Duration: {student.attachment_duration_weeks} weeks</div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{student.department_name}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(student.status)}`}>
                        {student.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-green-600 flex items-center gap-1">
                        📅 {new Date(student.uploaded_at).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => downloadAttachment(student.file_path, student.file_name)}
                        className="bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700 transition text-sm flex items-center gap-1"
                      >
                        📥 Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Statistics Summary */}
      {students.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-2xl font-bold text-green-700">{students.length}</div>
            <div className="text-sm text-gray-500">Total Letters Issued</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-2xl font-bold text-blue-700">
              {students.filter(s => s.status === 'Accepted').length}
            </div>
            <div className="text-sm text-gray-500">Accepted Students</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-2xl font-bold text-purple-700">
              {new Set(students.map(s => s.department_name)).size}
            </div>
            <div className="text-sm text-gray-500">Departments</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-2xl font-bold text-orange-700">
              {students.filter(s => s.status === 'Shortlisted').length}
            </div>
            <div className="text-sm text-gray-500">Shortlisted</div>
          </div>
        </div>
      )}
    </div>
  );
}

// Main Admin Dashboard Component
export default function AdminDashboard() {
  const router = useRouter();
  const { success, error: toastError } = useToast();
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [admin, setAdmin] = useState<any>(null);
  const [currentDate, setCurrentDate] = useState("");
  const [showWarning, setShowWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalApplications: 0,
    pendingApplications: 0,
    shortlistedApplications: 0,
    acceptedApplications: 0,
    rejectedApplications: 0,
    totalPositions: 0,
    openPositions: 0
  });

  // Warning timer ref
  const warningTimerRef = useState<NodeJS.Timeout | null>(null);
  const countdownRef = useState<NodeJS.Timeout | null>(null);

  // Custom logout handler
  const handleAutoLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('adminLoggedIn');
      localStorage.removeItem('adminData');
      router.push('/admin/login');
    }
  };

  // Reset all timers
  const resetTimers = () => {
    if (warningTimerRef[0]) {
      clearTimeout(warningTimerRef[0]);
      warningTimerRef[1](null);
    }
    if (countdownRef[0]) {
      clearInterval(countdownRef[0]);
      countdownRef[1](null);
    }
    setShowWarning(false);
    setTimeLeft(60);
  };

  // Set up inactivity timer (1 minute = 60 seconds)
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
        countdownRef[1](countdown);
      }, 50 * 1000);
      
      warningTimerRef[1](inactivityTimer);
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
        countdownRef[1](countdown);
      }, 50 * 1000);
      warningTimerRef[1](timer);
    };
    startTimer();
  };

  const handleLogout = async () => {
    resetTimers();
    try {
      await fetch('/api/logout', { method: 'POST' });
      success("👋 Logged out successfully!");
    } catch (err) {
      console.error('Logout error:', err);
      toastError("Failed to logout");
    } finally {
      localStorage.removeItem('adminLoggedIn');
      localStorage.removeItem('adminData');
      setTimeout(() => {
        router.push('/admin/login');
      }, 1000);
    }
  };

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('adminLoggedIn');
    if (!isLoggedIn) {
      router.push('/admin/login');
      return;
    }
    const adminData = localStorage.getItem('adminData');
    if (adminData) {
      setAdmin(JSON.parse(adminData));
    }
    fetchStats();
    
    const date = new Date();
    setCurrentDate(date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    }));
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats');
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const renderContent = () => {
    switch (activeMenu) {
      case "applications":
        return <ApplicationsManager onUpdate={fetchStats} />;
      case "documents":
        return <DocumentsViewer />;
      case "attachment-letters":
        return <AttachmentLettersViewer />;
      case "reports":
        return <ReportsManager stats={stats} />;
      case "positions":
        return <PositionsManager onUpdate={fetchStats} />;
      default:
        return <DashboardOverview stats={stats} currentDate={currentDate} setActiveMenu={setActiveMenu} />;
    }
  };

  return (
    <>
      <InactivityWarningModal 
        isOpen={showWarning}
        timeLeft={timeLeft}
        onStayLoggedIn={handleStayLoggedIn}
        onLogout={handleLogout}
      />
      <div className="min-h-screen bg-gray-100 flex">
        <Sidebar activeMenu={activeMenu} onMenuChange={setActiveMenu} />
        <div className="flex-1 flex flex-col">
          <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  {activeMenu === "dashboard" ? "Dashboard" : 
                   activeMenu === "applications" ? "Applications Management" :
                   activeMenu === "documents" ? "Documents Viewer" :
                   activeMenu === "attachment-letters" ? "Attachment Letters" :
                   activeMenu === "reports" ? "Reports & Export" : "Positions Management"}
                </h1>
                <p className="text-sm text-gray-500">{currentDate} |</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-gray-600">Welcome, {admin?.full_name || 'Admin'}</span>
                <button onClick={handleLogout} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition text-sm">Logout</button>
              </div>
            </div>
          </header>
          <main className="flex-1 p-6">{renderContent()}</main>
        </div>
      </div>
    </>
  );
}