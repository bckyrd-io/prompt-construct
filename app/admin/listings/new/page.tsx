"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Package, Users, BarChart3, Settings, Building2, ArrowLeft, Plus, Camera, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label"
import { SidebarTrigger } from "@/components/ui/sidebar"
import AppSidebar from "@/components/AppSidebar"
import { useAuthStore } from "@/lib/store/auth-store"

export default function NewPropertyPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    price: "",
    type: "Residential",
    beds: "",
    baths: "",
    sqft: "",
    description: "",
    image_url: ""
  });
  const [uploading, setUploading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      if (response.ok) {
        const data = await response.json();
        setFormData({ ...formData, image_url: data.url });
        setUploadedImage(data.url);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!formData.name || !formData.location || !formData.price) {
      alert("Please fill in all required fields: Name, Location, and Price");
      return;
    }
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          location: formData.location,
          price: parseInt(formData.price.replace(/[^0-9]/g, "")),
          type: formData.type,
          beds: parseInt(formData.beds) || 0,
          baths: parseFloat(formData.baths) || 0,
          sqft: parseInt(formData.sqft) || 0,
          description: formData.description,
          image_url: formData.image_url
        })
      });

      if (response.ok) {
        router.push("/admin/listings");
      } else {
        const error = await response.json();
        alert(error.error || "Failed to create property");
      }
    } catch (error) {
      alert("Failed to create property");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppSidebar>
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
          <header className="flex h-16 shrink-0 items-center justify-between border-b bg-background px-6 transition-all">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="-ml-2 text-muted-foreground hover:text-foreground" />
              <div className="flex items-center gap-2 text-sm">
                <Link href="/admin/listings" className="text-muted-foreground hover:text-foreground">
                  Listings
                </Link>
                <span className="text-muted-foreground">/</span>
                <span className="font-semibold tracking-tight text-foreground">New Property</span>
              </div>
            </div>
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting || !formData.name || !formData.location || !formData.price}
              className="h-11 bg-black hover:bg-[#ffc300] hover:text-black"
            >
              <Save className="mr-2 h-4 w-4" />
              {isSubmitting ? "Creating..." : "Create Property"}
            </Button>
          </header>

          <div className="flex-1 overflow-y-auto p-8">
            <div className="max-w-2xl mx-auto">

              <Card>
                <CardContent>
                  <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Property Name</Label>
                      <Input className="h-11"
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g., The Highlands Estate"
                        required
                      />
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="price">Price</Label>
                        <Input className="h-11"
                          id="price"
                          type="number"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                          placeholder="1200000"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="type">Property Type</Label>
                        <select
                          id="type"
                          value={formData.type}
                          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                          className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                          required
                        >
                          <option value="Residential">Residential</option>
                          <option value="Land">Land</option>
                          <option value="Waterfront">Waterfront</option>
                          <option value="Commercial">Commercial</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input className="h-11"
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="e.g., Lilongwe"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="beds">Bedrooms</Label>
                        <Input className="h-11"
                          id="beds"
                          type="number"
                          value={formData.beds}
                          onChange={(e) => setFormData({ ...formData, beds: e.target.value })}
                          placeholder="4"
                          min="0"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="baths">Bathrooms</Label>
                        <Input className="h-11"
                          id="baths"
                          type="number"
                          step="0.5"
                          value={formData.baths}
                          onChange={(e) => setFormData({ ...formData, baths: e.target.value })}
                          placeholder="3.5"
                          min="0"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="sqft">Square Feet</Label>
                        <Input className="h-11"
                          id="sqft"
                          type="number"
                          value={formData.sqft}
                          onChange={(e) => setFormData({ ...formData, sqft: e.target.value })}
                          placeholder="3200"
                          min="0"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Describe the property features, amenities, location details..."
                        className="w-full  px-3 py-2 rounded-md border border-input bg-background text-sm resize-y"
                        rows={2}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="image">Property Image</Label>
                      <Input className="h-11"
                        id="image"
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        onChange={handleFileUpload}
                        disabled={uploading}
                      />
                      {uploading && (
                        <p className="text-xs text-muted-foreground">Uploading...</p>
                      )}
                      {uploadedImage && (
                        <div className="mt-2">
                          <img
                            src={uploadedImage}
                            alt="Preview"
                            className="h-32 w-full object-cover rounded-md border"
                          />
                        </div>
                      )}
                    </div>

                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
    </AppSidebar>
  );
}
