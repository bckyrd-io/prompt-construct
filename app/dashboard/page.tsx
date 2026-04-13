"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

// Hardcoded dashboard data
const dashboardData = {
  project: {
    id: "RC-2024-88",
    name: "The Highlands Estate",
    unit: "Unit 4B",
    specs: "4 Bed, 3.5 Bath • 3,200 Sq Ft",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200",
    status: "In Progress",
    progress: 65,
    health: "On Track"
  },
  aiUpdates: [
    {
      id: 1,
      type: "UPDATE",
      title: "Structural framing is 85% complete",
      description: "Drone scan confirms alignment with blueprints.",
      time: "Just now",
      icon: "check_circle",
      color: "#ffc300"
    },
    
  ],
  milestones: [
    {
      id: 1,
      name: "Site Clearing & Excavation",
      status: "completed",
      paymentStatus: "paid",
      amount: 75000,
      date: "Jan 15, 2024",
      photos: [
        "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400",
        "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400"
      ]
    },
    {
      id: 2,
      name: "Foundation Pour",
      status: "completed",
      paymentStatus: "paid",
      amount: 75000,
      date: "Feb 10, 2024",
      photos: [
        "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400"
      ]
    },
    {
      id: 3,
      name: "Structural Framing",
      status: "active",
      paymentStatus: "due",
      amount: 50000,
      date: "Est. Completion Mar 15",
      progress: 85,
      aiNote: "Material delivery confirmed for Tuesday. Framing crew scheduled for full shifts this week.",
      photos: [
        "https://images.unsplash.com/photo-1590274853856-f22d5ee3d228?w=400",
        "https://images.unsplash.com/photo-1582268611958-ebfd161ef1cf?w=400"
      ]
    },
    {
      id: 4,
      name: "Roof Installation",
      status: "upcoming",
      paymentStatus: "pending",
      amount: 60000,
      date: "Est. Start April 20",
      photos: []
    },
    {
      id: 5,
      name: "Electrical & Plumbing",
      status: "upcoming",
      paymentStatus: "pending",
      amount: 100000,
      date: "Est. Start May 15",
      photos: []
    },
    {
      id: 6,
      name: "Interior Finishing",
      status: "upcoming",
      paymentStatus: "pending",
      amount: 90000,
      date: "Est. Start June 1",
      photos: []
    }
  ],
  payment: {
    totalCost: 450000,
    paidToDate: 150000,
    outstanding: 300000,
    nextPayment: {
      amount: 50000,
      dueDate: "March 01",
      milestone: "Structural Framing Completion"
    },
    history: [
      { id: "88-02", description: "Foundation", date: "Feb 10", amount: 75000 },
      { id: "88-01", description: "Deposit", date: "Jan 15", amount: 75000 }
    ]
  },
  navItems: [
    { name: "Dashboard", icon: "dashboard", active: true, href: "/dashboard" },
    { name: "My Projects", icon: "apartment", active: false, href: "/recommendations" },
    { name: "Documents", icon: "description", active: false, href: "#" },
    { name: "Messages", icon: "mail", active: false, href: "#", badge: 2 },
    { name: "Settings", icon: "settings", active: false, href: "#" }
  ]
};

