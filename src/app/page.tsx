"use client";

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  ChevronLeft, 
  ChevronRight,
  Menu,
  X,
  MapPin,
  Phone,
  Mail,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Youtube
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <HeroSection />
      <WhoWeAreSection />
      <OurProcessSection />
      <FeaturedProjectSection />
      <OurWorkSection />
      <ResourcesSection />
      <FooterSection />
    </div>
  );
}

// Header Component
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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-orange-600/95 backdrop-blur-sm shadow-lg' : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <div className="text-white font-bold text-xl lg:text-2xl">
              ROY CONSTRUCTION
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            <Link href="/about" className="text-white hover:text-white/80 transition-colors">
              About
            </Link>
            <Link href="/services" className="text-white hover:text-white/80 transition-colors">
              Services
            </Link>
            <Link href="/work" className="text-white hover:text-white/80 transition-colors">
              Our Work
            </Link>
            <Link href="/careers" className="text-white hover:text-white/80 transition-colors">
              Careers
            </Link>
            <Link href="/resources" className="text-white hover:text-white/80 transition-colors">
              Resources
            </Link>
            <Link href="/contact" className="text-white hover:text-white/80 transition-colors">
              Contact
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden text-white p-2"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-orange-600/95 backdrop-blur-sm border-t border-white/20">
            <nav className="py-4 space-y-2">
              <Link 
                href="/about" 
                className="block px-4 py-2 text-white hover:bg-white/10 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About
              </Link>
              <Link 
                href="/services" 
                className="block px-4 py-2 text-white hover:bg-white/10 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Services
              </Link>
              <Link 
                href="/work" 
                className="block px-4 py-2 text-white hover:bg-white/10 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Our Work
              </Link>
              <Link 
                href="/careers" 
                className="block px-4 py-2 text-white hover:bg-white/10 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Careers
              </Link>
              <Link 
                href="/resources" 
                className="block px-4 py-2 text-white hover:bg-white/10 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Resources
              </Link>
              <Link 
                href="/contact" 
                className="block px-4 py-2 text-white hover:bg-white/10 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Contact
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [showControls, setShowControls] = useState(false);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleWatchVideo = () => {
    setShowControls(true);
    if (videoRef.current && isMuted) {
      toggleMute();
    }
  };

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
        <source src="https://hoar.com/wp-content/uploads/2020/02/Hoar-Looping-1.5mbps.mp4" type="video/mp4" />
      </video>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Content */}
      <div className="relative z-10 h-full flex items-center justify-center text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-5xl lg:text-7xl font-light text-white mb-8 leading-tight">
            Building Excellence Together
          </h1>
          <button
            onClick={handleWatchVideo}
            className="inline-flex items-center space-x-3 bg-white text-orange-600 px-8 py-4 rounded hover:bg-white/90 transition-colors text-lg font-medium"
          >
            <Play size={24} />
            <span>Watch Video</span>
          </button>
        </div>
      </div>

      {/* Video Controls */}
      {showControls && (
        <div className="absolute bottom-8 left-8 flex items-center space-x-4 z-20">
          <button
            onClick={togglePlay}
            className="bg-white/20 hover:bg-white/30 text-white p-3 rounded-full backdrop-blur-sm transition-colors"
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </button>
          <button
            onClick={toggleMute}
            className="bg-white/20 hover:bg-white/30 text-white p-3 rounded-full backdrop-blur-sm transition-colors"
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
        </div>
      )}
    </section>
  );
}

// Who We Are Section Component
function WhoWeAreSection() {
  return (
    <section className="relative py-20 lg:py-32 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80"
          alt="Construction professional"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4">
        <div className="max-w-3xl">
          <h2 className="text-4xl lg:text-5xl font-light text-white mb-8 leading-tight">
            Your Trusted Construction Partner in Malawi
          </h2>
          <p className="text-lg lg:text-xl text-white/90 mb-8 leading-relaxed">
            Roy Construction is a leading construction company in Malawi, specializing in general construction, 
            building design and planning, and construction management. Based in Lilongwe, we serve clients 
            across the Central Region with a commitment to quality, innovation, and excellence in every project 
            we undertake.
          </p>
          <Link
            href="/about"
            className="inline-block bg-white text-orange-600 px-8 py-4 rounded hover:bg-white/90 transition-colors text-lg font-medium"
          >
            Learn More
          </Link>
        </div>
      </div>
    </section>
  );
}

