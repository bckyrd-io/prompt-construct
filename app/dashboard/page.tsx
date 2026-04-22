"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { 
  HardHat, 
  LayoutDashboard, 
  Building, 
  FileText, 
  Mail, 
  Settings, 

  CheckCircle2, 
  Bot, 
  ArrowRight, 
  Clock, 
  Hourglass, 
  CreditCard,
  ChevronRight,
  MoreHorizontal,
  LogOut,
  ChevronsUpDown
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  SidebarTrigger
} from "@/components/ui/sidebar"
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/lib/store/auth-store"
import AppSidebar from "@/components/AppSidebar"

interface Milestone {
  id: number;
  name: string;
  status: string;
  payment_status: string;
  amount: number;
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
  milestones: Milestone[];
}

export default function DashboardPage() {
  const router = useRouter()
  const { user, logout } = useAuthStore()
  const [property, setProperty] = useState<Property | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [balanceInfo, setBalanceInfo] = useState({
    totalCost: 0,
    paidAmount: 0,
    remainingBalance: 0
  })
  const [displayMilestones, setDisplayMilestones] = useState<Milestone[]>([])

  useEffect(() => {
    fetchUserProperty()
  }, [user])

  // Calculate balance whenever property changes
  useEffect(() => {
    if (property?.milestones) {
      const totalCost = property.price || 0
      const paidAmount = property.milestones
        .filter(m => m.payment_status === 'paid' || m.completed)
        .reduce((sum, m) => sum + (m.amount || 0), 0)
      const remainingBalance = totalCost - paidAmount
      
      setBalanceInfo({
        totalCost,
        paidAmount,
        remainingBalance
      })

      // Check if all regular milestones are paid and there's remaining balance
      const allPaid = property.milestones.every(m => m.payment_status === 'paid' || m.completed)
      const hasRemainingBalance = remainingBalance > 0

      if (allPaid && hasRemainingBalance) {
        // Add Complete Pay milestone
        const completePayMilestone: Milestone = {
          id: -1, // Special ID for Complete Pay
          name: "Complete Payment",
          status: "due",
          payment_status: "due",
          amount: remainingBalance,
          completed: false,
          current: true
        }
        setDisplayMilestones([...property.milestones, completePayMilestone])
      } else {
        setDisplayMilestones(property.milestones)
      }
    }
  }, [property])

  const fetchUserProperty = async () => {
    if (!user) {
      setIsLoading(false)
      return
    }
    try {
      // Fetch the latest application for this user
      const response = await fetch(`/api/applications?user_id=${user.id}`)
      if (response.ok) {
        const data = await response.json()
        // Get the most recent application (already ordered by created_at DESC)
        const latestApplication = data.applications && data.applications.length > 0 ? data.applications[0] : null
        
        if (latestApplication) {
          // Fetch full property details with milestones
          const detailResponse = await fetch(`/api/properties/${latestApplication.property_id}`)
          if (detailResponse.ok) {
            const detailData = await detailResponse.json()
            setProperty(detailData.property)
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch property:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePayNow = (milestone: Milestone) => {
    router.push(`/payment?milestoneId=${milestone.id}&amount=${milestone.amount}&name=${encodeURIComponent(milestone.name)}&propertyId=${property?.id}`)
  }

  // Find the first unpaid milestone for sequential payment
  const getNextPayableMilestone = () => {
    if (!displayMilestones || displayMilestones.length === 0) return null
    return displayMilestones.find(m => m.payment_status !== 'paid' && !m.completed) || null
  }

  const nextPayable = getNextPayableMilestone()

  const handleLogout = () => {
    logout()
    router.push("/auth/login")
  }

  return (
    <AppSidebar>
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
          <header className="flex h-16 shrink-0 items-center justify-between border-b bg-background px-6 transition-all">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="-ml-2 text-muted-foreground hover:text-foreground" />
              
              <h2 className="text-sm font-semibold tracking-tight text-foreground">Dashboard Overview</h2>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="gap-1.5 px-2.5 py-1 bg-green-500/10 text-green-700 border-green-200 dark:bg-green-500/20 dark:text-green-400 dark:border-green-500/30 rounded-full font-medium">
                <span className="size-1.5 rounded-full bg-green-600 animate-pulse" />
                AI Active
              </Badge>
            
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              
              {/* Project Hero */}
              <Card className="lg:col-span-2 overflow-hidden shadow-sm">
                {isLoading ? (
                  <div className="h-56 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : property ? (
                  <>
                    <div className="relative h-56 w-full">
                      <Image src={property.image_url} alt="Project" fill className="object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                      <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
                        <div>
                          <Badge className="mb-3 uppercase tracking-wider text-[10px] font-semibold bg-white/20 text-white hover:bg-white/30 backdrop-blur-md border-none">
                            {property.status === 'active' ? 'In Progress' : property.status}
                          </Badge>
                          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">{property.name}</h1>
                        </div>
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="space-y-1.5">
                          <p className="text-sm font-medium text-foreground">{property.type} • {property.location}</p>
                          <p className="text-xs font-mono text-muted-foreground">REF: RC-{property.id}</p>
                        </div>
                        <div className="w-full md:w-72 space-y-2.5">
                          <div className="flex justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            <span>Overall Progress</span>
                            <span className="text-foreground">{property.progress}%</span>
                          </div>
                          <Progress value={property.progress} className="h-2.5 bg-muted" />
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-green-600 dark:text-green-500 tracking-tight">
                            <CheckCircle2 className="size-3.5" /> On Track
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </>
                ) : (
                  <div className="h-56 flex items-center justify-center">
                    <p className="text-muted-foreground">No active project found</p>
                  </div>
                )}
              </Card>

              {/* Balance Summary Card */}
              <Card className="flex flex-col shadow-sm bg-muted/30 border-muted">
                <CardHeader className="pb-4">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <div className="flex size-6 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <CreditCard className="size-3.5" />
                    </div>
                    Payment Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 space-y-4">
                  {property && (
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total Property Cost</span>
                        <span className="font-semibold">MK {balanceInfo.totalCost.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Amount Paid</span>
                        <span className="font-semibold text-green-600">MK {balanceInfo.paidAmount.toLocaleString()}</span>
                      </div>
                      <div className="h-px bg-border" />
                      <div className="flex justify-between">
                        <span className="font-semibold text-foreground">Remaining Balance</span>
                        <span className="font-bold text-primary">MK {balanceInfo.remainingBalance.toLocaleString()}</span>
                      </div>
                      <Progress 
                        value={balanceInfo.totalCost > 0 ? (balanceInfo.paidAmount / balanceInfo.totalCost) * 100 : 0} 
                        className="h-2 mt-2" 
                      />
                      <p className="text-xs text-center text-muted-foreground">
                        {balanceInfo.totalCost > 0 ? ((balanceInfo.paidAmount / balanceInfo.totalCost) * 100).toFixed(0) : 0}% Paid
                      </p>
                    </div>
                  )}
                </CardContent>
                
              </Card>

              

              {/* Milestones */}
              <div className="lg:col-span-2 space-y-4 mt-2">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-base font-semibold tracking-tight">Timeline</h3>
                  <Button variant="link" size="sm" className="text-primary h-auto p-0 font-medium">Download Schedule</Button>
                </div>
                
                <div className="space-y-4">
                  {displayMilestones?.map((m) => (
                    <Card key={m.id} className={`overflow-hidden transition-all ${m.current ? 'border-primary shadow-md' : 'bg-background shadow-sm'} ${m.id === -1 ? 'border-green-500 bg-green-50' : ''}`}>
                      <div className="flex flex-col md:flex-row">
                        <div className={`w-1.5 shrink-0 ${m.completed ? 'bg-green-500' : m.current ? 'bg-primary' : 'bg-muted'} ${m.id === -1 ? 'bg-green-500' : ''}`} />
                        <CardContent className="p-5 flex-1">
                          <div className="flex flex-col md:flex-row justify-between gap-4">
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-2.5">
                                {m.completed ? <CheckCircle2 className="size-5 text-green-500" /> : m.current ? <div className="size-5 rounded-full border-2 border-primary border-t-transparent animate-spin" /> : <Hourglass className="size-5 text-muted-foreground" />}
                                <h4 className={`text-sm font-semibold ${m.current ? 'text-foreground' : 'text-muted-foreground'}`}>{m.name}</h4>
                                {m.current && <Badge variant={m.id === -1 ? 'default' : 'default'} className="h-5 px-1.5 text-[10px] uppercase tracking-wider">{m.id === -1 ? 'Final Payment' : 'Active Stage'}</Badge>}
                              </div>
                              <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                                <Clock className="size-3" />
                                {m.completed ? 'Completed' : m.current ? 'In Progress' : 'Pending'}
                              </p>
                            </div>
                            <div className="flex flex-row md:flex-col items-center md:items-end gap-3 md:gap-2">
                              <Badge variant={m.payment_status === 'paid' ? 'secondary' : m.payment_status === 'due' ? 'destructive' : 'outline'} className="h-6">
                                {m.payment_status === 'paid' ? `MK ${m.amount?.toLocaleString() || 0} - Paid` : m.payment_status === 'due' ? `MK ${m.amount?.toLocaleString() || 0} - Due` : `MK ${m.amount?.toLocaleString() || 0} - Pending`}
                              </Badge>
                              {nextPayable?.id === m.id && (
                                <Button
                                  size="sm"
                                  className="h-7 text-xs px-3 w-full shadow-sm"
                                  onClick={() => handlePayNow(m)}
                                >
                                  Pay Now
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
    </AppSidebar>
  )
}