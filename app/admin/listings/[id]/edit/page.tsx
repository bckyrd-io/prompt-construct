"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { Building2, ArrowLeft, Check, Clock, Save, Plus, Trash2, Camera, Upload } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "@/components/AppSidebar";
import { Progress } from "@/components/ui/progress";
import { useAuthStore } from "@/lib/store/auth-store";

interface Milestone {
  id: number;
  name: string;
  completed: boolean;
  current: boolean;
  payment_status: 'paid' | 'due' | 'unpaid';
  amount: number;
  due_date?: string;
  photos?: string[];
}

interface Property {
  id: number;
  name: string;
  location: string;
  price: number;
  type: string;
  status: string;
  progress: number;
  milestones: Milestone[];
}

export default function EditPropertyPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuthStore();
  const propertyId = params.id as string;

  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [uploadingImage, setUploadingImage] = useState<number | null>(null);
  const [tempIdCounter, setTempIdCounter] = useState(-1);

  useEffect(() => {
    fetchProperty();
  }, [propertyId]);

  const fetchProperty = async () => {
    try {
      const response = await fetch(`/api/properties/${propertyId}`);
      if (response.ok) {
        const data = await response.json();
        setProperty(data.property);
        setMilestones(data.property.milestones);
      } else {
        alert("Failed to load property");
        router.push("/admin/listings");
      }
    } catch (error) {
      alert("Failed to load property");
      router.push("/admin/listings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Update milestones
      const response = await fetch(`/api/properties/${propertyId}/milestones`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ milestones })
      });

      if (response.ok) {
        const data = await response.json();
        setMilestones(data.milestones);
        if (property) {
          setProperty({ ...property, progress: data.progress });
        }
        alert("Changes saved successfully!");
      } else {
        alert("Failed to save changes");
      }
    } catch (error) {
      alert("Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  const updateMilestone = (index: number, field: keyof Milestone, value: any) => {
    const updated = [...milestones];
    updated[index] = { ...updated[index], [field]: value };
    
    // If marking as current, unmark others
    if (field === 'current' && value === true) {
      updated.forEach((m, i) => {
        if (i !== index) m.current = false;
      });
    }
    
    // If completing, mark current as false
    if (field === 'completed' && value === true) {
      updated[index].current = false;
    }
    
    setMilestones(updated);
  };

  const addMilestone = () => {
    const newMilestone: Milestone = {
      id: tempIdCounter, // temporary negative ID
      name: "",
      completed: false,
      current: false,
      payment_status: 'unpaid',
      amount: 0,
      photos: []
    };
    setMilestones([...milestones, newMilestone]);
    setTempIdCounter(tempIdCounter - 1);
  };

  const removeMilestone = (index: number) => {
    const updated = milestones.filter((_, i) => i !== index);
    setMilestones(updated);
  };

  const handleMilestoneImageUpload = async (index: number, file: File) => {
    setUploadingImage(index);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        const updated = [...milestones];
        const currentPhotos = updated[index].photos || [];
        updated[index] = { 
          ...updated[index], 
          photos: [...currentPhotos, data.url]
        };
        setMilestones(updated);
      } else {
        alert('Failed to upload image');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image');
    } finally {
      setUploadingImage(null);
    }
  };

  const removeMilestoneImage = (milestoneIndex: number, imageIndex: number) => {
    const updated = [...milestones];
    const currentPhotos = updated[milestoneIndex].photos || [];
    updated[milestoneIndex] = {
      ...updated[milestoneIndex],
      photos: currentPhotos.filter((_, i) => i !== imageIndex)
    };
    setMilestones(updated);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading property...</p>
        </div>
      </div>
    );
  }

  if (!property) return null;

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
                <span className="font-semibold tracking-tight text-foreground">Edit Property</span>
              </div>
            </div>
            <Button 
              onClick={handleSave} 
              disabled={isSaving}
              className="h-11 bg-black hover:bg-[#ffc300] hover:text-black"
            >
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </header>

          <div className="flex-1 overflow-y-auto p-8">
            <div className="max-w-4xl mx-auto">
              <div className="mb-6">
                <Link href="/admin/listings">
                  <Button variant="ghost" className="pl-0">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Listings
                  </Button>
                </Link>
              </div>

              {/* Property Header */}
              <Card className="mb-6">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h1 className="text-2xl font-bold">{property.name}</h1>
                      <p className="text-muted-foreground">{property.location}</p>
                    </div>
                    <Badge variant={property.status === 'active' ? 'default' : 'secondary'}>
                      {property.status}
                    </Badge>
                  </div>
                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span>Progress</span>
                      <span>{property.progress}%</span>
                    </div>
                    <Progress value={property.progress} />
                  </div>
                </CardContent>
              </Card>

              {/* Milestones */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Payment Milestones</CardTitle>
                  <Button 
                    onClick={addMilestone} 
                    variant="outline" 
                    size="sm"
                    className="h-9"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Stage
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {milestones.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>No milestones yet. Click "Add Stage" to create payment stages.</p>
                      </div>
                    )}
                    {milestones.map((milestone, index) => (
                      <div 
                        key={milestone.id} 
                        className={`p-4 rounded-lg border ${milestone.current ? 'border-primary bg-primary/5' : 'border-border'}`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-2 flex-1">
                            <span className="text-sm font-medium text-muted-foreground w-6">{index + 1}.</span>
                            <Input
                              value={milestone.name}
                              onChange={(e) => updateMilestone(index, 'name', e.target.value)}
                              placeholder="Stage name (e.g., Foundation, Roofing)"
                              className="h-9 flex-1"
                            />
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeMilestone(index)}
                            className="h-9 w-9 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mt-4 pl-8">
                          <div className="flex items-center gap-2">
                            <Checkbox 
                              id={`current-${milestone.id}`}
                              checked={milestone.current}
                              onCheckedChange={(checked: any) => updateMilestone(index, 'current', checked)}
                              disabled={milestone.completed}
                            />
                            <Label htmlFor={`current-${milestone.id}`} className="text-sm cursor-pointer">
                              Current Stage
                            </Label>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-muted-foreground">MK</span>
                            <Input
                              type="number"
                              value={milestone.amount}
                              onChange={(e) => updateMilestone(index, 'amount', parseInt(e.target.value) || 0)}
                              className="h-9"
                              placeholder="Amount"
                            />
                          </div>

                          <div className="flex items-center gap-2">
                            <Checkbox 
                              checked={milestone.completed}
                              onCheckedChange={(checked: any) => updateMilestone(index, 'completed', checked)}
                            />
                            <Label className="text-sm cursor-pointer">
                              Completed
                            </Label>
                          </div>
                        </div>

                        {/* Milestone Images */}
                        <div className="mt-4 pl-8">
                          <Label className="text-sm text-muted-foreground mb-2 block">Stage Photos</Label>
                          <div className="flex flex-wrap gap-2">
                            {milestone.photos?.map((photo, photoIndex) => (
                              <div key={photoIndex} className="relative w-20 h-20">
                                <img 
                                  src={photo} 
                                  alt={`Milestone ${index + 1} photo ${photoIndex + 1}`}
                                  className="w-full h-full object-cover rounded-md"
                                />
                                <button
                                  onClick={() => removeMilestoneImage(index, photoIndex)}
                                  className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                            <label className="w-20 h-20 border-2 border-dashed border-input rounded-md flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors">
                              {uploadingImage === index ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                              ) : (
                                <>
                                  <Camera className="w-5 h-5 text-muted-foreground mb-1" />
                                  <span className="text-xs text-muted-foreground">Add</span>
                                </>
                              )}
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleMilestoneImageUpload(index, file);
                                }}
                                disabled={uploadingImage === index}
                              />
                            </label>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </AppSidebar>
    );
}
