"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

// Navigation items for client sidebar
const navItems = [
  { name: "Dashboard", icon: "dashboard", href: "/dashboard" },
  { name: "Recommendations", icon: "recommend", active: true, href: "/recommendations" },
  { name: "My Projects", icon: "construction", href: "/dashboard" },
  { name: "Messages", icon: "chat", href: "/chat" },
  { name: "Settings", icon: "settings", href: "#" }
];

// Hardcoded recommendations data
const recommendationsData = {
  filters: [
    { name: "Location", options: ["All Locations", "Austin, TX", "Seattle, WA", "Denver, CO", "Miami, FL"] },
    { name: "Property Type", options: ["All Types", "Residential", "Commercial", "Land Only", "Waterfront"] },
    { name: "Price Range", options: ["Any Price", "Under $500K", "$500K - $1M", "$1M - $2M", "$2M+"] },
    { name: "Status", options: ["All Status", "Available", "In Progress", "Ready to Build", "Completed"] }
  ],
  matches: [
    {
      id: "RC-2024-88",
      name: "The Highlands Estate",
      location: "Austin, TX",
      price: 1200000,
      displayPrice: "$1,200,000",
      beds: 4,
      baths: 3.5,
      sqft: 3200,
      acres: 2.5,
      type: "Residential",
      subtype: "Modern Estate",
      status: "In Progress",
      progress: 65,
      image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
      matchScore: 98,
      aiTags: ["Perfect for families", "High appreciation potential", "Premium location"],
      features: ["Smart home ready", "Solar compatible", "EV charging"],
      constructionEstimate: "$650,000 - $750,000",
      timeline: "6-8 months remaining"
    },
    {
      id: "RC-2024-92",
      name: "Urban Loft Project",
      location: "Seattle, WA",
      price: 850000,
      displayPrice: "$850,000",
      beds: 2,
      baths: 2,
      sqft: 1800,
      acres: 0.15,
      type: "Residential",
      subtype: "Urban Modern",
      status: "Ready to Build",
      progress: 100,
      image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800",
      matchScore: 94,
      aiTags: ["City living", "Transit accessible", "Investment opportunity"],
      features: ["Rooftop deck", "Floor-to-ceiling windows", "Open concept"],
      constructionEstimate: "$425,000 - $475,000",
      timeline: "5-6 months to complete"
    },
    {
      id: "RC-2024-105",
      name: "Rocky Mountain Estate",
      location: "Denver, CO",
      price: 2400000,
      displayPrice: "$2,400,000",
      beds: 5,
      baths: 4,
      sqft: 4500,
      acres: 5.0,
      type: "Residential",
      subtype: "Mountain Retreat",
      status: "Available",
      progress: 0,
      image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800",
      matchScore: 91,
      aiTags: ["Scenic views", "Privacy guaranteed", "Luxury living"],
      features: ["Mountain views", "Private well", "Horse stable potential"],
      constructionEstimate: "$1.2M - $1.5M",
      timeline: "12-14 months estimated"
    },
    {
      id: "RC-2024-110",
      name: "Sunset Valley Villa",
      location: "Phoenix, AZ",
      price: 950000,
      displayPrice: "$950,000",
      beds: 3,
      baths: 2.5,
      sqft: 2400,
      acres: 1.2,
      type: "Residential",
      subtype: "Desert Modern",
      status: "Available",
      progress: 0,
      image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
      matchScore: 89,
      aiTags: ["Energy efficient", "Pool ready", "Entertainment space"],
      features: ["Xeriscape ready", "Solar optimized", "Outdoor kitchen space"],
      constructionEstimate: "$500,000 - $600,000",
      timeline: "7-9 months estimated"
    },
    {
      id: "RC-2024-115",
      name: "Coastal Haven",
      location: "Miami, FL",
      price: 1850000,
      displayPrice: "$1,850,000",
      beds: 4,
      baths: 3.5,
      sqft: 3800,
      acres: 0.5,
      type: "Waterfront",
      subtype: "Ocean View",
      status: "In Progress",
      progress: 45,
      image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800",
      matchScore: 87,
      aiTags: ["Waterfront access", "Premium location", "Vacation rental potential"],
      features: ["Private dock space", "Hurricane resistant design", "Infinity pool ready"],
      constructionEstimate: "$900,000 - $1.1M",
      timeline: "8-10 months remaining"
    },
    {
      id: "RC-2024-120",
      name: "Desert Oasis Ranch",
      location: "Scottsdale, AZ",
      price: 1100000,
      displayPrice: "$1,100,000",
      beds: 3,
      baths: 2,
      sqft: 2100,
      acres: 2.5,
      type: "Residential",
      subtype: "Ranch Style",
      status: "Available",
      progress: 0,
      image: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800",
      matchScore: 85,
      aiTags: ["Ranch living", "Equestrian potential", "Stargazing views"],
      features: ["Acreage privacy", "Native landscaping", "Guest house pad"],
      constructionEstimate: "$550,000 - $650,000",
      timeline: "6-8 months estimated"
    }
  ],
  aiInsights: {
    summary: "Based on your preferences for modern architecture, family-friendly spaces, and locations with strong appreciation potential, I've found 6 high-match properties.",
    marketTrend: "Austin and Seattle markets showing 8-12% annual appreciation",
    recommendation: "Consider The Highlands Estate for immediate value, or Urban Loft for rental income potential."
  }
};

