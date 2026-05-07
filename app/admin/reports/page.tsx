"use client";

import { useState, useEffect } from "react";
import { LayoutDashboard, Package, Users, BarChart3, Settings, Building2, User, Download, TrendingUp, AlertTriangle, CreditCard, ChevronsUpDown, LogOut } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
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
  initials: string;
}

interface PropertyData {
  id: number;
  name: string;
  location: string;
  price: number;
  type: string;
  status: string;
  client_id?: number;
  progress: number;
}

interface MarketTrend {
  location: string;
  percentage: number;
  propertyCount: number;
  avgPrice: string;
}

interface InvestmentRecommendation {
  location: string;
  demand: number;
  available: number;
  recommendation: string;
}

interface ApplicationData {
  id: number;
  user_id: number;
  property_id: number;
  status: string;
  user_name: string;
  user_email: string;
  property_name: string;
  property_location: string;
  property_price: number;
  created_at: string;
}

export default function AdminReportsPage() {
  const { user, logout } = useAuthStore();
  const [marketTrends, setMarketTrends] = useState<MarketTrend[]>([]);
  const [dateRange, setDateRange] = useState("30d");
  const [users, setUsers] = useState<UserData[]>([]);
  const [properties, setProperties] = useState<PropertyData[]>([]);
  const [applications, setApplications] = useState<ApplicationData[]>([]);
  const [investmentRecommendations, setInvestmentRecommendations] = useState<InvestmentRecommendation[]>([]);
  const [stats, setStats] = useState({
    activeLeads: 0,
    leadGrowth: 10,
    investmentOpportunities: 0,
    revenue: 0,
    revenueGrowth: 8.5,
    projectsCompleted: 0,
    activeProjects: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      let usersData: any = null;
      let properties: PropertyData[] = [];
      let apps: ApplicationData[] = [];
      let completedProjects = 0;
      let activeProjects = 0;
      let displayedLeadCount = 0;
      let investmentOpportunityAreas = 0;

      // Fetch users
      const usersRes = await fetch("/api/users");
      if (usersRes.ok) {
        usersData = await usersRes.json();
        setUsers(usersData.users || []);
      }

      // Fetch properties
      const propsRes = await fetch("/api/properties");
      if (propsRes.ok) {
        const propsData = await propsRes.json();
        properties = propsData.properties || [];
        setProperties(properties);

        // Calculate stats
        activeProjects = properties.filter((p: PropertyData) => p.status === 'active').length;
        completedProjects = properties.filter((p: PropertyData) => p.status === 'completed').length;

        // Calculate market trends as percentages
        const locationStats: Record<string, { count: number; total: number }> = {};
        let totalProperties = 0;

        properties.forEach((p: PropertyData) => {
          if (!locationStats[p.location]) {
            locationStats[p.location] = { count: 0, total: 0 };
          }
          locationStats[p.location].count += 1;
          locationStats[p.location].total += p.price;
          totalProperties += 1;
        });

        const trends: MarketTrend[] = Object.entries(locationStats).map(([location, stats]) => {
          const percentage = totalProperties > 0 ? Math.round((stats.count / totalProperties) * 100) : 0;
          const avgPrice = stats.count > 0 ? Math.round(stats.total / stats.count) : 0;

          return {
            location,
            percentage,
            propertyCount: stats.count,
            avgPrice: `MK ${(avgPrice / 1000000).toFixed(1)}M`
          };
        }).sort((a, b) => b.percentage - a.percentage).slice(0, 5);

        setMarketTrends(trends);

        // Calculate investment opportunities based on locations with acquired properties
        const acquiredLocationCounts: Record<string, number> = {};
        properties
          .filter((p: PropertyData) => ['acquired', 'payment_in_progress'].includes(p.status))
          .forEach((p) => {
            acquiredLocationCounts[p.location] = (acquiredLocationCounts[p.location] || 0) + 1;
          });

        investmentOpportunityAreas = Object.values(acquiredLocationCounts)
          .filter(count => count >= 1) // loosened from > 1 to >= 1
          .length;
      }

      // Fetch applications
      const appsRes = await fetch("/api/applications");
      if (appsRes.ok) {
        const appsData = await appsRes.json();
        apps = appsData.applications || [];
        setApplications(apps);
        displayedLeadCount = apps.slice(0, 5).length;

        // DEBUG: log raw app fields to identify correct field names
        console.log("=== RAW APPS DEBUG ===");
        console.log("Total apps:", apps.length);
        apps.forEach((app: any, i: number) => {
          console.log(`App[${i}]:`, {
            id: app.id,
            user_id: app.user_id,
            property_location: app.property_location,
            location: app.location,
            allKeys: Object.keys(app)
          });
        });
      }

      // Fetch payments for revenue calculation
      try {
        const paymentsRes = await fetch("/api/payments");
        if (paymentsRes.ok) {
          const paymentsData = await paymentsRes.json();
          const completedPayments = paymentsData.payments?.filter((p: any) => p.status === 'completed') || [];
          const totalRevenue = completedPayments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);

          setStats(prev => ({
            ...prev,
            revenue: totalRevenue,
            activeLeads: displayedLeadCount,
            projectsCompleted: completedProjects,
            activeProjects: activeProjects
          }));
        }
      } catch (paymentsError) {
        console.error("Failed to fetch payments:", paymentsError);
        // Fallback to property-based calculation if payments API fails
        const totalRevenue = properties
          .filter((p: PropertyData) => p.status === 'completed' || p.status === 'active')
          .reduce((sum: number, p: PropertyData) => sum + (p.price || 0), 0);

        setStats(prev => ({
          ...prev,
          revenue: totalRevenue,
          activeLeads: displayedLeadCount,
          projectsCompleted: completedProjects,
          activeProjects: activeProjects
        }));
      }

      // Calculate investment recommendations using local `apps` variable (not stale state)
      if (properties.length > 0 && apps.length > 0) {
        const locationDemand: Record<string, number> = {};
        const locationAvailable: Record<string, number> = {};

        // Count applications per location
        apps.forEach((app: ApplicationData) => {
          const location = app.property_location;
          locationDemand[location] = (locationDemand[location] || 0) + 1;
        });

        // Count available properties per location
        properties.forEach((p: PropertyData) => {
          if (p.status === 'available') {
            locationAvailable[p.location] = (locationAvailable[p.location] || 0) + 1;
          }
        });

        // Generate recommendations
        const recommendations: InvestmentRecommendation[] = Object.entries(locationDemand)
          .map(([location, demand]) => {
            const available = locationAvailable[location] || 0;
            const ratio = demand / (available || 1);
            let recommendation = "Moderate Demand";

            if (ratio > 3) {
              recommendation = "High Demand - Add More Inventory";
            } else if (ratio > 1.5) {
              recommendation = "Growing Demand";
            } else if (ratio < 0.5) {
              recommendation = "Low Demand - Consider Marketing";
            }

            return {
              location,
              demand,
              available,
              recommendation
            };
          })
          .filter(r => r.demand > 0)
          .sort((a, b) => (b.demand / (b.available || 1)) - (a.demand / (a.available || 1)))
          .slice(0, 3);

        setMarketTrends;
        setInvestmentRecommendations(recommendations);

        // Normalize locations and count applications per user per location
        const userLocationCount: Record<string, Record<string, number>> = {};
        const locationTotalCount: Record<string, number> = {};

        apps.forEach((app: ApplicationData) => {
          const location = (app.property_location || "").trim().toLowerCase();
          const userId = String(app.user_id);

          if (!userLocationCount[location]) {
            userLocationCount[location] = {};
          }
          userLocationCount[location][userId] = (userLocationCount[location][userId] || 0) + 1;
          locationTotalCount[location] = (locationTotalCount[location] || 0) + 1;
        });

        // Calculate physical property density per location from our listings database
        const propertyLocationCounts: Record<string, number> = {};
        properties.forEach((p: PropertyData) => {
          const loc = (p.location || "").trim().toLowerCase();
          propertyLocationCounts[loc] = (propertyLocationCounts[loc] || 0) + 1;
        });

        // A location qualifies as an opportunity if:
        // - At least one user has applied more than once there, OR
        // - There are multiple total applications in that location, OR
        // - There is multiple property inventory there (high supply/listing density)
        const opportunityCount = Object.keys({ ...userLocationCount, ...propertyLocationCounts }).filter(location => {
          const hasRepeatUser = Object.values(userLocationCount[location] || {}).some(count => count > 1);
          const hasMultipleApps = (locationTotalCount[location] || 0) > 1;
          const hasMultipleProperties = (propertyLocationCounts[location] || 0) > 1;
          return hasRepeatUser || hasMultipleApps || hasMultipleProperties;
        }).length;

        // DEBUG: log the counts
        console.log("=== INVESTMENT OPPORTUNITY DEBUG ===");
        console.log("userLocationCount:", JSON.stringify(userLocationCount, null, 2));
        console.log("locationTotalCount:", JSON.stringify(locationTotalCount, null, 2));
        console.log("propertyLocationCounts:", JSON.stringify(propertyLocationCounts, null, 2));
        console.log("opportunityCount:", opportunityCount);

        setStats(prev => ({
          ...prev,
          investmentOpportunities: opportunityCount
        }));
      } else {
        // Fallback: use property-based calculation only
        setStats(prev => ({
          ...prev,
          investmentOpportunities: investmentOpportunityAreas
        }));
      }
    } catch (error) {
      console.error("Failed to fetch report data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Convert applications to leads format for display
  const leads = applications.slice(0, 5).map((app, idx) => ({
    id: app.id,
    userId: app.user_id,
    name: app.user_name,
    email: app.user_email,
    interest: app.property_name,
    location: app.property_location,
    price: app.property_price,
    status: app.status,
    score: 70 + (idx * 5),
    initials: app.user_name.split(' ').map((n: string) => n[0]).join('').toUpperCase()
  }));

  const handleReview = async (applicationId: number, userId: number) => {
    try {
      const response = await fetch('/api/applications/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          applicationId
        })
      });

      if (response.ok) {
        fetchData();
      } else {
        console.error('Failed to approve application');
      }
    } catch (error) {
      console.error('Error approving application:', error);
    }
  };

  return (
    <AppSidebar>
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
                  <span className="text-4xl font-bold text-foreground">{stats.activeLeads}</span>
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

            {/* Investment Opportunities */}
            <Card className="shadow-sm border-border relative overflow-hidden">
              <CardHeader className="p-6">
                <CardTitle className="text-4xl font-bold text-foreground">{stats.investmentOpportunities}</CardTitle>
                <CardDescription className="text-xs font-semibold uppercase text-muted-foreground mt-2">Investment Opportunities</CardDescription>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <Badge className="bg-green-50 text-green-700 hover:bg-green-50 text-xs font-semibold rounded-md">High Demand Areas</Badge>
              </CardContent>
              <div className="absolute right-4 top-4 bg-[#ffc300]/20 p-2 rounded-md">
                <TrendingUp className="w-5 h-5 text-[#e6b000]" />
              </div>
            </Card>

            {/* Revenue */}
            <Card className="shadow-sm border-border relative overflow-hidden">
              <CardHeader className="p-6">
                <div className="flex items-baseline gap-2">
                  <CardTitle className="text-4xl font-bold text-foreground">MK {stats.revenue.toLocaleString()}</CardTitle>
                </div>
                <CardDescription className="text-xs font-semibold uppercase text-muted-foreground mt-2">Total Revenue</CardDescription>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <p className="text-xs font-medium text-muted-foreground bg-muted p-1 px-2 inline-block rounded-md">
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
              <div className="bg-white shadow-sm rounded-lg border border-gray-100 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Applicant</TableHead>
                      <TableHead className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Property</TableHead>
                      <TableHead className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Status</TableHead>
                      <TableHead className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leads.map((lead) => (
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
                          <div className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-sm inline-block mt-1">{lead.location}</div>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <Badge variant={lead.status === 'approved' ? 'secondary' : 'outline'} className="text-xs">
                            {lead.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-6 py-4 text-right">
                          {lead.status === 'pending' ? (
                            <Button
                              variant="outline"
                              className="h-11 text-black hover:bg-[#ffc300]/10 hover:text-[#ffc300] border border-gray-200 hover:border-[#ffc300]/30 px-3 text-xs font-semibold rounded-md transition-colors"
                              onClick={() => handleReview(lead.id, lead.userId)}
                            >
                              Review
                            </Button>
                          ) : (
                            <Badge variant="secondary" className="text-xs">Approved</Badge>
                          )}
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
                {marketTrends.length > 0 ? (
                  <div className="space-y-3">
                    {marketTrends.map((trend, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-bold text-black">{trend.location}</p>
                          <p className="text-xs text-gray-500">Avg: {trend.avgPrice} • {trend.propertyCount} properties</p>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-bold text-[#ffc300]">{trend.percentage}%</span>
                          <Progress value={trend.percentage} className="w-16 h-1.5 mt-1 bg-gray-100" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No market data available yet</p>
                )}
              </div>

              {/* Investment Recommendations
              <div className="bg-white p-6 shadow-sm rounded-lg border border-gray-100">
                <h3 className="text-sm font-bold text-black uppercase tracking-wide mb-4 border-b-2 border-[#ffc300] pb-2 inline-block">
                  Investment Recommendations
                </h3>
                {investmentRecommendations.length > 0 ? (
                  <div className="space-y-3">
                    {investmentRecommendations.map((rec, idx) => (
                      <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-bold text-black">{rec.location}</p>
                          <Badge variant={rec.demand > (rec.available || 1) ? "default" : "outline"} className="text-xs">
                            {rec.demand} applications
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600">{rec.recommendation}</p>
                        <p className="text-xs text-gray-400 mt-1">{rec.available} available</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No recommendations yet</p>
                )}
              </div> */}
            </div>
          </div>
        </div>
      </main>
    </AppSidebar>
  );
}