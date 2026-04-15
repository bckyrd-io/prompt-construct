"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  HardHat,
  LayoutDashboard,
  ThumbsUp,
  Building2,
  MessageSquare,
  Settings,
  Brain,
  TrendingUp,
  Lightbulb,
  Star,
  MapPin,
  CheckCircle,
  Bed,
  Bath,
  Square,
  Mountain,
  Calculator,
  CreditCard,
  SearchX,
  LogOut,
  ChevronsUpDown,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sidebar,
  SidebarProvider,
  SidebarTrigger,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Navigation items for client sidebar
const navItems = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { name: "Recommendations", icon: ThumbsUp, active: true, href: "/recommendations" },
  { name: "My Projects", icon: Building2, href: "/dashboard" },
  { name: "Messages", icon: MessageSquare, href: "/chat" },
  { name: "Settings", icon: Settings, href: "#" },
];

// Hardcoded recommendations data
const recommendationsData = {
  filters: [
    { name: "Location", options: ["All Locations", "Austin, TX", "Seattle, WA", "Denver, CO", "Miami, FL"] },
    { name: "Property Type", options: ["All Types", "Residential", "Commercial", "Land Only", "Waterfront"] },
    { name: "Price Range", options: ["Any Price", "Under $500K", "$500K - $1M", "$1M - $2M", "$2M+"] },
    { name: "Status", options: ["All Status", "Available", "In Progress", "Ready to Build", "Completed"] },
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
      timeline: "6-8 months remaining",
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
      timeline: "5-6 months to complete",
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
      timeline: "12-14 months estimated",
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
      timeline: "7-9 months estimated",
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
      timeline: "8-10 months remaining",
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
      timeline: "6-8 months estimated",
    },
  ],
  aiInsights: {
    summary:
      "Based on your preferences for modern architecture, family-friendly spaces, and locations with strong appreciation potential, I've found 6 high-match properties.",
    marketTrend: "Austin and Seattle markets showing 8-12% annual appreciation",
    recommendation: "Consider The Highlands Estate for immediate value, or Urban Loft for rental income potential.",
  },
};

