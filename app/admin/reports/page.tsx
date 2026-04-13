"use client";

import { useState } from "react";
import Link from "next/link";

// Hardcoded reports data
const reportsData = {
  stats: {
    activeLeads: 124,
    leadGrowth: 12,
    inventoryGaps: 3,
    revenue: 4200000,
    revenueGrowth: 8.5,
    projectsCompleted: 28,
    avgBuildTime: 8.5,
    clientSatisfaction: 4.8
  },
  leads: [
    { id: 1, name: "John Doe", email: "john.d@example.com", interest: "Sunset Villas", budget: "$850k", score: 92, initials: "JD" },
    { id: 2, name: "Jane Smith", email: "jane.s@example.com", interest: "Oakwood Estate", budget: "$1.2M", score: 88, initials: "JS" },
    { id: 3, name: "Robert Brown", email: "robert.b@example.com", interest: "Pine Valley", budget: "$600k", score: 74, initials: "RB" },
    { id: 4, name: "Michael Wilson", email: "m.wilson@example.com", interest: "Lakefront", budget: "$2.5M", score: 95, initials: "MW" },
    { id: 5, name: "Emily Davis", email: "emily.d@example.com", interest: "Sunset Villas", budget: "$900k", score: 65, initials: "ED" }
  ],
  revenueChart: [
    { month: "May", acquisition: 40, sales: 35 },
    { month: "Jun", acquisition: 60, sales: 45 },
    { month: "Jul", acquisition: 35, sales: 30 },
    { month: "Aug", acquisition: 80, sales: 55 },
    { month: "Sep", acquisition: 55, sales: 60 },
    { month: "Oct", acquisition: 70, sales: 75 }
  ],
  marketTrends: [
    { location: "Austin, TX", trend: "up", change: "+12%", avgPrice: "$1.2M" },
    { location: "Seattle, WA", trend: "up", change: "+8%", avgPrice: "$950K" },
    { location: "Denver, CO", trend: "stable", change: "+3%", avgPrice: "$1.5M" },
    { location: "Miami, FL", trend: "up", change: "+15%", avgPrice: "$1.8M" }
  ],
  navItems: [
    { name: "Dashboard", icon: "dashboard", active: true, href: "/admin/reports" },
    { name: "Listings", icon: "inventory_2", href: "/admin/listings" },
    { name: "Leads", icon: "group", href: "/admin/users" },
    { name: "Analytics", icon: "analytics", href: "/admin/reports" },
    { name: "Settings", icon: "settings", href: "#" }
  ],
  milestoneProjects: [
    { id: "SV-002", name: "Sunset Villas - Phase 2", status: "On Track", currentMilestone: "Foundation Pouring", dueDate: "Oct 24" }
  ]
};

