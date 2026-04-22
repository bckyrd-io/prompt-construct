"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Package, Building2, User, Plus, Clock, DollarSign, MapPin, Check, Hourglass, Camera, CreditCard } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "@/components/AppSidebar";
import { useAuthStore } from "@/lib/store/auth-store";

interface Milestone {
  id: number;
  name: string;
  completed: boolean;
  current: boolean;
}

interface Property {
  id: number;
  name: string;
  location: string;
  price: number;
  type: string;
  status: string;
  progress: number;
  image_url: string;
  client?: {
    name: string;
  } | null;
  milestones: Milestone[];
}

export default function AdminListingsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [filter, setFilter] = useState("all");
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalListings: 0,
    activeProjects: 0,
    pendingApprovals: 0,
    availableCount: 0
  });

  useEffect(() => {
    // Initialize database and fetch properties
    fetch("/api/init")
      .then(() => fetchProperties())
      .catch(() => fetchProperties());
  }, []);

  const fetchProperties = async () => {
    try {
      const response = await fetch("/api/properties");
      if (response.ok) {
        const data = await response.json();
        setProperties(data.properties);
        
        // Calculate stats
        const active = data.properties.filter((p: Property) => p.status === 'active').length;
        const pending = data.properties.filter((p: Property) => p.status === 'pending').length;
        const available = data.properties.filter((p: Property) => p.status === 'available').length;
        
        setStats({
          totalListings: data.properties.length,
          activeProjects: active,
          pendingApprovals: pending,
          availableCount: available
        });
      }
    } catch (error) {
      console.error("Failed to fetch properties:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredListings = properties.filter(listing => {
    if (filter === "all") return true;
    return listing.status === filter;
  });

  return (
    <AppSidebar>
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
              { id: "all", label: "All Listings", count: stats.totalListings, icon: Package, color: "bg-blue-500" },
              { id: "active", label: "Active", count: stats.activeProjects, icon: Building2, color: "bg-green-500" },
              { id: "pending", label: "Pending", count: stats.pendingApprovals, icon: Clock, color: "bg-orange-500" },
              { id: "available", label: "Available", count: stats.availableCount, icon: CreditCard, color: "bg-[#ffc300]" }
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
          {isLoading ? (
            <Card className="p-16 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading properties...</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredListings.map((listing) => (
              <Card key={listing.id} className="rounded-xl shadow-sm border-border overflow-hidden">
                <div className="flex relative">
                  <div className="relative w-48 h-48 flex-shrink-0">
                    <Image 
                      src={listing.image_url} 
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
                      <p className="text-lg font-bold text-primary">MWK {listing.price.toLocaleString()}</p>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      <span>{listing.type}</span>
                      {listing.client && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {listing.client.name}
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
                      <Link href={`/admin/listings/${listing.id}/edit`} className="flex-1">
                        <Button className="w-full h-11 bg-black hover:bg-[#ffc300] hover:text-black text-white font-semibold uppercase transition-colors">
                          Edit
                        </Button>
                      </Link>
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
            {!isLoading && filteredListings.length === 0 && (
              <Card className="p-16 text-center col-span-2">
                <div className="bg-muted p-6 rounded-full inline-block mb-4">
                  <Package className="w-10 h-10 text-muted-foreground" />
                </div>
                <CardTitle className="text-lg font-semibold mb-2">No listings found</CardTitle>
                <p className="text-muted-foreground mb-4">Try adjusting your filters or create a new listing</p>
                <Link href="/admin/listings/new">
                  <Button className="h-11 bg-[#ffc300] hover:bg-[#e6b000] text-black font-semibold">
                    Create New Listing
                  </Button>
                </Link>
              </Card>
            )}
          </div>
        )}
      </div>
    </main>
    </AppSidebar>
  );
}
