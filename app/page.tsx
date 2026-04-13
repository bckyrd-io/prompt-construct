"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

// Hardcoded property catalog data
const propertiesData = {
    featured: [
        {
            id: "RC-2024-88",
            name: "The Highlands Estate",
            location: "Austin, TX",
            price: "$1,200,000",
            beds: 4,
            baths: 3.5,
            sqft: 3200,
            type: "NEW LISTING",
            image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
            status: "In Progress",
            progress: 65
        },
        {
            id: "RC-2024-92",
            name: "Urban Loft Project",
            location: "Seattle, WA",
            price: "$850,000",
            beds: 2,
            baths: 2,
            sqft: 1800,
            type: "PERMIT READY",
            image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800",
            status: "Ready to Build",
            progress: 100
        },
        {
            id: "RC-2024-105",
            name: "Rocky Mountain Estate",
            location: "Denver, CO",
            price: "$2,400,000",
            beds: 5,
            baths: 4,
            sqft: 4500,
            acres: 5,
            type: "LAND ONLY",
            image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800",
            status: "Available",
            progress: 0
        }
    ],
    catalog: [
        {
            id: "RC-2024-110",
            name: "Sunset Valley Villa",
            location: "Phoenix, AZ",
            price: "$950,000",
            beds: 3,
            baths: 2.5,
            sqft: 2400,
            type: "NEW LISTING",
            image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
            status: "Available",
            progress: 0
        },
        {
            id: "RC-2024-115",
            name: "Coastal Haven",
            location: "Miami, FL",
            price: "$1,850,000",
            beds: 4,
            baths: 3.5,
            sqft: 3800,
            type: "WATERFRONT",
            image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800",
            status: "In Progress",
            progress: 45
        },
        {
            id: "RC-2024-120",
            name: "Desert Oasis Ranch",
            location: "Scottsdale, AZ",
            price: "$1,100,000",
            beds: 3,
            baths: 2,
            sqft: 2100,
            acres: 2.5,
            type: "RANCH STYLE",
            image: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800",
            status: "Available",
            progress: 0
        },
        {
            id: "RC-2024-125",
            name: "Mountain View Estate",
            location: "Boulder, CO",
            price: "$1,650,000",
            beds: 4,
            baths: 3,
            sqft: 3100,
            type: "MOUNTAIN VIEW",
            image: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6b3?w=800",
            status: "Available",
            progress: 0
        },
        {
            id: "RC-2024-130",
            name: "Lakefront Paradise",
            location: "Lake Tahoe, NV",
            price: "$2,800,000",
            beds: 5,
            baths: 4.5,
            sqft: 5200,
            type: "LAKEFRONT",
            image: "https://images.unsplash.com/photo-1602343168117-bb8ffe3e2e9f?w=800",
            status: "Available",
            progress: 0
        },
        {
            id: "RC-2024-135",
            name: "Modern Minimalist",
            location: "Portland, OR",
            price: "$780,000",
            beds: 2,
            baths: 2,
            sqft: 1650,
            type: "MODERN",
            image: "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=800",
            status: "Ready to Build",
            progress: 100
        }
    ],
    quickActions: [
        { icon: "landscape", label: "Find Land", description: "Browse available plots" },
        { icon: "calculate", label: "Estimate Cost", description: "Get build estimates" },
        { icon: "architecture", label: "Browse Designs", description: "Modern blueprints" }
    ]
};

