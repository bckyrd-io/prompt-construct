"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

// Hardcoded admin listings data
const adminListingsData = {
  stats: {
    totalListings: 48,
    activeProjects: 12,
    pendingApprovals: 5,
    inventoryValue: 28400000
  },
  listings: [
    {
      id: "RC-2024-88",
      name: "The Highlands Estate",
      location: "Austin, TX",
      price: 1200000,
      type: "Residential",
      status: "active",
      progress: 65,
      client: "James Roy",
      image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400",
      milestones: [
        { name: "Site Clearing", completed: true },
        { name: "Foundation", completed: true },
        { name: "Framing", completed: false, current: true },
        { name: "Roofing", completed: false },
        { name: "Interior", completed: false }
      ]
    },
    {
      id: "RC-2024-92",
      name: "Urban Loft Project",
      location: "Seattle, WA",
      price: 850000,
      type: "Residential",
      status: "available",
      progress: 0,
      client: null,
      image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400",
      milestones: []
    },
    {
      id: "RC-2024-105",
      name: "Rocky Mountain Estate",
      location: "Denver, CO",
      price: 2400000,
      type: "Land",
      status: "available",
      progress: 0,
      client: null,
      image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400",
      milestones: []
    },
    {
      id: "RC-2024-115",
      name: "Coastal Haven",
      location: "Miami, FL",
      price: 1850000,
      type: "Waterfront",
      status: "active",
      progress: 45,
      client: "Maria Santos",
      image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400",
      milestones: [
        { name: "Site Prep", completed: true },
        { name: "Foundation", completed: true },
        { name: "Framing", completed: false, current: true },
        { name: "Roofing", completed: false }
      ]
    },
    {
      id: "RC-2024-130",
      name: "Lakefront Paradise",
      location: "Lake Tahoe, NV",
      price: 2800000,
      type: "Waterfront",
      status: "pending",
      progress: 0,
      client: null,
      image: "https://images.unsplash.com/photo-1602343168117-bb8ffe3e2e9f?w=400",
      milestones: []
    },
    {
      id: "RC-2024-145",
      name: "Desert Springs Villa",
      location: "Phoenix, AZ",
      price: 950000,
      type: "Residential",
      status: "completed",
      progress: 100,
      client: "Robert Chen",
      image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400",
      milestones: [
        { name: "Construction", completed: true },
        { name: "Inspection", completed: true },
        { name: "Handover", completed: true }
      ]
    }
  ],
  navItems: [
    { name: "Dashboard", icon: "dashboard", href: "/admin/reports" },
    { name: "Listings", icon: "inventory_2", active: true, href: "/admin/listings" },
    { name: "Leads", icon: "group", href: "/admin/users" },
    { name: "Analytics", icon: "analytics", href: "/admin/reports" },
    { name: "Settings", icon: "settings", href: "#" }
  ]
};

