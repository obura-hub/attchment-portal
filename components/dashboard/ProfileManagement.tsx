"use client";

import { useState, useEffect } from "react";

interface ProfileManagementProps {
  user: any;
  userId: number;
  onUpdate: () => void;
}

export default function ProfileManagement({ user, userId, onUpdate }: ProfileManagementProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    surname: "",
    phoneNumber: "",
    email: "",
    idNumber: "",
    postalAddress: "",
    countyOfResidence: "",
    educationLevel: "",
    fieldOfStudy: "",
    graduationDate: "",
    skills: "",
    isPwd: false,
    pwdNumber: ""
  });
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Fetch user profile from database
  useEffect(() => {
    if (userId) {
      fetchProfile();
    }
  }, [userId]);

  const fetchProfile = async () => {
    setFetching(true);
    try {
      const response = await fetch(`/api/dashboard/profile?userId=${userId}`);
      const data = await response.json();
      
      if (data.success) {
        const profile = data.profile;
        setFormData({
          firstName: profile.firstName || "",
          middleName: profile.middleName || "",
          surname: profile.surname || "",
          phoneNumber: profile.phoneNumber || "",
          email: profile.email || "",
          idNumber: profile.idNumber || "",
          postalAddress: profile.postalAddress || "",
          countyOfResidence: profile.countyOfResidence || "",
          educationLevel: profile.educationLevel || "",
          fieldOfStudy: profile.fieldOfStudy || "",
          graduationDate: profile.graduationDate || "",
          skills: profile.skills || "",
          isPwd: profile.isPwd || false,
          pwdNumber: profile.pwdNumber || ""
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError("Failed to load profile data");
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/dashboard/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userId,
          firstName: formData.firstName,
          middleName: formData.middleName,
          surname: formData.surname,
          phoneNumber: formData.phoneNumber,
          postalAddress: formData.postalAddress,
          countyOfResidence: formData.countyOfResidence,
          educationLevel: formData.educationLevel,
          fieldOfStudy: formData.fieldOfStudy,
          graduationDate: formData.graduationDate,
          skills: formData.skills,
          isPwd: formData.isPwd,
          pwdNumber: formData.pwdNumber
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMessage("Profile updated successfully!");
        onUpdate();
        // Refresh profile data
        fetchProfile();
        setTimeout(() => setMessage(""), 3000);
      } else {
        setError(data.error || "Failed to update profile");
      }
    } catch (error) {
      setError("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const kenyanCounties = [
    "Nairobi", "Mombasa", "Kisumu", "Nakuru", "Kiambu", "Tharaka Nithi", "Meru", 
    "Embu", "Kitui", "Machakos", "Makueni", "Garissa", "Wajir", "Mandera", 
    "Marsabit", "Isiolo", "Laikipia", "Nyeri", "Kirinyaga", "Murang'a", 
    "Turkana", "West Pokot", "Samburu", "Trans Nzoia", "Uasin Gishu", 
    "Elgeyo Marakwet", "Nandi", "Baringo", "Kericho", "Bomet", "Kakamega", 
    "Vihiga", "Bungoma", "Busia", "Siaya", "Homa Bay", "Migori", "Kisii", 
    "Nyamira", "Taita Taveta", "Lamu", "Kilifi", "Kwale", "Narok", "Kajiado"
  ];

  const educationLevels = [
    "Certificate", "Diploma", "Bachelor's Degree", "Master's Degree", "PhD"
  ];

  if (fetching) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span>👤</span> Personal Information
        </h3>
        
        {message && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg">
            {message}
          </div>
        )}
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 bg-gray-50"
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Middle Name</label>
              <input
                type="text"
                name="middleName"
                value={formData.middleName}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 bg-gray-50"
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Surname</label>
              <input
                type="text"
                name="surname"
                value={formData.surname}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 bg-gray-50"
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50"
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ID Number</label>
              <input
                type="text"
                name="idNumber"
                value={formData.idNumber}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50"
                disabled
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Postal Address</label>
              <input
                type="text"
                name="postalAddress"
                value={formData.postalAddress}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">County of Residence</label>
              <select
                name="countyOfResidence"
                value={formData.countyOfResidence}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500"
              >
                <option value="">Select County</option>
                {kenyanCounties.map(county => (
                  <option key={county} value={county}>{county}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="border-t pt-4 mt-4">
            <h4 className="text-md font-semibold text-gray-800 mb-3">🎓 Academic Information</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Education Level</label>
                <select
                  name="educationLevel"
                  value={formData.educationLevel}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select Level</option>
                  {educationLevels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Field of Study</label>
                <input
                  type="text"
                  name="fieldOfStudy"
                  value={formData.fieldOfStudy}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500"
                />
              </div>
            {/* Expected Graduation Date */}
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expected Graduation Date</label>
                <input
                  type="month"
                 name="graduationDate"
                value={formData.graduationDate || ""}
                 onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500"
                     />
                     <p className="text-xs text-gray-500 mt-1">Select the month and year you expect to graduate</p>
            </div>
            </div>
          </div>
          
          <div className="border-t pt-4 mt-4">
            <h4 className="text-md font-semibold text-gray-800 mb-3">💡 Skills & Competencies</h4>
            <div>
              <textarea
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                rows={4}
                placeholder="List your skills (e.g., Python, Project Management, Communication, Leadership)..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500"
              />
              <p className="text-xs text-gray-500 mt-1">Separate multiple skills with commas</p>
            </div>
          </div>
          
          <div className="border-t pt-4 mt-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="isPwd"
                checked={formData.isPwd}
                onChange={handleChange}
                className="w-4 h-4 text-green-700 focus:ring-green-500"
              />
              <span className="text-gray-700">I have a disability</span>
            </label>
            
            {formData.isPwd && (
              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">PWD Registration Number</label>
                <input
                  type="text"
                  name="pwdNumber"
                  value={formData.pwdNumber}
                  onChange={handleChange}
                  className="w-full md:w-1/2 border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
            )}
          </div>
          
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-green-700 text-white px-6 py-2 rounded-lg hover:bg-green-800 transition disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}