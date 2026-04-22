"use client";

import { useState, useEffect } from "react";
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
  MapPin,
  Bed,
  Bath,
  Square,
  SearchX,
  LogOut,
  ChevronsUpDown,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "@/components/AppSidebar";
import { useAuthStore } from "@/lib/store/auth-store";

export default function RecommendationsPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  const [properties, setProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isGeneratingEmbeddings, setIsGeneratingEmbeddings] = useState(false);
  const [embeddingsReady, setEmbeddingsReady] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [avgConfidence, setAvgConfidence] = useState<number>(0);

  const [activeFilters, setActiveFilters] = useState({
    location: "All Locations",
    type: "All Types",
    price: "Any Price",
    status: "All Status",
  });

  const [sortBy, setSortBy] = useState("price-low");

  useEffect(() => {
    const savedSearch = localStorage.getItem("searchQuery");
    if (savedSearch) {
      setSearchQuery(savedSearch);
      setHasSearched(true);
      localStorage.removeItem("searchQuery");
    } else {
      setHasSearched(false);
    }
    setIsInitialized(true);
  }, []);

  // Check embedding status on mount and generate if needed
  useEffect(() => {
    if (!isInitialized) return;

    const checkAndGenerateEmbeddings = async () => {
      try {
        setLoadingMessage("Checking AI embeddings...");
        const response = await fetch('/api/embeddings/generate');
        const data = await response.json();

        if (data.without_embeddings > 0) {
          setLoadingMessage("Generating AI embeddings for properties...");
          setIsGeneratingEmbeddings(true);
          const genResponse = await fetch('/api/embeddings/generate', {
            method: 'POST'
          });
          const genData = await genResponse.json();
          console.log('Generated embeddings:', genData);
        }
        
        setEmbeddingsReady(true);
        setLoadingMessage("");
      } catch (error) {
        console.error('Error checking embeddings:', error);
        setEmbeddingsReady(true); // Proceed anyway on error
        setLoadingMessage("");
      }
    };

    checkAndGenerateEmbeddings();
  }, [isInitialized]);

  const fetchProperties = async () => {
    try {
      if (searchQuery) {
        setLoadingMessage("Searching with AI...");
      }
      
      const params = new URLSearchParams();

      if (searchQuery) params.append("search", searchQuery);
      if (activeFilters.location !== "All Locations")
        params.append("location", activeFilters.location);
      if (activeFilters.type !== "All Types")
        params.append("type", activeFilters.type);
      if (activeFilters.status !== "All Status")
        params.append("status", activeFilters.status);

      const response = await fetch(`/api/properties?${params.toString()}`);

      if (response.ok) {
        const data = await response.json();
        setProperties(data.properties || []);
        
        // Calculate average confidence from similarity scores if available
        if (data.properties && data.properties.length > 0 && data.properties[0].similarity) {
          const avgSim = data.properties.reduce((sum: number, p: any) => sum + (p.similarity || 0), 0) / data.properties.length;
          setAvgConfidence(Math.round(avgSim * 100));
        } else {
          setAvgConfidence(0);
        }
      } else {
        const errorData = await response.json();
        // Display user-friendly error alert
        alert(`Search Error: ${errorData.error || 'Failed to fetch properties'}\n\n${errorData.details || ''}\n${errorData.suggestion || ''}`);
        console.error("API Error:", errorData);
      }
    } catch (error) {
      console.error("Failed to fetch properties:", error);
      alert("Network Error: Failed to connect to the server. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
      setLoadingMessage("");
    }
  };

  useEffect(() => {
    // Only fetch after embeddings are ready and localStorage is checked
    if (embeddingsReady && isInitialized && (searchQuery !== "" || !hasSearched)) {
      fetchProperties();
    }
  }, [activeFilters, searchQuery, hasSearched, isInitialized, embeddingsReady]);

  const filteredProperties = properties.sort((a, b) => {
    if (sortBy === "price-low") return a.price - b.price;
    if (sortBy === "price-high") return b.price - a.price;
    return 0;
  });

  return (
    <AppSidebar>
      <main className="flex-1 flex flex-col">
        <header className="h-16 flex items-center justify-between border-b px-6">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <h2 className="text-sm font-semibold">
              AI Property Recommendations
            </h2>
          </div>
          <div className="flex items-center gap-4">
            {hasSearched && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setHasSearched(false);
                }}
                className="h-8 text-xs"
              >
                Clear Search
              </Button>
            )}
            <Badge variant="outline" className="gap-1.5 px-2.5 py-1 bg-green-500/10 text-green-700 border-green-200 dark:bg-green-500/20 dark:text-green-400 dark:border-green-500/30 rounded-full font-medium">
              <span className="size-1.5 rounded-full bg-green-600 animate-pulse" />
              AI Active
            </Badge>

          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          {/* Banner */}
          <Card className="bg-black text-white mb-6">
            <CardContent className="p-6 flex gap-4">
              <Brain className="w-6 h-6" />
              <div className="flex-1">
                <h2 className="font-bold flex items-center gap-2">
                  AI-Powered Recommendations
                  <span className="text-xs font-normal text-gray-400">Powered by Gemini AI</span>
                </h2>
                <p className="text-sm text-gray-300">
                  {hasSearched
                    ? avgConfidence > 0
                      ? `AI confidence: ${avgConfidence}% - Found ${filteredProperties.length} properties matching "${searchQuery}"`
                      : `Found ${filteredProperties.length} properties matching "${searchQuery}"`
                    : `Showing all ${filteredProperties.length} available properties`}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* ✅ FIXED SECTION */}
          {isLoading || isGeneratingEmbeddings ? (
            <div className="flex flex-col justify-center h-64 items-center gap-4">
              <div className="animate-spin h-8 w-8 border-b-2 border-primary rounded-full" />
              <p className="text-sm text-muted-foreground">
                {loadingMessage || "Loading..."}
              </p>
            </div>
          ) : (
            <>
              {filteredProperties.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProperties.map((property) => (
                    <Card key={property.id} className="group flex flex-col h-full overflow-hidden">
                      <div className="relative h-64 overflow-hidden">
                        <Badge
                          className="absolute top-3 left-3 z-10 font-semibold text-xs"
                          variant="secondary"
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
                            src={property.image_url || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800"}
                            alt={property.name}
                            fill
                            className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                          />
                        </div>
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-4 flex flex-row justify-between items-end">
                          <h3 className="text-sm font-semibold text-white leading-tight">{property.name}</h3>
                          <Badge className="font-mono text-xs shrink-0 ml-2">MK {property.price?.toLocaleString()}</Badge>
                        </div>
                      </div>
                      <CardContent className="p-4 flex-1 flex flex-col gap-4">
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { icon: Bed, label: `${property.beds || 0} Beds` },
                            { icon: Bath, label: `${property.baths || 0} Baths` },
                            { icon: Square, label: `${(property.sqft || 0).toLocaleString()} ft²` },
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
                       
                          <div className="space-y-1.5">
                            <div className="flex flex-row justify-between text-xs text-muted-foreground">
                              <span className="text-xs text-muted-foreground">{property.status}</span>
                              <span>{property.progress}%</span>
                            </div>
                            <Progress value={property.progress} className="h-1.5 bg-green-500" />
                          </div>
                        )}

                        <Button variant="outline" className="w-full mt-auto h-10 text-sm font-medium" asChild>
                          <Link href={`/apply?property=${property.id}`}>Acquire</Link>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="p-16 text-center">
                  <SearchX className="w-10 h-10 mx-auto mb-4" />
                  <h3>{hasSearched ? "No properties found" : "No properties available"}</h3>
                  <p>{hasSearched ? "Try adjusting your search or filters" : "Check back later for new listings"}</p>
                </Card>
              )}
            </>
          )}
        </div>
           {/* <p className="text-xs text-muted-foreground">{property.status}</p> */}
      </main>
    </AppSidebar>
  );
}