export default function DashboardPage() {
  const [selectedMilestone, setSelectedMilestone] = useState<number | null>(null);

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
          {dashboardData.navItems.map((item) => (
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
              {item.badge && (
                <span className="ml-auto bg-[#ffc300] text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
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
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
          <div>
            <nav className="flex items-center gap-2 text-sm mb-2">
              <Link href="/dashboard" className="text-black font-bold underline decoration-[#ffc300] decoration-2 underline-offset-4">Dashboard</Link>
            </nav>
            {/* <h1 className="text-3xl font-bold text-black">Dashboard Overview</h1> */}
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-full">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full bg-green-400 opacity-75 rounded-full"></span>
                <span className="relative inline-flex h-2 w-2 bg-green-600 rounded-full"></span>
              </span>
              <span className="text-xs font-bold text-green-700 uppercase tracking-wide">AI Agent Active</span>
            </div>
            <div className="h-8 w-px bg-gray-100"></div>
            <button className="text-gray-500 hover:text-black transition-colors relative">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-0 right-0 block h-2 w-2 bg-red-600 ring-2 ring-white rounded-full"></span>
            </button>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Project Hero & AI Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Project Card */}
              <div className="lg:col-span-2 bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="relative h-64">
                  <Image 
                    src={dashboardData.project.image} 
                    alt={dashboardData.project.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 bg-[#ffc300] text-black text-[10px] font-bold uppercase tracking-wider rounded-md">
                        {dashboardData.project.status}
                      </span>
                      <span className="text-gray-500 text-sm font-mono">ID: {dashboardData.project.id}</span>
                    </div>
                    <h2 className="text-3xl font-bold text-black mb-1">{dashboardData.project.name}</h2>
                    <p className="text-gray-600 font-medium">{dashboardData.project.unit} • {dashboardData.project.specs}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2 min-w-[180px]">
                    <div className="flex justify-between w-full text-black text-sm font-bold uppercase">
                      <span>Overall Progress</span>
                      <span>{dashboardData.project.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-100 h-4 rounded-full overflow-hidden">
                      <div className="bg-[#ffc300] h-full rounded-full" style={{ width: `${dashboardData.project.progress}%` }}></div>
                    </div>
                    <p className="text-xs text-green-700 font-bold mt-1 flex items-center gap-1 uppercase tracking-wider">
                      <span className="material-symbols-outlined text-sm">check_circle</span>
                      {dashboardData.project.health}
                    </p>
                  </div>
                </div>
              </div>

              {/* AI Summary */}
              <div className="bg-white p-6 flex flex-col justify-between rounded-xl shadow-sm">
                <div>
                  <h3 className="text-black font-bold mb-4 flex items-center gap-2 uppercase tracking-wide text-sm border-b border-gray-100 pb-2">
                    <span className="material-symbols-outlined text-[#e6b000]">smart_toy</span>
                    AI Agent Summary
                  </h3>
                  <div className="space-y-3">
                    {dashboardData.aiUpdates.map((update) => (
                      <div 
                        key={update.id} 
                        className="p-3 bg-gray-50 rounded-lg border-l-4 text-sm text-gray-600 shadow-sm"
                        style={{ borderLeftColor: update.color }}
                      >
                        <p className="mb-2">
                          <span style={{ color: update.color }} className="font-bold uppercase text-xs">{update.type}:</span>
                          {" "}{update.title}. {update.description}
                        </p>
                        <p className="text-xs text-gray-400 font-mono">{update.time}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <Link 
                  href="/chat"
                  className="mt-4 w-full py-3 bg-gray-50 hover:bg-[#ffc300] hover:text-black transition-colors text-black text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 rounded-lg"
                >
                  View Report
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </Link>
              </div>
            </div>

            {/* Milestones & Payment */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Construction Milestones */}
              <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
                  <h3 className="text-xl font-bold text-black uppercase tracking-tight">Construction Milestones</h3>
                  <button className="text-sm font-bold text-[#e6b000] hover:text-black uppercase tracking-wider transition-colors">
                    Download Schedule
                  </button>
                </div>
                <div className="relative pl-4 space-y-8">
                  <div className="absolute top-0 bottom-0 left-[27px] w-0.5 bg-gray-100 rounded-full"></div>
                  {dashboardData.milestones.map((milestone, idx) => (
                    <div key={milestone.id} className="relative flex gap-6 group">
                      <div className={`absolute left-[15px] z-10 rounded-full border-2 ${
                        milestone.status === 'completed' ? 'bg-green-500 border-white p-0.5' :
                        milestone.status === 'active' ? 'bg-white border-[#ffc300] p-1' :
                        'bg-white border-gray-300 p-0.5'
                      }`}>
                        <div className={`w-3 h-3 rounded-full ${
                          milestone.status === 'completed' ? 'bg-green-500' :
                          milestone.status === 'active' ? 'bg-[#ffc300] animate-pulse' :
                          'bg-gray-300'
                        }`}></div>
                      </div>
                      <div className={`flex-1 ml-8 rounded-xl border transition-all ${
                        milestone.status === 'active' 
                          ? 'bg-white p-5 shadow-md border-l-4 border-l-[#ffc300] border-t border-r border-b border-gray-100' 
                          : milestone.status === 'completed'
                          ? 'bg-white p-5 shadow-sm border border-gray-100'
                          : 'bg-transparent border border-gray-200 border-dashed p-5'
                      }`}>
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className={`text-lg font-bold flex items-center gap-2 ${
                              milestone.status === 'upcoming' ? 'text-gray-600' : 'text-black'
                            }`}>
                              {milestone.name}
                              {milestone.status === 'active' && (
                                <span className="flex h-2 w-2 relative">
                                  <span className="animate-ping absolute inline-flex h-full w-full bg-[#ffc300] opacity-75 rounded-full"></span>
                                  <span className="relative inline-flex h-2 w-2 bg-[#ffc300] rounded-full"></span>
                                </span>
                              )}
                            </h4>
                            <p className={`text-sm font-mono mt-1 ${
                              milestone.status === 'upcoming' ? 'text-gray-400' : 'text-gray-500'
                            }`}>
                              {milestone.status === 'completed' ? 'Completed: ' : milestone.status === 'active' ? 'In Progress • Est. Completion ' : 'Upcoming • Est. Start '}
                              {milestone.date}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <span className={`px-2 py-1 text-xs font-bold uppercase tracking-wide rounded-md ${
                              milestone.status === 'completed' ? 'bg-green-50 text-green-800' :
                              milestone.status === 'active' ? 'bg-[#ffc300] text-black' :
                              'bg-gray-50 text-gray-500'
                            }`}>
                              {milestone.status === 'completed' ? 'Completed' : milestone.status === 'active' ? 'Active Stage' : 'Scheduled'}
                            </span>
                            <span className={`px-2 py-1 text-xs font-bold uppercase tracking-wide rounded-md flex items-center gap-1 ${
                              milestone.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' :
                              milestone.paymentStatus === 'due' ? 'bg-red-100 text-red-700' :
                              'bg-gray-100 text-gray-500'
                            }`}>
                              <span className="material-symbols-outlined text-[10px]">
                                {milestone.paymentStatus === 'paid' ? 'check_circle' :
                                 milestone.paymentStatus === 'due' ? 'schedule' : 'pending'}
                              </span>
                              {milestone.paymentStatus === 'paid' ? 'Paid' :
                               milestone.paymentStatus === 'due' ? `$${milestone.amount.toLocaleString()} Due` :
                               `$${milestone.amount.toLocaleString()} Pending`}
                            </span>
                          </div>
                        </div>
                        
                        {milestone.aiNote && (
                          <div className="mb-4 bg-gray-50 rounded-lg border-l-4 border-[#ffc300] p-3">
                            <div className="flex items-start gap-2">
                              <span className="material-symbols-outlined text-[#e6b000] text-sm mt-0.5">smart_toy</span>
                              <p className="text-sm text-gray-700 font-medium">{milestone.aiNote}</p>
                            </div>
                          </div>
                        )}

                        {milestone.photos.length > 0 && (
                          <div className="flex gap-2 overflow-x-auto pb-2">
                            {milestone.photos.map((photo, pidx) => (
                              <div key={pidx} className="h-20 w-32 flex-shrink-0 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity relative">
                                <Image src={photo} alt={`${milestone.name} photo ${pidx + 1}`} fill className="object-cover" />
                              </div>
                            ))}
                          </div>
                        )}

                        {milestone.paymentStatus === 'due' && (
                          <Link
                            href={`/payment?milestoneId=${milestone.id}&amount=${milestone.amount}&name=${encodeURIComponent(milestone.name)}`}
                            className="mt-4 w-full py-3 bg-black hover:bg-[#ffc300] hover:text-black text-white font-bold uppercase tracking-wide rounded-lg shadow-md transition-all flex items-center justify-center gap-2"
                          >
                            <span className="material-symbols-outlined">payments</span>
                            Pay Now - ${milestone.amount.toLocaleString()}
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

             
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