export default function RecommendationsPage() {
  const router = useRouter();
  const [activeFilters, setActiveFilters] = useState({
    location: "All Locations",
    type: "All Types",
    price: "Any Price",
    status: "All Status",
  });
  const [sortBy, setSortBy] = useState("match");

  const filteredMatches = recommendationsData.matches
    .filter((match) => {
      if (activeFilters.location !== "All Locations" && !match.location.includes(activeFilters.location.split(",")[0])) return false;
      if (activeFilters.type !== "All Types" && match.type !== activeFilters.type) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "match") return b.matchScore - a.matchScore;
      if (sortBy === "price-low") return a.price - b.price;
      if (sortBy === "price-high") return b.price - a.price;
      return 0;
    });

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-muted/40">
        <Sidebar collapsible="icon" className="border-r border-border !bg-white">
          <SidebarHeader className="h-16 border-b flex items-center justify-center px-4">
            <Link href="/" className="flex items-center gap-3 w-full overflow-hidden group-data-[collapsible=icon]:justify-center">
              <div className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <HardHat className="size-4" />
              </div>
              <div className="flex flex-col leading-none truncate group-data-[collapsible=icon]:hidden">
                <span className="font-semibold tracking-tight text-sm">RoyConstruction</span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">Client Portal</span>
              </div>
            </Link>
          </SidebarHeader>
          <SidebarContent className="p-4">
            <SidebarMenu className="gap-2">
              {navItems.map((item) => (
                <SidebarMenuItem className="w-full" key={item.name}>
                  <SidebarMenuButton
                    asChild
                    isActive={item.active}
                    tooltip={item.name}
                    className="h-10 px-3 transition-colors"
                  >
                    <Link href={item.href} className={`flex items-center gap-3 group-data-[collapsible=icon]:justify-center ${item.active ? "bg-primary/10" : ""}`}>
                      <item.icon className="size-4 shrink-0" />
                      <span className={`text-sm font-medium group-data-[collapsible=icon]:hidden ${item.active ? "text-primary" : ""}`}>
                        {item.name}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="border-t p-4">
            <SidebarMenu>
              <SidebarMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton
                      size="lg"
                      className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground group-data-[collapsible=icon]:justify-center"
                    >
                      <Avatar className="h-8 w-8 rounded-lg border">
                        <AvatarFallback className="rounded-lg bg-primary/10 text-primary font-medium text-xs">JR</AvatarFallback>
                      </Avatar>
                      <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                        <span className="truncate font-semibold">James Roy</span>
                        <span className="truncate text-xs text-muted-foreground">Client</span>
                      </div>
                      <ChevronsUpDown className="ml-auto size-4 text-muted-foreground group-data-[collapsible=icon]:hidden" />
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                    side="bottom"
                    align="end"
                    sideOffset={4}
                  >
                    <div className="flex items-center gap-2 px-2 py-2 text-left text-sm">
                      <Avatar className="h-8 w-8 rounded-lg border">
                        <AvatarFallback className="rounded-lg bg-primary/10 text-primary font-medium text-xs">JR</AvatarFallback>
                      </Avatar>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold">James Roy</span>
                        <span className="truncate text-xs text-muted-foreground">james.roy@example.com</span>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer" onClick={() => router.push("/")}>
                      <LogOut className="mr-2 h-4 w-4 text-muted-foreground" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col h-screen overflow-hidden">
          <header className="flex h-16 shrink-0 items-center justify-between border-b bg-background px-6 transition-all">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="-ml-2 text-muted-foreground hover:text-foreground" />
              <h2 className="text-sm font-semibold tracking-tight text-foreground">AI Property Recommendations</h2>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-4 md:p-8">
            {/* AI Insights Banner */}
            <Card className="bg-black text-white border-none mb-6">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/20 p-3 rounded-full flex-shrink-0">
                    <Brain className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h2 className="text-lg font-bold">AI-Powered Recommendations</h2>
                      
                    </div>
                    <p className="text-gray-300 text-sm mb-3">{recommendationsData.aiInsights.summary}</p>
                    <Badge className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                        {filteredMatches.length} Matches
                      </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            

            {/* Results Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredMatches.map((property) => (
                <Card key={property.id} className="overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group">
                  <div className="relative h-56">
                    <Image src={property.image} alt={property.name} fill className="object-cover" />
                    <div className="absolute top-4 left-4 right-4 flex justify-between">
                      
                      <Badge variant="secondary" className="bg-white/90 hover:bg-white/90 backdrop-blur text-foreground text-xs font-semibold px-3 py-1.5 shadow-sm">
                        {property.status}
                      </Badge>
                    </div>
                  
                  </div>

                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">{property.name}</h3>
                        <p className="text-muted-foreground text-sm flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {property.location}
                        </p>
                      </div>
                      <p className="text-xl font-bold text-primary">{property.displayPrice}</p>
                    </div>

                    {/* AI Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {property.aiTags.map((tag, idx) => (
                        <Badge key={idx} variant="secondary" className="bg-muted text-muted-foreground px-2 py-1 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-primary" />
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    {/* Property Specs */}
                    <div className="grid grid-cols-4 gap-2 mb-4">
                      <div className="text-center p-2 bg-muted rounded-lg">
                        <Bed className="w-4 h-4 text-primary mx-auto" />
                        <p className="text-xs font-semibold text-foreground">{property.beds}</p>
                      </div>
                      <div className="text-center p-2 bg-muted rounded-lg">
                        <Bath className="w-4 h-4 text-primary mx-auto" />
                        <p className="text-xs font-semibold text-foreground">{property.baths}</p>
                      </div>
                      <div className="text-center p-2 bg-muted rounded-lg">
                        <Square className="w-4 h-4 text-primary mx-auto" />
                        <p className="text-xs font-semibold text-foreground">{(property.sqft / 1000).toFixed(1)}k</p>
                      </div>
                      <div className="text-center p-2 bg-muted rounded-lg">
                        <Mountain className="w-4 h-4 text-primary mx-auto" />
                        <p className="text-xs font-semibold text-foreground">{property.acres}ac</p>
                      </div>
                    </div>

                    {/* AI Estimates */}
                    <div className="bg-muted/50 p-4 rounded-lg border border-border mb-4">
                      <div className="flex items-center gap-1 mb-2">
                        <Calculator className="w-4 h-4 text-primary" />
                        <h4 className="text-xs font-semibold uppercase text-muted-foreground">AI Construction Estimate</h4>
                      </div>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm font-bold text-foreground">{property.constructionEstimate}</p>
                          <p className="text-xs text-muted-foreground">{property.timeline}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Total Investment</p>
                          <p className="text-sm font-semibold text-foreground">
                            ${((property.price + parseInt(property.constructionEstimate.replace(/[^0-9]/g, "").slice(0, 6))) / 1000000).toFixed(1)}M -{" "}
                            ${((property.price + parseInt(property.constructionEstimate.replace(/[^0-9]/g, "").slice(-6))) / 1000000).toFixed(1)}M
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="p-6 pt-0">
                    <div className="flex gap-3 w-full mt-5">
                      <Button asChild variant="outline" className="flex-1 h-11 ">
                        <Link href={`/apply?property=${property.id}`}>
                          apply
                        </Link>
                      </Button>
                      <Button asChild className="h-11 ">
                        <Link href={`/payment?property=${property.id}`}>
                          <CreditCard className="w-4 h-4" />
                        </Link>
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>

            {/* Empty State */}
            {filteredMatches.length === 0 && (
              <Card className="p-16 text-center">
                <div className="bg-muted p-6 rounded-full inline-block mb-4">
                  <SearchX className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">No matches found</h3>
                <p className="text-muted-foreground mb-4">Try adjusting your filters or start a new AI chat</p>
                <Button asChild className="h-11">
                  <Link href="/chat" className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Start New Search
                  </Link>
                </Button>
              </Card>
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
