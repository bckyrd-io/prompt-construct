"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { LayoutDashboard, Package, Users, BarChart3, Settings, Building2, User, UserCheck, Shield, Clock, UserPlus, Search, Pencil, Ban, Trash2 , ChevronsUpDown, LogOut } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "@/components/AppSidebar";
import { useAuthStore } from "@/lib/store/auth-store";

interface UserData {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  projects: number;
  joined: string;
  lastActive: string;
  initials: string;
}

interface Stats {
  totalUsers: number;
  activeClients: number;
  adminUsers: number;
  pendingVerifications: number;
}

interface Application {
  id: number;
  user_id: number;
  property_id: number;
  status: string;
  property_name: string;
}

export default function AdminUsersPage() {
  const { user, logout } = useAuthStore();
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<UserData[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    activeClients: 0,
    adminUsers: 0,
    pendingVerifications: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await fetch("/api/applications");
      if (response.ok) {
        const data = await response.json();
        setApplications(data.applications || []);
      }
    } catch (error) {
      console.error("Failed to fetch applications:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users");
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesFilter = filter === "all" || 
      (filter === "clients" && user.role === "Client") ||
      (filter === "admins" && user.role === "Admin") ||
      (filter === "pending" && user.status === "Pending");
    
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const handleVerify = async (userId: number, applicationId: number) => {
    try {
      const response = await fetch("/api/applications/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, applicationId }),
      });

      if (response.ok) {
        alert("User verified successfully! First milestone registered.");
        fetchApplications();
        fetchUsers();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to verify user");
      }
    } catch (error) {
      console.error("Failed to verify user:", error);
      alert("Failed to verify user");
    }
  };

  return (
    <AppSidebar>
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
              { label: "Total Users", value: stats.totalUsers, icon: Users },
              { label: "Active Clients", value: stats.activeClients, icon: UserCheck },
              { label: "Admin Users", value: stats.adminUsers, icon: Shield },
              { label: "Pending Verification", value: stats.pendingVerifications, icon: Clock, alert: true },
            
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
                        {(() => {
                          const pendingApp = applications.find(
                            app => app.user_id === user.id && app.status === 'pending'
                          );
                          return pendingApp ? (
                            <Button
                              variant="default"
                              size="sm"
                              className="h-9 px-3 text-xs font-medium"
                              onClick={() => handleVerify(user.id, pendingApp.id)}
                            >
                              <UserCheck className="w-3 h-3 mr-1" />
                              Verify
                            </Button>
                          ) : null;
                        })()}
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
              Showing {filteredUsers.length} of {users.length} users
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
    </AppSidebar>
  );
}
