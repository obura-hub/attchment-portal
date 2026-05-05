"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/context/ToastContext";

interface Department {
  department_id: number;
  department_name: string;
}

interface Position {
  position_id?: number;
  position_title: string;
  department_id: number;
  department_name?: string;
  number_of_slots: number;
  qualification_requirements: string;
  responsibilities: string;
  application_deadline: string;
  attachment_duration_weeks: number;
  is_open: boolean;
  position_code?: string;
  posted_date?: string;
}

export default function PositionsManager({ onUpdate }: { onUpdate: () => void }) {
  const { success, error: toastError, warning, info } = useToast();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingPosition, setEditingPosition] = useState<Position | null>(null);
  const [deletingPosition, setDeletingPosition] = useState<Position | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchingDepartments, setFetchingDepartments] = useState(true);
  
  const [formData, setFormData] = useState<Position>({
    position_title: "",
    department_id: 0,
    number_of_slots: 1,
    qualification_requirements: "",
    responsibilities: "",
    application_deadline: "",
    attachment_duration_weeks: 8,
    is_open: true
  });

  useEffect(() => {
    fetchDepartments();
    fetchPositions();
  }, []);

  const fetchDepartments = async () => {
    setFetchingDepartments(true);
    try {
      const response = await fetch('/api/admin/departments');
      const data = await response.json();
      if (data.success) {
        setDepartments(data.departments);
        info(`📁 Loaded ${data.departments.length} departments`);
      }
    } catch (err) {
      toastError('Failed to fetch departments');
    } finally {
      setFetchingDepartments(false);
    }
  };

  const fetchPositions = async () => {
    try {
      const response = await fetch('/api/admin/positions');
      const data = await response.json();
      if (data.success) {
        setPositions(data.positions);
      }
    } catch (err) {
      toastError('Failed to fetch positions');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.department_id || formData.department_id === 0) {
      warning("Please select a department");
      return;
    }

    setLoading(true);

    try {
      const url = editingPosition ? '/api/admin/positions/update' : '/api/admin/positions/create';
      const method = editingPosition ? 'PUT' : 'POST';
      const body = editingPosition ? { ...formData, position_id: editingPosition.position_id } : formData;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (data.success) {
        if (editingPosition) {
          success(`✏️ Position "${formData.position_title}" updated successfully!`);
        } else {
          success(`✅ Position "${formData.position_title}" created successfully!`);
        }
        setShowForm(false);
        setEditingPosition(null);
        resetForm();
        fetchPositions();
        onUpdate();
      } else {
        toastError(data.error || "Failed to save position");
      }
    } catch (err) {
      toastError("Error saving position");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      position_title: "",
      department_id: 0,
      number_of_slots: 1,
      qualification_requirements: "",
      responsibilities: "",
      application_deadline: "",
      attachment_duration_weeks: 8,
      is_open: true
    });
  };

  const handleEdit = (position: Position) => {
    setEditingPosition(position);
    setFormData(position);
    setShowForm(true);
    info(`✏️ Editing position: ${position.position_title}`);
  };

  const handleDeleteClick = (position: Position) => {
    setDeletingPosition(position);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingPosition) return;

    try {
      const response = await fetch(`/api/admin/positions/delete?positionId=${deletingPosition.position_id}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      if (data.success) {
        success(`🗑️ Position "${deletingPosition.position_title}" deleted successfully!`);
        setShowDeleteModal(false);
        setDeletingPosition(null);
        fetchPositions();
        onUpdate();
      } else {
        toastError(data.error || "Failed to delete position");
      }
    } catch (err) {
      toastError("Error deleting position");
    }
  };

  const togglePositionStatus = async (positionId: number, currentStatus: boolean, positionTitle: string) => {
    try {
      const response = await fetch('/api/admin/positions/toggle', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ positionId, is_open: !currentStatus })
      });
      const data = await response.json();
      if (data.success) {
        const newStatus = !currentStatus;
        if (newStatus) {
          success(`🔓 Position "${positionTitle}" is now OPEN for applications`);
        } else {
          warning(`🔒 Position "${positionTitle}" has been CLOSED`);
        }
        fetchPositions();
      }
    } catch (err) {
      toastError("Error toggling position status");
    }
  };

  return (
    <div className="space-y-6">
      <button
        onClick={() => {
          setEditingPosition(null);
          resetForm();
          setShowForm(true);
        }}
        className="bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800 transition"
      >
        + Post New Position
      </button>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">
                {editingPosition ? "Edit Position" : "Post New Position"}
              </h3>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingPosition(null);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Position Title *</label>
                <input
                  type="text"
                  required
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500"
                  value={formData.position_title}
                  onChange={(e) => setFormData({...formData, position_title: e.target.value})}
                  placeholder="e.g., Software Development Intern"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Department *</label>
                <select
                  required
                  className="w-full border rounded-lg px-3 py-2"
                  value={formData.department_id}
                  onChange={(e) => setFormData({...formData, department_id: parseInt(e.target.value)})}
                >
                  <option value="0">-- Select Department --</option>
                  {fetchingDepartments ? (
                    <option disabled>Loading departments...</option>
                  ) : (
                    departments.map(dept => (
                      <option key={dept.department_id} value={dept.department_id}>
                        {dept.department_name}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Number of Slots *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    className="w-full border rounded-lg px-3 py-2"
                    value={formData.number_of_slots}
                    onChange={(e) => setFormData({...formData, number_of_slots: parseInt(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Duration (Weeks)</label>
                  <input
                    type="number"
                    min="4"
                    max="52"
                    className="w-full border rounded-lg px-3 py-2"
                    value={formData.attachment_duration_weeks}
                    onChange={(e) => setFormData({...formData, attachment_duration_weeks: parseInt(e.target.value)})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Application Deadline</label>
                <input
                  type="date"
                  className="w-full border rounded-lg px-3 py-2"
                  value={formData.application_deadline}
                  onChange={(e) => setFormData({...formData, application_deadline: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Qualification Requirements</label>
                <textarea
                  rows={3}
                  className="w-full border rounded-lg px-3 py-2"
                  value={formData.qualification_requirements}
                  onChange={(e) => setFormData({...formData, qualification_requirements: e.target.value})}
                  placeholder="List the qualifications required..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Responsibilities</label>
                <textarea
                  rows={3}
                  className="w-full border rounded-lg px-3 py-2"
                  value={formData.responsibilities}
                  onChange={(e) => setFormData({...formData, responsibilities: e.target.value})}
                  placeholder="Describe the responsibilities..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-green-700 text-white py-2 rounded hover:bg-green-800 transition disabled:opacity-50"
                >
                  {loading ? "Saving..." : (editingPosition ? "Update Position" : "Create Position")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingPosition(null);
                    resetForm();
                  }}
                  className="flex-1 border border-gray-300 py-2 rounded hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteModal && deletingPosition && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="text-center">
              <div className="text-5xl mb-4">🗑️</div>
              <h3 className="text-xl font-bold mb-2">Confirm Delete</h3>
              <p className="text-gray-600 mb-4">
                Are you sure you want to delete <strong>"{deletingPosition.position_title}"</strong>?
              </p>
              <p className="text-red-500 text-sm mb-4">This action cannot be undone.</p>
              <div className="flex gap-3">
                <button
                  onClick={handleConfirmDelete}
                  className="flex-1 bg-red-600 text-white py-2 rounded hover:bg-red-700 transition"
                >
                  Yes, Delete
                </button>
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeletingPosition(null);
                  }}
                  className="flex-1 border border-gray-300 py-2 rounded hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">Position</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Department</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Slots</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Deadline</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {positions.map((pos) => (
                <tr key={pos.position_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{pos.position_title}</td>
                  <td className="px-6 py-4 text-gray-600">{pos.department_name || 'N/A'}</td>
                  <td className="px-6 py-4 text-gray-600">{pos.number_of_slots}</td>
                  <td className="px-6 py-4 text-gray-600">
                    {pos.application_deadline ? new Date(pos.application_deadline).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => togglePositionStatus(pos.position_id!, pos.is_open, pos.position_title)}
                      className={`px-2 py-1 text-xs rounded transition ${
                        pos.is_open 
                          ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      }`}
                    >
                      {pos.is_open ? 'Open' : 'Closed'}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleEdit(pos)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClick(pos)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium transition"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {positions.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No positions posted yet. Click "Post New Position" to get started.
          </div>
        )}
      </div>
    </div>
  );
}