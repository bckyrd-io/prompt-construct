"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  HardHat, User, Sparkles, ArrowUp, Menu, Mountain, Calculator,
  Compass, MapPin, Bed, Bath, Square, ArrowRight, Brain, PenTool, BarChart3
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription
} from "@/components/ui/sheet"
import {
  Tooltip, TooltipProvider, TooltipTrigger, TooltipContent
} from "@/components/ui/tooltip"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { useAuthStore } from "@/lib/store/auth-store"

const propertiesData = {
  featured: [
    {
      id: "RC-2024-88",
      name: "The Highlands Estate",
      location: "Lilongwe",
      price: "MK 1,200,000",
      beds: 4,
      baths: 3.5,
      sqft: 3200,
      type: "NEW LISTING",
      image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
      status: "In Progress",
      progress: 65,
    },
    {
      id: "RC-2024-92",
      name: "Urban Loft Project",
      location: "Blantyre",
      price: "MK 850,000",
      beds: 2,
      baths: 2,
      sqft: 1800,
      type: "PERMIT READY",
      image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800",
      status: "Ready to Build",
      progress: 100,
    },
    {
      id: "RC-2024-105",
      name: "Rocky Mountain Estate",
      location: "Mzuzu",
      price: "MK 2,400,000",
      beds: 5,
      baths: 4,
      sqft: 4500,
      type: "LAND ONLY",
      image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800",
      status: "Available",
      progress: 0,
    },
  ],
  catalog: [
    {
      id: "RC-2024-110",
      name: "Sunset Valley Villa",
      location: "Zomba",
      price: "MK 950,000",
      beds: 3,
      baths: 2.5,
      sqft: 2400,
      type: "NEW LISTING",
      image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
      status: "Available",
      progress: 0,
    },
    {
      id: "RC-2024-115",
      name: "Coastal Haven",
      location: "Mangochi",
      price: "MK 1,850,000",
      beds: 4,
      baths: 3.5,
      sqft: 3800,
      type: "WATERFRONT",
      image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800",
      status: "In Progress",
      progress: 45,
    },
    {
      id: "RC-2024-120",
      name: "Desert Oasis Ranch",
      location: "Kasungu",
      price: "MK 1,100,000",
      beds: 3,
      baths: 2,
      sqft: 2100,
      type: "RANCH STYLE",
      image: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800",
      status: "Available",
      progress: 0,
    },
    {
      id: "RC-2024-125",
      name: "Mountain View Estate",
      location: "Karonga",
      price: "MK 1,650,000",
      beds: 4,
      baths: 3,
      sqft: 3100,
      type: "MOUNTAIN VIEW",
      image: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6b3?w=800",
      status: "Available",
      progress: 0,
    },
    {
      id: "RC-2024-130",
      name: "Lakefront Paradise",
      location: "Salima",
      price: "MK 2,800,000",
      beds: 5,
      baths: 4.5,
      sqft: 5200,
      type: "LAKEFRONT",
      image: "https://images.unsplash.com/photo-1602343168117-bb8ffe3e2e9f?w=800",
      status: "Available",
      progress: 0,
    },
    {
      id: "RC-2024-135",
      name: "Modern Minimalist",
      location: "Dedza",
      price: "MK 780,000",
      beds: 2,
      baths: 2,
      sqft: 1650,
      type: "MODERN",
      image: "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=800",
      status: "Ready to Build",
      progress: 100,
    },
  ],
  quickActions: [
    { icon: Mountain, label: "Find Land", description: "Browse available plots" },
    { icon: Calculator, label: "Estimate Cost", description: "Get build estimates" },
    { icon: Compass, label: "Browse Designs", description: "Modern blueprints" },
  ],
}

