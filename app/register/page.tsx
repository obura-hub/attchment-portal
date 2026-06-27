"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function RegisterPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState({
    // Personal Information (Step 1)
    title: "Mr",
    firstName: "",
    middleName: "",
    surname: "",
    gender: "",
    dateOfBirth: "",
    idNumber: "",
    
    // Contact Information (Step 2)
    email: "",
    confirmEmail: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    postalAddress: "",
    
    // Location Information (Step 3)
    countryOfBirth: "Kenya",
    countyOfBirth: "",
    countryOfResidence: "Kenya",
    countyOfResidence: "",
    citizenship: "Kenyan",
    ethnicity: "",
    
    // Education Information (Step 4)
    educationLevel: "",
    institutionName: "", // New field for University/College
    fieldOfStudy: "",
    graduationDate: "",
    isPwd: false,
    pwdNumber: "",
    
    // Declaration (Step 5)
    captchaAnswer: "",
    acceptedTerms: false
  });

  // Kenya Counties list
  const kenyanCounties = [
    "Nairobi", "Mombasa", "Kisumu", "Nakuru", "Kiambu", "Tharaka Nithi", "Meru", 
    "Embu", "Kitui", "Machakos", "Makueni", "Garissa", "Wajir", "Mandera", 
    "Marsabit", "Isiolo", "Laikipia", "Nyeri", "Kirinyaga", "Murang'a", 
    "Turkana", "West Pokot", "Samburu", "Trans Nzoia", "Uasin Gishu", 
    "Elgeyo Marakwet", "Nandi", "Baringo", "Kericho", "Bomet", "Kakamega", 
    "Vihiga", "Bungoma", "Busia", "Siaya", "Homa Bay", "Migori", "Kisii", 
    "Nyamira", "Taita Taveta", "Lamu", "Kilifi", "Kwale", "Narok", "Kajiado"
  ];

  // Education Levels
  const educationLevels = [
    "Certificate", "Diploma", "Bachelor's Degree", "Master's Degree", "PhD"
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formData.surname.trim()) newErrors.surname = "Surname is required";
    if (!formData.dateOfBirth) newErrors.dateOfBirth = "Date of birth is required";
    if (!formData.gender) newErrors.gender = "Please select gender";
    if (!formData.idNumber.trim()) newErrors.idNumber = "ID number is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (formData.email !== formData.confirmEmail) newErrors.confirmEmail = "Email addresses do not match";
    
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    
    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = "Phone number is required";
    if (!formData.postalAddress.trim()) newErrors.postalAddress = "Postal address is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.countyOfBirth) newErrors.countyOfBirth = "County of birth is required";
    if (!formData.countyOfResidence) newErrors.countyOfResidence = "County of residence is required";
    if (!formData.ethnicity) newErrors.ethnicity = "Ethnicity is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep4 = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.educationLevel) newErrors.educationLevel = "Education level is required";
    if (!formData.institutionName.trim()) newErrors.institutionName = "University/College name is required";
    if (!formData.fieldOfStudy.trim()) newErrors.fieldOfStudy = "Field of study is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep5 = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.captchaAnswer) {
      newErrors.captchaAnswer = "Please answer the CAPTCHA";
    } else if (parseInt(formData.captchaAnswer) !== 14) {
      newErrors.captchaAnswer = "Incorrect CAPTCHA answer";
    }
    if (!formData.acceptedTerms) {
      newErrors.acceptedTerms = "You must accept the terms and conditions";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    let isValid = false;
    
    if (currentStep === 1) isValid = validateStep1();
    else if (currentStep === 2) isValid = validateStep2();
    else if (currentStep === 3) isValid = validateStep3();
    else if (currentStep === 4) isValid = validateStep4();
    else isValid = validateStep5();
    
    if (isValid && currentStep < 5) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep5()) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Store user email for the success page
        if (result.user) {
          localStorage.setItem('user', JSON.stringify(result.user));
        }
        router.push('/register/success');
      } else {
        setErrors({ submit: result.error || "Registration failed. Please try again." });
      }
    } catch (error) {
      setErrors({ submit: "Network error. Please check your connection." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white shadow-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3 md:py-4">
            <Link href="/" className="flex items-center space-x-3">
              <div className="relative">
                <Image 
                  src="/logo.jpg" 
                  alt="Nairobi City County Logo" 
                  width={48} 
                  height={48}
                  className="object-contain"
                  priority
                />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-base md:text-xl font-bold text-green-800">Nairobi City County</h1>
                <p className="text-xs text-gray-600">Student Attachment Application Portal</p>
              </div>
            </Link>
            
            <nav className="hidden md:flex space-x-6 lg:space-x-8">
              <Link href="/" className="text-gray-700 hover:text-green-700 font-medium">Home</Link>
              <Link href="/register" className="text-green-700 font-medium border-b-2 border-green-700">Register</Link>
              <Link href="/login" className="text-gray-700 hover:text-green-700 font-medium">Login</Link>
            </nav>
            
            <Link href="/login" className="hidden md:block bg-green-700 text-white px-4 py-2 rounded-md hover:bg-green-800 transition text-sm">
              Apply Now
            </Link>
            
            <button className="md:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="relative bg-gradient-to-r from-green-900 to-green-800 text-white py-12">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center mb-4">
            <div className="text-5xl">📝</div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Student Attachment Registration</h1>
          <p className="text-green-100">
            Nairobi City County Government - Student Industrial Attachment Program 2025/2026
          </p>
          <div className="mt-4 inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm">
            <span>⏰</span> Application Deadline: July 30, 2026
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[
              { step: 1, name: "Personal",icon: "👤" },
              { step: 2, name: "Contact",icon: "📧" },
              { step: 3, name: "Location",icon: "📍" },
              { step: 4, name: "Education",icon: "🎓" },
              { step: 5, name: "Submit",icon:"✅" }
            ].map((item) => (
              <div key={item.step} className="flex-1 flex items-center">
                <div 
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold cursor-pointer transition-all ${
                    currentStep >= item.step 
                      ? 'bg-green-700 text-white shadow-lg' 
                      : 'bg-gray-200 text-gray-500'
                  }`}
                  onClick={() => {
                    if (item.step < currentStep) setCurrentStep(item.step);
                  }}
                >
                  <span className="text-xl">{item.icon}</span>
                </div>
                {item.step < 5 && (
                  <div className={`flex-1 h-1 mx-2 transition-all ${
                    currentStep > item.step ? 'bg-green-700' : 'bg-gray-200'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm">
            {["Personal", "Contact", "Location", "Education", "Submit"].map((name, idx) => (
              <span key={idx} className={`text-center w-8 ${currentStep >= idx + 1 ? 'text-green-700 font-medium' : 'text-gray-400'}`}>
                {name}
              </span>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
          <div className="p-6 md:p-8">
            {errors.submit && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                {errors.submit}
              </div>
            )}

            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="border-l-4 border-green-700 pl-4">
                  <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
                  <p className="text-gray-500 text-sm">Please provide your legal identification details</p>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <select name="title" value={formData.title} onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500">
                      <option value="Mr">Mr</option>
                      <option value="Mrs">Mrs</option>
                      <option value="Miss">Miss</option>
                      <option value="Ms">Ms</option>
                      <option value="Dr">Dr</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name <span className="text-red-500">*</span></label>
                    <input type="text" name="firstName" value={formData.firstName} onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500" />
                    {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Middle Name</label>
                    <input type="text" name="middleName" value={formData.middleName} onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Surname <span className="text-red-500">*</span></label>
                    <input type="text" name="surname" value={formData.surname} onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500" />
                    {errors.surname && <p className="text-red-500 text-xs mt-1">{errors.surname}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gender <span className="text-red-500">*</span></label>
                    <select name="gender" value={formData.gender} onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500">
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                    {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth <span className="text-red-500">*</span></label>
                    <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500" />
                    {errors.dateOfBirth && <p className="text-red-500 text-xs mt-1">{errors.dateOfBirth}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ID Number <span className="text-red-500">*</span></label>
                    <input type="text" name="idNumber" value={formData.idNumber} onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500" />
                    {errors.idNumber && <p className="text-red-500 text-xs mt-1">{errors.idNumber}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Contact Information */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="border-l-4 border-green-700 pl-4">
                  <h2 className="text-xl font-semibold text-gray-900">Contact Information</h2>
                  <p className="text-gray-500 text-sm">We'll use these details to contact you</p>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address <span className="text-red-500">*</span></label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500" />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Email <span className="text-red-500">*</span></label>
                    <input type="email" name="confirmEmail" value={formData.confirmEmail} onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500" />
                    {errors.confirmEmail && <p className="text-red-500 text-xs mt-1">{errors.confirmEmail}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password <span className="text-red-500">*</span></label>
                    <input type="password" name="password" value={formData.password} onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500" />
                    {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password <span className="text-red-500">*</span></label>
                    <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500" />
                    {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number <span className="text-red-500">*</span></label>
                    <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange}
                      placeholder="0712345678"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500" />
                    {errors.phoneNumber && <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Postal Address <span className="text-red-500">*</span></label>
                    <input type="text" name="postalAddress" value={formData.postalAddress} onChange={handleChange}
                      placeholder="P.O. Box 12345-00100"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500" />
                    {errors.postalAddress && <p className="text-red-500 text-xs mt-1">{errors.postalAddress}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Location Information */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="border-l-4 border-green-700 pl-4">
                  <h2 className="text-xl font-semibold text-gray-900">Location Details</h2>
                  <p className="text-gray-500 text-sm">Your county of origin and residence</p>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country of Birth</label>
                    <select name="countryOfBirth" value={formData.countryOfBirth} onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500">
                      <option value="Kenya">Kenya</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">County of Birth <span className="text-red-500">*</span></label>
                    <select name="countyOfBirth" value={formData.countyOfBirth} onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500">
                      <option value="">Select County</option>
                      {kenyanCounties.map(county => (
                        <option key={county} value={county}>{county}</option>
                      ))}
                    </select>
                    {errors.countyOfBirth && <p className="text-red-500 text-xs mt-1">{errors.countyOfBirth}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country of Residence</label>
                    <select name="countryOfResidence" value={formData.countryOfResidence} onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500">
                      <option value="Kenya">Kenya</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">County of Residence <span className="text-red-500">*</span></label>
                    <select name="countyOfResidence" value={formData.countyOfResidence} onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500">
                      <option value="">Select County</option>
                      {kenyanCounties.map(county => (
                        <option key={county} value={county}>{county}</option>
                      ))}
                    </select>
                    {errors.countyOfResidence && <p className="text-red-500 text-xs mt-1">{errors.countyOfResidence}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Citizenship</label>
                    <select name="citizenship" value={formData.citizenship} onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500">
                      <option value="Kenyan">Kenyan</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ethnicity <span className="text-red-500">*</span></label>
                    <select name="ethnicity" value={formData.ethnicity} onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500">
                      <option value="">Select Ethnicity</option>
                      <option value="Kikuyu">Kikuyu</option>
                      <option value="Luo">Luo</option>
                      <option value="Luhya">Luhya</option>
                      <option value="Kalenjin">Kalenjin</option>
                      <option value="Kamba">Kamba</option>
                      <option value="Kisii">Kisii</option>
                      <option value="Mijikenda">Mijikenda</option>
                      <option value="Meru">Meru</option>
                      <option value="Turkana">Turkana</option>
                      <option value="Maasai">Maasai</option>
                      <option value="Embu">Embu</option>
                      <option value="Taita">Taita</option>
                      <option value="Taveta">Taveta</option>
                      <option value="Pokot">Pokot</option>
                      <option value="Samburu">Samburu</option>
                      <option value="Borana">Borana</option>
                      <option value="Rendille">Rendille</option>
                      <option value="Somali">Somali</option>
                      <option value="Orma">Orma</option>
                      <option value="Gabra">Gabra</option>
                      <option value="Burji">Burji</option>
                      <option value="Konso">Konso</option>
                      <option value="Sakuye">Sakuye</option>
                      <option value="Ajuran">Ajuran</option>
                      <option value="Dasanach">Dasanach</option>
                      <option value="Elmolo">Elmolo</option>
                      <option value="Bajuni">Bajuni</option>
                      <option value="Swahili">Swahili</option>
                      <option value="Teso">Teso</option>
                      <option value="Kuria">Kuria</option>
                      <option value="Suba">Suba</option>
                      <option value="Tharaka">Tharaka</option>
                      <option value="Mbeere">Mbeere</option>
                      <option value="Chuka">Chuka</option>
                      <option value="Mwimbi">Mwimbi</option>
                      <option value="Muthambi">Muthambi</option>
                      <option value="Ameru">Ameru</option>
                      <option value="Sabaot">Sabaot</option>
                      <option value="Keiyo">Keiyo</option>
                      <option value="Marakwet">Marakwet</option>
                      <option value="Nandi">Nandi</option>
                      <option value="Kipsigis">Kipsigis</option>
                      <option value="Tugen">Tugen</option>
                      <option value="Terik">Terik</option>
                      <option value="Ogiek">Ogiek</option>
                      <option value="Endorois">Endorois</option>
                      <option value="Waata">Waata</option>
                      <option value="Aweer">Aweer</option>
                      <option value="Segeju">Segeju</option>
                      <option value="Shona">Shona</option>
                      <option value="Makonde">Makonde</option>
                      <option value="Nubian">Nubian</option>
                      <option value="Asian Kenyan">Asian Kenyan</option>
                      <option value="Arab Kenyan">Arab Kenyan</option>
                      <option value="European Kenyan">European Kenyan</option>
                      <option value="Other">Other</option>
                    </select>
                    {errors.ethnicity && <p className="text-red-500 text-xs mt-1">{errors.ethnicity}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Education Information */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="border-l-4 border-green-700 pl-4">
                  <h2 className="text-xl font-semibold text-gray-900">Academic Information</h2>
                  <p className="text-gray-500 text-sm">Your educational background</p>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Education Level <span className="text-red-500">*</span></label>
                    <select name="educationLevel" value={formData.educationLevel} onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500">
                      <option value="">Select Education Level</option>
                      {educationLevels.map(level => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </select>
                    {errors.educationLevel && <p className="text-red-500 text-xs mt-1">{errors.educationLevel}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">University/College Of Study <span className="text-red-500">*</span></label>
                    <input type="text" name="institutionName" value={formData.institutionName} onChange={handleChange}
                      placeholder="e.g., University of Nairobi, Kenyatta University"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500" />
                    {errors.institutionName && <p className="text-red-500 text-xs mt-1">{errors.institutionName}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Field of Study <span className="text-red-500">*</span></label>
                    <input type="text" name="fieldOfStudy" value={formData.fieldOfStudy} onChange={handleChange}
                      placeholder="e.g., Computer Science, Business Administration"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500" />
                    {errors.fieldOfStudy && <p className="text-red-500 text-xs mt-1">{errors.fieldOfStudy}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Expected Graduation Date</label>
                    <input type="date" name="graduationDate" value={formData.graduationDate} onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500" />
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-md font-semibold text-gray-900 mb-3">Disability Information</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" name="isPwd" checked={formData.isPwd} onChange={handleChange}
                          className="w-4 h-4 text-green-700 focus:ring-green-500" />
                        <span className="text-gray-700">Do you have a disability?</span>
                      </label>
                    </div>
                    {formData.isPwd && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">PWD Registration Number</label>
                        <input type="text" name="pwdNumber" value={formData.pwdNumber} onChange={handleChange}
                          placeholder="Enter your PWD certificate number"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Declaration & Submit */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div className="border-l-4 border-green-700 pl-4">
                  <h2 className="text-xl font-semibold text-gray-900">Declaration</h2>
                  <p className="text-gray-500 text-sm">Please confirm the following</p>
                </div>
                
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CAPTCHA: What is 7 + 7? <span className="text-red-500">*</span>
                  </label>
                  <input type="number" name="captchaAnswer" value={formData.captchaAnswer} onChange={handleChange}
                    placeholder="Enter your answer"
                    className="w-full md:w-1/2 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500" />
                  {errors.captchaAnswer && <p className="text-red-500 text-xs mt-1">{errors.captchaAnswer}</p>}
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" name="acceptedTerms" checked={formData.acceptedTerms} onChange={handleChange}
                      className="mt-1 w-4 h-4 text-green-700 focus:ring-green-500" />
                    <span className="text-gray-700 text-sm">
                      I hereby declare that the information provided in this application is true and complete to the best of my knowledge. 
                      I understand that providing false information may lead to disqualification or termination of attachment.
                      I consent to Nairobi City County Government collecting, processing, and storing my personal data for 
                      the purposes of attachment recruitment and selection.
                    </span>
                  </label>
                  {errors.acceptedTerms && <p className="text-red-500 text-xs mt-1">{errors.acceptedTerms}</p>}
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800 text-sm flex items-start gap-2">
                    <span>⚠️</span>
                    <span>Upon successful registration, you will receive a confirmation email with your login credentials. 
                    Please keep your password secure as you will need it to access your application dashboard.</span>
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-between">
            {currentStep > 1 && (
              <button type="button" onClick={handlePrevious}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition font-medium">
                ← Previous
              </button>
            )}
            {currentStep < 5 ? (
              <button type="button" onClick={handleNext}
                className="ml-auto px-6 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition font-medium">
                Continue →
              </button>
            ) : (
              <button type="submit" disabled={isSubmitting}
                className="ml-auto px-6 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition font-medium disabled:opacity-50">
                {isSubmitting ? "Submitting..." : "✓ Submit Registration"}
              </button>
            )}
          </div>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Having trouble? Contact us at <a href="mailto:cpsb@nairobi.go.ke" className="text-green-700">cpsb@nairobi.go.ke</a> or call 0208000325/326</p>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 pt-8 pb-6 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="border-t border-gray-800 pt-6 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} Nairobi City County Government. All rights reserved. Powered by SMART Nairobi</p>
          </div>
        </div>
      </footer>
    </div>
  );
}