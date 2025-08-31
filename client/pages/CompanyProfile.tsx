import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Building2, MapPin, Phone, Mail, UserRoundCog, FileText, Globe2, Settings } from "lucide-react";

export default function CompanyProfile() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-gradient-to-b from-brand-blue/5 to-transparent py-10">
      <div className="container max-w-3xl">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Create Company Profile</h1>
          <Button variant="outline" onClick={() => navigate(-1)}>Back</Button>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">Provide verified details to complete your organization profile.</p>

        <form
          className="mt-8 space-y-6"
          onSubmit={(e) => {
            e.preventDefault();
            navigate("/company-dashboard");
          }}
        >
          <Section title="Company Information" icon={<Building2 className="h-4 w-4 text-brand-blue" />}> 
            <Field id="companyName" label="Legal Company Name" placeholder="Enter registered name" />
            <Field id="cin" label="CIN/Registration Number" placeholder="Corporate Identification Number" />
            <Field id="website" type="url" label="Website" placeholder="https://example.com" />
          </Section>

          <Section title="Registered Address" icon={<MapPin className="h-4 w-4 text-brand-blue" />}> 
            <Field id="address1" label="Address Line 1" />
            <Field id="address2" label="Address Line 2" />
            <div className="grid gap-3 md:grid-cols-3">
              <Field id="city" label="City" />
              <Field id="state" label="State" />
              <Field id="pincode" label="PIN Code" />
            </div>
          </Section>

          <Section title="Primary Contact" icon={<Phone className="h-4 w-4 text-brand-blue" />}> 
            <div className="grid gap-3 md:grid-cols-2">
              <Field id="contactName" label="Contact Person" />
              <Field id="designation" label="Designation" />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <Field id="email" type="email" label="Official Email" placeholder="name@company.com" />
              <Field id="phone" label="Phone Number" placeholder="+91-XXXXXXXXXX" />
            </div>
          </Section>

          <Section title="Operations Details" icon={<Globe2 className="h-4 w-4 text-brand-blue" />}> 
            <div className="grid gap-3 md:grid-cols-2">
              <Field id="plantLocation" label="Primary Plant Location" />
              <Field id="capacity" label="Installed Capacity (kg/day)" />
            </div>
            <Field id="techStack" label="Technology Used" placeholder="Electrolyzer type, energy source, etc." />
          </Section>

          <Section title="Compliance Documents" icon={<FileText className="h-4 w-4 text-brand-blue" />}> 
            <FileField id="incorporation" label="Certificate of Incorporation" />
            <FileField id="gst" label="GST Certificate" />
            <FileField id="factoryLicense" label="Factory License" />
          </Section>

          <Section title="Preferences" icon={<Settings className="h-4 w-4 text-brand-blue" />}> 
            <div className="flex items-center gap-3 text-sm">
              <input id="notify" type="checkbox" className="accent-brand-blue" defaultChecked />
              <label htmlFor="notify">Email me important updates and review schedules</label>
            </div>
          </Section>

          <div className="rounded-xl border bg-card p-4">
            <Button type="submit" className="w-full bg-gradient-to-r from-brand-green to-brand-blue text-white">Save Profile</Button>
            <p className="mt-2 text-center text-xs text-muted-foreground">Your details are used for verification and program eligibility checks.</p>
          </div>
        </form>
      </div>
    </main>
  );
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border bg-card p-5 shadow-sm">
      <div className="flex items-center gap-2">
        {icon}
        <div className="font-semibold">{title}</div>
      </div>
      <div className="mt-4 space-y-3">{children}</div>
    </section>
  );
}

function Field({ id, label, placeholder, type = "text" }: { id: string; label: string; placeholder?: string; type?: string }) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium">{label}</label>
      <input id={id} name={id} type={type} placeholder={placeholder} className="mt-1 w-full rounded-md border bg-background px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-brand-blue" />
    </div>
  );
}

function FileField({ id, label }: { id: string; label: string }) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium">{label}</label>
      <input id={id} name={id} type="file" className="mt-1 w-full rounded-md border bg-background px-3 py-2 file:mr-4 file:rounded-md file:border-0 file:bg-accent file:px-3 file:py-1 file:text-sm file:text-foreground" />
    </div>
  );
}
