import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Leaf, Zap, DollarSign } from "lucide-react";

export default function Index() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Hero Section */}
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="text-center max-w-4xl mx-auto">
          <div className="mb-8">
            <Leaf className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 tracking-tight leading-tight mb-6">
              Green Hydrogen
              <span className="block text-green-600">Subsidy Platform</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Accelerate the green hydrogen revolution with government subsidies.
              Register your production facility and unlock financial support for sustainable energy.
            </p>
          </div>

          <div className="space-y-4 mb-12">
            <Button
              size="lg"
              className="text-lg px-8 py-6 h-auto"
              onClick={() => window.location.href = "/register"}
            >
              Apply for Subsidy
            </Button>
            <p className="text-sm text-gray-500">
              Join the clean energy transition today
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="border-green-200 bg-green-50/50">
              <CardHeader className="text-center">
                <Zap className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <CardTitle className="text-lg">Production Support</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Get financial assistance for green hydrogen production facilities and technology upgrades.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-blue-200 bg-blue-50/50">
              <CardHeader className="text-center">
                <DollarSign className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <CardTitle className="text-lg">Flexible Models</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Choose between loan-based and production-based subsidy models that fit your business needs.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-purple-200 bg-purple-50/50">
              <CardHeader className="text-center">
                <Leaf className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <CardTitle className="text-lg">Certified Process</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Transparent verification process with third-party certification and IoT monitoring.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
