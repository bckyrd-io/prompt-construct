"use client"

import { useState } from "react"
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
  Bell, 
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
  Sidebar, 
  SidebarProvider, 
  SidebarTrigger, 
  SidebarContent, 
  SidebarHeader, 
  SidebarFooter, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton 
} from "@/components/ui/sidebar"
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const dashboardData = {
  project: {
    id: "RC-2024-88",
    name: "The Highlands Estate",
    unit: "Unit 4B",
    specs: "4 Bed, 3.5 Bath • 3,200 Sq Ft",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200",
    status: "In Progress",
    progress: 65,
    health: "On Track"
  },
  aiUpdates: [
    {
      id: 1,
      type: "Update",
      title: "Structural framing is 85% complete",
      description: "Drone scan confirms alignment with blueprints.",
      time: "Just now",
      color: "bg-amber-500"
    },
  ],
  milestones: [
    {
      id: 1,
      name: "Site Clearing & Excavation",
      status: "completed",
      paymentStatus: "paid",
      amount: 75000,
      date: "Jan 15, 2024",
      photos: ["https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400"]
    },
    {
      id: 3,
      name: "Structural Framing",
      status: "active",
      paymentStatus: "due",
      amount: 50000,
      date: "Est. Mar 15",
      progress: 85,
      aiNote: "Material delivery confirmed for Tuesday. Crew scheduled for full shifts.",
      photos: ["https://images.unsplash.com/photo-1590274853856-f22d5ee3d228?w=400"]
    },
  ],
  navItems: [
    { name: "Dashboard", icon: LayoutDashboard, active: true, href: "/dashboard" },
    { name: "My Projects", icon: Building, active: false, href: "/recommendations" },
    { name: "Documents", icon: FileText, active: false, href: "#" },
    { name: "Messages", icon: Mail, active: false, href: "#", badge: 2 },
    { name: "Settings", icon: Settings, active: false, href: "#" }
  ]
};

