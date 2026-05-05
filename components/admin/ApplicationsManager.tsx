"use client";

import { useState, useEffect } from "react";

interface Application {
  application_id: number;
  position_title: string;
  department_name: string;
  student_name: string;
  student_email: string;
  student_phone: string;
  education_level: string;
  field_of_study: string;
  application_date: string;
  status: string;
  cover_letter: string;
}

interface ApplicationsManagerProps {
  onUpdate: () => void;
}

export default function ApplicationsManager({ onUpdate }: ApplicationsManagerProps) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [comments, setComments] = useState("");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/admin/applications');
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

  const handleStatusChange = async () => {
    if (!selectedApp) return;

    try {
      const response = await fetch('/api/admin/applications/status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId: selectedApp.application_id,
          status: newStatus,
          comments: comments
        })
      });

      const data = await response.json();

      if (data.success) {
        alert(`Application ${newStatus} successfully!`);
        setShowModal(false);
        fetchApplications();
        onUpdate();
      } else {
        alert(data.error || "Failed to update status");
      }
    } catch (error) {
      alert("Error updating status");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'shortlisted': return 'bg-blue-100 text-blue-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredApplications = applications.filter(app => {
    if (filter !== "all" && app.status.toLowerCase() !== filter) return false;
    if (search) {
      const searchLower = search.toLowerCase();
      return app.student_name.toLowerCase().includes(searchLower) ||
             app.student_email.toLowerCase().includes(searchLower) ||
             app.position_title.toLowerCase().includes(searchLower);
    }
    return true;
  });

  if (loading) {
    return <div className="text-center py-8">Loading applications...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b">
        <div className="flex flex-wrap gap-4 justify-between items-center">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1 rounded ${filter === "all" ? "bg-gray-800 text-white" : "bg-gray-200"}`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("pending")}
              className={`px-3 py-1 rounded ${filter === "pending" ? "bg-yellow-600 text-white" : "bg-yellow-100"}`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilter("shortlisted")}
              className={`px-3 py-1 rounded ${filter === "shortlisted" ? "bg-blue-600 text-white" : "bg-blue-100"}`}
            >
              Shortlisted
            </button>
            <button
              onClick={() => setFilter("accepted")}
              className={`px-3 py-1 rounded ${filter === "accepted" ? "bg-green-600 text-white" : "bg-green-100"}`}
            >
              Accepted
            </button>
            <button
              onClick={() => setFilter("rejected")}
              className={`px-3 py-1 rounded ${filter === "rejected" ? "bg-red-600 text-white" : "bg-red-100"}`}
            >
              Rejected
            </button>
          </div>
          <input
            type="text"
            placeholder="Search by name, email or position..."
            className="px-4 py-2 border rounded-lg w-64"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold">Student</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Position</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Department</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Application Date</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredApplications.map((app) => (
              <tr key={app.application_id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="font-medium">{app.student_name}</div>
                  <div className="text-sm text-gray-500">{app.student_email}</div>
                  <div className="text-sm text-gray-500">{app.student_phone}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-medium">{app.position_title}</div>
                  <div className="text-sm text-gray-500">{app.field_of_study}</div>
                </td>
                <td className="px-6 py-4 text-gray-600">{app.department_name}</td>
                <td className="px-6 py-4 text-gray-600">
                  {new Date(app.application_date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(app.status)}`}>
                    {app.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => {
                      setSelectedApp(app);
                      setNewStatus(app.status);
                      setShowModal(true);
                    }}
                    className="bg-green-700 text-white px-3 py-1 rounded hover:bg-green-800 text-sm"
                  >
                    Update Status
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Status Update Modal */}
      {showModal && selectedApp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Update Application Status</h3>
            <p className="text-gray-600 mb-4">
              Student: <strong>{selectedApp.student_name}</strong><br />
              Position: <strong>{selectedApp.position_title}</strong>
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">New Status</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="Pending">Pending</option>
                <option value="Shortlisted">Shortlisted</option>
                <option value="Accepted">Accepted</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Comments (Optional)</label>
              <textarea
                rows={3}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Add any comments about this decision..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleStatusChange}
                className="flex-1 bg-green-700 text-white py-2 rounded hover:bg-green-800"
              >
                Update
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 border border-gray-300 py-2 rounded hover:bg-gray-50"
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