export default function RecommendationsPage() {
  const [activeFilters, setActiveFilters] = useState({
    location: "All Locations",
    type: "All Types",
    price: "Any Price",
    status: "All Status"
  });
  const [sortBy, setSortBy] = useState("match");

  const filteredMatches = recommendationsData.matches.filter(match => {
    if (activeFilters.location !== "All Locations" && !match.location.includes(activeFilters.location.split(",")[0])) return false;
    if (activeFilters.type !== "All Types" && match.type !== activeFilters.type) return false;
    return true;
  }).sort((a, b) => {
    if (sortBy === "match") return b.matchScore - a.matchScore;
    if (sortBy === "price-low") return a.price - b.price;
    if (sortBy === "price-high") return b.price - a.price;
    return 0;
  });

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
                <Link href="/dashboard" className="text-gray-500 hover:text-black">Dashboard</Link>
                <span className="text-gray-300">/</span>
                <span className="text-black font-bold underline decoration-[#ffc300] decoration-2 underline-offset-4">Recommendations</span>
              </nav>
              <h1 className="text-3xl font-bold text-black">AI Property Recommendations</h1>
            </div>
            <div className="flex gap-3">
              <Link 
                href="/chat"
                className="flex items-center gap-2 bg-white px-5 py-2.5 text-sm font-bold text-black shadow-sm border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <span className="material-symbols-outlined text-sm">chat</span>
                New Search
              </Link>
              <Link 
                href="/apply"
                className="flex items-center gap-2 bg-[#ffc300] hover:bg-[#e6b000] px-5 py-2.5 text-sm font-bold text-black shadow-sm rounded-lg transition-colors"
              >
                <span className="material-symbols-outlined text-sm">add</span>
                Start Application
              </Link>
            </div>
          </div>
        </header>

        <div className="p-8">
            {/* AI Insights Banner */}
          <div className="bg-gradient-to-r from-black to-gray-900 text-white py-6 px-6 rounded-xl mb-8">
            <div className="flex items-start gap-4">
              <div className="bg-[#ffc300]/20 p-3 rounded-full flex-shrink-0">
                <span className="material-symbols-outlined text-[#ffc300] text-2xl">psychology</span>
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold mb-1 flex items-center gap-2">
                  AI-Powered Recommendations
                  <span className="bg-[#ffc300] text-black text-xs px-2 py-0.5 rounded-full">{filteredMatches.length} Matches</span>
                </h2>
                <p className="text-gray-300 text-sm mb-3">{recommendationsData.aiInsights.summary}</p>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-white/10 text-xs px-3 py-1 rounded-full flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">trending_up</span>
                    {recommendationsData.aiInsights.marketTrend}
                  </span>
                  <span className="bg-[#ffc300]/20 text-[#ffc300] text-xs px-3 py-1 rounded-full flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">lightbulb</span>
                    {recommendationsData.aiInsights.recommendation}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Filters & Sort */}
          <div className="flex flex-col lg:flex-row gap-4 mb-8">
            <div className="flex-1 flex flex-wrap gap-2">
              {recommendationsData.filters.map((filter) => (
                <select 
                  key={filter.name}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-[#ffc300] outline-none"
                  value={activeFilters[filter.name.toLowerCase() as keyof typeof activeFilters] || "All"}
                  onChange={(e) => setActiveFilters(prev => ({ ...prev, [filter.name.toLowerCase()]: e.target.value }))}
                >
                  <option value={filter.options[0]}>{filter.name}</option>
                  {filter.options.slice(1).map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Sort by:</span>
              <select 
                className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-[#ffc300] outline-none"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="match">AI Match Score</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Results Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredMatches.map((property) => (
            <div key={property.id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group">
              <div className="relative h-56">
                <Image 
                  src={property.image} 
                  alt={property.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-4 left-4 bg-[#ffc300] text-black text-sm font-black px-3 py-1.5 rounded-lg shadow-md flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">star</span>
                  {property.matchScore}% Match
                </div>
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur text-black text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm">
                  {property.status}
                </div>
                {property.progress > 0 && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    <div className="flex justify-between text-white text-xs font-bold mb-1">
                      <span>Construction Progress</span>
                      <span>{property.progress}%</span>
                    </div>
                    <div className="w-full bg-white/30 h-2 rounded-full overflow-hidden">
                      <div className="bg-[#ffc300] h-full rounded-full" style={{ width: `${property.progress}%` }}></div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-xl font-black text-black uppercase">{property.name}</h3>
                    <p className="text-gray-500 text-sm flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">location_on</span>
                      {property.location}
                    </p>
                  </div>
                  <p className="text-2xl font-black text-[#ffc300]">{property.displayPrice}</p>
                </div>

                {/* AI Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {property.aiTags.map((tag, idx) => (
                    <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs text-[#ffc300]">check_circle</span>
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Property Specs */}
                <div className="grid grid-cols-4 gap-2 mb-4">
                  <div className="text-center p-2 bg-gray-50 rounded-lg">
                    <span className="material-symbols-outlined text-[#ffc300] text-lg">bed</span>
                    <p className="text-xs font-bold text-black">{property.beds}</p>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded-lg">
                    <span className="material-symbols-outlined text-[#ffc300] text-lg">shower</span>
                    <p className="text-xs font-bold text-black">{property.baths}</p>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded-lg">
                    <span className="material-symbols-outlined text-[#ffc300] text-lg">square_foot</span>
                    <p className="text-xs font-bold text-black">{(property.sqft / 1000).toFixed(1)}k</p>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded-lg">
                    <span className="material-symbols-outlined text-[#ffc300] text-lg">landscape</span>
                    <p className="text-xs font-bold text-black">{property.acres}ac</p>
                  </div>
                </div>

                {/* AI Estimates */}
                <div className="bg-gradient-to-r from-gray-50 to-white p-4 rounded-lg border border-gray-100 mb-4">
                  <h4 className="text-xs font-bold uppercase text-gray-400 mb-2 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">calculate</span>
                    AI Construction Estimate
                  </h4>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-lg font-black text-black">{property.constructionEstimate}</p>
                      <p className="text-xs text-gray-500">{property.timeline}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Total Investment</p>
                      <p className="text-sm font-bold text-black">
                        ${((property.price + parseInt(property.constructionEstimate.replace(/[^0-9]/g, "").slice(0, 6))) / 1000000).toFixed(1)}M - ${((property.price + parseInt(property.constructionEstimate.replace(/[^0-9]/g, "").slice(-6))) / 1000000).toFixed(1)}M
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Link 
                    href={`/apply?property=${property.id}`}
                    className="flex-1 py-3 bg-black hover:bg-[#ffc300] hover:text-black text-white font-bold transition-colors text-sm uppercase rounded-lg text-center"
                  >
                    View Details
                  </Link>
                  <Link 
                    href={`/payment?property=${property.id}`}
                    className="px-4 py-3 bg-[#ffc300] hover:bg-[#e6b000] text-black font-bold transition-colors rounded-lg"
                  >
                    <span className="material-symbols-outlined">payments</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

          {/* Empty State */}
          {filteredMatches.length === 0 && (
            <div className="text-center py-16">
              <div className="bg-gray-100 p-6 rounded-full inline-block mb-4">
                <span className="material-symbols-outlined text-4xl text-gray-400">search_off</span>
              </div>
              <h3 className="text-xl font-bold text-black mb-2">No matches found</h3>
              <p className="text-gray-500 mb-4">Try adjusting your filters or start a new AI chat</p>
              <Link href="/chat" className="px-6 py-3 bg-[#ffc300] hover:bg-[#e6b000] text-black font-bold rounded-lg inline-flex items-center gap-2">
                <span className="material-symbols-outlined">chat</span>
                Start New Search
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
