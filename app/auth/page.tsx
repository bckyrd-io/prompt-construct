"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Hardcoded auth data
const authData = {
  features: [
    { icon: "psychology", title: "AI Property Matching", description: "Smart recommendations based on your preferences" },
    { icon: "analytics", title: "Real-time Tracking", description: "Monitor your construction milestones 24/7" },
    { icon: "payments", title: "Secure Payments", description: "Paychangu integration for safe transactions" }
  ]
};

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<"client" | "admin" | "login">("client");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    agreeToTerms: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (activeTab === "admin") {
        router.push("/admin/reports");
      } else {
        router.push("/dashboard");
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50">
    

      {/* Main Content */}
      <main className="min-h-[calc(100vh-80px)] flex items-center py-12 px-4" style={{
        background: 'linear-gradient(135deg, #f9fafb 0%, #ffffff 50%, #f3f4f6 100%)'
      }}>
        <div className="w-full max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* Right Side - Auth Forms */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              {/* Tabs */}
              <div className="flex border-b border-gray-100">
                <button 
                  onClick={() => setActiveTab("client")}
                  className={`flex-1 py-4 text-sm font-bold uppercase tracking-wide border-b-2 transition-all flex items-center justify-center gap-2 ${
                    activeTab === "client" 
                      ? "border-[#ffc300] bg-[#ffc300]/5 text-black" 
                      : "border-transparent text-gray-400 hover:text-black"
                  }`}
                >
                  <span className="material-symbols-outlined">person</span>
                  Client
                </button>
                <button 
                  onClick={() => setActiveTab("admin")}
                  className={`flex-1 py-4 text-sm font-bold uppercase tracking-wide border-b-2 transition-all flex items-center justify-center gap-2 ${
                    activeTab === "admin" 
                      ? "border-[#ffc300] bg-[#ffc300]/5 text-black" 
                      : "border-transparent text-gray-400 hover:text-black"
                  }`}
                >
                  <span className="material-symbols-outlined">admin_panel_settings</span>
                  Admin
                </button>
              </div>

              {/* Client Signup Form */}
              {(activeTab === "client" || activeTab === "login") && (
                <div className="p-8">
                  <h2 className="text-2xl font-black text-black mb-2 uppercase">
                    {activeTab === "login" ? "Welcome Back" : "Create Account"}
                  </h2>
                  <p className="text-gray-500 text-sm mb-6">
                    {activeTab === "login" ? "Sign in to your account" : "Start your property journey today"}
                  </p>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {activeTab !== "login" && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wide text-black mb-2">First Name</label>
                          <input 
                            type="text" 
                            value={formData.firstName}
                            onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ffc300] focus:border-transparent outline-none text-sm"
                            placeholder="John"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wide text-black mb-2">Last Name</label>
                          <input 
                            type="text" 
                            value={formData.lastName}
                            onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ffc300] focus:border-transparent outline-none text-sm"
                            placeholder="Doe"
                            required
                          />
                        </div>
                      </div>
                    )}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wide text-black mb-2">Email Address</label>
                      <input 
                        type="email" 
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ffc300] focus:border-transparent outline-none text-sm"
                        placeholder="john@example.com"
                        required
                      />
                    </div>
                    {activeTab !== "login" && (
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wide text-black mb-2">Phone Number</label>
                        <input 
                          type="tel" 
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ffc300] focus:border-transparent outline-none text-sm"
                          placeholder="+1 (555) 000-0000"
                        />
                      </div>
                    )}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wide text-black mb-2">Password</label>
                      <div className="relative">
                        <input 
                          type="password" 
                          value={formData.password}
                          onChange={(e) => setFormData({...formData, password: e.target.value})}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ffc300] focus:border-transparent outline-none text-sm"
                          placeholder="Min 8 characters"
                          required
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer material-symbols-outlined">visibility_off</span>
                      </div>
                    </div>
                    {activeTab !== "login" && (
                      <div className="flex items-start gap-3">
                        <input 
                          type="checkbox" 
                          checked={formData.agreeToTerms}
                          onChange={(e) => setFormData({...formData, agreeToTerms: e.target.checked})}
                          className="mt-1 w-4 h-4 text-[#ffc300] border-gray-300 rounded focus:ring-[#ffc300]"
                          required
                        />
                        <label className="text-xs text-gray-500">
                          I agree to the <Link href="#" className="text-[#ffc300] font-bold hover:underline">Terms of Service</Link> and <Link href="#" className="text-[#ffc300] font-bold hover:underline">Privacy Policy</Link>
                        </label>
                      </div>
                    )}
                    <button 
                      type="submit" 
                      disabled={isLoading}
                      className="w-full py-4 bg-[#ffc300] hover:bg-[#e6b000] text-black font-bold uppercase tracking-wide rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isLoading ? (
                        <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <>
                          {activeTab === "login" ? "Sign In" : "Create Account"}
                          <span className="material-symbols-outlined">arrow_forward</span>
                        </>
                      )}
                    </button>
                  </form>

                  {activeTab === "login" ? (
                    <p className="text-center text-xs text-gray-500 mt-6">
                      Don't have an account? <button onClick={() => setActiveTab("client")} className="text-[#ffc300] font-bold hover:underline">Create one here</button>
                    </p>
                  ) : (
                    <p className="text-center text-xs text-gray-500 mt-6">
                      Already have an account? <button onClick={() => setActiveTab("login")} className="text-[#ffc300] font-bold hover:underline">Sign in here</button>
                    </p>
                  )}
                </div>
              )}

              {/* Admin Login Form */}
              {activeTab === "admin" && (
                <div className="p-8">
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-black rounded-full mb-4">
                      <span className="material-symbols-outlined text-3xl text-[#ffc300]">admin_panel_settings</span>
                    </div>
                    <h2 className="text-2xl font-black text-black uppercase">Admin Portal</h2>
                    <p className="text-gray-500 text-sm">Authorized personnel only</p>
                  </div>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wide text-black mb-2">Admin Email</label>
                      <input 
                        type="email" 
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ffc300] focus:border-transparent outline-none text-sm"
                        placeholder="admin@royconstruction.com"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wide text-black mb-2">Password</label>
                      <div className="relative">
                        <input 
                          type="password" 
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ffc300] focus:border-transparent outline-none text-sm"
                          placeholder="Enter your password"
                          required
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer material-symbols-outlined">visibility_off</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <input type="checkbox" className="w-4 h-4 text-[#ffc300] border-gray-300 rounded focus:ring-[#ffc300]" />
                        <label className="text-xs text-gray-500">Remember me</label>
                      </div>
                      <Link href="#" className="text-xs text-[#ffc300] font-bold hover:underline">Forgot password?</Link>
                    </div>
                    <button 
                      type="submit" 
                      disabled={isLoading}
                      className="w-full py-4 bg-black hover:bg-[#ffc300] hover:text-black text-white font-bold uppercase tracking-wide rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <>
                          Access Dashboard
                          <span className="material-symbols-outlined">login</span>
                        </>
                      )}
                    </button>
                  </form>

                  <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-[#ffc300] text-sm mt-0.5">security</span>
                      <div>
                        <p className="text-xs font-bold text-black uppercase">Secure Access</p>
                        <p className="text-xs text-gray-500 mt-1">This portal is protected by multi-factor authentication and encrypted connections.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