function PropertyCard({
  property,
  featured = false,
}: {
  property: (typeof propertiesData.featured)[0]
  featured?: boolean
}) {
  return (
    <Card className="group flex flex-col h-full overflow-hidden">
      <div className="relative h-64 overflow-hidden">
        <Badge
          className="absolute top-3 left-3 z-10 font-semibold text-xs"
          variant={featured ? "default" : "secondary"}
        >
          {property.type}
        </Badge>
        <Badge
          variant="outline"
          className="absolute top-3 right-3 z-10 bg-background/90 backdrop-blur-sm text-xs font-medium inline-flex flex-row items-center gap-1"
        >
          <MapPin className="w-3 h-3 shrink-0" />
          {property.location}
        </Badge>
        <div className="relative h-full w-full">
          <Image
            src={property.image}
            alt={property.name}
            fill
            className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
          />
        </div>
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-4 flex flex-row justify-between items-end">
          <h3 className="text-sm font-semibold text-white leading-tight">{property.name}</h3>
          <Badge className="font-mono text-xs shrink-0 ml-2">{property.price}</Badge>
        </div>
      </div>
      <CardContent className="p-4 flex-1 flex flex-col gap-4">
        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: Bed, label: `${property.beds} Beds` },
            { icon: Bath, label: `${property.baths} Baths` },
            { icon: Square, label: `${property.sqft.toLocaleString()} ft²` },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex flex-row items-center justify-center gap-1.5 rounded-md bg-muted px-2 py-2"
            >
              <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
              <span className="text-xs font-medium text-foreground whitespace-nowrap">{label}</span>
            </div>
          ))}
        </div>

        {property.progress > 0 ? (
          <div className="space-y-1.5">
            <div className="flex flex-row justify-between text-xs text-muted-foreground">
              <span>{property.status}</span>
              <span>{property.progress}% complete</span>
            </div>
            <Progress value={property.progress} className="h-1.5" />
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">{property.status}</p>
        )}

        <Button variant="outline" className="w-full mt-auto h-10 text-sm font-medium">
          <Link href={`/apply?property=${property.id}`}>View Blueprint</Link>
        </Button>
      </CardContent>
    </Card>
  )
}

