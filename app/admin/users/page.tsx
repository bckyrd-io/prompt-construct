"use client";

import { useState } from "react";
import Link from "next/link";

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
    { name: "Dashboard", icon: "dashboard", href: "/admin/reports" },
    { name: "Listings", icon: "inventory_2", href: "/admin/listings" },
    { name: "Leads", icon: "group", active: true, href: "/admin/users" },
    { name: "Analytics", icon: "analytics", href: "/admin/reports" },
    { name: "Settings", icon: "settings", href: "#" }
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
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex-col hidden md:flex">
        <div className="p-4 border-b border-gray-100">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#ffc300] flex items-center justify-center text-black rounded">
              <span className="material-symbols-outlined font-bold">construction</span>
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-wide uppercase">RoyConstruction</h1>
              <p className="text-xs text-gray-500">Admin Portal</p>
            </div>
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {usersData.navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                item.active 
                  ? "bg-[#ffc300]/10 text-black" 
                  : "text-gray-600 hover:bg-gray-50 hover:text-black"
              }`}
            >
              <span className={`material-symbols-outlined ${item.active ? "text-black" : "text-gray-400"}`}>
                {item.icon}
              </span>
              {item.name}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gray-300 rounded flex items-center justify-center">
              <span className="material-symbols-outlined text-gray-600">person</span>
            </div>
            <div>
              <p className="text-sm font-bold text-black">Tom Cook</p>
              <p className="text-xs text-gray-500">Site Manager</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <nav className="flex items-center gap-2 text-sm mb-2">
                <Link href="/admin/reports" className="text-gray-500 hover:text-black">Dashboard</Link>
                <span className="text-gray-300">/</span>
                <span className="text-black font-bold underline decoration-[#ffc300] decoration-2 underline-offset-4">User Management</span>
              </nav>
              <h1 className="text-3xl font-bold text-black">User Management</h1>
            </div>
           
          </div>
        </header>

        <div className="p-8">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            {[
              { label: "Total Users", value: usersData.stats.totalUsers, icon: "group" },
              { label: "Active Clients", value: usersData.stats.activeClients, icon: "person_check" },
              { label: "Admin Users", value: usersData.stats.adminUsers, icon: "admin_panel_settings" },
              { label: "Pending Verification", value: usersData.stats.pendingVerifications, icon: "pending", alert: true },
              { label: "New This Month", value: usersData.stats.newThisMonth, icon: "person_add" }
            ].map((stat, idx) => (
              <div key={idx} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl font-bold text-black">{stat.value}</span>
                  <span className={`material-symbols-outlined ${stat.alert ? 'text-orange-500' : 'text-[#ffc300]'}`}>
                    {stat.icon}
                  </span>
                </div>
                <p className="text-xs font-bold uppercase text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex bg-white rounded-lg shadow-sm border border-gray-200 p-1">
              {["all", "clients", "admins", "pending"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-md text-sm font-bold capitalize transition-all ${
                    filter === f 
                      ? "bg-[#ffc300] text-black" 
                      : "text-gray-500 hover:text-black"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
            <div className="flex-1"></div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 material-symbols-outlined">search</span>
              <input 
                type="text" 
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#ffc300] outline-none w-full sm:w-64"
              />
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">User</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Role</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Projects</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Joined</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Last Active</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 bg-[#ffc300]/20 flex items-center justify-center text-xs font-bold text-black rounded-full">
                            {user.initials}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-bold text-black">{user.name}</div>
                            <div className="text-xs text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${
                          user.role === 'Admin' 
                            ? 'bg-purple-100 text-purple-700' 
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${
                          user.status === 'Active' 
                            ? 'bg-green-100 text-green-700' 
                            : user.status === 'Pending'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            user.status === 'Active' ? 'bg-green-500' : 
                            user.status === 'Pending' ? 'bg-yellow-500' : 'bg-gray-400'
                          }`}></span>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-black">{user.projects}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-500">{user.joined}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-500">{user.lastActive}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button className="p-2 text-gray-400 hover:text-[#ffc300] transition-colors">
                            <span className="material-symbols-outlined text-sm">edit</span>
                          </button>
                          <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                            <span className="material-symbols-outlined text-sm">block</span>
                          </button>
                          <button className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                            <span className="material-symbols-outlined text-sm">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-16">
              <div className="bg-gray-100 p-6 rounded-full inline-block mb-4">
                <span className="material-symbols-outlined text-4xl text-gray-400">group_off</span>
              </div>
              <h3 className="text-xl font-bold text-black mb-2">No users found</h3>
              <p className="text-gray-500 mb-4">Try adjusting your filters or search query</p>
            </div>
          )}

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-gray-500">
              Showing {filteredUsers.length} of {usersData.users.length} users
            </p>
            <div className="flex gap-2">
              <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-500 hover:text-black disabled:opacity-50" disabled>
                Previous
              </button>
              <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-500 hover:text-black">
                Next
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