export default function DashboardPage() {
  const router = useRouter()

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
              {dashboardData.navItems.map((item) => (
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
                      {item.badge && (
                        <Badge className="ml-auto size-5 flex items-center justify-center rounded-full p-0 bg-primary/10 text-primary hover:bg-primary/20 border-none group-data-[collapsible=icon]:hidden">
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          
          {/* User Profile Dropdown in Footer */}
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
              
              <h2 className="text-sm font-semibold tracking-tight text-foreground">Dashboard Overview</h2>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="gap-1.5 px-2.5 py-1 bg-green-500/10 text-green-700 border-green-200 dark:bg-green-500/20 dark:text-green-400 dark:border-green-500/30 rounded-full font-medium">
                <span className="size-1.5 rounded-full bg-green-600 animate-pulse" />
                AI Active
              </Badge>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
                      <Bell className="size-5" />
                      <span className="absolute top-2.5 right-2.5 size-2 rounded-full bg-destructive border-2 border-background" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Notifications</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              
              {/* Project Hero */}
              <Card className="lg:col-span-2 overflow-hidden shadow-sm">
                <div className="relative h-56 w-full">
                  <Image src={dashboardData.project.image} alt="Project" fill className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
                    <div>
                      <Badge className="mb-3 uppercase tracking-wider text-[10px] font-semibold bg-white/20 text-white hover:bg-white/30 backdrop-blur-md border-none">
                        {dashboardData.project.status}
                      </Badge>
                      <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">{dashboardData.project.name}</h1>
                    </div>
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="space-y-1.5">
                      <p className="text-sm font-medium text-foreground">{dashboardData.project.unit} • {dashboardData.project.specs}</p>
                      <p className="text-xs font-mono text-muted-foreground">REF: {dashboardData.project.id}</p>
                    </div>
                    <div className="w-full md:w-72 space-y-2.5">
                      <div className="flex justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        <span>Overall Progress</span>
                        <span className="text-foreground">{dashboardData.project.progress}%</span>
                      </div>
                      <Progress value={dashboardData.project.progress} className="h-2.5 bg-muted" />
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-green-600 dark:text-green-500 tracking-tight">
                        <CheckCircle2 className="size-3.5" /> {dashboardData.project.health}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* AI Sidebar */}
              <Card className="flex flex-col shadow-sm bg-muted/30 border-muted">
                <CardHeader className="pb-4">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <div className="flex size-6 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <Bot className="size-3.5" />
                    </div>
                    AI Agent Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 space-y-4">
                  {dashboardData.aiUpdates.map((update) => (
                    <div key={update.id} className="text-sm bg-background p-4 rounded-xl border shadow-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`size-2 rounded-full ${update.color}`} />
                        <span className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">{update.type}</span>
                      </div>
                      <p className="text-foreground text-sm font-medium leading-snug mb-1">{update.title}</p>
                      <p className="text-muted-foreground text-xs leading-relaxed">{update.description}</p>
                      <p className="text-[10px] text-muted-foreground mt-3 font-medium">{update.time}</p>
                    </div>
                  ))}
                </CardContent>
                <CardFooter className="pt-2">
                  <Button variant="outline" className="w-full group shadow-sm bg-background" size="sm">
                    Open Full Report <ChevronRight className="ml-2 size-3.5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardFooter>
              </Card>

              {/* Milestones */}
              <div className="lg:col-span-2 space-y-4 mt-2">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-base font-semibold tracking-tight">Construction Timeline</h3>
                  <Button variant="link" size="sm" className="text-primary h-auto p-0 font-medium">Download Schedule</Button>
                </div>
                
                <div className="space-y-4">
                  {dashboardData.milestones.map((m) => (
                    <Card key={m.id} className={`overflow-hidden transition-all ${m.status === 'active' ? 'border-primary shadow-md' : 'bg-background shadow-sm'}`}>
                      <div className="flex flex-col md:flex-row">
                        <div className={`w-1.5 shrink-0 ${m.status === 'completed' ? 'bg-green-500' : m.status === 'active' ? 'bg-primary' : 'bg-muted'}`} />
                        <CardContent className="p-5 flex-1">
                          <div className="flex flex-col md:flex-row justify-between gap-4">
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-2.5">
                                {m.status === 'completed' && <CheckCircle2 className="size-4 text-green-500" />}
                                <h4 className={`text-sm font-semibold ${m.status === 'active' ? 'text-foreground' : 'text-muted-foreground'}`}>{m.name}</h4>
                                {m.status === 'active' && <Badge variant="default" className="h-5 px-1.5 text-[10px] uppercase tracking-wider">Active Stage</Badge>}
                              </div>
                              <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                                <Clock className="size-3" />
                                {m.date}
                              </p>
                            </div>
                            <div className="flex flex-row md:flex-col items-center md:items-end gap-3 md:gap-2">
                              <Badge variant={m.paymentStatus === 'paid' ? 'secondary' : 'destructive'} className="h-6">
                                {m.paymentStatus === 'paid' ? 'Paid in Full' : `$${m.amount.toLocaleString()} Due`}
                              </Badge>
                              {m.paymentStatus === 'due' && (
                                <Button size="sm" className="h-7 text-xs px-3 w-full shadow-sm">Pay Now</Button>
                              )}
                            </div>
                          </div>
                          
                          {m.photos && m.photos.length > 0 && (
                            <div className="mt-4 flex gap-2">
                              {m.photos.map((photo, idx) => (
                                <div key={idx} className="relative h-20 w-32 rounded-md overflow-hidden">
                                  <Image src={photo} alt={`${m.name} photo ${idx + 1}`} fill className="object-cover" />
                                </div>
                              ))}
                            </div>
                          )}
                          {m.aiNote && (
                            <div className="mt-5 flex gap-3 items-start bg-muted/50 p-3.5 rounded-lg border border-border text-sm">
                              <Bot className="size-4 text-primary shrink-0 mt-0.5" />
                              <p className="text-muted-foreground leading-relaxed">{m.aiNote}</p>
                            </div>
                          )}
                        </CardContent>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}