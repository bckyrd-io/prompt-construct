"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { LayoutDashboard, Package, Users, BarChart3, Settings, Building2, User, Plus, Clock, DollarSign, ListFilter, MapPin, Check, Hourglass, Camera , ChevronsUpDown, LogOut } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Sidebar, SidebarProvider, SidebarTrigger, SidebarContent, SidebarHeader, SidebarFooter, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

// Hardcoded admin listings data
const adminListingsData = {
  stats: {
    totalListings: 48,
    activeProjects: 12,
    pendingApprovals: 5,

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
    { name: "Dashboard", icon: LayoutDashboard, href: "/admin/reports" },
    { name: "Listings", icon: Package, active: true, href: "/admin/listings" },
    { name: "Leads", icon: Users, href: "/admin/users" },
    { name: "Analytics", icon: BarChart3, href: "/admin/reports" },
    { name: "Settings", icon: Settings, href: "#" }
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
    <SidebarProvider>
            <div className="flex min-h-screen w-full bg-muted/40">
        <Sidebar collapsible="icon" className="border-r border-border !bg-white">
          <SidebarHeader className="h-16 border-b flex items-center justify-center px-4">
            <Link href="/" className="flex items-center gap-3 w-full overflow-hidden group-data-[collapsible=icon]:justify-center">
              <div className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Building2 className="size-4" />
              </div>
              <div className="flex flex-col leading-none truncate group-data-[collapsible=icon]:hidden">
                <span className="font-semibold tracking-tight text-sm">RoyConstruction</span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">Admin Portal</span>
              </div>
            </Link>
          </SidebarHeader>
          <SidebarContent className="p-4">
            <SidebarMenu className="gap-2">
              {adminListingsData.navItems.map((item) => (
                <SidebarMenuItem className="w-full" key={item.name}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={item.active} 
                    tooltip={item.name}
                    className="h-10 px-3 transition-colors"
                  >
                    <Link href={item.href} className={`flex items-center gap-3 group-data-[collapsible=icon]:justify-center ${item.active ? 'bg-primary/10' : ''}`}>
                      <item.icon className="size-4 shrink-0" />
                      <span className={`text-sm font-medium group-data-[collapsible=icon]:hidden ${item.active ? 'text-primary' : ''}`}>{item.name}</span>
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
                    <SidebarMenuButton size="lg" className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground group-data-[collapsible=icon]:justify-center">
                      <Avatar className="h-8 w-8 rounded-lg border">
                        <AvatarFallback className="rounded-lg bg-primary/10 text-primary font-medium text-xs">TC</AvatarFallback>
                      </Avatar>
                      <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                        <span className="truncate font-semibold">Tom Cook</span>
                        <span className="truncate text-xs text-muted-foreground">Site Manager</span>
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
                        <AvatarFallback className="rounded-lg bg-primary/10 text-primary font-medium text-xs">TC</AvatarFallback>
                      </Avatar>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold">Tom Cook</span>
                        <span className="truncate text-xs text-muted-foreground">tom.cook@example.com</span>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer">
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
              <div className="flex items-center gap-2 text-sm">
                <span className="font-semibold tracking-tight text-foreground">Listings</span>
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-8">
          {/* Filter Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {[
              { id: "all", label: "All Listings", count: adminListingsData.stats.totalListings, icon: Package, color: "bg-blue-500" },
              { id: "active", label: "Active", count: adminListingsData.stats.activeProjects, icon: Building2, color: "bg-green-500" },
              { id: "pending", label: "Pending", count: adminListingsData.stats.pendingApprovals, icon: Clock, color: "bg-orange-500" },
              { id: "available", label: "Available", count: adminListingsData.listings.filter(l => l.status === 'available').length, icon: DollarSign, color: "bg-[#ffc300]" }
            ].map((f) => (
              <Card
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  filter === f.id 
                    ? 'ring-2 ring-primary shadow-md' 
                    : 'hover:border-primary/50'
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase text-muted-foreground">{f.label}</p>
                      <p className="text-2xl font-bold text-foreground mt-1">{f.count}</p>
                    </div>
                    <div className={`p-2 rounded-lg ${f.color} text-white`}>
                      <f.icon className="w-5 h-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

       

          {/* Listings Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredListings.map((listing) => (
              <Card key={listing.id} className="rounded-xl shadow-sm border-border overflow-hidden">
                <div className="flex relative">
                  <div className="relative w-48 h-48 flex-shrink-0">
                    <Image 
                      src={listing.image} 
                      alt={listing.name}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-2 left-2">
                      <Badge className={`uppercase ${
                        listing.status === 'active' ? 'bg-green-500 hover:bg-green-600' :
                        listing.status === 'available' ? 'bg-[#ffc300] hover:bg-[#ffc300] text-black' :
                        listing.status === 'pending' ? 'bg-orange-500 hover:bg-orange-600' :
                        'bg-gray-500 hover:bg-gray-600'
                      }`}>
                        {listing.status}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="flex-1 p-4 pb-0 items-start">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-foreground">{listing.name}</h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {listing.location}
                        </p>
                      </div>
                      <p className="text-lg font-bold text-primary">${listing.price.toLocaleString()}</p>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      <span>{listing.type}</span>
                      {listing.client && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {listing.client}
                          </span>
                        </>
                      )}
                    </div>

                    {listing.progress > 0 && (
                      <div className="mb-3">
                        <div className="flex justify-between text-xs font-semibold uppercase mb-1">
                          <span>Progress</span>
                          <span>{listing.progress}%</span>
                        </div>
                        <Progress value={listing.progress} className="h-2 bg-muted [&>[data-slot=progress-indicator]]:bg-primary" />
                      </div>
                    )}

                    {/* Milestone Editor */}
                    {listing.status === 'active' && listing.milestones.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-border">
                        <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">Milestones</p>
                        <div className="flex flex-wrap gap-2">
                          {listing.milestones.map((milestone, idx) => (
                            <Badge 
                              key={idx}
                              variant="secondary"
                              className={`flex items-center gap-1 ${
                                milestone.completed 
                                  ? 'bg-green-100 text-green-700 hover:bg-green-100' 
                                  : milestone.current
                                  ? 'bg-[#ffc300] text-black hover:bg-[#ffc300]'
                                  : 'bg-gray-100 text-gray-400 hover:bg-gray-100'
                              }`}
                            >
                              {milestone.completed ? <Check className="w-3 h-3" /> : milestone.current ? <Clock className="w-3 h-3" /> : <Hourglass className="w-3 h-3" />}
                              {milestone.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2 mt-3 pb-4">
                      <Button className="flex-1 h-11 bg-black hover:bg-[#ffc300] hover:text-black text-white font-semibold uppercase transition-colors">
                        Edit
                      </Button>
                      {listing.status === 'active' && (
                        <Button size="icon" className="h-11 w-11 bg-[#ffc300] hover:bg-[#e6b000] text-black transition-colors">
                          <Camera className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>

          {filteredListings.length === 0 && (
            <Card className="p-16 text-center">
              <div className="bg-muted p-6 rounded-full inline-block mb-4">
                <Package className="w-10 h-10 text-muted-foreground" />
              </div>
              <CardTitle className="text-lg font-semibold mb-2">No listings found</CardTitle>
              <p className="text-muted-foreground mb-4">Try adjusting your filters or create a new listing</p>
              <Button className="h-11 bg-[#ffc300] hover:bg-[#e6b000] text-black font-semibold">
                Create New Listing
              </Button>
            </Card>
          )}
        </div>
      </main>
    </div>
    </SidebarProvider>
  );
}