export default function Home() {
    const [searchQuery, setSearchQuery] = useState("");

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-sm ">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        <div className="flex items-center gap-3">
                            <div className="bg-[#ffc300] p-2 text-black rounded-lg">
                                <span className="material-symbols-outlined text-3xl">construction</span>
                            </div>
                            <span className="text-xl font-bold tracking-tight text-black uppercase">
                                Roy<span className="text-[#e6b000]">Construction</span>
                            </span>
                        </div>

                        <div className="flex items-center gap-4">
                            <Link
                                href="/auth"
                                className="hidden sm:flex items-center gap-2 px-6 py-3 bg-black hover:bg-[#ffc300] hover:text-black text-white text-sm font-bold transition-all rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                            >
                                <span className="material-symbols-outlined text-xl">person</span>
                                <span>Client Login</span>
                            </Link>

                        </div>
                    </div>
                </div>
            </header>

            {/* Hero Section with AI Search */}
            <section className="relative pt-16 pb-24 lg:pt-32 lg:pb-32 px-4 overflow-hidden bg-white">
                <div className="absolute inset-0 opacity-50" style={{
                    backgroundColor: '#ffffff',
                    backgroundImage: 'radial-gradient(#e5e7eb 1px, transparent 1px)',
                    backgroundSize: '24px 24px'
                }}></div>
                <div className="max-w-4xl mx-auto relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gray-50 text-black text-xs font-bold uppercase tracking-wider mb-8 rounded-full shadow-sm ring-1 ring-gray-100">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full bg-[#ffc300] opacity-75 rounded-full"></span>
                            <span className="relative inline-flex h-2 w-2 bg-[#ffc300] rounded-full"></span>
                        </span>
                        Agentic AI Powered
                    </div>
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-black leading-none mb-6 tracking-tight uppercase">
                        Build Your Vision <br />
                        <span className="bg-[#ffc300]/20 text-black px-4 rounded-lg inline-block mt-2 transform -skew-x-3">
                            with Agentic AI
                        </span>
                    </h1>
                    <p className="text-lg md:text-xl text-[#555555] mb-10 max-w-2xl mx-auto leading-relaxed font-medium">
                        Describe your dream property. Our AI matches land, architectural designs, and construction plans instantly.
                    </p>
                    <div className="w-full max-w-2xl mx-auto">
                        <div className="relative group">
                            <div className="relative flex items-center bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 p-2 transition-shadow hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
                                <div className="flex items-center justify-center pl-3 pr-2 text-[#ffc300]">
                                    <span className="material-symbols-outlined">auto_awesome</span>
                                </div>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-transparent border-0 focus:ring-0 text-black placeholder-gray-400 text-base md:text-lg h-12 md:h-14 font-medium outline-none"
                                    placeholder="Try: 'Find me a 2-acre lot for a mid-century modern home...'"
                                />
                                <Link
                                    href="/chat"
                                    className="bg-[#ffc300] hover:bg-[#e6b000] text-black p-2 md:px-6 md:py-2 h-10 md:h-12 font-bold uppercase tracking-wide flex items-center justify-center transition-all rounded-lg shadow-sm hover:shadow-md whitespace-nowrap"
                                >

                                    <span className="material-symbols-outlined">arrow_upward</span>
                                </Link>
                            </div>
                        </div>
                        <div className="mt-8 flex flex-wrap justify-center gap-4">
                            {propertiesData.quickActions.map((action, idx) => (
                                <button
                                    key={idx}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-gray-50 text-sm text-black font-bold transition-all shadow-sm hover:shadow-md border border-gray-200 rounded-lg group"
                                >
                                    <span className="material-symbols-outlined text-[#ffc300] text-[20px]">{action.icon}</span>
                                    {action.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Properties */}
            <section className="py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-black text-black mb-2 uppercase">Featured Opportunities</h2>
                        <p className="text-[#555555] font-medium">Premium properties selected by our AI for high investment potential</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {propertiesData.featured.map((property) => (
                            <div key={property.id} className="group bg-white flex flex-col h-full rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden">
                                <div className="relative h-64 overflow-hidden">
                                    <div className="absolute top-4 left-4 z-10 bg-[#ffc300] text-black text-xs font-black px-3 py-1.5 uppercase tracking-wide rounded-md shadow-sm">
                                        {property.type}
                                    </div>
                                    <div className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur text-black text-xs font-bold px-3 py-1.5 flex items-center gap-1 rounded-md shadow-sm">
                                        <span className="material-symbols-outlined text-sm">location_on</span>
                                        {property.location}
                                    </div>
                                    <div className="h-full w-full relative">
                                        <Image
                                            src={property.image}
                                            alt={property.name}
                                            fill
                                            className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                                        />
                                    </div>
                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 flex justify-between items-end">
                                        <h3 className="text-lg font-black text-white uppercase drop-shadow-md">{property.name}</h3>
                                        <p className="text-black font-mono font-bold bg-[#ffc300] px-2 py-1 rounded text-sm">{property.price}</p>
                                    </div>
                                </div>
                                <div className="p-6 flex-1 flex flex-col justify-between bg-white">
                                    <div className="grid grid-cols-3 gap-3 mb-6">
                                        <div className="flex flex-col items-center p-2 bg-gray-50 rounded-lg">
                                            <span className="material-symbols-outlined text-black mb-1">bed</span>
                                            <span className="text-sm font-bold text-black">{property.beds} Beds</span>
                                        </div>
                                        <div className="flex flex-col items-center p-2 bg-gray-50 rounded-lg">
                                            <span className="material-symbols-outlined text-black mb-1">shower</span>
                                            <span className="text-sm font-bold text-black">{property.baths} Baths</span>
                                        </div>
                                        <div className="flex flex-col items-center p-2 bg-gray-50 rounded-lg">
                                            <span className="material-symbols-outlined text-black mb-1">square_foot</span>
                                            <span className="text-sm font-bold text-black">{property.sqft.toLocaleString()} sqft</span>
                                        </div>
                                    </div>
                                    <div className="mb-4">
                                        <div className="flex justify-between text-xs font-bold uppercase mb-2">
                                            <span>Status: {property.status}</span>
                                            {property.progress > 0 && <span>{property.progress}% Complete</span>}
                                        </div>
                                        {property.progress > 0 && (
                                            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                                <div
                                                    className="bg-[#ffc300] h-full rounded-full transition-all"
                                                    style={{ width: `${property.progress}%` }}
                                                ></div>
                                            </div>
                                        )}
                                    </div>
                                    <Link
                                        href={`/apply?property=${property.id}`}
                                        className="w-full py-3 bg-black text-white hover:bg-[#ffc300] hover:text-black font-bold transition-colors text-sm uppercase tracking-wider rounded-lg shadow-md hover:shadow-lg text-center"
                                    >
                                        View Blueprint
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Full Property Catalog */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
                        <div>
                            <h2 className="text-4xl font-black text-black mb-2 uppercase">Curated Opportunities</h2>
                            <p className="text-[#555555] font-medium text-lg">High-potential properties pre-vetted for construction.</p>
                        </div>
                        <Link
                            href="/recommendations"
                            className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-black font-bold hover:bg-black hover:text-white transition-all shadow-md hover:shadow-lg rounded-lg transform hover:-translate-y-0.5"
                        >
                            View all listings
                            <span className="material-symbols-outlined">arrow_forward</span>
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {propertiesData.catalog.map((property) => (
                            <div key={property.id} className="group bg-white flex flex-col h-full rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden">
                                <div className="relative h-64 overflow-hidden">
                                    <div className="absolute top-4 left-4 z-10 bg-black text-white text-xs font-black px-3 py-1.5 uppercase tracking-wide rounded-md shadow-sm">
                                        {property.type}
                                    </div>
                                    <div className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur text-black text-xs font-bold px-3 py-1.5 flex items-center gap-1 rounded-md shadow-sm">
                                        <span className="material-symbols-outlined text-sm">location_on</span>
                                        {property.location}
                                    </div>
                                    <div className="h-full w-full relative">
                                        <Image
                                            src={property.image}
                                            alt={property.name}
                                            fill
                                            className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                                        />
                                    </div>
                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 flex justify-between items-end">
                                        <h3 className="text-lg font-black text-white uppercase drop-shadow-md">{property.name}</h3>
                                        <p className="text-black font-mono font-bold bg-[#ffc300] px-2 py-1 rounded text-sm">{property.price}</p>
                                    </div>
                                </div>
                                <div className="p-6 flex-1 flex flex-col justify-between bg-white">
                                    <div className="grid grid-cols-3 gap-3 mb-6">
                                        <div className="flex flex-col items-center p-2 bg-gray-50 rounded-lg">
                                            <span className="material-symbols-outlined text-black mb-1">bed</span>
                                            <span className="text-sm font-bold text-black">{property.beds} Beds</span>
                                        </div>
                                        <div className="flex flex-col items-center p-2 bg-gray-50 rounded-lg">
                                            <span className="material-symbols-outlined text-black mb-1">shower</span>
                                            <span className="text-sm font-bold text-black">{property.baths} Baths</span>
                                        </div>
                                        <div className="flex flex-col items-center p-2 bg-gray-50 rounded-lg">
                                            <span className="material-symbols-outlined text-black mb-1">square_foot</span>
                                            <span className="text-sm font-bold text-black">{property.sqft.toLocaleString()} sqft</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Link
                                            href={`/apply?property=${property.id}`}
                                            className="flex-1 py-3 bg-black text-white hover:bg-[#ffc300] hover:text-black font-bold transition-colors text-sm uppercase tracking-wider rounded-lg shadow-md hover:shadow-lg text-center"
                                        >
                                            View Details
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-black text-black mb-2 uppercase">How It Works</h2>
                        <p className="text-[#555555] font-medium">Three simple steps to your dream property</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { step: "1", title: "AI Matchmaking", desc: "Our agentic AI scans thousands of listings and zoning laws to find properties that match your vision perfectly.", icon: "psychology" },
                            { step: "2", title: "Instant Feasibility", desc: "Get immediate construction cost estimates, timeline projections, and architectural compatibility checks.", icon: "design_services" },
                            { step: "3", title: "Build & Track", desc: "Watch your project come to life. Track milestones, approve changes, and view drone footage from your dashboard.", icon: "analytics" }
                        ].map((item, idx) => (
                            <div key={idx} className="relative p-8 bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 group border border-gray-100">
                                <div className="absolute -top-4 -left-4 w-12 h-12 bg-[#ffc300] rounded-lg flex items-center justify-center font-black text-black text-lg z-10 shadow-lg shadow-[#ffc300]/30">
                                    {item.step}
                                </div>
                                <div className="mt-2">
                                    <h3 className="text-xl font-black text-black mb-3 uppercase tracking-wide">{item.title}</h3>
                                    <p className="text-[#555555] text-sm leading-relaxed font-medium">{item.desc}</p>
                                </div>
                                <div className="mt-6 flex justify-end border-t border-gray-100 pt-4">
                                    <span className="material-symbols-outlined text-gray-300 text-4xl group-hover:text-[#ffc300] transition-colors">{item.icon}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="mt-auto bg-gray-50 text-black">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                 
                    <div className="border-t border-gray-200 mt-0 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-[#555555] font-bold">
                        <p>&copy; 2026 RoyConstruction. All rights reserved.</p>
                        <div className="flex gap-6 mt-4 md:mt-0">
                            <Link href="#" className="hover:text-[#ffc300] transition-colors">Privacy Policy</Link>
                            <Link href="#" className="hover:text-[#ffc300] transition-colors">Terms of Service</Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
