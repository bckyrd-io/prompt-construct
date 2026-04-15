"use client"

import { useState, Suspense } from "react"
import Image from "next/image"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { LayoutDashboard, ThumbsUp, FileText, MessageSquare, Settings, HardHat, User, Home, Banknote, CheckCircle, Bed, Bath, Square, Info, Check, Upload, ShieldCheck, CreditCard, ArrowRight, Clock, ChevronsUpDown, LogOut } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Sidebar, SidebarProvider, SidebarTrigger, SidebarContent, SidebarHeader, SidebarFooter, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

// Navigation items for client sidebar
const navItems = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { name: "Recommendations", icon: ThumbsUp, href: "/recommendations" },
  { name: "Apply", icon: FileText, active: true, href: "/apply" },
  { name: "Messages", icon: MessageSquare, href: "/chat" },
  { name: "Settings", icon: Settings, href: "#" },
];

// Hardcoded application workflow data
const applicationData = {
  steps: [
    { id: 1, name: "Property Selection", status: "completed", icon: Home },
    { id: 2, name: "Personal Details", status: "current", icon: User },
    { id: 3, name: "Financial Info", status: "pending", icon: Banknote },
    { id: 4, name: "Documents", status: "pending", icon: FileText },
    { id: 5, name: "Review & Submit", status: "pending", icon: CheckCircle }
  ],
  properties: [
    {
      id: "RC-2024-88",
      name: "The Highlands Estate",
      location: "Austin, TX",
      price: "$1,200,000",
      image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
      specs: { beds: 4, baths: 3.5, sqft: 3200 }
    },
    {
      id: "RC-2024-92",
      name: "Urban Loft Project",
      location: "Seattle, WA",
      price: "$850,000",
      image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800",
      specs: { beds: 2, baths: 2, sqft: 1800 }
    }
  ],
  documentTypes: [
    { id: "id", name: "Government ID", required: true, description: "Driver's license or passport" },
    { id: "proof-income", name: "Proof of Income", required: true, description: "Last 2 pay stubs or tax returns" },
    { id: "bank-statements", name: "Bank Statements", required: true, description: "Last 3 months" },
    { id: "credit-report", name: "Credit Report", required: false, description: "Optional - we can pull this" }
  ]
};

