"use client";

import { useState, useEffect } from "react";

// Simple type definitions without external imports
type Department = {
  department_id: number;
  department_name: string;
};

type Position = {
  position_id: number;
  position_title: string;
  department_id: number;
  department_name: string;
  number_of_slots: number;
  qualification_requirements: string;
  responsibilities: string;
  application_deadline: string;
  attachment_duration_weeks: number;
  is_open: boolean;
};

export default function PositionsManager({ onUpdate }: { onUpdate: () => void }) {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingPosition, setEditingPosition] = useState<Position | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchingDepartments, setFetchingDepartments] = useState(true);
  
  const [formData, setFormData] = useState({
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
      const res = await fetch('/api/admin/departments');
      const data = await res.json();
      if (data.success) setDepartments(data.departments);
    } catch (err) {
      console.error(err);
    } finally {
      setFetchingDepartments(false);
    }
  };

  const fetchPositions = async () => {
    try {
      const res = await fetch('/api/admin/positions');
      const data = await res.json();
      if (data.success) setPositions(data.positions);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.department_id) {
      alert("Please select a department");
      return;
    }
    setLoading(true);
    try {
      const url = editingPosition ? '/api/admin/positions/update' : '/api/admin/positions/create';
      const method = editingPosition ? 'PUT' : 'POST';
      const body = editingPosition ? { ...formData, position_id: editingPosition.position_id } : formData;
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json();
      if (data.success) {
        alert(editingPosition ? "Updated!" : "Created!");
        setShowForm(false);
        setEditingPosition(null);
        resetForm();
        fetchPositions();
        onUpdate();
      } else {
        alert(data.error || "Failed");
      }
    } catch (err) {
      alert("Error saving");
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

  const handleEdit = (pos: Position) => {
    setEditingPosition(pos);
    setFormData({
      position_title: pos.position_title,
      department_id: pos.department_id,
      number_of_slots: pos.number_of_slots,
      qualification_requirements: pos.qualification_requirements,
      responsibilities: pos.responsibilities,
      application_deadline: pos.application_deadline,
      attachment_duration_weeks: pos.attachment_duration_weeks,
      is_open: pos.is_open
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this position?")) return;
    try {
      const res = await fetch(`/api/admin/positions/delete?positionId=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        alert("Deleted!");
        fetchPositions();
        onUpdate();
      } else {
        alert(data.error || "Failed");
      }
    } catch (err) {
      alert("Error deleting");
    }
  };

  const toggleStatus = async (id: number, current: boolean) => {
    try {
      const res = await fetch('/api/admin/positions/toggle', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ positionId: id, is_open: !current })
      });
      const data = await res.json();
      if (data.success) fetchPositions();
    } catch (err) {
      alert("Error toggling");
    }
  };

  return (
    <div className="space-y-6">
      <button onClick={() => { setEditingPosition(null); resetForm(); setShowForm(true); }} className="bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800">
        + Post New Position
      </button>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <h3 className="text-xl font-bold mb-4">{editingPosition ? "Edit Position" : "Post New Position"}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="text" required placeholder="Position Title" className="w-full border rounded px-3 py-2" value={formData.position_title} onChange={e => setFormData({...formData, position_title: e.target.value})} />
              <select required className="w-full border rounded px-3 py-2" value={formData.department_id} onChange={e => setFormData({...formData, department_id: parseInt(e.target.value)})}>
                <option value="0">-- Select Department --</option>
                {departments.map(d => <option key={d.department_id} value={d.department_id}>{d.department_name}</option>)}
              </select>
              <div className="grid grid-cols-2 gap-4">
                <input type="number" required min="1" placeholder="Number of Slots" className="border rounded px-3 py-2" value={formData.number_of_slots} onChange={e => setFormData({...formData, number_of_slots: parseInt(e.target.value)})} />
                <input type="number" min="4" max="52" placeholder="Duration (Weeks)" className="border rounded px-3 py-2" value={formData.attachment_duration_weeks} onChange={e => setFormData({...formData, attachment_duration_weeks: parseInt(e.target.value)})} />
              </div>
              <input type="date" className="w-full border rounded px-3 py-2" value={formData.application_deadline} onChange={e => setFormData({...formData, application_deadline: e.target.value})} />
              <textarea rows={3} placeholder="Qualification Requirements" className="w-full border rounded px-3 py-2" value={formData.qualification_requirements} onChange={e => setFormData({...formData, qualification_requirements: e.target.value})} />
              <textarea rows={3} placeholder="Responsibilities" className="w-full border rounded px-3 py-2" value={formData.responsibilities} onChange={e => setFormData({...formData, responsibilities: e.target.value})} />
              <div className="flex gap-3">
                <button type="submit" disabled={loading} className="flex-1 bg-green-700 text-white py-2 rounded hover:bg-green-800">{loading ? "Saving..." : (editingPosition ? "Update" : "Create")}</button>
                <button type="button" onClick={() => { setShowForm(false); setEditingPosition(null); }} className="flex-1 border rounded py-2 hover:bg-gray-50">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr><th className="px-6 py-3 text-left">Position</th><th className="px-6 py-3 text-left">Department</th><th className="px-6 py-3 text-left">Slots</th><th className="px-6 py-3 text-left">Deadline</th><th className="px-6 py-3 text-left">Status</th><th className="px-6 py-3 text-left">Actions</th></tr>
          </thead>
          <tbody>
            {positions.map(p => (
              <tr key={p.position_id} className="border-t">
                <td className="px-6 py-4">{p.position_title}</td>
                <td className="px-6 py-4">{p.department_name}</td>
                <td className="px-6 py-4">{p.number_of_slots}</td>
                <td className="px-6 py-4">{p.application_deadline ? new Date(p.application_deadline).toLocaleDateString() : 'N/A'}</td>
                <td className="px-6 py-4"><button onClick={() => toggleStatus(p.position_id, p.is_open)} className={`px-2 py-1 text-xs rounded ${p.is_open ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{p.is_open ? 'Open' : 'Closed'}</button></td>
                <td className="px-6 py-4"><button onClick={() => handleEdit(p)} className="text-blue-600 mr-3">Edit</button><button onClick={() => handleDelete(p.position_id)} className="text-red-600">Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {positions.length === 0 && <div className="text-center py-8 text-gray-500">No positions yet.</div>}
      </div>
    </div>
  );
}