// Our Process Section Component
function OurProcessSection() {
  const processItems = [
    {
      title: "Quality Control",
      description: "Committed to delivering the highest quality construction services"
    },
    {
      title: "Project Management",
      description: "Expert project management from conception to completion"
    },
    {
      title: "Construction Management",
      description: "Comprehensive construction management for all project types"
    },
    {
      title: "Safety First",
      description: "Zero accidents, zero incidents - safety is our top priority"
    },
    {
      title: "Design & Planning",
      description: "Professional building design and thorough project planning"
    }
  ];

  return (
    <section className="bg-orange-600 py-20 lg:py-32">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-16">
          {/* Process Visual */}
          <div className="flex justify-center">
            <div className="w-80 h-80 relative">
              <div className="absolute inset-0 rounded-full border-4 border-white/30"></div>
              <div className="absolute inset-8 rounded-full border-2 border-white/20"></div>
              <div className="absolute inset-16 rounded-full bg-white/10 flex items-center justify-center">
                <div className="text-white text-center">
                  <div className="text-2xl font-bold mb-2">ROY</div>
                  <div className="text-lg">PROCESS</div>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div>
            <h2 className="text-4xl lg:text-5xl font-light text-white mb-8 leading-tight">
              Our Process
            </h2>
            <p className="text-lg text-white/90 mb-8 leading-relaxed">
              The construction industry in Malawi is evolving, and we stay ahead by continuously 
              refining our processes. Our integrated approach combines proven methodologies with 
              modern technologies to deliver exceptional results for our clients across the Central Region.
            </p>
            <Link
              href="/process"
              className="inline-block bg-white text-orange-600 px-8 py-4 rounded hover:bg-white/90 transition-colors text-lg font-medium"
            >
              Learn More
            </Link>
          </div>
        </div>

        {/* Process Items */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8">
          {processItems.map((item, index) => (
            <div key={index} className="text-center">
              <div className="bg-white/10 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <div className="text-white text-2xl font-bold">{index + 1}</div>
              </div>
              <h3 className="text-xl font-medium text-white mb-2">{item.title}</h3>
              <p className="text-sm text-white/80 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Featured Project Section Component
function FeaturedProjectSection() {
  return (
    <section className="relative py-20 lg:py-32 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=800&q=80"
          alt="Featured construction project"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4">
        <div className="max-w-3xl">
          <div className="text-white/80 text-lg mb-4">Featured Project</div>
          <h2 className="text-4xl lg:text-5xl font-light text-white mb-8 leading-tight">
            Modern Residential Complex, Lilongwe
          </h2>
          <p className="text-lg lg:text-xl text-white/90 mb-8 leading-relaxed">
            A stunning residential development featuring modern amenities and sophisticated 
            design. This project showcases our expertise in residential construction and our 
            commitment to creating exceptional living spaces that enhance communities throughout 
            the Central Region of Malawi.
          </p>
          <Link
            href="/projects/residential-complex"
            className="inline-block bg-white text-orange-600 px-8 py-4 rounded hover:bg-white/90 transition-colors text-lg font-medium"
          >
            Learn More
          </Link>
        </div>
      </div>
    </section>
  );
}

// Our Work Section Component
function OurWorkSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const projects = [
    {
  image: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=800&q=80",
      title: "Commercial Building Complex",
      description: "Modern commercial facility in Lilongwe"
    },
    {
  image: "https://images.unsplash.com/photo-1521737852567-6949f3f9f2b5?auto=format&fit=crop&w=800&q=80",
      title: "Residential Development",
      description: "Quality housing project"
    },
    {
  image: "https://images.unsplash.com/photo-1465101178521-c1a4c8a0a8b7?auto=format&fit=crop&w=800&q=80",
      title: "Office Building",
      description: "Contemporary workspace design"
    },
    {
  image: "https://images.unsplash.com/photo-1508921912186-1d1a45ebb3c1?auto=format&fit=crop&w=800&q=80",
      title: "Industrial Construction",
      description: "Manufacturing facility project"
    },
    {
  image: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=800&q=80",
      title: "New Home Construction",
      description: "Custom residential homes"
    },
    {
  image: "https://images.unsplash.com/photo-1465101178521-c1a4c8a0a8b7?auto=format&fit=crop&w=800&q=80",
      title: "Mixed-Use Development",
      description: "Commercial and residential complex"
    },
    {
  image: "https://images.unsplash.com/photo-1521737852567-6949f3f9f2b5?auto=format&fit=crop&w=800&q=80",
      title: "Educational Facility",
      description: "School construction project"
    },
    {
  image: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=800&q=80",
      title: "Healthcare Facility",
      description: "Medical center construction"
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % projects.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + projects.length) % projects.length);
  };

  return (
    <section className="relative py-20 lg:py-32 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="https://hoar.com/wp-content/uploads/2020/01/shutterstock_1027893370-scaled.jpg"
          alt="Construction background"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Text Content */}
          <div>
            <h2 className="text-4xl lg:text-5xl font-light text-white mb-8 leading-tight">
              Our Work
            </h2>
            <p className="text-lg lg:text-xl text-white/90 mb-8 leading-relaxed">
              Roy Construction has built a reputation for excellence across Malawi's Central Region. 
              From commercial and residential developments to industrial and institutional facilities, 
              our diverse portfolio demonstrates our commitment to quality construction and innovative 
              building solutions.
            </p>
            <Link
              href="/work"
              className="inline-block bg-white text-orange-600 px-8 py-4 rounded hover:bg-white/90 transition-colors text-lg font-medium"
            >
              View Work
            </Link>
          </div>

          {/* Project Carousel */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <div className="relative aspect-video mb-4 rounded overflow-hidden">
              <Image
                src={projects[currentSlide].image}
                alt={projects[currentSlide].title}
                fill
                className="object-cover"
              />
            </div>
            
            <h3 className="text-xl font-medium text-white mb-2">
              {projects[currentSlide].title}
            </h3>
            <p className="text-white/80 mb-6">
              {projects[currentSlide].description}
            </p>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={prevSlide}
                  className="bg-white/20 hover:bg-white/30 text-white p-2 rounded transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
                <span className="text-white">
                  {currentSlide + 1} / {projects.length}
                </span>
                <button
                  onClick={nextSlide}
                  className="bg-white/20 hover:bg-white/30 text-white p-2 rounded transition-colors"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
              <Link
                href="/work"
                className="text-white hover:text-white/80 transition-colors"
              >
                View All
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Resources Section Component
function ResourcesSection() {
  const resources = [
    {
      image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/3b5d1d5b-b5da-43cd-a603-1a79088e9254-hoar-com/assets/images/Blog-pic-for-safety-week-768x512-12.png",
      title: "Construction Safety in Malawi: Best Practices",
      description: "Learn about our comprehensive safety programs and initiatives that keep our teams safe on every project throughout the Central Region."
    },
    {
      image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/3b5d1d5b-b5da-43cd-a603-1a79088e9254-hoar-com/assets/images/MeetOurExperts_PapeFall2024_BlogImage-768x512-13.jpg",
      title: "Meet Our Local Construction Experts",
      description: "Get to know the experienced Malawian professionals who lead our projects and drive innovation in local construction."
    }
  ];

  return (
    <section className="py-20 lg:py-32 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-light text-gray-800 mb-4">
            Resources
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Stay informed with the latest insights, news, and expertise from our construction team in Malawi
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {resources.map((resource, index) => (
            <div key={index} className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
              <div className="relative aspect-video">
                <Image
                  src={resource.image}
                  alt={resource.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-medium text-gray-800 mb-3 leading-tight">
                  {resource.title}
                </h3>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  {resource.description}
                </p>
                <Link
                  href="/resources"
                  className="inline-block text-orange-600 hover:text-orange-700 transition-colors font-medium"
                >
                  Read More →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Footer Section Component
function FooterSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
  };

  return (
    <footer className="bg-orange-600 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Company Info */}
          <div>
            <div className="mb-8">
              <h3 className="text-2xl font-bold">ROY CONSTRUCTION</h3>
            </div>
            <p className="text-white/80 mb-6 leading-relaxed">
              Roy Construction is your trusted partner for quality construction services in Malawi. 
              We specialize in general construction, building design and planning, and construction 
              management across the Central Region.
            </p>
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
          </div>

          {/* Our Services & Contact */}
          <div>
            <h3 className="text-xl font-medium mb-6">Our Services</h3>
            <div className="space-y-3 text-white/80 text-sm">
              <div>• General Construction</div>
              <div>• Building Design and Planning</div>
              <div>• Construction Management</div>
              <div>• New Home Construction</div>
              <div>• Commercial Construction</div>
              <div>• Industrial Construction</div>
              <div>• Project Management</div>
              <div>• Quality Control</div>
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

          {/* Contact Form */}
          <div>
            <h3 className="text-xl font-medium mb-6">Get In Touch</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                name="name"
                placeholder="Your Name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full bg-white/10 border border-white/20 rounded px-4 py-3 text-white placeholder-white/60 focus:outline-none focus:border-white/40"
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Your Email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full bg-white/10 border border-white/20 rounded px-4 py-3 text-white placeholder-white/60 focus:outline-none focus:border-white/40"
                required
              />
              <textarea
                name="message"
                placeholder="Your Message"
                value={formData.message}
                onChange={handleInputChange}
                rows={4}
                className="w-full bg-white/10 border border-white/20 rounded px-4 py-3 text-white placeholder-white/60 focus:outline-none focus:border-white/40 resize-none"
                required
              />
              <button
                type="submit"
                className="w-full bg-white text-orange-600 px-6 py-3 rounded hover:bg-white/90 transition-colors font-medium"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-white/20 mt-12 pt-8 text-center">
          <p className="text-white/60 text-sm">
            © {new Date().getFullYear()} Roy Construction. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}