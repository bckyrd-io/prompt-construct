"use client";

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {

  Menu,
  X,
  MapPin,
  Phone,
  Mail,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Youtube,
  HardHat,
  Building2,
  PencilRuler,
  ClipboardList,
  Wrench,
  Home,
  Factory,
  Layers,
  Paintbrush,
  Zap,
  Droplets,
  Wind,
  Hammer,
  SquareStack
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <HeroSection />
      <AboutSection />
      <ProcessSection />
      <Hero2Section />
      <WorkSection />
      <Hero3Section />
      <ServiceSection />
      <ContactCTASection />
      <FooterSection />
    </div>
  );
}

// Header Component

function scrollToSection(id: string) {
  if (typeof window !== 'undefined') {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  }
}

function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
            <HardHat size={32} className={isScrolled ? 'text-primary' : 'text-primary'} /> {/* Helmet icon */}
            <div className={isScrolled ? 'text-gray-800 font-bold text-xl lg:text-2xl' : 'text-white font-bold text-xl lg:text-2xl'}>
              Roy Construction
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            <button
              className={isScrolled ? 'text-gray-800 hover:text-gray-600 transition-colors' : 'text-white hover:text-gray-200 transition-colors'}
              onClick={() => scrollToSection('services')}
              type="button"
            >
              Services
            </button>
            <Link href="/projects" className={isScrolled ? 'text-gray-800 hover:text-gray-600 transition-colors' : 'text-white hover:text-gray-200 transition-colors'}>
              Projects
            </Link>
            <button
              className={isScrolled ? 'text-gray-800 hover:text-gray-600 transition-colors' : 'text-white hover:text-gray-200 transition-colors'}
              onClick={() => scrollToSection('contact')}
              type="button"
            >
              Contacts
            </button>
            {/* Replaced Contact link with Get Quote button */}
            <Link href="#get-quote">
              <button className={`${isScrolled ? 'text-gray-800 hover:text-gray-600' : 'text-white hover:text-gray-200'} transition-colors bg-primary px-6 py-2 font-medium hover:bg-primary/90`}>
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
                className="block px-4 py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <button className="w-full bg-primary text-white py-2 font-medium hover:bg-primary/90 transition-colors">
                  Request Quote
                </button>
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

// Hero Section Component
function HeroSection() {
  const [isMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);


  return (
    <section className="relative h-screen overflow-hidden">
      {/* Video Background */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        loop
        muted={isMuted}
        playsInline
      >
        <source src="/gate.mp4" type="video/mp4" />
      </video>

      {/* Overlay - Removed to show videos clearly */}

      {/* Content */}
      <div className="relative z-10 h-full flex items-center justify-left text-left">
        <div className="max-w-4xl  px-12">
          <h1 className="text-5xl lg:text-7xl  text-white mb-8 leading-tight">
            CONSTRUCTION
            PROCESS
          </h1>

        </div>
      </div>

    </section>
  );
}
// Hero Section Component
function Hero3Section() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted] = useState(true);



  return (
    <section className="relative h-screen overflow-hidden">
      {/* Video Background */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        loop
        muted={isMuted}
        playsInline
      >
        <source src="/metal.mp4" type="video/mp4" />
      </video>

      {/* Overlay - Removed to show videos clearly */}

      {/* Content */}
      <div className="relative z-10 h-full flex items-center justify-left text-left">
        <div className="max-w-4xl  px-12">
          <h1 className="text-5xl lg:text-7xl  text-white mb-8 leading-tight">
            METAL WORKS <br /> IN PROGRESS 
          </h1>

        </div>
      </div>


    </section>
  );
}
// Hero Section Component
function Hero2Section() {



 

  return (
    <section className="relative h-screen overflow-hidden">
      {/* Video Background */}
      <Image
        src="/dimension.jpg"
        alt="Construction professional"
        fill
        className="absolute inset-0 w-full h-full object-cover"
      />
    </section>
  );
}

// Who We Are Section Component
function AboutSection() {
  return (
    <section className="relative py-20 lg:py-32 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        {/* <Image
          src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80"
          alt="Construction professional"
          fill
          className="object-cover"
        /> */}
        <div className="absolute inset-0 bg-light/90" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4">
        <div className="max-w-3xl">
          {/* <h2 className="text-4xl lg:text-5xl  text-black mb-8 leading-tight">
            Your Trusted Construction Partner in Malawi
          </h2> */}
          <p className="text-lg lg:text-xl text-black/90 mb-8 leading-relaxed">
            Roy Construction is a leading construction company in Malawi, specializing in general construction,
            building design and planning, and construction management. Based in Lilongwe, we serve clients
            across the Central Region with a commitment to quality, innovation, and excellence in every project
            we undertake.
          </p>
          <Link
            href="/about"
            className="inline-block border border-primary text-primary px-8 py-4  hover:bg-white/90 transition-colors"
          >
            Select Your Project
          </Link>
        </div>
      </div>
    </section>
  );
}

