'use client';

import { getContents } from "@/app/actions";
import Link from "next/link";
import { Facebook, HardHat, Instagram, Linkedin, Mail, MapPin, Menu, Phone, Plus, Twitter, X, Youtube } from "lucide-react";
import { useState, useEffect } from 'react';
import Image from 'next/image';

interface ContentMetadata {
  locationName?: string;
  location?: string;
  [key: string]: unknown;
}

interface ContentItem {
  id: number;
  title: string;
  content: string;
  featuredMedia?: string | null;
  isPublished?: boolean | null;
  publishedAt?: Date | null;
  category?: string | null;
  tags?: string[] | null;
  metadata?: ContentMetadata;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

interface Project {
  img: string;
  title: string;
  date: string;
  location: string;
  desc: string;
  tags: string;
  type: string;
}

// ProjectCard component moved inline
function ProjectCard({ project }: { project: Project }) {
  const [imgSrc, setImgSrc] = useState(project.img || '/default-project.jpg');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <article className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Project header with location and date */}
      <div className="p-4 flex items-center gap-3 border-b border-gray-100">
        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
          <HardHat size={18} className="text-white" />
        </div>
        <div>
          <div className="font-medium text-gray-800">{project.location || 'Location not specified'}</div>
          <div className="text-sm text-gray-500">
            {project.date ? new Date(project.date).toLocaleDateString() : 'Date not available'}
          </div>
        </div>
      </div>

      {/* Project image */}
      <div className="relative aspect-video cursor-pointer" onClick={() => setSelectedImage(imgSrc)}>
        <Image
          src={imgSrc}
          alt={project.title || 'Project image'}
          width={800}
          height={450}
          className="w-full h-full object-cover"
          onError={() => setImgSrc('/default-project.jpg')}
          unoptimized
        />
      </div>

      {/* Project details */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-800 mb-2">{project.title || 'Untitled Project'}</h3>
        <p className="text-gray-600 text-sm mb-3">
          {project.desc || 'No description available for this project.'}
        </p>
        <p className="text-primary text-xs font-mono mb-4">
          {project.tags || '#construction #project'}
        </p>
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
            {project.type || 'Project'}
          </span>
        </div>
      </div>

      {/* Image modal (simplified version) */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative w-full max-w-4xl">
            <Image
              src={selectedImage}
              alt="Enlarged view"
              width={1200}
              height={800}
              className="w-full h-auto max-h-[80vh] object-contain"
              unoptimized
            />
            <button
              className="absolute -top-10 right-0 text-white hover:text-gray-300"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImage(null);
              }}
            >
              <X size={24} />
            </button>
          </div>
        </div>
      )}
    </article>
  );
}



// Header Component

// function scrollToSection(id: string) {
//   if (typeof window !== 'undefined') {
//     const section = document.getElementById(id);
//     if (section) {
//       section.scrollIntoView({ behavior: 'smooth' });
//     }
//   }
// }

// Header Section Component
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
            <div className={'text-gray-800 font-bold text-xl lg:text-2xl'}>
              Roy Construction
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            <Link href="/#services" className={'text-gray-800 hover:text-gray-600 transition-colors'}>
              Services
            </Link>
            <Link href="/projects" className={'text-gray-800 hover:text-gray-600 transition-colors'}>
              Projects
            </Link>
            <Link href="/projects/#contacts" className={'text-gray-800 hover:text-gray-600 transition-colors'}>
              Contacts
            </Link>
            {/* Replaced Contact link with Get Quote button */}
            <Link href="#get-quote">
              <button className={'text-gray-800 hover:text-gray-600 bg-primary px-6 py-2 font-medium rounded-sm hover:bg-primary/90'}>
                Request Quote
              </button>
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={'lg:hidden text-gray-800 p-2'}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white/95 text-gray-800 backdrop-blur-sm border-t border-white/20">
            <nav className="py-4 space-y-2">
              <Link
                href="/../#services"
                className="block px-4 py-2 text-gray-800 hover:bg-white/10 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Services
              </Link>
              <Link
                href="/projects"
                className="block px-4 py-2 text-gray-800 hover:bg-white/10 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Projects
              </Link>
              <Link
                href="/projects/#contacts"
                className="block px-4 py-2 text-gray-800 hover:bg-white/10 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Contacts
              </Link>
              <Link
                href="/../#get-quote"
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


// Footer Section Component
function FooterSection() {
  return (
    <footer className="text-white" id="contacts" style={{ background: 'black' }}>
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Contact Info */}
          <div className="text-white text-sm space-y-2 text-left">
            <div className="flex items-center gap-2">
              <MapPin size={18} className="flex-shrink-0" />
              <span>Lilongwe, Bypass Road, Central Region, Malawi</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone size={18} className="flex-shrink-0" />
              <span>+265(0)888481815</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail size={18} className="flex-shrink-0" />
              <span>info@royconstruction.mw</span>
            </div>
          </div>
        </div>
        {/* Bottom Footer with Social Links */}
        <div className="border-t border-white/20 mt-12 pt-8 flex flex-col lg:flex-row items-center justify-between text-left gap-4">
          <div className="flex space-x-4 mb-2 lg:mb-0">
            <Link href="#" className="text-white hover:text-white transition-colors">
              <Facebook size={28} />
            </Link>
            <Link href="#" className="text-white hover:text-white transition-colors">
              <Twitter size={28} />
            </Link>
            <Link href="#" className="text-white hover:text-white transition-colors">
              <Linkedin size={28} />
            </Link>
            <Link href="#" className="text-white hover:text-white transition-colors">
              <Instagram size={28} />
            </Link>
            <Link href="#" className="text-white hover:text-white transition-colors">
              <Youtube size={28} />
            </Link>
          </div>
          <p className="text-white text-sm">
            {new Date().getFullYear()} Roy Construction. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const result = await getContents();
        if (result.success && result.data) {
          const formattedProjects: Project[] = result.data.map((project: ContentItem) => ({
            img: project.featuredMedia ? `/uploads/${project.featuredMedia}` : "/default-project.jpg",
            title: project.title,
            date: project.createdAt ? new Date(project.createdAt).toISOString() : new Date().toISOString(),
            location: project.metadata?.locationName || project.metadata?.location || "Location not specified",
            desc: project.content ? (typeof project.content === 'string' ?
              project.content.substring(0, 100) + (project.content.length > 100 ? '...' : '') :
              'No description available') : 'No description available',
            tags: project.tags && project.tags.length > 0
              ? project.tags.map(t => `#${t}`).join(' ')
              : "#Construction",
            type: project.category?.toLowerCase() || "service"
          } as Project));
          setProjects(formattedProjects);
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col relative">
      <Header />
      <main className="flex-1">
        <section className="py-12 lg:py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-left mb-10 mt-10">
              <h1 className="text-3xl lg:text-4xl font-bold text-primary mb-2">Our Projects</h1>
              <p className="text-gray-600 max-w-2xl">Completed, in-progress, and service projects at a glance.</p>
            </div>

            <div className="max-w-8xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
              {projects.map((project, index) => (
                <ProjectCard key={index} project={project} />
              ))}
            </div>
          </div>
        </section>
      </main>


      <FooterSection />
      {/* Floating Login Button - improved positioning */}
      <Link href="/login" className="fixed bottom-8 right-13 z-50 bg-white text-primary rounded-full shadow-lg p-3 hover:bg-primary/90 hover:text-white transition-colors flex items-center justify-center" style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }} aria-label="Login">
        <Plus size={28} />
      </Link>
    </div>
  );
}

