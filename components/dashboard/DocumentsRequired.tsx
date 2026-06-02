"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/context/ToastContext";

interface DocumentsRequiredProps {
  userId: number;
  onUpdate: () => void;
  preselectedPositionId?: number;
  onDocumentsComplete?: () => void;
}

interface DocumentUpload {
  type: string;
  name: string;
  required: boolean;
  file: File | null;
  uploaded: boolean;
  filePath?: string;
}

// File size limit: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

export default function DocumentsRequired({ userId, onUpdate, preselectedPositionId, onDocumentsComplete }: DocumentsRequiredProps) {
  const { success, error: toastError, warning, info } = useToast();
  const [documents, setDocuments] = useState<DocumentUpload[]>([
    { type: "introduction_letter", name: "Introduction Letter from School", required: true, file: null, uploaded: false },
    { type: "application_letter", name: "Application Letter (Cover Letter)", required: true, file: null, uploaded: false },
    { type: "cv", name: "Curriculum Vitae (CV)", required: true, file: null, uploaded: false },
    { type: "insurance", name: "Personal Accident/Medical Insurance Cover", required: true, file: null, uploaded: false },
    { type: "id_card", name: "National ID or Passport", required: true, file: null, uploaded: false },
    { type: "police_clearance", name: "Police Clearance Certificate", required: true, file: null, uploaded: false },
    { type: "transcripts", name: "Exam Transcripts", required: false, file: null, uploaded: false }
  ]);
  
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: boolean }>({});
  const [message, setMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [existingDocuments, setExistingDocuments] = useState<any[]>([]);

  useEffect(() => {
    if (userId) {
      fetchExistingDocuments();
    }
  }, [userId]);

  const fetchExistingDocuments = async () => {
    try {
      const response = await fetch(`/api/dashboard/documents?userId=${userId}`);
      const data = await response.json();
      if (data.success && data.documents) {
        setExistingDocuments(data.documents);
        // Mark documents as uploaded if they exist
        const updatedDocs = documents.map(doc => {
          const exists = data.documents.some((d: any) => d.document_type === doc.type);
          return { ...doc, uploaded: exists };
        });
        setDocuments(updatedDocs);
      }
    } catch (err) {
      console.error('Error fetching documents:', err);
    }
  };

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return { 
        valid: false, 
        error: `File size exceeds 5MB limit. Current file: ${(file.size / (1024 * 1024)).toFixed(2)}MB` 
      };
    }
    
    // Check file type - only PDF
    const allowedTypes = ['application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      return { 
        valid: false, 
        error: 'Only PDF files are allowed. Please convert your document to PDF format.' 
      };
    }
    
    return { valid: true };
  };

  const handleFileChange = (index: number, file: File | null) => {
    if (!file) return;
    
    // Validate file before accepting
    const validation = validateFile(file);
    if (!validation.valid) {
      setErrorMsg(validation.error || "Invalid file");
      return;
    }
    
    setErrorMsg("");
    const updatedDocs = [...documents];
    updatedDocs[index] = { ...updatedDocs[index], file };
    setDocuments(updatedDocs);
  };

  const uploadDocument = async (doc: DocumentUpload, index: number): Promise<boolean> => {
    if (!doc.file) return false;
    
    // Update progress for this document
    setUploadProgress(prev => ({ ...prev, [doc.type]: true }));
    
    const formData = new FormData();
    formData.append('documentType', doc.type);
    formData.append('userId', userId.toString());
    formData.append('file', doc.file);
    if (preselectedPositionId) {
      formData.append('applicationId', preselectedPositionId.toString());
    }
    
    try {
      console.log(`Uploading ${doc.type}...`);
      
      const response = await fetch('/api/dashboard/documents/upload', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      if (data.success) {
        console.log(`Successfully uploaded ${doc.type}`);
        const updatedDocs = [...documents];
        updatedDocs[index] = { ...doc, uploaded: true, filePath: data.filePath };
        setDocuments(updatedDocs);
        return true;
      } else {
        console.error(`Failed to upload ${doc.type}:`, data.error);
        setErrorMsg(data.error || `Failed to upload ${doc.name}`);
        return false;
      }
    } catch (err) {
      console.error(`Error uploading ${doc.type}:`, err);
      setErrorMsg(`Error uploading ${doc.name}: ${err instanceof Error ? err.message : 'Unknown error'}`);
      return false;
    } finally {
      setUploadProgress(prev => ({ ...prev, [doc.type]: false }));
    }
  };

  const handleUploadAll = async () => {
    // Check which documents need to be uploaded
    const documentsToUpload = documents.filter(doc => doc.file && !doc.uploaded);
    const missingRequired = documents.filter(doc => doc.required && !doc.file && !doc.uploaded);
    
    if (missingRequired.length > 0) {
      warning(`Please select files for: ${missingRequired.map(d => d.name).join(", ")}`);
      return;
    }
    
    if (documentsToUpload.length === 0) {
      info("All documents are already uploaded!");
      if (onDocumentsComplete) {
        onDocumentsComplete();
      }
      return;
    }
    
    setUploading(true);
    setErrorMsg("");
    
    let successCount = 0;
    let failCount = 0;
    
    for (let i = 0; i < documents.length; i++) {
      const doc = documents[i];
      if (doc.file && !doc.uploaded) {
        const successUpload = await uploadDocument(doc, i);
        if (successUpload) {
          successCount++;
        } else {
          failCount++;
          toastError(`Failed to upload ${doc.name}.`);
          break; // Stop on first failure
        }
      }
    }
    
    if (failCount === 0 && successCount > 0) {
      success(`✅ Successfully uploaded ${successCount} document(s)!`);
      setMessage("All documents uploaded successfully!");
      onUpdate();
      if (onDocumentsComplete) {
        onDocumentsComplete();
      }
      setTimeout(() => setMessage(""), 3000);
    } else if (successCount > 0 && failCount > 0) {
      warning(`⚠️ Uploaded ${successCount} document(s), but ${failCount} failed.`);
    }
    
    setUploading(false);
  };

  const getFileInputColor = (doc: DocumentUpload) => {
    if (doc.uploaded) return "border-green-500 bg-green-50";
    if (doc.file) return "border-blue-500 bg-blue-50";
    return "border-gray-300";
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get document icon based on type
  const getDocumentIcon = (type: string) => {
    const icons: Record<string, string> = {
      introduction_letter: "📄",
      application_letter: "📝",
      cv: "📑",
      insurance: "🛡️",
      id_card: "🪪",
      police_clearance: "👮",
      transcripts: "📊"
    };
    return icons[type] || "📎";
  };

  // Get document description
  const getDocumentDescription = (type: string) => {
    const descriptions: Record<string, string> = {
      police_clearance: "Valid Police Clearance Certificate (Certificate of Good Conduct)",
      transcripts: "Official academic transcripts from your institution"
    };
    return descriptions[type];
  };

  const isUploading = uploadProgress[documents.find(d => d.file && !d.uploaded)?.type || ''] || false;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <span>📎</span> Required Documents
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Please upload all the required documents for your attachment application.
            All documents marked with <span className="text-red-500">*</span> are mandatory.
          </p>
          <div className="mt-2 text-xs text-gray-400">
            <span>📄 Accepted format: PDF only</span>
            <span className="ml-4">📦 Maximum file size: 5MB</span>
          </div>
        </div>

        {message && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg">
            ✅ {message}
          </div>
        )}

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            ⚠️ {errorMsg}
          </div>
        )}

        <div className="space-y-4">
          {documents.map((doc, index) => (
            <div key={doc.type} className={`border rounded-lg p-4 transition ${getFileInputColor(doc)}`}>
              <div className="flex flex-wrap justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{getDocumentIcon(doc.type)}</span>
                    <label className="font-medium text-gray-800">
                      {doc.name} {doc.required && <span className="text-red-500">*</span>}
                    </label>
                  </div>
                  {getDocumentDescription(doc.type) && (
                    <p className="text-xs text-gray-400 mt-1">
                      {getDocumentDescription(doc.type)}
                    </p>
                  )}
                  {doc.uploaded && (
                    <p className="text-xs text-green-600 mt-1">✓ Document uploaded</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    PDF only, Max 5MB
                  </p>
                </div>
                <div>
                  {!doc.uploaded ? (
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => handleFileChange(index, e.target.files?.[0] || null)}
                      className="text-sm text-gray-500 file:mr-2 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                      disabled={uploading}
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-green-600">✓ Uploaded</span>
                      <button
                        onClick={() => {
                          const updatedDocs = [...documents];
                          updatedDocs[index] = { ...doc, uploaded: false, file: null };
                          setDocuments(updatedDocs);
                        }}
                        className="text-sm text-red-600 hover:text-red-800"
                        disabled={uploading}
                      >
                        Replace
                      </button>
                    </div>
                  )}
                </div>
              </div>
              {doc.file && !doc.uploaded && (
                <div className="mt-2 text-xs text-blue-600">
                  Selected: {doc.file.name} ({formatFileSize(doc.file.size)})
                </div>
              )}
              {uploadProgress[doc.type] && (
                <div className="mt-2">
                  <div className="flex items-center gap-2 text-xs text-green-600">
                    <div className="animate-spin rounded-full h-3 w-3 border-2 border-green-600 border-t-transparent"></div>
                    Uploading...
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleUploadAll}
            disabled={uploading}
            className="bg-green-700 text-white px-6 py-2 rounded-lg hover:bg-green-800 transition disabled:opacity-50 flex items-center gap-2"
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Uploading...
              </>
            ) : (
              "Upload All Documents"
            )}
          </button>
        </div>
      </div>

      {/* Document Requirements Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-800 mb-2">📌 Document Guidelines</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Introduction letter must be on official school letterhead</li>
          <li>• Cover letter should be addressed to the County Director</li>
          <li>• CV should be up to date and include relevant experience</li>
          <li>• Insurance cover must be valid for the attachment period</li>
          <li>• ID/Passport should be clearly visible</li>
          <li>• Police Clearance Certificate must be valid (less than 1 year old)</li>
          <li>• Transcripts should be official academic records</li>
          <li>• All documents must be in <strong>PDF format</strong></li>
          <li>• Maximum file size per document is <strong>5MB</strong></li>
        </ul>
      </div>
    </div>
  );
}