export default function Home() {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = () => {
    if (!isAuthenticated) {
      // Store search query in localStorage for after login
      if (searchQuery) {
        localStorage.setItem("searchQuery", searchQuery)
      }
      router.push("/auth/login")
      return
    }
    // Store search query in localStorage
    if (searchQuery) {
      localStorage.setItem("searchQuery", searchQuery)
    }
    router.push("/recommendations")
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">

        {/* ── Header ── */}
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-2.5">
                <div className="flex items-center justify-center w-9 h-9 rounded-md bg-primary text-dark">
                  <HardHat className="w-5 h-5" />
                </div>
                <span className="text-base font-bold tracking-tight">
                  Roy<span className="text-primary">Construction</span>
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/*
                  FIX: SheetTrigger renders its own <button> internally.
                  We must NOT put a <Button> inside it — instead style
                  the trigger itself directly via className.
                */}
                <Sheet>
                  <SheetTrigger className="md:hidden h-10 px-4 inline-flex flex-row items-center gap-2 rounded-md border border-input bg-background text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground transition-colors">
                    <Menu className="w-4 h-4 shrink-0" />
                    Menu
                  </SheetTrigger>
                  <SheetContent side="bottom" className="rounded-t-2xl">
                    <SheetHeader className="text-left mb-4">
                      <SheetTitle>Quick Actions</SheetTitle>
                      <SheetDescription>
                        Open the account portal or jump to AI search actions.
                      </SheetDescription>
                    </SheetHeader>
                    <div className="flex flex-col gap-2 pb-6">
                      <Button
                        variant="outline"
                        className="justify-start h-11 flex flex-row items-center gap-2"
                      >
                        <Link href="/auth">
                          <User className="w-4 h-4 shrink-0" />
                          Account Portal
                        </Link>
                      </Button>
                      <Separator />
                      {propertiesData.quickActions.map((action) => (
                        <Button
                          key={action.label}
                          variant="ghost"
                          className="justify-start h-11 flex flex-row items-center gap-2"
                        >
                          <Link href="#">
                            <action.icon className="w-4 h-4 shrink-0 text-primary" />
                            {action.label}
                          </Link>
                        </Button>
                      ))}
                    </div>
                  </SheetContent>
                </Sheet>

                {/*
                  FIX: TooltipTrigger also renders its own <button>.
                  Use asChild on TooltipTrigger so it delegates to the
                  <Link> directly — no Button in between.
                */}
                <Tooltip>
                  <TooltipTrigger>
                    {isAuthenticated ? (
                      <Link
                        href="/recommendations"
                        className="hidden sm:inline-flex flex-row hover:text-primary/90 transition-colors"
                      >
                        {/* <Link
                        href="/recommendations"
                        className="hidden sm:inline-flex flex-row items-center gap-2 h-10 px-5 rounded-md text-sm font-semibold bg-secondary text-dark hover:bg-primary/90 transition-colors"
                      ></Link> */}
                        {/* <User className="w-4 h-4 shrink-0" />
                        logged in */}
                        <Badge variant="outline" className="gap-1.5 px-2.5 py-1 bg-green-500/10 text-green-700 border-green-200 dark:bg-green-500/20 dark:text-green-400 dark:border-green-500/30 rounded-full font-medium">
                          <span className="size-1.5 rounded-full bg-green-600 animate-pulse" />
                          AI Active
                        </Badge>
                      </Link>
                    ) : (
                      <Link
                        href="/auth/login"
                        className="hidden sm:inline-flex flex-row items-center gap-2 h-10 px-5 rounded-md text-sm font-semibold bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90 transition-colors"
                      >
                        <User className="w-4 h-4 shrink-0" />
                        Account
                      </Link>
                    )}
                  </TooltipTrigger>
                  <TooltipContent>Open your account portal</TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>
        </header>

        {/* ── Hero ── */}
        <section className="relative py-24 lg:py-36 px-4 overflow-hidden bg-background">
          <div className="absolute inset-0 opacity-50 bg-[radial-gradient(circle,_var(--border)_1px,_transparent_1px)] [background-size:24px_24px]" />

          <div className="max-w-3xl mx-auto relative z-10 text-center space-y-7">
            <Badge variant="outline" className="inline-flex flex-row items-center gap-2 px-3 py-1.5 text-xs font-medium">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              Agentic AI Powered
            </Badge>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-none">
              Acquire Your Property
              <br />
              <span className="text-primary">with Agentic AI</span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Describe your dream property. Our AI matches land
              and construction plans instantly.
            </p>

            {/* Search bar */}
            <div className="relative flex flex-row items-center max-w-2xl mx-auto rounded-xl border bg-background shadow-sm focus-within:ring-2 focus-within:ring-ring">
              <Sparkles className="absolute left-4 w-4 h-4 text-muted-foreground pointer-events-none shrink-0" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-0 shadow-none pl-11 pr-36 h-14 text-base focus-visible:ring-0 bg-transparent"
                placeholder="Try: 'Find a 2-acre lot for a mid-century modern home...'"
              />
              <div className="absolute right-2">
                <button
                  onClick={handleSearch}
                  className="h-10 px-5 inline-flex flex-row items-center gap-2 rounded-md text-sm font-semibold bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90 transition-colors"
                >
                  <ArrowUp className="w-4 h-4 shrink-0" />
                </button>
              </div>
            </div>

            {/* Quick action pills */}
            <div className="flex flex-wrap justify-center gap-3 pt-1">
              {propertiesData.quickActions.map((action) => (
                <button
                  key={action.label}
                  type="button"
                  className="h-11 px-5 inline-flex flex-row items-center gap-2.5 rounded-md border border-input bg-background text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  <action.icon className="w-4 h-4 text-primary shrink-0" />
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ── Featured Properties ── */}
        <section className="py-16 bg-muted/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10 space-y-1.5">
              <h2 className="text-2xl font-bold tracking-tight">Featured Opportunities</h2>
              <p className="text-sm text-muted-foreground">
                Premium properties selected by our AI for high investment potential
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {propertiesData.featured.map((property) => (
                <PropertyCard key={property.id} property={property} featured />
              ))}
            </div>
          </div>
        </section>

        {/* ── Full Catalog ── */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold tracking-tight">Curated Opportunities</h2>
                <p className="text-sm text-muted-foreground">
                  High-potential properties pre-vetted for construction.
                </p>
              </div>
              <Link
                href="/recommendations"
                className="h-10 px-5 inline-flex flex-row items-center gap-2 rounded-md border border-input bg-background text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground transition-colors shrink-0"
              >
                View all listings
                <ArrowRight className="w-4 h-4 shrink-0" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {propertiesData.catalog.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          </div>
        </section>

        {/* ── How It Works ── */}
        <section className="py-16 bg-muted/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10 space-y-1.5">
              <h2 className="text-2xl font-bold tracking-tight">How It Works</h2>
              <p className="text-sm text-muted-foreground">
                Three simple steps to your dream property
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  step: "01",
                  title: "AI Matchmaking",
                  desc: "Our agentic AI scans thousands of listings and zoning laws to find properties that match your vision perfectly.",
                  icon: Brain,
                },
                {
                  step: "02",
                  title: "Instant Feasibility",
                  desc: "Get immediate construction cost estimates, timeline projections, and architectural compatibility checks.",
                  icon: PenTool,
                },
                {
                  step: "03",
                  title: "Build & Track",
                  desc: "Watch your project come to life. Track milestones, approve changes, and view drone footage from your dashboard.",
                  icon: BarChart3,
                },
              ].map(({ step, title, desc, icon: Icon }) => (
                <Card key={step} className="p-6">
                  <div className="flex flex-row items-start gap-4">
                    <div className="flex items-center justify-center w-11 h-11 rounded-md bg-primary/10 text-primary shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex flex-row items-center gap-2">
                        <span className="text-xs font-mono text-muted-foreground">{step}</span>
                        <h3 className="text-sm font-semibold">{title}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="border-t bg-muted/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
              <p>&copy; 2026 RoyConstruction. All rights reserved.</p>
              <div className="flex gap-4">
                <Link href="#" className="hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
                <Link href="#" className="hover:text-foreground transition-colors">
                  Terms of Service
                </Link>
              </div>
            </div>
          </div>
        </footer>

      </div>
    </TooltipProvider>
  )
}