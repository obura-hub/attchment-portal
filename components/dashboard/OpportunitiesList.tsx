"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/context/ToastContext";
import DocumentsRequired from "./DocumentsRequired";

interface OpportunitiesListProps {
  user: any;
  userId: number;
  onApply: () => void;
}

interface Department {
  department_id: number;
  department_name: string;
  total_positions: number;
}

interface Position {
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
  applied_count?: number;
}

export default function OpportunitiesList({ user, userId, onApply }: OpportunitiesListProps) {
  const { success, error: toastError, warning, info } = useToast();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [loadingPositions, setLoadingPositions] = useState(false);
  const [applying, setApplying] = useState<number | null>(null);
  const [hasApplied, setHasApplied] = useState<Set<number>>(new Set());
  
  // Documents modal state
  const [showDocumentsModal, setShowDocumentsModal] = useState(false);
  const [pendingPosition, setPendingPosition] = useState<Position | null>(null);
  
  // Check if documents are uploaded
  const [hasDocuments, setHasDocuments] = useState(false);
  const [checkingDocuments, setCheckingDocuments] = useState(false);

  // Fetch departments on component mount
  useEffect(() => {
    fetchDepartments();
  }, []);

  // Fetch positions when department changes
  useEffect(() => {
    if (selectedDepartment) {
      fetchPositions(selectedDepartment);
    } else {
      setPositions([]);
    }
  }, [selectedDepartment]);

  // Fetch user's existing applications
  useEffect(() => {
    if (userId) {
      fetchUserApplications();
      checkUserDocuments();
    }
  }, [userId]);

  const fetchDepartments = async () => {
    try {
      const response = await fetch('/api/dashboard/departments');
      const data = await response.json();
      if (data.success) {
        setDepartments(data.departments);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
      toastError('Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserApplications = async () => {
    try {
      const response = await fetch(`/api/dashboard/applications?userId=${userId}`);
      const data = await response.json();
      if (data.success && data.applications) {
        const appliedPositionIds = new Set(data.applications.map((app: any) => app.position_id));
        setHasApplied(appliedPositionIds);
      }
    } catch (error) {
      console.error('Error fetching user applications:', error);
    }
  };

  const checkUserDocuments = async () => {
    setCheckingDocuments(true);
    try {
      const response = await fetch(`/api/dashboard/documents?userId=${userId}`);
      const data = await response.json();
      if (data.success && data.documents) {
        // Check if all required documents are uploaded
        const requiredDocs = ["introduction_letter", "application_letter", "cv", "insurance", "id_card", "police_clearance"];
        const uploadedDocTypes = new Set(data.documents.map((doc: any) => doc.document_type));
        const allDocsUploaded = requiredDocs.every(doc => uploadedDocTypes.has(doc));
        setHasDocuments(allDocsUploaded);
      }
    } catch (error) {
      console.error('Error checking documents:', error);
    } finally {
      setCheckingDocuments(false);
    }
  };

  const fetchPositions = async (departmentId: string) => {
    setLoadingPositions(true);
    try {
      const response = await fetch(`/api/dashboard/positions?departmentId=${departmentId}`);
      const data = await response.json();
      if (data.success) {
        setPositions(data.positions);
      } else {
        setPositions([]);
      }
    } catch (error) {
      console.error('Error fetching positions:', error);
      setPositions([]);
      toastError('Failed to load positions');
    } finally {
      setLoadingPositions(false);
    }
  };

  const handleDepartmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDepartment(e.target.value);
  };

  // Function to submit application after documents are uploaded
  const submitApplication = async (position: Position) => {
    setApplying(position.position_id);
    try {
      const response = await fetch('/api/dashboard/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          positionId: position.position_id,
          userId: userId,
          coverLetter: "Application submitted with required documents"
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        success(`🎉 Successfully applied for ${position.position_title}!`);
        setShowDocumentsModal(false);
        setPendingPosition(null);
        setHasApplied(prev => new Set(prev).add(position.position_id));
        onApply();
        // Refresh positions to update applied count
        if (selectedDepartment) {
          fetchPositions(selectedDepartment);
        }
      } else {
        toastError(data.error || "Failed to submit application");
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      toastError("Error submitting application. Please try again.");
    } finally {
      setApplying(null);
    }
  };

  const handleApplyClick = (position: Position) => {
    // Check if user already applied
    if (hasApplied.has(position.position_id)) {
      warning(`You have already applied for ${position.position_title}`);
      return;
    }
    
    // Store the selected position and open documents modal
    setPendingPosition(position);
    setShowDocumentsModal(true);
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
      {/* Documents Status Banner */}
      {!hasDocuments && !checkingDocuments && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <span className="text-yellow-600 text-xl">⚠️</span>
            <div>
              <p className="text-yellow-800 font-medium">Required Documents Missing</p>
              <p className="text-yellow-700 text-sm">
                Please upload all required documents before applying. Click "Apply Now" to upload your documents.
              </p>
            </div>
          </div>
        </div>
      )}

      {checkingDocuments && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-700 inline-block mr-2"></div>
          <span className="text-sm text-gray-600">Checking document status...</span>
        </div>
      )}

      {hasDocuments && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <span className="text-green-600 text-xl">✅</span>
            <div>
              <p className="text-green-800 font-medium">Documents Verified</p>
              <p className="text-green-700 text-sm">
                All required documents have been uploaded. You can now apply for positions.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Department Dropdown */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Department
        </label>
        <select
          value={selectedDepartment}
          onChange={handleDepartmentChange}
          className="w-full md:w-1/2 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
        >
          <option value="">-- Select a department --</option>
          {departments.map((dept) => (
            <option key={dept.department_id} value={dept.department_id}>
              {dept.department_name} ({dept.total_positions} position{dept.total_positions !== 1 ? 's' : ''})
            </option>
          ))}
        </select>
        {departments.length === 0 && (
          <p className="text-sm text-gray-500 mt-2">
            No departments with available positions at the moment.
          </p>
        )}
      </div>

      {/* Positions List */}
      {selectedDepartment && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <span>📋</span> Available Positions
          </h3>
          
          {loadingPositions ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700"></div>
            </div>
          ) : positions.length > 0 ? (
            <div className="grid gap-4">
              {positions.map((position) => {
                const alreadyApplied = hasApplied.has(position.position_id);
                return (
                  <div key={position.position_id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-800">{position.position_title}</h4>
                        <p className="text-sm text-gray-500 mt-1">{position.department_name}</p>
                      </div>
                      <div className="text-right">
                        <span className="inline-block text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                          {position.number_of_slots} slot{position.number_of_slots !== 1 ? 's' : ''} available
                        </span>
                        {position.applied_count !== undefined && position.applied_count > 0 && (
                          <p className="text-xs text-gray-400 mt-1">
                            {position.applied_count} applicant{position.applied_count !== 1 ? 's' : ''} applied
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4 mb-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Duration:</span>{' '}
                        <span className="text-gray-600">{position.attachment_duration_weeks} weeks</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Deadline:</span>{' '}
                        <span className="text-gray-600">{formatDate(position.application_deadline)}</span>
                      </div>
                    </div>
                    
                    <details className="text-sm text-gray-600 mb-4">
                      <summary className="cursor-pointer text-green-700 font-medium hover:text-green-800">
                        View Requirements & Responsibilities
                      </summary>
                      <div className="mt-3 p-4 bg-gray-50 rounded-lg space-y-2">
                        <div>
                          <strong className="text-gray-700">Qualifications:</strong>
                          <p className="mt-1">{position.qualification_requirements || 'Not specified'}</p>
                        </div>
                        <div>
                          <strong className="text-gray-700">Responsibilities:</strong>
                          <p className="mt-1">{position.responsibilities || 'Not specified'}</p>
                        </div>
                      </div>
                    </details>
                    
                    <button
                      onClick={() => handleApplyClick(position)}
                      disabled={!position.is_open || alreadyApplied}
                      className={`w-full py-2 rounded-lg font-medium transition ${
                        alreadyApplied
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : !hasDocuments
                          ? 'bg-yellow-300 text-yellow-800 cursor-not-allowed'
                          : position.is_open
                          ? 'bg-green-700 text-white hover:bg-green-800'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {alreadyApplied 
                        ? 'Already Applied' 
                        : !hasDocuments 
                        ? 'Upload Documents First' 
                        : position.is_open 
                        ? 'Apply Now' 
                        : 'Position Closed'}
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
              <p className="text-gray-500">No positions available in this department at the moment.</p>
            </div>
          )}
        </div>
      )}

      {/* Documents Required Modal */}
      {showDocumentsModal && pendingPosition && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
              <h3 className="text-xl font-semibold">
                Required Documents for {pendingPosition.position_title}
              </h3>
              <button
                onClick={() => {
                  setShowDocumentsModal(false);
                  setPendingPosition(null);
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="p-4">
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-800 text-sm">
                  📌 Please upload the following documents in <strong>PDF format</strong>. All documents are required for your application to be considered.
                </p>
              </div>
              <DocumentsRequired 
                userId={userId} 
                onUpdate={() => {
                  checkUserDocuments();
                  onApply();
                }}
                preselectedPositionId={pendingPosition.position_id}
                onDocumentsComplete={() => {
                  // After documents are uploaded, submit the application
                  submitApplication(pendingPosition);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}