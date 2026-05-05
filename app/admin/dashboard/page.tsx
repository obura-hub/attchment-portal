"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/context/ToastContext";
import ApplicationsManager from "@/components/admin/ApplicationsManager";
import PositionsManager from "@/components/admin/PositionsManager";
import ReportsManager from "@/components/admin/ReportsManager";

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("applications");
  const [admin, setAdmin] = useState<any>(null);
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

   const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' });
      success("👋 Logged out successfully!");
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('adminLoggedIn');
      localStorage.removeItem('adminData');
      setTimeout(() => {
        router.push('/admin/login');
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-green-800 text-white shadow-lg sticky top-0 z-50">
        <div className="px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-green-200 text-sm">Nairobi City County - Attachment Program</p>
          </div>
          <div className="flex items-center gap-4">
            <span>Welcome, {admin?.full_name || 'Admin'}</span>
            <button onClick={handleLogout} className="bg-red-600 px-4 py-2 rounded hover:bg-red-700 transition">
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 p-6">
        <div className="bg-white rounded-lg p-4 shadow">
          <div className="text-2xl font-bold text-green-700">{stats.totalStudents}</div>
          <div className="text-sm text-gray-600">Total Students</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow">
          <div className="text-2xl font-bold text-blue-700">{stats.totalApplications}</div>
          <div className="text-sm text-gray-600">Applications</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow">
          <div className="text-2xl font-bold text-yellow-700">{stats.pendingApplications}</div>
          <div className="text-sm text-gray-600">Pending</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow">
          <div className="text-2xl font-bold text-indigo-700">{stats.shortlistedApplications}</div>
          <div className="text-sm text-gray-600">Shortlisted</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow">
          <div className="text-2xl font-bold text-green-700">{stats.acceptedApplications}</div>
          <div className="text-sm text-gray-600">Accepted</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow">
          <div className="text-2xl font-bold text-red-700">{stats.rejectedApplications}</div>
          <div className="text-sm text-gray-600">Rejected</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow">
          <div className="text-2xl font-bold text-purple-700">{stats.totalPositions}</div>
          <div className="text-sm text-gray-600">Total Positions</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow">
          <div className="text-2xl font-bold text-orange-700">{stats.openPositions}</div>
          <div className="text-sm text-gray-600">Open Positions</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 bg-white px-6">
        <nav className="flex gap-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab("applications")}
            className={`py-3 px-2 font-medium transition whitespace-nowrap ${
              activeTab === "applications"
                ? "text-green-700 border-b-2 border-green-700"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            📋 Applications Management
          </button>
          <button
            onClick={() => setActiveTab("documents")}
            className={`py-3 px-2 font-medium transition whitespace-nowrap ${
              activeTab === "documents"
                ? "text-green-700 border-b-2 border-green-700"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            📎 View Documents
          </button>
          <button
            onClick={() => setActiveTab("reports")}
            className={`py-3 px-2 font-medium transition whitespace-nowrap ${
              activeTab === "reports"
                ? "text-green-700 border-b-2 border-green-700"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            📊 Reports & Export
          </button>
          <button
            onClick={() => setActiveTab("positions")}
            className={`py-3 px-2 font-medium transition whitespace-nowrap ${
              activeTab === "positions"
                ? "text-green-700 border-b-2 border-green-700"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            📌 Post Positions
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === "applications" && <ApplicationsManager onUpdate={fetchStats} />}
        {activeTab === "documents" && <DocumentsViewer />}
        {activeTab === "reports" && <ReportsManager stats={stats} />}
        {activeTab === "positions" && <PositionsManager onUpdate={fetchStats} />}
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
          console.log('No documents found for user:', userId);
        }
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
      setDocuments([]);
    } finally {
      setLoadingDocs(false);
    }
  };

  const downloadDocument = (filePath: string, fileName: string) => {
    // Construct full URL for the file
    const baseUrl = window.location.origin;
    const fileUrl = `${baseUrl}${filePath}`;
    window.open(fileUrl, '_blank');
  };

  const getDocumentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'introduction_letter': '📄 Introduction Letter',
      'application_letter': '📝 Application Letter',
      'cv': '📑 Curriculum Vitae',
      'insurance': '🛡️ Insurance Cover',
      'id_card': '🪪 ID/Passport'
    };
    return labels[type] || type;
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
            <tbody className="divide-y">
              {applications.map((app) => (
                <tr key={app.application_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium">{app.student_name}</div>
                    <div className="text-xs text-gray-500">{app.student_email}</div>
                   </td>
                  <td className="px-6 py-4">{app.position_title}</td>
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
                    <span className="text-sm text-gray-500">
                      📎 {app.documents_count || 0} document(s)
                    </span>
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
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h3 className="text-xl font-bold">
                Documents: {selectedApp.student_name}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setDocuments([]);
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="p-4">
              {loadingDocs ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700 mx-auto"></div>
                  <p className="mt-2 text-gray-500">Loading documents...</p>
                </div>
              ) : documents.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-5xl mb-4">📂</div>
                  <p className="text-gray-500">No documents uploaded by this student</p>
                  <p className="text-xs text-gray-400 mt-2">Make sure the student has uploaded documents from their dashboard</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {documents.map((doc) => (
                    <div key={doc.document_id} className="border rounded-lg p-4 flex justify-between items-center hover:bg-gray-50">
                      <div>
                        <div className="font-medium">{getDocumentTypeLabel(doc.document_type)}</div>
                        <div className="text-sm text-gray-600">{doc.document_name}</div>
                        <div className="text-xs text-gray-400">
                          Uploaded: {new Date(doc.uploaded_at).toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-400">
                          Size: {doc.file_size ? (doc.file_size / 1024).toFixed(2) : 'N/A'} KB
                        </div>
                      </div>
                      <button
                        onClick={() => downloadDocument(doc.file_path, doc.document_name)}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2"
                      >
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