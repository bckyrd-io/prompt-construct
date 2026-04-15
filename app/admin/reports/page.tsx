"use client";

import { useState } from "react";
import Link from "next/link";
import { LayoutDashboard, Package, Users, BarChart3, Settings, Building2, User, Download, TrendingUp, AlertTriangle, CreditCard, TrendingDown , ChevronsUpDown, LogOut } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sidebar, SidebarProvider, SidebarTrigger, SidebarContent, SidebarHeader, SidebarFooter, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

// Hardcoded reports data
const reportsData = {
  stats: {
    activeLeads: 124,
    leadGrowth: 12,
    inventoryGaps: 3,
    revenue: 4200000,
    revenueGrowth: 8.5,
    projectsCompleted: 28,
    avgBuildTime: 8.5,
    clientSatisfaction: 4.8
  },
  leads: [
    { id: 1, name: "John Doe", email: "john.d@example.com", interest: "Sunset Villas", budget: "$850k", score: 92, initials: "JD" },
    { id: 2, name: "Jane Smith", email: "jane.s@example.com", interest: "Oakwood Estate", budget: "$1.2M", score: 88, initials: "JS" },
    { id: 3, name: "Robert Brown", email: "robert.b@example.com", interest: "Pine Valley", budget: "$600k", score: 74, initials: "RB" },
    { id: 4, name: "Michael Wilson", email: "m.wilson@example.com", interest: "Lakefront", budget: "$2.5M", score: 95, initials: "MW" },
    { id: 5, name: "Emily Davis", email: "emily.d@example.com", interest: "Sunset Villas", budget: "$900k", score: 65, initials: "ED" }
  ],
  revenueChart: [
    { month: "May", acquisition: 40, sales: 35 },
    { month: "Jun", acquisition: 60, sales: 45 },
    { month: "Jul", acquisition: 35, sales: 30 },
    { month: "Aug", acquisition: 80, sales: 55 },
    { month: "Sep", acquisition: 55, sales: 60 },
    { month: "Oct", acquisition: 70, sales: 75 }
  ],
  marketTrends: [
    { location: "Austin, TX", trend: "up", change: "+12%", avgPrice: "$1.2M" },
    { location: "Seattle, WA", trend: "up", change: "+8%", avgPrice: "$950K" },
    { location: "Denver, CO", trend: "stable", change: "+3%", avgPrice: "$1.5M" },
    { location: "Miami, FL", trend: "up", change: "+15%", avgPrice: "$1.8M" }
  ],
  navItems: [
    { name: "Dashboard", icon: LayoutDashboard, active: true, href: "/admin/reports" },
    { name: "Listings", icon: Package, href: "/admin/listings" },
    { name: "Leads", icon: Users, href: "/admin/users" },
    { name: "Analytics", icon: BarChart3, href: "/admin/reports" },
    { name: "Settings", icon: Settings, href: "#" }
  ],
  milestoneProjects: [
    { id: "SV-002", name: "Sunset Villas - Phase 2", status: "On Track", currentMilestone: "Foundation Pouring", dueDate: "Oct 24" }
  ]
};

