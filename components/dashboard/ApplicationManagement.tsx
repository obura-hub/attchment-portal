"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/context/ToastContext";

interface ApplicationManagementProps {
  user: any;
  userId: number;
  onUpdate: () => void;
}

interface Application {
  application_id: number;
  position_id: number;
  position_title: string;
  department_name: string;
  application_date: string;
  status: string;
  cover_letter: string;
  status_updated_date: string;
  attachment_duration_weeks: number;
  application_deadline: string;
  has_attachment?: boolean;
  attachment_file_path?: string;
  attachment_file_name?: string;
}

export default function ApplicationManagement({ user, userId, onUpdate }: ApplicationManagementProps) {
  const { success, error: toastError, info } = useToast();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [withdrawReason, setWithdrawReason] = useState("");
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchApplications();
    }
  }, [userId]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/dashboard/applications?userId=${userId}`);
      const data = await response.json();
      if (data.success) {
        setApplications(data.applications);
      } else {
        console.error('Failed to fetch applications:', data.error);
        setApplications([]);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!selectedApp) return;
    
    try {
      const response = await fetch('/api/dashboard/applications/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId: selectedApp.application_id,
          userId: userId,
          reason: withdrawReason
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        success("✅ Application withdrawn successfully!");
        setShowWithdrawModal(false);
        setWithdrawReason("");
        fetchApplications();
        onUpdate();
      } else {
        toastError(data.error || "Failed to withdraw application");
      }
    } catch (error) {
      toastError("Error withdrawing application. Please try again.");
    }
  };

  const downloadAttachment = async (applicationId: number) => {
    try {
      const response = await fetch(`/api/dashboard/applications/download-attachment?applicationId=${applicationId}`);
      const data = await response.json();
      
      if (data.success && data.filePath) {
        window.open(data.filePath, '_blank');
        success(`📥 Downloading attachment letter`);
      } else {
        toastError(data.error || 'No attachment letter found');
      }
    } catch (error) {
      toastError('Error downloading attachment');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'shortlisted': return 'bg-blue-100 text-blue-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'withdrawn': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return '⏳';
      case 'shortlisted': return '⭐';
      case 'accepted': return '✅';
      case 'rejected': return '❌';
      case 'withdrawn': return '🚫';
      default: return '📝';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <span>📝</span> My Applications
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Track the status of your attachment applications
          </p>
        </div>
        
        {applications.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {applications.map((app) => (
              <div key={app.application_id} className="p-6 hover:bg-gray-50 transition">
                <div className="flex flex-wrap justify-between items-start gap-4">
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-800">{app.position_title}</h4>
                    <p className="text-sm text-gray-500 mt-1">{app.department_name}</p>
                    <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                      <span>📅 Applied: {formatDate(app.application_date)}</span>
                      <span>⏱️ Duration: {app.attachment_duration_weeks} weeks</span>
                      {app.application_deadline && (
                        <span>⏰ Deadline: {formatDate(app.application_deadline)}</span>
                      )}
                    </div>
                    {app.status.toLowerCase() === 'accepted' && app.has_attachment && (
                      <div className="mt-2">
                        <span className="text-xs text-green-600">📎 Attachment letter available</span>
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(app.status)}`}>
                      {getStatusIcon(app.status)} {app.status}
                    </span>
                    <p className="text-xs text-gray-400 mt-1">
                      Updated: {formatDate(app.status_updated_date)}
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-3 mt-4 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => {
                      setSelectedApp(app);
                      setShowDetailsModal(true);
                    }}
                    className="text-green-700 hover:text-green-800 text-sm font-medium transition"
                  >
                    View Details
                  </button>
                  {app.status.toLowerCase() === 'pending' && (
                    <button
                      onClick={() => {
                        setSelectedApp(app);
                        setShowWithdrawModal(true);
                      }}
                      className="text-red-700 hover:text-red-800 text-sm font-medium transition"
                    >
                      Withdraw Application
                    </button>
                  )}
                  {app.status.toLowerCase() === 'accepted' && app.has_attachment && (
                    <button
                      onClick={() => downloadAttachment(app.application_id)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium transition flex items-center gap-1"
                    >
                      📥 Download Attachment Letter
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">📭</div>
            <p className="text-gray-500">You haven't submitted any applications yet.</p>
            <p className="text-sm text-gray-400 mt-1">
              Browse attachment opportunities and start your application today!
            </p>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedApp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-gray-800">Application Details</h3>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Position</label>
                  <p className="text-gray-800 font-medium">{selectedApp.position_title}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Department</label>
                  <p className="text-gray-800">{selectedApp.department_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Application Status</label>
                  <p className={`inline-flex items-center gap-1 px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(selectedApp.status)}`}>
                    {getStatusIcon(selectedApp.status)} {selectedApp.status}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Application Date</label>
                  <p className="text-gray-800">{formatDate(selectedApp.application_date)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Last Status Update</label>
                  <p className="text-gray-800">{formatDate(selectedApp.status_updated_date)}</p>
                </div>
                {selectedApp.status.toLowerCase() === 'accepted' && selectedApp.has_attachment && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Attachment Letter</label>
                    <button
                      onClick={() => downloadAttachment(selectedApp.application_id)}
                      className="mt-2 inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                      📥 Download Attachment Letter
                    </button>
                  </div>
                )}
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Withdraw Modal */}
      {showWithdrawModal && selectedApp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-semibold mb-4">Withdraw Application</h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to withdraw your application for <strong>{selectedApp.position_title}</strong>?
            </p>
            <p className="text-sm text-red-600 mb-4">
              Warning: This action cannot be undone.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Reason for withdrawal (optional)</label>
              <textarea
                rows={3}
                value={withdrawReason}
                onChange={(e) => setWithdrawReason(e.target.value)}
                placeholder="Please tell us why you're withdrawing..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleWithdraw}
                className="flex-1 bg-red-700 text-white py-2 rounded-lg hover:bg-red-800 transition"
              >
                Yes, Withdraw
              </button>
              <button
                onClick={() => {
                  setShowWithdrawModal(false);
                  setWithdrawReason("");
                }}
                className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}