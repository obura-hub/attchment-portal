"use client";

import Link from "next/link";
import { useRef, useState, useEffect } from "react";

interface Department {
  department_id: number;
  department_name: string;
  slug: string;
  icon?: string;
  description: string;
  total_positions: number;
  categories: string[];
}

// Helper function to get icon based on department name - Exact match for your database
const getDepartmentIcon = (departmentName: string): string => {
  const iconMap: { [key: string]: string } = {
    "Office of the Governor": "👨‍💼",
    "Finance & Economic Planning": "💰",
    "ICT & Digital Transformation": "💻",
    "Health Services": "🏥",
    "Urban Planning & Development": "🏗️",
    "Transport & Infrastructure": "🚗",
    "Water & Sanitation": "💧",
    "Environment & Waste Management": "🌿",
    "Education & Vocational Training": "📚",
    "Youth & Sports": "⚽",
    "Trade & Industrialization": "🏪",
    "Agriculture & Livestock": "🌾",
    "Human Resources & Administration": "👥",
    "Social Services & Gender": "🤝",
    "Public Service Board": "📋"
  };
  
  return iconMap[departmentName] || "🏛️";
};

export default function Home() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalDepartments: 0,
    totalPositions: 0,
    applicationDeadline: "July 30, 2025"
  });

  // Fetch departments from API
  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await fetch('/api/departments');
      const data = await response.json();
      if (data.success) {
        // Add icons to departments
        const departmentsWithIcons = data.data.map((dept: Department) => ({
          ...dept,
          icon: getDepartmentIcon(dept.department_name)
        }));
        setDepartments(departmentsWithIcons);
        
        // Calculate total positions
        const totalPositions = departmentsWithIcons.reduce((sum: number, dept: Department) => sum + (dept.total_positions || 0), 0);
        setStats({
          totalDepartments: departmentsWithIcons.length,
          totalPositions: totalPositions,
          applicationDeadline: "July 30, 2025"
        });
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScrollButtons();
    window.addEventListener('resize', checkScrollButtons);
    return () => window.removeEventListener('resize', checkScrollButtons);
  }, [departments]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
      setTimeout(checkScrollButtons, 300);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Top Bar */}
      <div className="bg-gray-900 text-gray-300 text-sm py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <span>📞 0208000325/326</span>
            <span>✉️ cpsb@nairobi.go.ke</span>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/faq" className="hover:text-white">FAQ</Link>
            <Link href="/contact" className="hover:text-white">Contact</Link>
          </div>
        </div>
      </div>

      {/* Header with Navigation */}
      <header className="sticky top-0 z-50 bg-white shadow-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="text-3xl">🏛️</div>
              <div>
                <h1 className="text-xl font-bold text-green-800">Nairobi City County</h1>
                <p className="text-xs text-gray-600">Student Attachment Application Portal</p>
              </div>
            </div>
            
            <nav className="hidden md:flex space-x-8">
              <Link href="/" className="text-gray-700 hover:text-green-700 font-medium">Home</Link>
              <Link href="/register" className="text-gray-700 hover:text-green-700 font-medium">Register</Link>
              <Link href="/login" className="text-gray-700 hover:text-green-700 font-medium">Login</Link>
            </nav>
            
            <Link href="/login" className="bg-green-700 text-white px-4 py-2 rounded-md hover:bg-green-800 transition">
              Apply Now
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="relative bg-gradient-to-r from-green-900 to-green-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="max-w-3xl">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Student Attachment Portal
            </h2>
            <p className="text-lg md:text-xl text-green-100 mb-6">
              The Nairobi City County Government invites qualified and motivated students to apply for industrial attachment opportunities across various departments for the 2025/2026 financial year.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/register" className="bg-white text-green-800 px-6 py-3 rounded-md font-semibold text-center hover:bg-gray-100 transition">
                Register Now
              </Link>
              <Link href="/login" className="border border-white px-6 py-3 rounded-md font-semibold text-center hover:bg-white/10 transition">
                Login to Apply
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Key Information Cards */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-700">
              <div className="text-3xl mb-3">📅</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Application Period</h3>
              <p className="text-gray-600">1st June - {stats.applicationDeadline}</p>
              <p className="text-sm text-gray-500 mt-2">Late applications will not be accepted</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-700">
              <div className="text-3xl mb-3">👥</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Available Positions</h3>
              <p className="text-gray-600">{stats.totalPositions}+ positions across {stats.totalDepartments} departments</p>
              <p className="text-sm text-gray-500 mt-2">ICT, Health, Engineering, Finance & more</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-700">
              <div className="text-3xl mb-3">⏱️</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Attachment Duration</h3>
              <p className="text-gray-600"> Maximum 12 weeks</p>
              <p className="text-sm text-gray-500 mt-2">Full-time commitment required</p>
            </div>
          </div>
        </div>
      </section>

      {/* Departments Horizontal Scroll Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-3">Attachment Departments</h2>
            <div className="w-20 h-1 bg-green-700 mx-auto mb-4"></div>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Scroll through all county departments to find attachment opportunities matching your field of study
            </p>
          </div>
          
          {/* Carousel Controls */}
          <div className="flex justify-end gap-2 mb-4">
            <button
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className={`p-2 rounded-full border ${
                canScrollLeft 
                  ? 'bg-green-700 text-white hover:bg-green-800 border-green-700' 
                  : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
              } transition-colors`}
              aria-label="Scroll left"
            >
              ←
            </button>
            <button
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              className={`p-2 rounded-full border ${
                canScrollRight 
                  ? 'bg-green-700 text-white hover:bg-green-800 border-green-700' 
                  : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
              } transition-colors`}
              aria-label="Scroll right"
            >
              →
            </button>
          </div>
          
          {/* Horizontal Scroll Container */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
            </div>
          ) : (
            <div
              ref={scrollContainerRef}
              onScroll={checkScrollButtons}
              className="overflow-x-auto scroll-smooth hide-scrollbar"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              <div className="flex gap-6 pb-4 min-w-max">
                {departments.map((dept) => (
                  <div
                    key={dept.department_id}
                    className="w-80 bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all duration-300 hover:border-green-300 flex-shrink-0"
                  >
                    {/* Large Emoji Icon */}
                    <div className="text-6xl mb-4 text-center">{dept.icon}</div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2 text-center line-clamp-2 min-h-[56px]">
                      {dept.department_name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3 text-center line-clamp-2 min-h-[40px]">
                      {dept.description}
                    </p>
                    <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100">
                      <span className={`text-sm font-medium ${dept.total_positions > 0 ? 'text-green-700' : 'text-gray-400'}`}>
                        {dept.total_positions} position{dept.total_positions !== 1 ? 's' : ''}
                      </span>
                    
                    </div>
                    {/* Position categories */}
                    {dept.categories && dept.categories.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1 justify-center">
                        {dept.categories.slice(0, 3).map((cat, idx) => (
                          <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                            {cat}
                          </span>
                        ))}
                        {dept.categories.length > 3 && (
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                            +{dept.categories.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Scroll Indicator */}
          {!loading && departments.length > 0 && (
            <div className="text-center mt-6 text-sm text-gray-500">
              <span className="inline-flex items-center gap-2">
                ← Scroll to see all {departments.length} departments →
              </span>
            </div>
          )}
        </div>
      </section>

      {/* How to Apply - Steps */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-3">Application Process</h2>
            <div className="w-20 h-1 bg-green-700 mx-auto mb-4"></div>
            <p className="text-gray-600">Follow these steps to complete your application</p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-6">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-700 font-bold text-xl">
                  {index + 1}
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <Link href="/register" className="inline-block bg-green-700 text-white px-6 py-3 rounded-md font-semibold hover:bg-green-800 transition">
              Start Your Application
            </Link>
          </div>
        </div>
      </section>

      {/* Requirements & Documents */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span>✓</span> Eligibility Requirements
              </h3>
              <ul className="space-y-3">
                {requirements.map((req, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-700">
                    <span className="text-green-700">•</span>
                    {req}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span>📄</span> Required Documents
              </h3>
              <ul className="space-y-3">
                {documents.map((doc, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-700">
                    <span className="text-green-700">•</span>
                    {doc}
                  </li>
                ))}
              </ul>
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                <strong>Note:</strong> All documents must be in PDF format and less than 5MB each.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Important Dates Table */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-3">Important Dates</h2>
            <div className="w-20 h-1 bg-green-700 mx-auto"></div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr><td className="px-6 py-4 text-sm text-gray-900">Application Opening</td><td className="px-6 py-4 text-sm text-gray-600">June 1, 2025</td><td className="px-6 py-4"><span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Open</span></td></tr>
                <tr><td className="px-6 py-4 text-sm text-gray-900">Application Deadline</td><td className="px-6 py-4 text-sm text-gray-600">July 30, 2025</td><td className="px-6 py-4"><span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Upcoming</span></td></tr>
                <tr><td className="px-6 py-4 text-sm text-gray-900">Shortlisting & Interviews</td><td className="px-6 py-4 text-sm text-gray-600">August 15-30, 2025</td><td className="px-6 py-4"><span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">Pending</span></td></tr>
                <tr><td className="px-6 py-4 text-sm text-gray-900">Attachment Period</td><td className="px-6 py-4 text-sm text-gray-600">September - November 2025</td><td className="px-6 py-4"><span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">Pending</span></td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 bg-green-800">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">Need Assistance?</h2>
          <p className="text-green-100 mb-8">
            Contact the Nairobi City County Public Service Board for any inquiries regarding the attachment program.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <div className="bg-white/10 px-6 py-3 rounded-md text-white">📞 0208000325/326</div>
            <div className="bg-white/10 px-6 py-3 rounded-md text-white">✉️ cpsb@nairobi.go.ke</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 pt-12 pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div><h3 className="text-white font-semibold mb-3">Nairobi City County</h3><p className="text-sm">City Hall, P.O. Box 30075-00100</p><p className="text-sm">Nairobi, Kenya</p></div>
            <div><h4 className="text-white font-semibold mb-3">Quick Links</h4><ul className="space-y-2 text-sm"><li><Link href="/register" className="hover:text-white">Register</Link></li><li><Link href="/login" className="hover:text-white">Login</Link></li><li><Link href="/opportunities" className="hover:text-white">Opportunities</Link></li></ul></div>
            <div><h4 className="text-white font-semibold mb-3">Resources</h4><ul className="space-y-2 text-sm"><li><Link href="/guidelines" className="hover:text-white">Application Guidelines</Link></li><li><Link href="/faq" className="hover:text-white">FAQ</Link></li><li><Link href="/contact" className="hover:text-white">Contact</Link></li></ul></div>
            <div><h4 className="text-white font-semibold mb-3">Subscribe</h4><p className="text-sm mb-3">Get updates on new opportunities</p><form className="flex flex-col gap-2"><input type="email" placeholder="Your email" className="px-3 py-2 rounded text-gray-900 text-sm" /><button className="bg-green-700 px-3 py-2 rounded text-white text-sm hover:bg-green-800">Subscribe</button></form></div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-6 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} Nairobi City County Public Service Board. All rights reserved. Powered By SMART NAIROBI</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

const steps = [
  { title: "Create Account", description: "Register with your student email" },
  { title: "Submit Application", description: "Fill details and upload documents" },
  { title: "Shortlisting", description: "Wait for selection notification" },
  { title: "Placement", description: "Get assigned to a department" }
];

const requirements = [
  "Be a Kenyan citizen with a valid National ID",
  "Be a 3rd or 4th year student in a recognized university/college",
  "Have a valid introduction letter from your institution",
  "Have valid personal accident insurance cover",
  "Commit to the full attachment period (minimum 8 weeks)"
];

const documents = [
  "Application letter addressed to the County Director",
  "Updated Curriculum Vitae (CV)",
  "Recommendation letter from your institution",
  "Copy of National ID or Passport",
  "Personal accident insurance certificate",
  "Academic transcripts (latest)"
];