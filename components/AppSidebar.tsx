"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { 
  LayoutDashboard, Sparkles, Building2, CreditCard, FileText, MessageSquare, Settings,
  Package, Users, BarChart3, LogOut, ChevronsUpDown
} from "lucide-react"
import { useAuthStore } from "@/lib/store/auth-store"
import {
  Sidebar,
  SidebarProvider,
  SidebarTrigger,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { HardHat } from "lucide-react"
import { usePathname } from "next/navigation"

interface AppSidebarProps {
  children: React.ReactNode
}

export default function AppSidebar({ children }: AppSidebarProps) {
  const { user, logout } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()
  const role = user?.role || 'client'

  // Client navigation
  const clientNavItems = [
    { name: "Recommendations", icon: Sparkles, href: "/recommendations" },
    { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    { name: "Payment", icon: CreditCard, href: "/payment" },
    { name: "Applications", icon: FileText, href: "/apply" }
  ]

  // Admin navigation
  const adminNavItems = [
    { name: "Listings", icon: Package, href: "/admin/listings" },
    { name: "New Property", icon: Building2, href: "/admin/listings/new" },
    { name: "Leads", icon: Users, href: "/admin/users" },
    { name: "Analytics", icon: BarChart3, href: "/admin/reports" }
  ]

  const navItems = role === 'admin' ? adminNavItems : clientNavItems
  const portalLabel = role === 'admin' ? 'Admin Portal' : 'Client Portal'

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-muted/40">
        <Sidebar collapsible="icon" className="border-r border-border !bg-white">
          <SidebarHeader className="h-16 border-b flex items-center justify-center px-4">
            <Link href="/" className="flex items-center gap-3 w-full overflow-hidden group-data-[collapsible=icon]:justify-center">
              <div className="flex size-8 items-center justify-center rounded-md bg-primary text-dark">
                <HardHat className="size-4" />
              </div>
              <div className="flex flex-col leading-none truncate group-data-[collapsible=icon]:hidden">
                <span className="font-semibold tracking-tight text-sm">RoyConstruction</span>
              </div>
            </Link>
          </SidebarHeader>
          <SidebarContent className="p-4">
            <SidebarMenu className="gap-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <SidebarMenuItem className="w-full" key={item.name}>
                    <SidebarMenuButton 
                      isActive={isActive} 
                      tooltip={item.name}
                      className="h-10 px-3 transition-colors"
                    >
                      <Link href={item.href} className={`flex items-center gap-3 group-data-[collapsible=icon]:justify-center ${isActive ? 'bg-primary/15' : ''}`}>
                        <item.icon className="size-4 shrink-0" />
                        <span className={`text-sm font-medium group-data-[collapsible=icon]:hidden ${isActive ? 'text-primary' : ''}`}>{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarContent>
          
          <SidebarFooter className="border-t p-4">
            <SidebarMenu>
              <SidebarMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <SidebarMenuButton size="lg" className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground group-data-[collapsible=icon]:justify-center">
                      <Avatar className="h-8 w-8 rounded-lg border">
                        <AvatarFallback className="rounded-lg bg-primary/10 text-primary font-medium text-xs">
                          {user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'JR'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                        <span className="truncate font-semibold">{user?.name || 'User'}</span>
                        <span className="truncate text-xs text-muted-foreground">{role === 'admin' ? 'Administrator' : 'Client'}</span>
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
                        <AvatarFallback className="rounded-lg bg-primary/10 text-primary font-medium text-xs">
                          {user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'JR'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold">{user?.name || 'User'}</span>
                        <span className="truncate text-xs text-muted-foreground">{user?.email || ''}</span>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer" onClick={() => {
                      logout()
                      router.push('/auth/login')
                    }}>
                      <LogOut className="mr-2 h-4 w-4 text-muted-foreground" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        {children}
      </div>
    </SidebarProvider>
  )
}