export default function AdminReportsPage() {
  const [dateRange, setDateRange] = useState("30d");

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
              {reportsData.navItems.map((item) => (
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
                <span className="font-semibold tracking-tight text-foreground">Reports</span>
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-8">
          {/* Key Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Active Leads */}
            <Card className="shadow-sm border-border relative overflow-hidden">
              <CardHeader className="p-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-foreground">{reportsData.stats.activeLeads}</span>
                  <Badge className="text-sm font-semibold text-green-700 bg-green-50 hover:bg-green-50 rounded-full">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    {reportsData.stats.leadGrowth}%
                  </Badge>
                </div>
                <CardDescription className="text-xs font-semibold uppercase text-muted-foreground mt-2">Active Leads</CardDescription>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <Progress value={65} className="mt-4 h-2 bg-muted [&>[data-slot=progress-indicator]]:bg-[#ffc300]" />
              </CardContent>
              <div className="absolute right-4 top-4 bg-[#ffc300]/20 p-2 rounded-md">
                <Users className="w-5 h-5 text-[#e6b000]" />
              </div>
            </Card>

            {/* Inventory Gaps */}
            <Card className="shadow-sm border-border relative overflow-hidden">
              <CardHeader className="p-6">
                <CardTitle className="text-4xl font-bold text-foreground">{reportsData.stats.inventoryGaps}</CardTitle>
                <CardDescription className="text-xs font-semibold uppercase text-muted-foreground mt-2">Inventory Gaps</CardDescription>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <Badge className="bg-red-50 text-red-700 hover:bg-red-50 text-xs font-semibold rounded-md">Critical Alert</Badge>
              </CardContent>
              <div className="absolute right-4 top-4 bg-red-50 p-2 text-red-600 rounded-md">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </Card>

            {/* Revenue */}
            <Card className="shadow-sm border-border relative overflow-hidden">
              <CardHeader className="p-6">
                <div className="flex items-baseline gap-2">
                  <CardTitle className="text-4xl font-bold text-foreground">${(reportsData.stats.revenue / 1000000).toFixed(1)}M</CardTitle>
                  <Badge className="text-sm font-semibold text-green-700 bg-green-50 hover:bg-green-50 rounded-full">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    {reportsData.stats.revenueGrowth}%
                  </Badge>
                </div>
                <CardDescription className="text-xs font-semibold uppercase text-muted-foreground mt-2">Total Revenue (YTD)</CardDescription>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <p className="text-xs font-medium text-muted-foreground bg-muted p-1 px-2 inline-block rounded-md">
                  + $250k vs previous period
                </p>
              </CardContent>
              <div className="absolute right-4 top-4 bg-[#ffc300]/20 p-2 rounded-md">
                <CreditCard className="w-5 h-5 text-[#e6b000]" />
              </div>
            </Card>
          </div>

          {/* Main Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Lead Qualification Table */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-4 bg-background p-3 rounded-lg border-l-4 border-l-[#ffc300] border border-border shadow-sm pl-4">
                <h2 className="text-lg font-semibold text-foreground">Lead Qualification</h2>
                <Button variant="outline" size="sm" className="h-11 text-xs font-semibold uppercase border border-border hover:border-[#ffc300] hover:text-[#ffc300]">
                  View All
                </Button>
              </div>
              <div className="bg-white shadow-sm rounded-lg border border-gray-100 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Lead Name</TableHead>
                      <TableHead className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Interest</TableHead>
                      <TableHead className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">AI Score</TableHead>
                      <TableHead className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportsData.leads.map((lead) => (
                      <TableRow key={lead.id} className="hover:bg-gray-50 transition-colors">
                        <TableCell className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="h-10 w-10 bg-[#ffc300]/20 flex items-center justify-center text-xs font-bold text-black rounded-none">
                              {lead.initials}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-bold text-black">{lead.name}</div>
                              <div className="text-xs text-gray-500">{lead.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <div className="text-sm font-medium text-black">{lead.interest}</div>
                          <div className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-sm inline-block mt-1">{lead.budget} Budget</div>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Progress 
                              value={lead.score} 
                              className="w-16 h-2 bg-gray-100"
                              style={{
                                '--progress-indicator-color': lead.score >= 90 ? '#22c55e' :
                                lead.score >= 75 ? '#4ade80' :
                                lead.score >= 60 ? '#facc15' :
                                '#9ca3af'
                              } as React.CSSProperties}
                            />
                            <span className={`text-sm font-bold ${lead.score >= 60 ? 'text-black' : 'text-gray-500'}`}>{lead.score}</span>
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4 text-right">
                          <Button variant="outline" className="h-11 text-black hover:bg-[#ffc300]/10 hover:text-[#ffc300] border border-gray-200 hover:border-[#ffc300]/30 px-3 text-xs font-semibold rounded-md transition-colors">
                            Review
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Right Column */}
            <div className="flex flex-col gap-6">
              

             

              {/* Market Trends */}
              <div className="bg-white p-6 shadow-sm rounded-lg border border-gray-100">
                <h3 className="text-sm font-bold text-black uppercase tracking-wide mb-4 border-b-2 border-[#ffc300] pb-2 inline-block">
                  Market Trends
                </h3>
                <div className="space-y-3">
                  {reportsData.marketTrends.map((trend, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-black">{trend.location}</p>
                        <p className="text-xs text-gray-500">Avg: {trend.avgPrice}</p>
                      </div>
                      <span className={`text-sm font-bold flex items-center gap-1 ${
                        trend.trend === 'up' ? 'text-green-600' : 'text-gray-500'
                      }`}>
                        {trend.trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        {trend.change}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
    </SidebarProvider>
  );
}