function ApplicationContent() {
  const searchParams = useSearchParams();
  const propertyId = searchParams.get("property") || "RC-2024-88";
  const [currentStep, setCurrentStep] = useState(2);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    employment: "",
    income: "",
    downPayment: ""
  });
  const [uploadedDocs, setUploadedDocs] = useState<string[]>([]);

  const selectedProperty = applicationData.properties.find(p => p.id === propertyId) || applicationData.properties[0];

  const handleNext = () => {
    if (currentStep < 5) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = () => {
    alert("Application submitted successfully! Reference: APP-2024-" + Math.floor(Math.random() * 10000));
  };

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

        {/* Main Content */}
        <main className="flex-1 flex flex-col h-screen overflow-hidden">
          {/* Header */}
          <header className="flex h-16 shrink-0 items-center justify-between border-b bg-background px-6 transition-all">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="-ml-2 text-muted-foreground hover:text-foreground" />
              <div className="flex items-center gap-2 text-sm">
                <Link href="/recommendations" className="text-muted-foreground hover:text-foreground">Recommendations</Link>
                <span className="text-muted-foreground">/</span>
                <span className="font-semibold tracking-tight text-foreground">Property Application</span>
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto">
          {/* Progress Steps */}
          <div className="bg-background border-b border-border">
            <div className="max-w-6xl mx-auto px-8 py-6">
              <div className="flex items-center justify-between">
                {applicationData.steps.map((step, idx) => (
                  <div key={step.id} className="flex items-center">
                    <div className={`flex flex-col items-center ${idx < applicationData.steps.length - 1 ? 'flex-1' : ''}`}>
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                        step.id < currentStep ? 'bg-green-500 text-white' :
                        step.id === currentStep ? 'bg-primary text-primary-foreground' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        <step.icon className="w-5 h-5" />
                      </div>
                      <span className={`text-xs font-bold uppercase ${
                        step.id <= currentStep ? 'text-foreground' : 'text-muted-foreground'
                      }`}>{step.name}</span>
                    </div>
                    {idx < applicationData.steps.length - 1 && (
                      <div className={`h-1 w-16 mx-2 rounded ${
                        step.id < currentStep ? 'bg-green-500' : 'bg-muted'
                      }`}></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-6xl mx-auto px-8 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Application Form */}
              <div className="lg:col-span-2">
                {currentStep === 1 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xl font-semibold">Selected Property</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                    <div className="relative h-64 rounded-xl overflow-hidden mb-4">
                      <Image src={selectedProperty.image} alt={selectedProperty.name} fill className="object-cover" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground">{selectedProperty.name}</h3>
                    <p className="text-muted-foreground mb-4">{selectedProperty.location}</p>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <Bed className="w-5 h-5 text-primary mx-auto" />
                        <p className="font-bold">{selectedProperty.specs.beds} Beds</p>
                      </div>
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <Bath className="w-5 h-5 text-primary mx-auto" />
                        <p className="font-bold">{selectedProperty.specs.baths} Baths</p>
                      </div>
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <Square className="w-5 h-5 text-primary mx-auto" />
                        <p className="font-bold">{selectedProperty.specs.sqft.toLocaleString()} sqft</p>
                      </div>
                    </div>
                    <p className="text-xl font-bold text-primary">{selectedProperty.price}</p>
                    </CardContent>
                  </Card>
                )}

                {currentStep === 2 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xl font-semibold">Personal Information</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">First Name</Label>
                        <Input
                          type="text"
                          value={formData.firstName}
                          onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                          placeholder="John"
                          className="h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Last Name</Label>
                        <Input
                          type="text"
                          value={formData.lastName}
                          onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                          placeholder="Doe"
                          className="h-11"
                        />
                      </div>
                    </div>
                    <div className="mb-4 space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Email Address</Label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        placeholder="john@example.com"
                        className="h-11"
                      />
                    </div>
                    <div className="mb-4 space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Phone Number</Label>
                      <Input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        placeholder="(555) 123-4567"
                        className="h-11"
                      />
                    </div>
                    <div className="mb-4 space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Current Address</Label>
                      <Input
                        type="text"
                        value={formData.address}
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                        className="mb-2 h-11"
                        placeholder="Street Address"
                      />
                      <div className="grid grid-cols-3 gap-2">
                        <Input
                          type="text"
                          value={formData.city}
                          onChange={(e) => setFormData({...formData, city: e.target.value})}
                          placeholder="City"
                          className="h-11"
                        />
                        <Input
                          type="text"
                          value={formData.state}
                          onChange={(e) => setFormData({...formData, state: e.target.value})}
                          placeholder="State"
                          className="h-11"
                        />
                        <Input
                          type="text"
                          value={formData.zip}
                          onChange={(e) => setFormData({...formData, zip: e.target.value})}
                          placeholder="ZIP"
                          className="h-11"
                        />
                      </div>
                    </div>
                    </CardContent>
                  </Card>
                )}

                {currentStep === 3 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xl font-semibold">Financial Information</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                    <div className="mb-4">
                      <Label className="text-xs font-bold uppercase text-muted-foreground mb-2 block">Employment Status</Label>
                      <Select value={formData.employment} onValueChange={(value) => setFormData({...formData, employment: value})}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select employment status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="employed">Full-time Employed</SelectItem>
                          <SelectItem value="self-employed">Self-employed</SelectItem>
                          <SelectItem value="business">Business Owner</SelectItem>
                          <SelectItem value="retired">Retired</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="mb-4">
                      <label className="block text-xs font-bold uppercase text-muted-foreground mb-2">Annual Income</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                        <Input
                          type="number"
                          value={formData.income}
                          onChange={(e) => setFormData({...formData, income: e.target.value})}
                          className="pl-8 h-11"
                          placeholder="150000"
                        />
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className="block text-xs font-bold uppercase text-muted-foreground mb-2">Down Payment Amount</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                        <Input
                          type="number"
                          value={formData.downPayment}
                          onChange={(e) => setFormData({...formData, downPayment: e.target.value})}
                          className="pl-8 h-11"
                          placeholder="240000"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Minimum 20% recommended for this property type</p>
                    </div>
                    <div className="bg-muted p-4 rounded-lg">
                      <h4 className="font-bold text-foreground mb-2 flex items-center gap-2">
                        <Info className="w-5 h-5 text-primary" />
                        AI Financial Analysis
                      </h4>
                      <p className="text-sm text-muted-foreground">Based on your income level, you qualify for properties up to $2.5M. Your debt-to-income ratio appears healthy.</p>
                    </div>
                    </CardContent>
                  </Card>
                )}

                {currentStep === 4 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xl font-semibold">Required Documents</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                    <div className="space-y-4">
                      {applicationData.documentTypes.map((doc) => (
                        <div key={doc.id} className={`p-4 border-2 rounded-lg transition-all ${
                          uploadedDocs.includes(doc.id) ? 'border-green-500 bg-green-50' : 'border-border hover:border-primary'
                        }`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${uploadedDocs.includes(doc.id) ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                                {uploadedDocs.includes(doc.id) ? <Check className="w-5 h-5" /> : <Upload className="w-5 h-5" />}
                              </div>
                              <div>
                                <h4 className="font-bold text-foreground flex items-center gap-2">
                                  {doc.name}
                                  {doc.required && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Required</span>}
                                </h4>
                                <p className="text-sm text-muted-foreground">{doc.description}</p>
                              </div>
                            </div>
                            <Button
                              onClick={() => {
                                if (!uploadedDocs.includes(doc.id)) {
                                  setUploadedDocs([...uploadedDocs, doc.id]);
                                }
                              }}
                              variant={uploadedDocs.includes(doc.id) ? "outline" : "default"}
                              size="sm"
                              className="h-11"
                              disabled={uploadedDocs.includes(doc.id)}
                            >
                              {uploadedDocs.includes(doc.id) ? 'Uploaded' : 'Upload'}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 p-4 bg-primary/10 rounded-lg border border-primary/30">
                      <p className="text-sm text-foreground flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5" />
                        All documents are encrypted and securely stored. We comply with SOC 2 standards.
                      </p>
                    </div>
                    </CardContent>
                  </Card>
                )}

                {currentStep === 5 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xl font-semibold">Review & Submit</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                    <div className="space-y-6">
                      <div className="border border-border rounded-lg p-4">
                        <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
                          <Home className="w-5 h-5 text-primary" />
                          Property
                        </h3>
                        <p className="font-bold">{selectedProperty.name}</p>
                        <p className="text-muted-foreground text-sm">{selectedProperty.location}</p>
                        <p className="text-primary font-bold">{selectedProperty.price}</p>
                      </div>
                      <div className="border border-border rounded-lg p-4">
                        <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
                          <User className="w-5 h-5 text-primary" />
                          Applicant
                        </h3>
                        <p className="font-bold">{formData.firstName} {formData.lastName}</p>
                        <p className="text-muted-foreground text-sm">{formData.email}</p>
                        <p className="text-muted-foreground text-sm">{formData.phone}</p>
                      </div>
                      <div className="border border-border rounded-lg p-4">
                        <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
                          <CreditCard className="w-5 h-5 text-primary" />
                          Financial
                        </h3>
                        <p className="text-sm text-muted-foreground">Annual Income: <span className="font-bold text-foreground">${formData.income || '0'}</span></p>
                        <p className="text-sm text-muted-foreground">Down Payment: <span className="font-bold text-foreground">${formData.downPayment || '0'}</span></p>
                      </div>
                      <div className="border border-border rounded-lg p-4">
                        <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
                          <FileText className="w-5 h-5 text-primary" />
                          Documents
                        </h3>
                        <p className="text-sm text-muted-foreground">{uploadedDocs.length} of {applicationData.documentTypes.length} documents uploaded</p>
                      </div>
                    </div>
                    <div className="mt-6 p-4 bg-muted rounded-lg">
                      <div className="flex items-start gap-3">
                        <Checkbox id="termsCheck" className="mt-1" />
                        <Label htmlFor="termsCheck" className="text-sm text-muted-foreground font-normal leading-relaxed text-left cursor-pointer">
                          I confirm that all information provided is accurate and complete. I authorize RoyConstruction to verify my information and conduct a credit check.
                        </Label>
                      </div>
                    </div>
                    </CardContent>
                  </Card>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-6">
                  <Button
                    variant="outline"
                    onClick={handleBack}
                    disabled={currentStep === 1}
                    className="h-11"
                  >
                    Back
                  </Button>
                  {currentStep < 5 ? (
                    <Button onClick={handleNext} className="h-11">
                      Continue
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  ) : (
                    <Button onClick={handleSubmit} className="h-11">
                      Submit Application
                      <Check className="w-5 h-5 ml-2" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Summary Sidebar */}
              <div className="lg:col-span-1">
                <Card className="sticky top-8">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold">Application Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                  <div className="relative h-32 rounded-lg overflow-hidden mb-4">
                    <Image src={selectedProperty.image} alt={selectedProperty.name} fill className="object-cover" />
                  </div>
                  <h4 className="font-bold text-foreground">{selectedProperty.name}</h4>
                  <p className="text-sm text-muted-foreground mb-3">{selectedProperty.location}</p>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Property Price</span>
                      <span className="font-bold">{selectedProperty.price}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Est. Construction</span>
                      <span className="font-bold">$650,000</span>
                    </div>
                    <div className="h-px bg-border my-2"></div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground font-bold">Total Investment</span>
                      <span className="font-black text-primary">$1.85M</span>
                    </div>
                  </div>
                  <div className="bg-muted p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Application review: 2-3 business days
                    </p>
                  </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}

export default function ApplyPage() {
  return (
    <Suspense fallback={
      <div className="h-screen bg-muted flex overflow-hidden">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading application...</p>
          </div>
        </div>
      </div>
    }>
      <ApplicationContent />
    </Suspense>
  )
}