export default function AdminReportsPage() {
  const [dateRange, setDateRange] = useState("30d");

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex-col hidden md:flex">
        <div className="p-4 border-b border-gray-100">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#ffc300] flex items-center justify-center text-black rounded">
              <span className="material-symbols-outlined font-bold">construction</span>
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-wide uppercase">RoyConstruction</h1>
              <p className="text-xs text-gray-500">Admin Portal</p>
            </div>
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {reportsData.navItems.map((item) => (
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
              <p className="text-sm font-bold text-black">Tom Cook</p>
              <p className="text-xs text-gray-500">Site Manager</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <nav className="flex items-center gap-2 text-sm mb-2">
                <span className="text-gray-500">Dashboard</span>
                <span className="text-gray-300">/</span>
                <span className="text-black font-bold underline decoration-[#ffc300] decoration-2 underline-offset-4">Overview</span>
              </nav>
              <h1 className="text-3xl font-bold text-black">Executive Summary</h1>
            </div>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 bg-white px-5 py-2.5 text-sm font-bold text-black shadow-sm border border-gray-200 rounded-lg hover:bg-gray-50">
                <span className="material-symbols-outlined text-sm">cloud_download</span>
                Export
              </button>
              
            </div>
          </div>
        </header>

        <div className="p-8">
          {/* Key Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Active Leads */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-black">{reportsData.stats.activeLeads}</span>
                <span className="text-sm font-bold text-green-700 flex items-center bg-green-50 px-2 py-0.5 rounded-full">
                  <span className="material-symbols-outlined text-sm mr-1">trending_up</span>
                  {reportsData.stats.leadGrowth}%
                </span>
              </div>
              <p className="text-xs font-bold uppercase text-gray-500 mt-2">Active Leads</p>
              <div className="absolute right-4 top-4 bg-[#ffc300]/20 p-2 rounded-md">
                <span className="material-symbols-outlined text-[#e6b000]">groups</span>
              </div>
              <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#ffc300] rounded-full" style={{ width: "65%" }}></div>
              </div>
            </div>

            {/* Inventory Gaps */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-black">{reportsData.stats.inventoryGaps}</span>
                <span className="text-sm font-medium text-gray-500">Properties</span>
              </div>
              <p className="text-xs font-bold uppercase text-gray-500 mt-2">Inventory Gaps</p>
              <div className="absolute right-4 top-4 bg-red-50 p-2 text-red-600 rounded-md">
                <span className="material-symbols-outlined">warning</span>
              </div>
              <div className="mt-4">
                <span className="inline-flex items-center bg-red-50 text-red-700 px-2 py-1 text-xs font-bold rounded-md">
                  Critical Alert
                </span>
              </div>
            </div>

            {/* Revenue */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-black">${(reportsData.stats.revenue / 1000000).toFixed(1)}M</span>
                <span className="text-sm font-bold text-green-700 flex items-center bg-green-50 px-2 py-0.5 rounded-full">
                  <span className="material-symbols-outlined text-sm mr-1">trending_up</span>
                  {reportsData.stats.revenueGrowth}%
                </span>
              </div>
              <p className="text-xs font-bold uppercase text-gray-500 mt-2">Total Revenue (YTD)</p>
              <div className="absolute right-4 top-4 bg-[#ffc300]/20 p-2 rounded-md">
                <span className="material-symbols-outlined text-[#e6b000]">payments</span>
              </div>
              <div className="mt-4 text-xs font-medium text-gray-500 bg-gray-50 p-1 px-2 inline-block rounded-md">
                + $250k vs previous period
              </div>
            </div>
          </div>

          {/* Main Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Lead Qualification Table */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-4 bg-white p-3 rounded-lg border-l-4 border-l-[#ffc300] border border-gray-100 shadow-sm pl-4">
                <h2 className="text-lg font-bold text-black">Lead Qualification</h2>
                <button className="text-xs text-gray-600 hover:text-[#ffc300] font-bold uppercase border border-gray-200 px-3 py-1.5 rounded-md hover:border-[#ffc300] transition-colors">
                  View All
                </button>
              </div>
              <div className="bg-white shadow-sm rounded-lg border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Lead Name</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Interest</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">AI Score</th>
                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {reportsData.leads.map((lead) => (
                        <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="h-10 w-10 bg-[#ffc300]/20 flex items-center justify-center text-xs font-bold text-black rounded-none">
                                {lead.initials}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-bold text-black">{lead.name}</div>
                                <div className="text-xs text-gray-500">{lead.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-black">{lead.interest}</div>
                            <div className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-sm inline-block mt-1">{lead.budget} Budget</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full ${
                                    lead.score >= 90 ? 'bg-green-500' :
                                    lead.score >= 75 ? 'bg-green-400' :
                                    lead.score >= 60 ? 'bg-yellow-400' :
                                    'bg-gray-400'
                                  }`}
                                  style={{ width: `${lead.score}%` }}
                                ></div>
                              </div>
                              <span className={`text-sm font-bold ${lead.score >= 60 ? 'text-black' : 'text-gray-500'}`}>{lead.score}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button className="text-black hover:bg-[#ffc300]/10 hover:text-[#ffc300] border border-gray-200 hover:border-[#ffc300]/30 px-3 py-1.5 text-xs font-bold rounded-md transition-colors">
                              Review
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="flex flex-col gap-6">
              {/* Milestone Tracker */}
              <div>
                <h2 className="text-lg font-bold text-black mb-4 bg-[#ffc300] p-3 rounded-lg text-center uppercase tracking-wide shadow-sm">
                  Milestone Tracker
                </h2>
                <div className="bg-white p-6 shadow-sm rounded-lg border border-gray-100">
                  {reportsData.milestoneProjects.map((project) => (
                    <div key={project.id}>
                      <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                        <div>
                          <h3 className="text-base font-bold text-black">{project.name}</h3>
                          <p className="text-xs text-gray-500 font-mono mt-1">ID: #{project.id}</p>
                        </div>
                        <span className="inline-flex items-center bg-green-50 border border-green-100 px-2 py-1 text-xs font-bold uppercase text-green-700 rounded-md">
                          {project.status}
                        </span>
                      </div>
                      <div className="relative pl-4 border-l-2 border-gray-200 space-y-8 my-6 ml-2">
                        <div className="relative">
                          <div className="absolute -left-[21px] top-1 h-4 w-4 bg-[#ffc300] rounded-full border-2 border-white ring-2 ring-[#ffc300]/20"></div>
                          <p className="text-sm font-bold text-black uppercase">{project.currentMilestone}</p>
                          <p className="text-xs text-gray-500 font-medium mt-1">In Progress • Due {project.dueDate}</p>
                        </div>
                        <div className="relative">
                          <div className="absolute -left-[21px] top-1 h-4 w-4 bg-gray-200 rounded-full border-2 border-white"></div>
                          <p className="text-sm font-medium text-gray-400 uppercase">Framing</p>
                          <p className="text-xs text-gray-300 mt-1">Upcoming</p>
                        </div>
                        <div className="relative">
                          <div className="absolute -left-[21px] top-1 h-4 w-4 bg-gray-200 rounded-full border-2 border-white"></div>
                          <p className="text-sm font-medium text-gray-400 uppercase">Roofing</p>
                          <p className="text-xs text-gray-300 mt-1">Upcoming</p>
                        </div>
                      </div>
                      <div className="mt-8 border-2 border-dashed border-gray-300 bg-gray-50 p-6 text-center hover:bg-white hover:border-[#ffc300]/50 transition-colors cursor-pointer group rounded-lg">
                        <span className="material-symbols-outlined text-gray-400 text-3xl mb-2 group-hover:scale-110 group-hover:text-[#ffc300] transition-all">cloud_upload</span>
                        <p className="text-sm font-bold text-black uppercase">Upload Milestone Photos</p>
                        <p className="text-xs text-gray-500 mt-1">JPG, PNG up to 10MB</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Revenue Chart */}
              <div className="bg-white p-6 shadow-sm rounded-lg border border-gray-100">
                <h3 className="text-sm font-bold text-black uppercase tracking-wide mb-4 border-b-2 border-[#ffc300] pb-2 inline-block">
                  Acquisition vs. Sales
                </h3>
                <div className="flex items-end justify-between h-32 gap-3 mt-4 px-2">
                  {reportsData.revenueChart.map((data, idx) => (
                    <div key={idx} className="w-full relative group">
                      <div className="bg-gray-100 h-full rounded-t-sm relative">
                        <div 
                          className="absolute bottom-0 w-full bg-[#ffc300] transition-all duration-300 group-hover:bg-[#ffc300]/80 rounded-t-sm"
                          style={{ height: `${data.acquisition}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-center mt-2 text-gray-400 font-bold">{data.month}</p>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-center gap-4 mt-4 text-xs">
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 bg-[#ffc300] rounded-sm"></span>
                    Acquisition
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 bg-gray-800 rounded-sm"></span>
                    Sales
                  </span>
                </div>
              </div>

              {/* Market Trends */}
              <div className="bg-white p-6 shadow-sm rounded-lg border border-gray-100">
                <h3 className="text-sm font-bold text-black uppercase tracking-wide mb-4 border-b-2 border-[#ffc300] pb-2 inline-block">
                  Market Trends
                </h3>
                <div className="space-y-3">
                  {reportsData.marketTrends.map((trend, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-black">{trend.location}</p>
                        <p className="text-xs text-gray-500">Avg: {trend.avgPrice}</p>
                      </div>
                      <span className={`text-sm font-bold flex items-center gap-1 ${
                        trend.trend === 'up' ? 'text-green-600' : 'text-gray-500'
                      }`}>
                        <span className="material-symbols-outlined text-sm">
                          {trend.trend === 'up' ? 'trending_up' : 'trending_flat'}
                        </span>
                        {trend.change}
                      </span>
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
