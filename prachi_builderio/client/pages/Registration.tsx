import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { FileText, Building2, Zap, DollarSign, CheckCircle } from "lucide-react";

const registrationSchema = z.object({
  // Company Details
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  companyProof: z.instanceof(FileList).optional(),
  
  // Production and Technology Details
  hydrogenProductionVolume: z.number().min(0, "Production volume must be a positive number"),
  costReductionCommitments: z.string().min(10, "Please provide detailed cost reduction commitments"),
  iotSensorUrl: z.string().url("Please enter a valid URL"),
  certificationProvider: z.string().min(2, "Please select or enter a certification provider"),
  productionLogs: z.instanceof(FileList).optional(),
  
  // Financial and Subsidy Model
  subsidyModel: z.enum(["loan-based", "production-based"], {
    required_error: "Please select a subsidy model",
  }),
  bankAccountNumber: z.string().min(8, "Bank account number must be at least 8 digits"),
  bankName: z.string().min(2, "Bank name is required"),
  ifscCode: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Please enter a valid IFSC code"),
  
});

type RegistrationForm = z.infer<typeof registrationSchema>;

const certificationProviders = [
  "ISO 14064",
  "Gold Standard",
  "Verified Carbon Standard (VCS)",
  "Climate Action Reserve",
  "American Carbon Registry",
  "Other"
];

// Mock existing application data for update mode
const existingApplicationData = {
  companyName: "Green Energy Solutions Pvt. Ltd.",
  hydrogenProductionVolume: 500,
  costReductionCommitments: "We are committed to reducing production costs by implementing advanced electrolysis technology and optimizing our supply chain. Our target is to achieve a 25% cost reduction over the next 2 years through technological improvements and economies of scale.",
  iotSensorUrl: "https://api.greenenergy.com/sensor-data",
  certificationProvider: "ISO 14064",
  bankAccountNumber: "1234567890123456",
  bankName: "State Bank of India",
  ifscCode: "SBIN0001234",
};

export default function Registration() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check URL parameters to determine mode
  const urlParams = new URLSearchParams(window.location.search);
  const mode = urlParams.get('mode') || 'new';
  const isUpdateMode = mode === 'update';

  // Use existing data for update mode, empty values for new mode
  const defaultValues = isUpdateMode ? existingApplicationData : {
    companyName: "",
    hydrogenProductionVolume: 0,
    costReductionCommitments: "",
    iotSensorUrl: "",
    certificationProvider: "",
    bankAccountNumber: "",
    bankName: "",
    ifscCode: "",
  };

  const form = useForm<RegistrationForm>({
    resolver: zodResolver(registrationSchema),
    defaultValues,
  });

  async function onSubmit(data: RegistrationForm) {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log("Form submitted:", data);
      setIsSubmitted(true);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsLoading(false);
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <CardTitle className="text-2xl text-green-800">
              {isUpdateMode ? 'Application Updated!' : 'Registration Successful!'}
            </CardTitle>
            <CardDescription>
              {isUpdateMode
                ? 'Your application has been updated successfully. The review process will continue with your new information.'
                : 'Your application has been submitted successfully. You will receive a confirmation email shortly.'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <Button className="w-full" onClick={() => window.location.href = "/dashboard"}>
              Go to Dashboard
            </Button>
            <Button variant="outline" className="w-full" onClick={() => setIsSubmitted(false)}>
              Submit Another Application
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {isUpdateMode ? 'Update Your Application' : 'Green Hydrogen Subsidy Registration'}
          </h1>
          <p className="text-lg text-gray-600">
            {isUpdateMode
              ? 'Modify your existing application details and resubmit'
              : 'Apply for government subsidies for your green hydrogen production'
            }
          </p>
          {isUpdateMode && (
            <div className="mt-4 inline-flex items-center px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
              <svg className="w-5 h-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span className="text-sm text-blue-800">
                Your existing application data has been pre-filled. Make changes as needed.
              </span>
            </div>
          )}
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            
            {/* Company Details Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  Company Details
                </CardTitle>
                <CardDescription>
                  Provide information about your company and proof of authenticity
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your company name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="companyProof"
                  render={({ field: { onChange, value, ...field } }) => (
                    <FormItem>
                      <FormLabel>Proof of Company Existence/Authenticity</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                          onChange={(e) => onChange(e.target.files)}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                      <p className="text-sm text-gray-500">Upload registration certificate, incorporation documents, etc.</p>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Production and Technology Details Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-green-600" />
                  Production and Technology Details
                </CardTitle>
                <CardDescription>
                  Provide details about your hydrogen production capabilities and technology
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="hydrogenProductionVolume"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hydrogen Production Volume (kg/day) *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter daily production volume"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="costReductionCommitments"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Commitments to Cost Reduction *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe your strategies and commitments to reduce hydrogen production costs..."
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="iotSensorUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>IoT Sensor Data Feed URL *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://api.yourcompany.com/sensor-data"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="certificationProvider"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Third-Party Certification Provider *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select certification provider" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {certificationProviders.map((provider) => (
                            <SelectItem key={provider} value={provider}>
                              {provider}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="productionLogs"
                  render={({ field: { onChange, value, ...field } }) => (
                    <FormItem>
                      <FormLabel>Production Logs</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          accept=".pdf,.csv,.xlsx,.xls"
                          multiple
                          onChange={(e) => onChange(e.target.files)}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                      <p className="text-sm text-gray-500">Upload historical production data and logs</p>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Financial and Subsidy Model Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-yellow-600" />
                  Financial and Subsidy Model
                </CardTitle>
                <CardDescription>
                  Select your preferred subsidy model and provide banking details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="subsidyModel"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Subsidy Model Selection *</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-2"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="loan-based" id="loan-based" />
                            <Label htmlFor="loan-based">Loan-based Subsidy</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="production-based" id="production-based" />
                            <Label htmlFor="production-based">Production-based Subsidy</Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="bankAccountNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bank Account Number *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter account number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bankName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bank Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter bank name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="ifscCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>IFSC Code *</FormLabel>
                        <FormControl>
                          <Input placeholder="ABCD0123456" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <Card>
              <CardContent className="pt-6">
                <Button 
                  type="submit" 
                  className="w-full h-12 text-lg"
                  disabled={isLoading}
                >
                  {isLoading
                    ? (isUpdateMode ? "Updating Application..." : "Submitting Application...")
                    : (isUpdateMode ? "Update Application" : "Submit Registration")
                  }
                </Button>
                <p className="text-sm text-gray-500 text-center mt-4">
                  By submitting this form, you agree to our terms and conditions and privacy policy.
                </p>
              </CardContent>
            </Card>

          </form>
        </Form>
      </div>
    </div>
  );
}
