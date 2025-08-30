import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CalendarDays, FileText, DollarSign, Zap, ArrowLeft, Edit, Download, Bell } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            className="mb-4"
            onClick={() => window.location.href = "/"}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Application Dashboard
              </h1>
              <p className="text-lg text-gray-600">
                Track your green hydrogen subsidy application status and manage your account
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => window.location.href = "/register?mode=update"}
                className="flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Update Application
              </Button>
              <Button
                onClick={() => window.location.href = "/register?mode=new"}
                className="flex items-center gap-2"
              >
                Submit New Application
              </Button>
            </div>
          </div>
        </div>

        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Application Status</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Badge variant="secondary" className="text-yellow-600 bg-yellow-100">
                Under Review
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Subsidy Amount</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹2,50,000</div>
              <p className="text-xs text-muted-foreground">Estimated</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Production Capacity</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">500 kg/day</div>
              <p className="text-xs text-muted-foreground">Green Hydrogen</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Next Review</CardTitle>
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">15 Days</div>
              <p className="text-xs text-muted-foreground">Estimated</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Application Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Application Progress</CardTitle>
              <CardDescription>Track the status of your subsidy application</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Document Verification</span>
                  <span className="text-green-600">Complete</span>
                </div>
                <Progress value={100} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Technical Review</span>
                  <span className="text-yellow-600">In Progress</span>
                </div>
                <Progress value={60} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Financial Assessment</span>
                  <span className="text-gray-500">Pending</span>
                </div>
                <Progress value={0} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Final Approval</span>
                  <span className="text-gray-500">Pending</span>
                </div>
                <Progress value={0} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest updates on your application</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Application Submitted</p>
                  <p className="text-xs text-gray-500">Today at 2:30 PM</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Documents Verified</p>
                  <p className="text-xs text-gray-500">Expected by tomorrow</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-gray-300 rounded-full mt-2"></div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Technical Review Scheduled</p>
                  <p className="text-xs text-gray-500">Within 3-5 business days</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => window.location.href = "/register?mode=update"}>
              <CardContent className="flex items-center p-6">
                <Edit className="w-8 h-8 text-blue-600 mr-4" />
                <div>
                  <h3 className="font-semibold text-gray-900">Update Application</h3>
                  <p className="text-sm text-gray-600">Modify your existing application details</p>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="flex items-center p-6">
                <Download className="w-8 h-8 text-green-600 mr-4" />
                <div>
                  <h3 className="font-semibold text-gray-900">Download Documents</h3>
                  <p className="text-sm text-gray-600">Get copies of your submitted documents</p>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="flex items-center p-6">
                <Bell className="w-8 h-8 text-orange-600 mr-4" />
                <div>
                  <h3 className="font-semibold text-gray-900">Notifications</h3>
                  <p className="text-sm text-gray-600">View application updates and alerts</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
