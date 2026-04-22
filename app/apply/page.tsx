"use client"

import { useState, Suspense, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { Home, Banknote, CheckCircle, Info, CreditCard, ArrowRight, Clock, User, Check } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { SidebarTrigger } from "@/components/ui/sidebar"
import AppSidebar from "@/components/AppSidebar"
import { useAuthStore } from "@/lib/store/auth-store"

function ApplicationContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { user } = useAuthStore();

    const propertyId: string = searchParams.get("property") ?? "1";

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [property, setProperty] = useState<any>(null);
    const [currentStep, setCurrentStep] = useState(1);

    // All fields are non-optional plain `string` with empty-string defaults.
    // This ensures TypeScript never widens employment (or any field) to string | null.
    const [formData, setFormData] = useState({
        employment: "",
        income: "",
        downPayment: "",
        email: "",
    });

    useEffect(() => {
        if (user?.email) {
            // FIX (TS2322 — "Type 'string | null' is not assignable to type 'string'" on employment):
            // Root cause was using `user.email ?? ""` — the `??` operator made TypeScript infer
            // that user.email *might* be null, which widened the entire formData object type and
            // caused `employment` to appear as `string | null` at the JSON.stringify call site.
            // Since the User interface in auth-store.ts types email as plain `string` (never null),
            // we assign it directly — no `??` needed, and the null inference disappears entirely.
            setFormData(prev => ({ ...prev, email: user.email }));
        }
        fetchProperty();
    }, [propertyId, user]);

    const fetchProperty = async () => {
        try {
            const response = await fetch(`/api/properties/${propertyId}`);
            if (response.ok) {
                const data = await response.json();
                setProperty(data.property);
            }
        } catch (error) {
            console.error("Failed to fetch property:", error);
        }
    };

    const canAfford = () => {
        const income = parseInt(formData.income) || 0;
        const downPayment = parseInt(formData.downPayment) || 0;
        const propertyPrice = property?.price || 0;
        const minIncome = propertyPrice / 3;
        const minDownPayment = propertyPrice * 0.2;
        return income >= minIncome && downPayment >= minDownPayment;
    };

    const selectedProperty = property || {
        id: propertyId,
        name: "Loading...",
        location: "",
        price: 0,
        image_url: "",
        beds: 0,
        baths: 0,
        sqft: 0
    };

    const applicationSteps = [
        { id: 1, name: "Personal Details", icon: User },
        { id: 2, name: "Financial Qualification", icon: Banknote },
        { id: 3, name: "Review & Submit", icon: CheckCircle }
    ];

    const handleNext = () => {
        if (currentStep < 3) setCurrentStep(currentStep + 1);
    };

    const handleBack = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1);
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const response = await fetch("/api/applications", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    property_id: parseInt(propertyId),
                    employment: formData.employment,
                    income: parseInt(formData.income) || 0,
                    down_payment: parseInt(formData.downPayment) || 0,
                    email: formData.email,
                })
            });

            if (response.ok) {
                const data = await response.json();
                alert(`Application submitted successfully! Reference: APP-${data.applicationId}`);
                router.push("/dashboard");
            } else {
                const error = await response.json();
                alert(error.error || "Failed to submit application");
            }
        } catch (error) {
            console.error("Failed to submit application:", error);
            alert("Failed to submit application");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AppSidebar>
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

                {/* Progress Steps */}
                <div className="bg-background border-b border-border">
                    <div className="max-w-6xl mx-auto px-8 py-6">
                        <div className="flex items-center justify-between">
                            {applicationSteps.map((step, idx) => (
                                <div key={step.id} className="flex items-center">
                                    <div className={`flex flex-col items-center ${idx < applicationSteps.length - 1 ? 'flex-1' : ''}`}>
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${step.id < currentStep ? 'bg-green-500 text-white' :
                                                step.id === currentStep ? 'bg-primary text-primary-foreground' :
                                                    'bg-muted text-muted-foreground'
                                            }`}>
                                            <step.icon className="w-5 h-5" />
                                        </div>
                                        <span className={`text-xs font-bold uppercase ${step.id <= currentStep ? 'text-foreground' : 'text-muted-foreground'
                                            }`}>{step.name}</span>
                                    </div>
                                    {idx < applicationSteps.length - 1 && (
                                        <div className={`h-1 w-16 mx-2 rounded ${step.id < currentStep ? 'bg-green-500' : 'bg-muted'
                                            }`}></div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 overflow-y-auto">
                    <div className="max-w-6xl mx-auto px-8 py-8">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                            {/* Application Form */}
                            <div className="lg:col-span-2">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-xl font-semibold">
                                            {currentStep === 1 && "Personal Details"}
                                            {currentStep === 2 && "Financial Qualification"}
                                            {currentStep === 3 && "Review & Submit"}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-0 space-y-6">

                                        {/* Step 1: Personal Details */}
                                        {currentStep === 1 && (
                                            <div className="space-y-4">
                                                <div className="p-4 bg-muted rounded-lg">
                                                    <div className="flex items-start gap-4">
                                                        <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                                                            <Image
                                                                src={selectedProperty.image_url || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800"}
                                                                alt={selectedProperty.name}
                                                                fill
                                                                className="object-cover"
                                                            />
                                                        </div>
                                                        <div>
                                                            <h3 className="font-bold text-foreground">{selectedProperty.name}</h3>
                                                            <p className="text-sm text-muted-foreground">{selectedProperty.location}</p>
                                                            <p className="text-primary font-bold mt-1">MK {selectedProperty.price?.toLocaleString()}</p>
                                                            <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                                                                <span>{selectedProperty.beds || 0} Beds</span>
                                                                <span>{selectedProperty.baths || 0} Baths</span>
                                                                <span>{(selectedProperty.sqft || 0).toLocaleString()} sqft</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="p-4 border border-border rounded-lg">
                                                    <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
                                                        <User className="w-5 h-5 text-primary" />
                                                        Account Information
                                                    </h3>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <Label className="text-xs font-bold uppercase text-muted-foreground mb-1 block">Full Name</Label>
                                                            <p className="text-sm font-medium">{user?.name || "Not provided"}</p>
                                                        </div>
                                                        <div>
                                                            <Label className="text-xs font-bold uppercase text-muted-foreground mb-1 block">Email Address</Label>
                                                            <p className="text-sm font-medium">{user?.email || "Not provided"}</p>
                                                        </div>
                                                        <div>
                                                            <Label className="text-xs font-bold uppercase text-muted-foreground mb-1 block">Role</Label>
                                                            <p className="text-sm font-medium capitalize">{user?.role || "Not provided"}</p>
                                                        </div>
                                                        <div>
                                                            <Label className="text-xs font-bold uppercase text-muted-foreground mb-1 block">Account Status</Label>
                                                            <p className="text-sm font-medium">{user?.status || "Not provided"}</p>
                                                        </div>
                                                        <div className="col-span-2">
                                                            <Label className="text-xs font-bold uppercase text-muted-foreground mb-1 block">Account Created</Label>
                                                            <p className="text-sm font-medium">
                                                                {user?.created_at ? new Date(user.created_at).toLocaleDateString() : "Not provided"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Step 2: Financial Qualification */}
                                        {currentStep === 2 && (
                                            <div className="space-y-6">
                                                <div className="p-4 bg-muted rounded-lg">
                                                    <div className="flex items-start gap-4">
                                                        <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                                                            <Image
                                                                src={selectedProperty.image_url || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800"}
                                                                alt={selectedProperty.name}
                                                                fill
                                                                className="object-cover"
                                                            />
                                                        </div>
                                                        <div>
                                                            <h3 className="font-bold text-foreground">{selectedProperty.name}</h3>
                                                            <p className="text-sm text-muted-foreground">{selectedProperty.location}</p>
                                                            <p className="text-primary font-bold mt-1">MK {selectedProperty.price?.toLocaleString()}</p>
                                                            <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                                                                <span>{selectedProperty.beds || 0} Beds</span>
                                                                <span>{selectedProperty.baths || 0} Baths</span>
                                                                <span>{(selectedProperty.sqft || 0).toLocaleString()} sqft</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    <div>
                                                        <Label className="text-xs font-bold uppercase text-muted-foreground mb-2 block">Employment Status</Label>
                                                        <Select
                                                            value={formData.employment}
                                                            onValueChange={(value) => setFormData({ ...formData, employment: value ?? "" })}
                                                        >
                                                            <SelectTrigger className="w-full h-11">
                                                                <SelectValue placeholder="Select your employment status" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="employed">Full-time Employed</SelectItem>
                                                                <SelectItem value="self-employed">Self-employed</SelectItem>
                                                                <SelectItem value="business">Business Owner</SelectItem>
                                                                <SelectItem value="retired">Retired</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="block text-xs font-bold uppercase text-muted-foreground mb-2">Annual Income (MK)</label>
                                                            <Input
                                                                type="number"
                                                                value={formData.income}
                                                                onChange={(e) => setFormData({ ...formData, income: e.target.value })}
                                                                className="h-11"
                                                                placeholder="e.g., 1500000"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-bold uppercase text-muted-foreground mb-2">Down Payment (MK)</label>
                                                            <Input
                                                                type="number"
                                                                value={formData.downPayment}
                                                                onChange={(e) => setFormData({ ...formData, downPayment: e.target.value })}
                                                                className="h-11"
                                                                placeholder="e.g., 300000"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                {formData.income && formData.downPayment && (
                                                    <div className={`mt-4 p-4 rounded-lg ${canAfford() ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'}`}>
                                                        <div className="flex items-start gap-3">
                                                            {canAfford()
                                                                ? <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                                                                : <Info className="w-5 h-5 text-amber-600 mt-0.5" />
                                                            }
                                                            <div>
                                                                <h5 className={`font-bold text-sm ${canAfford() ? 'text-green-700' : 'text-amber-700'}`}>
                                                                    {canAfford() ? 'You Qualify!' : 'May Not Qualify'}
                                                                </h5>
                                                                <p className="text-sm text-muted-foreground mt-1">
                                                                    {canAfford()
                                                                        ? 'Based on your income and down payment, you appear qualified for this property.'
                                                                        : 'You may need higher income or down payment. Recommended: Income 3x property price, down payment 20%.'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Step 3: Review & Submit */}
                                        {currentStep === 3 && (
                                            <div className="space-y-6">
                                                <div className="border border-border rounded-lg p-4">
                                                    <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
                                                        <Home className="w-5 h-5 text-primary" />
                                                        Property
                                                    </h3>
                                                    <p className="font-bold">{selectedProperty.name}</p>
                                                    <p className="text-muted-foreground text-sm">{selectedProperty.location}</p>
                                                    <p className="text-primary font-bold">MK {selectedProperty.price?.toLocaleString()}</p>
                                                    <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                                                        <span>{selectedProperty.beds || 0} Beds</span>
                                                        <span>{selectedProperty.baths || 0} Baths</span>
                                                        <span>{(selectedProperty.sqft || 0).toLocaleString()} sqft</span>
                                                    </div>
                                                </div>

                                                <div className="border border-border rounded-lg p-4">
                                                    <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
                                                        <User className="w-5 h-5 text-primary" />
                                                        Applicant
                                                    </h3>
                                                    <p className="font-bold">{user?.name || "Not provided"}</p>
                                                    <p className="text-muted-foreground text-sm">{user?.email || "Not provided"}</p>
                                                    <p className="text-muted-foreground text-sm capitalize">Role: {user?.role || "Not provided"}</p>
                                                </div>

                                                <div className="border border-border rounded-lg p-4">
                                                    <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
                                                        <CreditCard className="w-5 h-5 text-primary" />
                                                        Financial
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground">Employment: <span className="font-bold text-foreground capitalize">{formData.employment || "Not provided"}</span></p>
                                                    <p className="text-sm text-muted-foreground">Annual Income: <span className="font-bold text-foreground">MK {parseInt(formData.income || "0").toLocaleString()}</span></p>
                                                    <p className="text-sm text-muted-foreground">Down Payment: <span className="font-bold text-foreground">MK {parseInt(formData.downPayment || "0").toLocaleString()}</span></p>
                                                </div>

                                                <div className="p-4 bg-muted rounded-lg">
                                                    <div className="flex items-start gap-3">
                                                        <Checkbox id="termsCheck" className="mt-1" />
                                                        <Label htmlFor="termsCheck" className="text-sm text-muted-foreground font-normal leading-relaxed text-left cursor-pointer">
                                                            I confirm that all information provided is accurate and complete. I authorize RoyConstruction to verify my information.
                                                        </Label>
                                                    </div>
                                                </div>

                                                <Button
                                                    onClick={handleSubmit}
                                                    disabled={isSubmitting || !formData.employment || !formData.income || !formData.downPayment}
                                                    className="w-full h-12"
                                                >
                                                    {isSubmitting ? "Submitting..." : "Submit Application"}
                                                    <Check className="w-5 h-5 ml-2" />
                                                </Button>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {currentStep < 3 && (
                                    <div className="flex justify-between mt-6">
                                        <Button variant="outline" onClick={handleBack} disabled={currentStep === 1} className="h-11">
                                            Back
                                        </Button>
                                        <Button
                                            onClick={handleNext}
                                            className="h-11"
                                            disabled={currentStep === 2 && (!formData.employment || !formData.income || !formData.downPayment)}
                                        >
                                            Continue
                                            <ArrowRight className="w-5 h-5 ml-2" />
                                        </Button>
                                    </div>
                                )}
                            </div>

                           

                        </div>
                    </div>
                </div>
            </main>
        </AppSidebar>
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