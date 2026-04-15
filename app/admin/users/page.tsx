"use client";

import { useState } from "react";
import Link from "next/link";
import { LayoutDashboard, Package, Users, BarChart3, Settings, Building2, User, UserCheck, Shield, Clock, UserPlus, Search, Pencil, Ban, Trash2 , ChevronsUpDown, LogOut } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sidebar, SidebarProvider, SidebarTrigger, SidebarContent, SidebarHeader, SidebarFooter, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

// Hardcoded users data
const usersData = {
  stats: {
    totalUsers: 342,
    activeClients: 156,
    adminUsers: 8,
    pendingVerifications: 12,
    newThisMonth: 28
  },
  users: [
    { 
      id: 1, 
      name: "James Roy", 
      email: "james.roy@example.com", 
      role: "Client", 
      status: "Active", 
      projects: 1,
      joined: "Jan 15, 2024",
      lastActive: "2 hours ago",
      initials: "JR",
      avatar: null
    },
    { 
      id: 2, 
      name: "Maria Santos", 
      email: "maria.santos@example.com", 
      role: "Client", 
      status: "Active", 
      projects: 1,
      joined: "Feb 3, 2024",
      lastActive: "5 hours ago",
      initials: "MS",
      avatar: null
    },
    { 
      id: 3, 
      name: "Robert Chen", 
      email: "robert.chen@example.com", 
      role: "Client", 
      status: "Active", 
      projects: 2,
      joined: "Dec 10, 2023",
      lastActive: "1 day ago",
      initials: "RC",
      avatar: null
    },
    { 
      id: 4, 
      name: "Tom Cook", 
      email: "tom.cook@royconstruction.com", 
      role: "Admin", 
      status: "Active", 
      projects: 0,
      joined: "Nov 1, 2023",
      lastActive: "Just now",
      initials: "TC",
      avatar: null
    },
    { 
      id: 5, 
      name: "Sarah Johnson", 
      email: "sarah.j@example.com", 
      role: "Client", 
      status: "Pending", 
      projects: 0,
      joined: "Mar 5, 2024",
      lastActive: "Never",
      initials: "SJ",
      avatar: null
    },
    { 
      id: 6, 
      name: "Michael Brown", 
      email: "michael.b@example.com", 
      role: "Client", 
      status: "Inactive", 
      projects: 0,
      joined: "Oct 20, 2023",
      lastActive: "2 months ago",
      initials: "MB",
      avatar: null
    },
    { 
      id: 7, 
      name: "Emily Davis", 
      email: "emily.d@example.com", 
      role: "Client", 
      status: "Active", 
      projects: 0,
      joined: "Jan 28, 2024",
      lastActive: "3 days ago",
      initials: "ED",
      avatar: null
    },
    { 
      id: 8, 
      name: "David Wilson", 
      email: "david.w@royconstruction.com", 
      role: "Admin", 
      status: "Active", 
      projects: 0,
      joined: "Sep 15, 2023",
      lastActive: "1 hour ago",
      initials: "DW",
      avatar: null
    }
  ],
  navItems: [
    { name: "Dashboard", icon: LayoutDashboard, href: "/admin/reports" },
    { name: "Listings", icon: Package, href: "/admin/listings" },
    { name: "Leads", icon: Users, active: true, href: "/admin/users" },
    { name: "Analytics", icon: BarChart3, href: "/admin/reports" },
    { name: "Settings", icon: Settings, href: "#" }
  ]
};

export default function AdminUsersPage() {
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers = usersData.users.filter(user => {
    const matchesFilter = filter === "all" || 
      (filter === "clients" && user.role === "Client") ||
      (filter === "admins" && user.role === "Admin") ||
      (filter === "pending" && user.status === "Pending");
    
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesFilter && matchesSearch;
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
              {usersData.navItems.map((item) => (
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
                <span className="font-semibold tracking-tight text-foreground">User Management</span>
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-8">
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              { label: "Total Users", value: usersData.stats.totalUsers, icon: Users },
              { label: "Active Clients", value: usersData.stats.activeClients, icon: UserCheck },
              { label: "Admin Users", value: usersData.stats.adminUsers, icon: Shield },
              { label: "Pending Verification", value: usersData.stats.pendingVerifications, icon: Clock, alert: true },
            
            ].map((stat, idx) => (
              <Card key={idx} className="shadow-sm border-border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl font-bold text-foreground">{stat.value}</span>
                    <stat.icon className={`w-5 h-5 ${stat.alert ? 'text-orange-500' : 'text-primary'}`} />
                  </div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

         
          {/* Users Table */}
          <Card className="shadow-sm border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs font-semibold uppercase text-muted-foreground">User</TableHead>
                  <TableHead className="text-xs font-semibold uppercase text-muted-foreground">Role</TableHead>
                  <TableHead className="text-xs font-semibold uppercase text-muted-foreground">Status</TableHead>
                  <TableHead className="text-xs font-semibold uppercase text-muted-foreground">Projects</TableHead>
                  <TableHead className="text-xs font-semibold uppercase text-muted-foreground">Joined</TableHead>
                  <TableHead className="text-xs font-semibold uppercase text-muted-foreground">Last Active</TableHead>
                  <TableHead className="text-xs font-semibold uppercase text-muted-foreground text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-primary/20 flex items-center justify-center text-xs font-bold text-foreground rounded-full">
                          {user.initials}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-semibold text-foreground">{user.name}</div>
                          <div className="text-xs text-muted-foreground">{user.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={`uppercase text-xs ${
                        user.role === 'Admin' 
                          ? 'bg-purple-100 text-purple-700 hover:bg-purple-100' 
                          : 'bg-blue-100 text-blue-700 hover:bg-blue-100'
                      }`}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`gap-1 uppercase text-xs ${
                        user.status === 'Active' 
                          ? 'bg-green-100 text-green-700 hover:bg-green-100' 
                          : user.status === 'Pending'
                          ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-100'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          user.status === 'Active' ? 'bg-green-500' : 
                          user.status === 'Pending' ? 'bg-yellow-500' : 'bg-gray-400'
                        }`}></span>
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-semibold text-foreground">{user.projects}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">{user.joined}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">{user.lastActive}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" className="h-11 w-11 text-muted-foreground hover:text-primary">
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-11 w-11 text-muted-foreground hover:text-red-500">
                          <Ban className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-11 w-11 text-muted-foreground hover:text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          {filteredUsers.length === 0 && (
            <Card className="p-16 text-center">
              <div className="bg-muted p-6 rounded-full inline-block mb-4">
                <Users className="w-10 h-10 text-muted-foreground" />
              </div>
              <CardTitle className="text-lg font-semibold text-foreground mb-2">No users found</CardTitle>
              <p className="text-muted-foreground mb-4">Try adjusting your filters or search query</p>
            </Card>
          )}

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-muted-foreground">
              Showing {filteredUsers.length} of {usersData.users.length} users
            </p>
            <div className="flex gap-2">
              <Button variant="outline" className="h-11 border-border" disabled>
                Previous
              </Button>
              <Button variant="outline" className="h-11 border-border">
                Next
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
    </SidebarProvider>
  );
}
