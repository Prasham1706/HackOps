import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Leaf, Zap, DollarSign, Menu, User, Bell, FileText, Settings, Lock, LogOut, BarChart3, RefreshCw, Palette, Eye } from "lucide-react";

export default function Index() {
  // No longer needed for continuous scroll
  // const [currentScheme, setCurrentScheme] = useState(0);
  
  const governmentSchemes = [
    "New PLI Scheme for Green Hydrogen - ₹19,744 crore allocation announced",
    "National Green Hydrogen Mission launches with ₹2.4 lakh crore investment target",
    "Export incentives for green hydrogen producers - Up to 25% subsidy available",
    "Green Hydrogen Production Linked Incentive extended till 2030",
    "State-wise Green Energy Parks approved with special hydrogen zones"
  ];

  // Continuous scroll is now handled by CSS animations

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <Leaf className="w-8 h-8 text-green-600" />
              <span className="text-xl font-bold text-gray-900">GreenH2 Platform</span>
            </div>

            {/* User Profile Section */}
            <div className="flex items-center space-x-4">
              {/* Profile Info */}
              <div className="hidden md:flex flex-col items-end">
                <span className="text-sm font-medium text-gray-900">Green Energy Solutions Pvt. Ltd.</span>
                <span className="text-xs text-gray-500">contact@greenenergy.com</span>
              </div>
              
              {/* Profile Picture & Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <div className="h-8 w-8 rounded-full bg-green-600 flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <div className="flex items-center space-x-2 p-2">
                    <div className="h-8 w-8 rounded-full bg-green-600 flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">Green Energy Solutions</p>
                      <p className="text-xs text-gray-500">contact@greenenergy.com</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem onClick={() => window.location.href = "/dashboard"}>
                    <Eye className="mr-2 h-4 w-4" />
                    View Application Status
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    Update Profile
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem>
                    <Bell className="mr-2 h-4 w-4" />
                    Notifications
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Update Monthly Report
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem>
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Previous Reports Stats
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem>
                    <Palette className="mr-2 h-4 w-4" />
                    Change Theme
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem>
                    <Lock className="mr-2 h-4 w-4" />
                    Change Password
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mobile menu button */}
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {/* Section 1: Hero & Features */}
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            {/* Hero Content */}
            <div className="text-center mb-16">
              <h1 className="text-5xl md:text-7xl font-bold text-gray-900 tracking-tight leading-tight mb-6">
                Green Hydrogen
                <span className="block text-green-600">Subsidy Platform</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
                Accelerate the green hydrogen revolution with government subsidies. 
                Register your production facility and unlock financial support for sustainable energy.
              </p>
              <div className="space-y-4 mb-12">
                <Button 
                  size="lg" 
                  className="text-lg px-8 py-6 h-auto"
                  onClick={() => window.location.href = "/register?mode=new"}
                >
                  Apply for Subsidy
                </Button>
                <p className="text-sm text-gray-500">
                  Join the clean energy transition today
                </p>
              </div>
            </div>

            {/* Our Features */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">Our Features</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card className="border-green-200 bg-green-50/50 hover:shadow-lg transition-shadow">
                  <CardHeader className="text-center">
                    <Zap className="w-12 h-12 text-green-600 mx-auto mb-4" />
                    <CardTitle className="text-xl">Production Support</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-center">
                      Get comprehensive financial assistance for green hydrogen production facilities, 
                      technology upgrades, and infrastructure development.
                    </CardDescription>
                  </CardContent>
                </Card>

                <Card className="border-blue-200 bg-blue-50/50 hover:shadow-lg transition-shadow">
                  <CardHeader className="text-center">
                    <DollarSign className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                    <CardTitle className="text-xl">Flexible Models</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-center">
                      Choose between loan-based and production-based subsidy models 
                      tailored to fit your business requirements and cash flow.
                    </CardDescription>
                  </CardContent>
                </Card>

                <Card className="border-purple-200 bg-purple-50/50 hover:shadow-lg transition-shadow">
                  <CardHeader className="text-center">
                    <Leaf className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                    <CardTitle className="text-xl">Certified Process</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-center">
                      Transparent verification process with third-party certification, 
                      IoT monitoring, and comprehensive audit trails.
                    </CardDescription>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Continuous Scrolling Government Schemes */}
        <section className="py-4 border-t border-b border-gray-200 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-green-100 text-green-700 font-semibold whitespace-nowrap">
                Latest Update
              </Badge>
              <div className="flex-1 overflow-hidden">
                <div className="flex animate-scroll">
                  <div className="flex space-x-8 text-gray-700">
                    {governmentSchemes.map((scheme, index) => (
                      <span key={index} className="text-sm font-medium whitespace-nowrap">
                        {scheme}
                      </span>
                    ))}
                  </div>
                  <div className="flex space-x-8 text-gray-700 ml-8">
                    {governmentSchemes.map((scheme, index) => (
                      <span key={`duplicate-${index}`} className="text-sm font-medium whitespace-nowrap">
                        {scheme}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Terms and Conditions */}
        <section className="bg-gray-50 py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Terms & Conditions</h2>
              <p className="text-lg text-gray-600">
                Understanding our subsidy disbursement process and requirements
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-green-600" />
                    Eligibility Criteria
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></span>
                      Minimum production capacity of 100 kg/day green hydrogen
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></span>
                      Valid third-party certification from approved agencies
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></span>
                      Operational IoT monitoring system for production tracking
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></span>
                      Commitment to cost reduction targets over 5-year period
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5 text-blue-600" />
                    Disbursement Process
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                      Initial verification within 15 working days of application
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                      Technical audit by certified third-party inspectors
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                      Monthly production reporting mandatory for continued support
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                      Quarterly disbursement based on verified production data
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="w-5 h-5 text-purple-600" />
                    Compliance Requirements
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0"></span>
                      Environmental clearance certificates must be maintained
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0"></span>
                      Annual sustainability impact assessment required
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0"></span>
                      Technology upgrade commitments must be fulfilled
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0"></span>
                      Regular financial audits and transparency requirements
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-orange-600" />
                    Support & Benefits
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-orange-600 rounded-full mt-2 flex-shrink-0"></span>
                      Up to ₹50 lakh subsidy for production-based model
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-orange-600 rounded-full mt-2 flex-shrink-0"></span>
                      Low-interest loans at 4% annual rate for infrastructure
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-orange-600 rounded-full mt-2 flex-shrink-0"></span>
                      Technical support and consultation services included
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-orange-600 rounded-full mt-2 flex-shrink-0"></span>
                      Priority access to government green energy initiatives
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <div className="mt-12 text-center">
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => window.location.href = "/register?mode=new"}
              >
                Start Your Application
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm text-gray-400">
            © 2024 Green Hydrogen Subsidy Platform. All rights reserved. 
            Powered by Ministry of New and Renewable Energy, Government of India.
          </p>
        </div>
      </footer>
    </div>
  );
}
