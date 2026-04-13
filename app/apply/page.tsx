"use client";

import { useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

// Navigation items for client sidebar
const navItems = [
  { name: "Dashboard", icon: "dashboard", href: "/dashboard" },
  { name: "Recommendations", icon: "recommend", href: "/recommendations" },
  { name: "Apply", icon: "description", active: true, href: "/apply" },
  { name: "Messages", icon: "chat", href: "/chat" },
  { name: "Settings", icon: "settings", href: "#" }
];

// Hardcoded application workflow data
const applicationData = {
  steps: [
    { id: 1, name: "Property Selection", status: "completed", icon: "home" },
    { id: 2, name: "Personal Details", status: "current", icon: "person" },
    { id: 3, name: "Financial Info", status: "pending", icon: "account_balance" },
    { id: 4, name: "Documents", status: "pending", icon: "description" },
    { id: 5, name: "Review & Submit", status: "pending", icon: "check_circle" }
  ],
  properties: [
    {
      id: "RC-2024-88",
      name: "The Highlands Estate",
      location: "Austin, TX",
      price: "$1,200,000",
      image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
      specs: { beds: 4, baths: 3.5, sqft: 3200 }
    },
    {
      id: "RC-2024-92",
      name: "Urban Loft Project",
      location: "Seattle, WA",
      price: "$850,000",
      image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800",
      specs: { beds: 2, baths: 2, sqft: 1800 }
    }
  ],
  documentTypes: [
    { id: "id", name: "Government ID", required: true, description: "Driver's license or passport" },
    { id: "proof-income", name: "Proof of Income", required: true, description: "Last 2 pay stubs or tax returns" },
    { id: "bank-statements", name: "Bank Statements", required: true, description: "Last 3 months" },
    { id: "credit-report", name: "Credit Report", required: false, description: "Optional - we can pull this" }
  ]
};

function ApplicationContent() {
  const searchParams = useSearchParams();
  const propertyId = searchParams.get("property") || "RC-2024-88";
  const [currentStep, setCurrentStep] = useState(2);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    employment: "",
    income: "",
    downPayment: ""
  });
  const [uploadedDocs, setUploadedDocs] = useState<string[]>([]);

  const selectedProperty = applicationData.properties.find(p => p.id === propertyId) || applicationData.properties[0];

  const handleNext = () => {
    if (currentStep < 5) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = () => {
    alert("Application submitted successfully! Reference: APP-2024-" + Math.floor(Math.random() * 10000));
  };

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex-col hidden md:flex">
        <div className="p-4 border-b border-gray-100">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#ffc300] flex items-center justify-center text-black rounded">
              <span className="material-symbols-outlined font-bold">construction</span>
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-wide uppercase">RoyConstruction</h1>
              <p className="text-xs text-gray-500">Client Portal</p>
            </div>
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                item.active 
                  ? "bg-[#ffc300]/10 text-black" 
                  : "text-gray-600 hover:bg-gray-50 hover:text-black"
              }`}
            >
              <span className={`material-symbols-outlined ${item.active ? "text-black" : "text-gray-400"}`}>
                {item.icon}
              </span>
              {item.name}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gray-300 rounded flex items-center justify-center">
              <span className="material-symbols-outlined text-gray-600">person</span>
            </div>
            <div>
              <p className="text-sm font-bold text-black">James Roy</p>
              <p className="text-xs text-gray-500">Client</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <nav className="flex items-center gap-2 text-sm mb-2">
                <Link href="/recommendations" className="text-gray-500 hover:text-black">Recommendations</Link>
                <span className="text-gray-300">/</span>
                <span className="text-black font-bold underline decoration-[#ffc300] decoration-2 underline-offset-4">Application</span>
              </nav>
              <h1 className="text-3xl font-bold text-black">Property Application</h1>
            </div>
           
          </div>
        </header>

        {/* Progress Steps */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            {applicationData.steps.map((step, idx) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex flex-col items-center ${idx < applicationData.steps.length - 1 ? 'flex-1' : ''}`}>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                    step.id < currentStep ? 'bg-green-500 text-white' :
                    step.id === currentStep ? 'bg-[#ffc300] text-black' :
                    'bg-gray-100 text-gray-400'
                  }`}>
                    <span className="material-symbols-outlined">{step.icon}</span>
                  </div>
                  <span className={`text-xs font-bold uppercase ${
                    step.id <= currentStep ? 'text-black' : 'text-gray-400'
                  }`}>{step.name}</span>
                </div>
                {idx < applicationData.steps.length - 1 && (
                  <div className={`h-1 w-16 mx-2 rounded ${
                    step.id < currentStep ? 'bg-green-500' : 'bg-gray-200'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Application Form */}
          <div className="lg:col-span-2">
            {currentStep === 1 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-2xl font-black text-black mb-6 uppercase">Selected Property</h2>
                <div className="relative h-64 rounded-xl overflow-hidden mb-4">
                  <Image src={selectedProperty.image} alt={selectedProperty.name} fill className="object-cover" />
                </div>
                <h3 className="text-xl font-bold text-black">{selectedProperty.name}</h3>
                <p className="text-gray-500 mb-4">{selectedProperty.location}</p>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <span className="material-symbols-outlined text-[#ffc300]">bed</span>
                    <p className="font-bold">{selectedProperty.specs.beds} Beds</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <span className="material-symbols-outlined text-[#ffc300]">shower</span>
                    <p className="font-bold">{selectedProperty.specs.baths} Baths</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <span className="material-symbols-outlined text-[#ffc300]">square_foot</span>
                    <p className="font-bold">{selectedProperty.specs.sqft.toLocaleString()} sqft</p>
                  </div>
                </div>
                <p className="text-2xl font-black text-[#ffc300]">{selectedProperty.price}</p>
              </div>
            )}

            {currentStep === 2 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-2xl font-black text-black mb-6 uppercase">Personal Information</h2>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-2">First Name</label>
                    <input 
                      type="text" 
                      value={formData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ffc300] outline-none"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Last Name</label>
                    <input 
                      type="text" 
                      value={formData.lastName}
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ffc300] outline-none"
                      placeholder="Doe"
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Email Address</label>
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ffc300] outline-none"
                    placeholder="john@example.com"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Phone Number</label>
                  <input 
                    type="tel" 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ffc300] outline-none"
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Current Address</label>
                  <input 
                    type="text" 
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ffc300] outline-none mb-2"
                    placeholder="Street Address"
                  />
                  <div className="grid grid-cols-3 gap-2">
                    <input 
                      type="text" 
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                      className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ffc300] outline-none"
                      placeholder="City"
                    />
                    <input 
                      type="text" 
                      value={formData.state}
                      onChange={(e) => setFormData({...formData, state: e.target.value})}
                      className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ffc300] outline-none"
                      placeholder="State"
                    />
                    <input 
                      type="text" 
                      value={formData.zip}
                      onChange={(e) => setFormData({...formData, zip: e.target.value})}
                      className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ffc300] outline-none"
                      placeholder="ZIP"
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-2xl font-black text-black mb-6 uppercase">Financial Information</h2>
                <div className="mb-4">
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Employment Status</label>
                  <select 
                    value={formData.employment}
                    onChange={(e) => setFormData({...formData, employment: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ffc300] outline-none"
                  >
                    <option value="">Select employment status</option>
                    <option value="employed">Full-time Employed</option>
                    <option value="self-employed">Self-employed</option>
                    <option value="business">Business Owner</option>
                    <option value="retired">Retired</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Annual Income</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <input 
                      type="number" 
                      value={formData.income}
                      onChange={(e) => setFormData({...formData, income: e.target.value})}
                      className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ffc300] outline-none"
                      placeholder="150000"
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Down Payment Amount</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <input 
                      type="number" 
                      value={formData.downPayment}
                      onChange={(e) => setFormData({...formData, downPayment: e.target.value})}
                      className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ffc300] outline-none"
                      placeholder="240000"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Minimum 20% recommended for this property type</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-bold text-black mb-2 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#ffc300]">info</span>
                    AI Financial Analysis
                  </h4>
                  <p className="text-sm text-gray-600">Based on your income level, you qualify for properties up to $2.5M. Your debt-to-income ratio appears healthy.</p>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-2xl font-black text-black mb-6 uppercase">Required Documents</h2>
                <div className="space-y-4">
                  {applicationData.documentTypes.map((doc) => (
                    <div key={doc.id} className={`p-4 border-2 rounded-lg transition-all ${
                      uploadedDocs.includes(doc.id) ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-[#ffc300]'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${uploadedDocs.includes(doc.id) ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                            <span className="material-symbols-outlined">{uploadedDocs.includes(doc.id) ? 'check' : 'upload'}</span>
                          </div>
                          <div>
                            <h4 className="font-bold text-black flex items-center gap-2">
                              {doc.name}
                              {doc.required && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Required</span>}
                            </h4>
                            <p className="text-sm text-gray-500">{doc.description}</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => {
                            if (!uploadedDocs.includes(doc.id)) {
                              setUploadedDocs([...uploadedDocs, doc.id]);
                            }
                          }}
                          className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${
                            uploadedDocs.includes(doc.id) 
                              ? 'bg-green-500 text-white' 
                              : 'bg-[#ffc300] hover:bg-[#e6b000] text-black'
                          }`}
                          disabled={uploadedDocs.includes(doc.id)}
                        >
                          {uploadedDocs.includes(doc.id) ? 'Uploaded' : 'Upload'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 p-4 bg-[#ffc300]/10 rounded-lg border border-[#ffc300]/30">
                  <p className="text-sm text-black flex items-center gap-2">
                    <span className="material-symbols-outlined">security</span>
                    All documents are encrypted and securely stored. We comply with SOC 2 standards.
                  </p>
                </div>
              </div>
            )}

            {currentStep === 5 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-2xl font-black text-black mb-6 uppercase">Review & Submit</h2>
                <div className="space-y-6">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-bold text-black mb-3 flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#ffc300]">home</span>
                      Property
                    </h3>
                    <p className="font-bold">{selectedProperty.name}</p>
                    <p className="text-gray-500 text-sm">{selectedProperty.location}</p>
                    <p className="text-[#ffc300] font-bold">{selectedProperty.price}</p>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-bold text-black mb-3 flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#ffc300]">person</span>
                      Applicant
                    </h3>
                    <p className="font-bold">{formData.firstName} {formData.lastName}</p>
                    <p className="text-gray-500 text-sm">{formData.email}</p>
                    <p className="text-gray-500 text-sm">{formData.phone}</p>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-bold text-black mb-3 flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#ffc300]">payments</span>
                      Financial
                    </h3>
                    <p className="text-sm text-gray-600">Annual Income: <span className="font-bold text-black">${formData.income || '0'}</span></p>
                    <p className="text-sm text-gray-600">Down Payment: <span className="font-bold text-black">${formData.downPayment || '0'}</span></p>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-bold text-black mb-3 flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#ffc300]">description</span>
                      Documents
                    </h3>
                    <p className="text-sm text-gray-600">{uploadedDocs.length} of {applicationData.documentTypes.length} documents uploaded</p>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <label className="flex items-start gap-3">
                    <input type="checkbox" className="mt-1 w-5 h-5 text-[#ffc300] rounded" />
                    <span className="text-sm text-gray-600">
                      I confirm that all information provided is accurate and complete. I authorize RoyConstruction to verify my information and conduct a credit check.
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-6">
              <button 
                onClick={handleBack}
                disabled={currentStep === 1}
                className="px-6 py-3 border border-gray-200 rounded-lg font-bold text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Back
              </button>
              {currentStep < 5 ? (
                <button 
                  onClick={handleNext}
                  className="px-6 py-3 bg-[#ffc300] hover:bg-[#e6b000] text-black font-bold rounded-lg transition-colors flex items-center gap-2"
                >
                  Continue
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              ) : (
                <button 
                  onClick={handleSubmit}
                  className="px-6 py-3 bg-black hover:bg-[#ffc300] hover:text-black text-white font-bold rounded-lg transition-colors flex items-center gap-2"
                >
                  Submit Application
                  <span className="material-symbols-outlined">check</span>
                </button>
              )}
            </div>
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-8">
              <h3 className="text-lg font-black text-black uppercase mb-4">Application Summary</h3>
              <div className="relative h-32 rounded-lg overflow-hidden mb-4">
                <Image src={selectedProperty.image} alt={selectedProperty.name} fill className="object-cover" />
              </div>
              <h4 className="font-bold text-black">{selectedProperty.name}</h4>
              <p className="text-sm text-gray-500 mb-3">{selectedProperty.location}</p>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Property Price</span>
                  <span className="font-bold">{selectedProperty.price}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Est. Construction</span>
                  <span className="font-bold">$650,000</span>
                </div>
                <div className="h-px bg-gray-200 my-2"></div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 font-bold">Total Investment</span>
                  <span className="font-black text-[#ffc300]">$1.85M</span>
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">schedule</span>
                  Application review: 2-3 business days
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
  );
}

export default function ApplyPage() {
  return (
    <Suspense fallback={
      <div className="h-screen bg-gray-50 flex overflow-hidden">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-[#ffc300] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500">Loading application...</p>
          </div>
        </div>
      </div>
    }>
      <ApplicationContent />
    </Suspense>
  );
}
