"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { HardHat } from "lucide-react";

// Dummy project data (merge completed, in-progress, service, etc.)
const allProjects = [
  // Completed
  { img: "/after-construction.jpg", title: "After Construction", date: "2025-08-28", location: "Lilongwe Central", desc: "Completed staircase with safety-first design and premium finishes.", tags: "#Staircase #Safety", type: "completed" },
  { img: "/window.jpg", title: "Window Replacement", date: "2025-08-24", location: "Area 49", desc: "Custom welded slatted gate combining aesthetics and security.", tags: "#Gate #Welding", type: "completed" },
  // In Progress
  { img: "/morden-cladding.jpg", title: "Morden Cladding", date: "2025-09-01", location: "Area 15", desc: "Cladding project in progress.", tags: "#Cladding #Modern", type: "inprogress" },
  // Service
  { img: "/cantilever.jpg", title: "Cantilever", date: "2025-08-24", location: "Area 49", desc: "Structural cantilever service.", tags: "#Service #Structure", type: "service" },
  { img: "/machinery.jpg", title: "Machinery", date: "2025-08-24", location: "Area 49", desc: "Heavy machinery service.", tags: "#Service #Machinery", type: "service" },
  // Add more as needed
];

import { useEffect } from "react";
import { X, Menu, Facebook, Twitter, Linkedin, Instagram, Youtube, MapPin, Phone, Mail } from "lucide-react";

function scrollToSection(id: string) {
  if (typeof window !== 'undefined') {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  }
}

function Header() {
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 
        ${isScrolled ? 'bg-white/80 backdrop-blur-xl shadow-md' : 'bg-transparent'}
      `}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <HardHat size={32} className={isScrolled ? 'text-primary' : 'text-primary'} />
            <div className={isScrolled ? 'text-gray-800 font-bold text-xl lg:text-2xl' : 'text-gray-800 font-bold text-xl lg:text-2xl'}>
              Roy Construction
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            <button
              className={isScrolled ? 'text-gray-800 hover:text-gray-600 transition-colors' : 'text-gray-800 hover:text-gray-200 transition-colors'}
              onClick={() => scrollToSection('services')}
              type="button"
            >
              Services
            </button>
            <Link href="/projects" className={isScrolled ? 'text-gray-800 hover:text-gray-600 transition-colors' : 'text-gray-800 hover:text-gray-200 transition-colors'}>
              Projects
            </Link>
            <button
              className={isScrolled ? 'text-gray-800 hover:text-gray-600 transition-colors' : 'text-gray-800 hover:text-gray-200 transition-colors'}
              onClick={() => scrollToSection('contact')}
              type="button"
            >
              Contacts
            </button>
            <Link href="#get-quote">
              <button className='bg-primary rounded-sm text-gray-800 px-6 py-2 font-medium hover:bg-primary/90 transition-colors'>
                Request Quote
              </button>
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={isScrolled ? 'lg:hidden text-gray-800 p-2' : 'lg:hidden text-white p-2'}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-primary/95 backdrop-blur-sm border-t border-white/20">
            <nav className="py-4 space-y-2">
              <button
                className="block w-full text-left px-4 py-2 text-white hover:bg-white/10 transition-colors"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  scrollToSection('services');
                }}
                type="button"
              >
                Services
              </button>
              <Link
                href="/projects"
                className="block px-4 py-2 text-white hover:bg-white/10 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Projects
              </Link>
              <button
                className="block w-full text-left px-4 py-2 text-white hover:bg-white/10 transition-colors"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  scrollToSection('contact');
                }}
                type="button"
              >
                Contacts
              </button>
              <Link
                href="#get-quote"
                className="block px-4 py-2 text-white hover:bg-white/10 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <button className="w-full bg-primary text-white py-2 font-medium hover:bg-primary/90 transition-colors">
                  Request Quote
                  Get Quote
                </button>
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

function FooterSection() {
  return (
    <footer className="bg-primary text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-1 gap-12">
          {/* Company Info */}
          <div>
            <div className="flex space-x-4">
              <Link href="#" className="text-white/60 hover:text-white transition-colors">
                <Facebook size={24} />
              </Link>
              <Link href="#" className="text-white/60 hover:text-white transition-colors">
                <Twitter size={24} />
              </Link>
              <Link href="#" className="text-white/60 hover:text-white transition-colors">
                <Linkedin size={24} />
              </Link>
              <Link href="#" className="text-white/60 hover:text-white transition-colors">
                <Instagram size={24} />
              </Link>
              <Link href="#" className="text-white/60 hover:text-white transition-colors">
                <Youtube size={24} />
              </Link>
            </div>
            <div className="mt-8">
              <h4 className="font-medium text-white mb-4">Contact Information</h4>
              <div className="text-white/80 text-sm space-y-2">
                <div className="flex items-start space-x-2">
                  <MapPin size={16} className="mt-0.5 flex-shrink-0" />
                  <span>Lilongwe, Bypass Road<br />Central Region, Malawi</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone size={16} className="flex-shrink-0" />
                  <span>+265(0)888481815</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail size={16} className="flex-shrink-0" />
                  <span>info@royconstruction.mw</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-white/20 mt-12 pt-8">
          <p className="text-white/60 text-sm">
            {new Date().getFullYear()} Roy Construction. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default function ProjectsPage() {
  const [selected, setSelected] = useState(null as null | typeof allProjects[number]);
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <section className="py-20 lg:py-28 bg-white flex-1">
        <div className="container mx-auto px-4">
          <div className="text-left mb-10">
            <h2 className="text-3xl lg:text-4xl font-bold text-primary">All Projects</h2>
            <p className="text-gray-600 max-w-2xl mt-2">Completed, in-progress, and service projects at a glance.</p>
          </div>
          <div className="max-w-8xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
            {allProjects.map((p, i) => (
              <article key={i} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                <div className="p-4 flex items-center gap-3 border-b border-gray-100">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center"><HardHat size={18} className="text-white" /></div>
                  <div>
                    <div className="font-medium text-gray-800">{p.location}</div>
                    <div className="text-sm text-gray-500">{new Date(p.date).toLocaleDateString()}</div>
                  </div>
                </div>
                <div className="relative aspect-video"><Image src={p.img} alt={p.title} fill className="object-cover" /></div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">{p.title}</h3>
                  <p className="text-gray-600 text-sm mb-3">{p.desc}</p>
                  <p className="text-primary text-xs font-mono mb-4">{p.tags}</p>
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <button 
                      onClick={() => setSelected(p)} 
                      className="text-sm text-gray-600 hover:text-primary px-3 py-1.5 rounded-md border border-gray-300 hover:border-primary transition-colors"
                    >
                      View Details
                    </button>
                    <span className="text-xs text-gray-400">{p.type}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
        {/* Modal Popup */}
        {selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 relative">
              <button
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold"
                onClick={() => setSelected(null)}
                aria-label="Close"
              >
                ×
              </button>
              <div className="mb-4 relative aspect-video rounded overflow-hidden">
                <Image src={selected.img} alt={selected.title} fill className="object-cover" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{selected.title}</h2>
              <p className="text-gray-700 mb-2">{selected.desc}</p>
              <p className="text-gray-600">Location: {selected.location}</p>
              <p className="text-gray-600">Type: {selected.type}</p>
              <p className="text-gray-600">Date: {new Date(selected.date).toLocaleDateString()}</p>
            </div>
          </div>
        )}
      </section>
      <FooterSection />
    </div>
  );
}