export default function AdminListingsPage() {
  const [filter, setFilter] = useState("all");
  const [selectedListing, setSelectedListing] = useState<string | null>(null);

  const filteredListings = adminListingsData.listings.filter(listing => {
    if (filter === "all") return true;
    return listing.status === filter;
  });

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
          {adminListingsData.navItems.map((item) => (
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
          <div className="flex items-center justify-between">
            <div>
              <nav className="flex items-center gap-2 text-sm mb-2">
                <Link href="/admin/reports" className="text-gray-500 hover:text-black">Dashboard</Link>
                <span className="text-gray-300">/</span>
                <span className="text-black font-bold underline decoration-[#ffc300] decoration-2 underline-offset-4">Listings</span>
              </nav>
              <h1 className="text-3xl font-bold text-black">Property Listings Management</h1>
            </div>
            <button className="flex items-center gap-2 bg-[#ffc300] hover:bg-[#e6b000] text-black px-5 py-2.5 rounded-lg font-bold shadow-sm transition-colors">
              <span className="material-symbols-outlined">add</span>
              New Listing
            </button>
          </div>
        </header>

        <div className="p-8">
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              { label: "Total Listings", value: adminListingsData.stats.totalListings, icon: "inventory_2", color: "bg-blue-50 text-blue-600" },
              { label: "Active Projects", value: adminListingsData.stats.activeProjects, icon: "construction", color: "bg-green-50 text-green-600" },
              { label: "Pending Approvals", value: adminListingsData.stats.pendingApprovals, icon: "pending", color: "bg-[#ffc300]/20 text-[#e6b000]" },
              { label: "Inventory Value", value: `$${(adminListingsData.stats.inventoryValue / 1000000).toFixed(1)}M`, icon: "attach_money", color: "bg-purple-50 text-purple-600" }
            ].map((stat, idx) => (
              <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase text-gray-500 tracking-wide">{stat.label}</p>
                    <p className="text-3xl font-bold text-black mt-1">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.color}`}>
                    <span className="material-symbols-outlined">{stat.icon}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex bg-white rounded-lg shadow-sm border border-gray-200 p-1">
              {["all", "available", "active", "pending", "completed"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-md text-sm font-bold uppercase transition-all ${
                    filter === f 
                      ? "bg-[#ffc300] text-black" 
                      : "text-gray-500 hover:text-black"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
            <div className="flex-1"></div>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Search listings..."
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#ffc300] outline-none"
              />
              <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                <span className="material-symbols-outlined text-gray-500">filter_list</span>
              </button>
            </div>
          </div>

          {/* Listings Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredListings.map((listing) => (
              <div key={listing.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="flex">
                  <div className="relative w-48 h-40 flex-shrink-0">
                    <Image 
                      src={listing.image} 
                      alt={listing.name}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-2 left-2">
                      <span className={`px-2 py-1 text-xs font-bold uppercase rounded-md ${
                        listing.status === 'active' ? 'bg-green-500 text-white' :
                        listing.status === 'available' ? 'bg-[#ffc300] text-black' :
                        listing.status === 'pending' ? 'bg-orange-500 text-white' :
                        'bg-gray-500 text-white'
                      }`}>
                        {listing.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-black">{listing.name}</h3>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">location_on</span>
                          {listing.location}
                        </p>
                      </div>
                      <p className="text-lg font-black text-[#ffc300]">${listing.price.toLocaleString()}</p>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                      <span>{listing.type}</span>
                      {listing.client && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">person</span>
                            {listing.client}
                          </span>
                        </>
                      )}
                    </div>

                    {listing.progress > 0 && (
                      <div className="mb-3">
                        <div className="flex justify-between text-xs font-bold uppercase mb-1">
                          <span>Progress</span>
                          <span>{listing.progress}%</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-[#ffc300] rounded-full"
                            style={{ width: `${listing.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {/* Milestone Editor */}
                    {listing.status === 'active' && listing.milestones.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-xs font-bold uppercase text-gray-400 mb-2">Milestones</p>
                        <div className="flex flex-wrap gap-2">
                          {listing.milestones.map((milestone, idx) => (
                            <span 
                              key={idx}
                              className={`px-2 py-1 text-xs rounded-full flex items-center gap-1 ${
                                milestone.completed 
                                  ? 'bg-green-100 text-green-700' 
                                  : milestone.current
                                  ? 'bg-[#ffc300] text-black'
                                  : 'bg-gray-100 text-gray-400'
                              }`}
                            >
                              <span className="material-symbols-outlined text-xs">
                                {milestone.completed ? 'check' : milestone.current ? 'schedule' : 'pending'}
                              </span>
                              {milestone.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2 mt-3">
                      <button className="flex-1 py-2 bg-black hover:bg-[#ffc300] hover:text-black text-white text-xs font-bold uppercase rounded-lg transition-colors">
                        Edit
                      </button>
                      {listing.status === 'active' && (
                        <button className="px-3 py-2 bg-[#ffc300] hover:bg-[#e6b000] text-black text-xs font-bold uppercase rounded-lg transition-colors">
                          <span className="material-symbols-outlined text-sm">photo_camera</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredListings.length === 0 && (
            <div className="text-center py-16">
              <div className="bg-gray-100 p-6 rounded-full inline-block mb-4">
                <span className="material-symbols-outlined text-4xl text-gray-400">inventory_2</span>
              </div>
              <h3 className="text-xl font-bold text-black mb-2">No listings found</h3>
              <p className="text-gray-500 mb-4">Try adjusting your filters or create a new listing</p>
              <button className="px-6 py-3 bg-[#ffc300] hover:bg-[#e6b000] text-black font-bold rounded-lg">
                Create New Listing
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