// Our Process Section Component
function ProcessSection() {
  const processItems = [
    { title: 'General Contracting', icon: <HardHat size={32} className="text-white" /> },
    { title: 'Building Design & Planning', icon: <PencilRuler size={32} className="text-white" /> },
    { title: 'Construction Management', icon: <ClipboardList size={32} className="text-white" /> },
    { title: 'Renovation & Restoration', icon: <Wrench size={32} className="text-white" /> },
    { title: 'New Home Construction', icon: <Home size={32} className="text-white" /> },
    { title: 'Commercial Construction', icon: <Building2 size={32} className="text-white" /> },
    { title: 'Industrial Construction', icon: <Factory size={32} className="text-white" /> },
    { title: 'Land Development', icon: <MapPin size={32} className="text-white" /> },
    { title: 'Roofing & Siding', icon: <Layers size={32} className="text-white" /> },
    { title: 'Interior & Exterior Finishing', icon: <Paintbrush size={32} className="text-white" /> },
    { title: 'Electrical Services', icon: <Zap size={32} className="text-white" /> },
    { title: 'Plumbing Services', icon: <Droplets size={32} className="text-white" /> },
    { title: 'HVAC Services', icon: <Wind size={32} className="text-white" /> },
    { title: 'Carpentry Services', icon: <Hammer size={32} className="text-white" /> },
    { title: 'Masonry Services', icon: <SquareStack size={32} className="text-white" /> },
  ];

  return (
    <section className="bg-primary py-20 lg:py-32">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-16">
          {/* Process Visual */}
          {/* <div className="flex justify-center">
            <div className="w-80 h-80 relative">
              <div className="absolute inset-0 rounded-full border-4 border-white/30"></div>
              <div className="absolute inset-8 rounded-full border-2 border-white/20"></div>
              <div className="absolute inset-16 rounded-full bg-white/10 flex items-center justify-center">
                <div className="text-white text-center">
                  <div className="text-2xl font-bold mb-2">OUR</div>
                  <div className="text-lg">PROCESS</div>
                </div>
              </div>
            </div>
          </div> */}

          {/* Content */}
          {/* <div>
            <p className="text-lg text-white/90 mb-8 leading-relaxed">
              The construction industry in Malawi is evolving, and we stay ahead by continuously
              refining our processes. Our integrated approach combines proven methodologies with
              modern technologies to deliver exceptional results for our clients across the Central Region.
            </p>
          </div> */}
        </div>

        {/* Process Items */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8">
          {processItems.map((item, index) => (
            <div key={index} className="text-center">
              <div className="bg-secondary rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                {item.icon}
              </div>
              <h3 className="text-xl font-medium text-white mb-2">{item.title}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}




/* ---------------- Recent Work ---------------- */


function WorkSection() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const posts = [
    { img: "/morden-cladding.jpg", title: "Morden Cladding", date: "2025-08-28", location: "Lilongwe Central", desc: "Completed staircase with safety-first design and premium finishes.", tags: "#Staircase #Safety" },
    { img: "/window.jpg", title: "Window Replacement", date: "2025-08-24", location: "Area 49", desc: "Custom welded slatted gate combining aesthetics and security.", tags: "#Gate #Welding" },
    { img: "/after-construction.jpg", title: "After Construction", date: "2025-08-28", location: "Lilongwe Central", desc: "Completed staircase with safety-first design and premium finishes.", tags: "#Staircase #Safety" },
    { img: "/welding-fabrication.jpg", title: "Welding Fabrication", date: "2025-08-24", location: "Area 49", desc: "Custom welded slatted gate combining aesthetics and security.", tags: "#Gate #Welding" },
  ];

  return (
    <section id="recent" className="py-20 lg:py-28 bg-white">
      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl w-full max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <button
              className="absolute -top-10 right-0 text-white hover:text-gray-300"
              onClick={() => setSelectedImage(null)}
            >
              <X size={24} />
            </button>
            <div className="relative w-full h-full">
              <Image
                src={selectedImage}
                alt="Enlarged view"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4">
        <div className="text-left mb-10">
          <h2 className="text-3xl lg:text-4xl font-bold text-primary">Recent Work</h2>
          <p className="text-gray-600 max-w-2xl mt-2">Latest completed projects and milestones.</p>
        </div>

        <div className="max-w-8xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
          {posts.map((p, i) => (
            <article key={i} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
              <div className="p-4 flex items-center gap-3 border-b border-gray-100">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center"><HardHat size={18} className="text-white" /></div>
                <div>
                  <div className="font-medium text-gray-800">{p.location}</div>
                  <div className="text-sm text-gray-500">{new Date(p.date).toLocaleDateString()}</div>
                </div>
              </div>

              <div className="relative aspect-video cursor-pointer" onClick={() => setSelectedImage(p.img)}><Image src={p.img} alt={p.title} fill className="object-cover" /></div>

              <div className="p-4">
                <h3 className="font-semibold text-gray-800 mb-2">{p.title}</h3>
                <p className="text-gray-600 text-sm mb-3">{p.desc}</p>
                <p className="text-primary text-xs font-mono mb-4">{p.tags}</p>
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <a href="#" className="text-sm text-gray-600 hover:text-primary">View Details</a>

                </div>
              </div>
            </article>
          ))}
        </div>


      </div>
    </section>
  );
}


function ServiceSection() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const posts = [
    {
      img: "/perfect-work.jpg", title: " Perfect Work",
      date: "2025-08-28", location: "Lilongwe Central", desc: "#Roy Construction #2025trends #Proposed 3 bedroom house in Lilongwe",
      tags: "#proposed #trends #cantilever"
    },

    { img: "/cantilever.jpg", title: "Cantilever", date: "2025-08-24", location: "Area 49", desc: "Custom welded slatted gate combining aesthetics and security.", tags: "#Gate #Welding" },
    { img: "/staircase.jpg", title: "Staircase Design Completion", date: "2025-08-28", location: "Lilongwe Central", desc: "Completed staircase with safety-first design and premium finishes.", tags: "#Staircase #Safety" },
    { img: "/machinery.jpg", title: "Machinery", date: "2025-08-24", location: "Area 49", desc: "Custom welded slatted gate combining aesthetics and security.", tags: "#Gate #Welding" },
  ];

  return (
    <section id="recent" className="py-20 lg:py-28 bg-white">
      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl w-full max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <button
              className="absolute -top-10 right-0 text-white hover:text-gray-300"
              onClick={() => setSelectedImage(null)}
            >
              <X size={24} />
            </button>
            <div className="relative w-full h-full">
              <Image
                src={selectedImage}
                alt="Enlarged view"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4">
        <div className="text-left mb-10">
          <h2 className="text-3xl lg:text-4xl font-bold text-primary">Services</h2>
          <p className="text-gray-600 max-w-2xl mt-2">Check Out What We Can Work On.</p>
        </div>

        <div className="max-w-8xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
          {posts.map((p, i) => (
            <article key={i} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
              <div className="p-4 flex items-center gap-3 border-b border-gray-100">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center"><HardHat size={18} className="text-white" /></div>
                <div>
                  <div className="font-medium text-gray-800">Roy Construction</div>
                  <div className="text-sm text-gray-500">{new Date(p.date).toLocaleDateString()} • {p.location}</div>
                </div>
              </div>

              <div className="relative aspect-video cursor-pointer" onClick={() => setSelectedImage(p.img)}><Image src={p.img} alt={p.title} fill className="object-cover" /></div>

              <div className="p-4">
                <h3 className="font-semibold text-gray-800 mb-2">{p.title}</h3>
                <p className="text-gray-600 text-sm mb-3">{p.desc}</p>
                <p className="text-primary text-xs font-mono mb-4">{p.tags}</p>
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <a href="#" className="text-sm text-gray-600 hover:text-primary">View Details</a>
                  <a href="#" className="text-sm text-gray-600 hover:text-primary">Share</a>
                </div>
              </div>
            </article>
          ))}
        </div>


      </div>
    </section>
  );
}



function ContactCTASection() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  return (
    <section id="get-quote" className="py-20 lg:py-28 ">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl">
          <h3 className="text-3xl font-semibold mb-4 text-primary">Request a Quote</h3>
          <p className="mb-8 text-[color:rgba(0,0,0,0.7)]">
            Tell us about your project and we’ll get back to you shortly.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              name="name"
              placeholder="Your Name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full bg-white border border-[color:rgba(0,0,0,0.15)] px-4 py-3 text-[color:rgba(0,0,0,0.8)] placeholder-[color:rgba(0,0,0,0.5)] focus:outline-none focus:border-[color:rgba(0,0,0,0.35)]"
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Your Email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full bg-white border border-[color:rgba(0,0,0,0.15)] px-4 py-3 text-[color:rgba(0,0,0,0.8)] placeholder-[color:rgba(0,0,0,0.5)] focus:outline-none focus:border-[color:rgba(0,0,0,0.35)]"
              required
            />
            <textarea
              name="message"
              placeholder="Your Message"
              value={formData.message}
              onChange={handleInputChange}
              rows={4}
              className="w-full bg-white border border-[color:rgba(0,0,0,0.15)] px-4 py-3 text-[color:rgba(0,0,0,0.8)] placeholder-[color:rgba(0,0,0,0.5)] focus:outline-none focus:border-[color:rgba(0,0,0,0.35)] resize-none"
              required
            />
            <button
              type="submit"
              className="w-full bg-primary text-white px-6 py-3 hover:bg-primary/90 transition-colors font-medium"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

// Footer Section Component
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
            © {new Date().getFullYear()} Roy Construction. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}