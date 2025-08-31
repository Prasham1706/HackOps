import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Building2, Factory, Wallet, FileText, Gauge, Link as LinkIcon, CheckCircle2 } from "lucide-react";

import { useNavigate } from "react-router-dom";

export default function SubsidyRegistration() {
  const [volume, setVolume] = useState(0);
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-gradient-to-b from-brand-green/10 to-transparent py-10">
      <div className="container max-w-3xl">
        <div className="text-center">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Green Hydrogen Subsidy Registration</h1>
          <p className="mt-2 text-sm text-muted-foreground">Apply for government subsidies for your green hydrogen production</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={(e)=>{e.preventDefault(); navigate('/application-dashboard');}}>
          <SectionCard icon={<Building2 className="h-4 w-4 text-brand-blue" />} title="Company Details" subtitle="Provide information about your company and proof of authenticity">
            <Field label="Company Name" id="companyName" placeholder="Enter your company name" />
            <FileField label="Proof of Company Existence/Authenticity" id="proofFile" hint="Upload registration certificate, incorporation documents, etc." />
          </SectionCard>

          <SectionCard icon={<Factory className="h-4 w-4 text-brand-green" />} title="Production and Technology Details" subtitle="Provide details about your hydrogen production capabilities and technology">
            <div>
              <label htmlFor="productionVolume" className="text-sm font-medium">Hydrogen Production Volume (kg/day)</label>
              <div className="mt-2 flex items-center gap-3">
                <input id="productionVolume" type="range" min={0} max={1000} value={volume} onChange={(e)=>setVolume(Number(e.target.value))} className="w-full" />
                <div className="w-16 text-right text-sm">{volume}</div>
              </div>
            </div>
            <div>
              <label htmlFor="costCommit" className="text-sm font-medium">Commitments to Cost Reduction</label>
              <textarea id="costCommit" className="mt-1 w-full rounded-md border bg-background p-2 outline-none focus-visible:ring-2 focus-visible:ring-brand-blue" rows={4} placeholder="Describe your strategies and commitments to reduce hydrogen production costs..." />
            </div>
            <div>
              <label htmlFor="iotUrl" className="text-sm font-medium">IoT Sensor Data Feed URL</label>
              <div className="relative mt-1">
                <input id="iotUrl" type="url" placeholder="https://yourcompany.com/sensor-data" className="w-full rounded-md border bg-background px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-brand-blue" />
                <LinkIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              </div>
            </div>
            <div>
              <label htmlFor="certProvider" className="text-sm font-medium">Third Party Certification Provider</label>
              <select id="certProvider" className="mt-1 w-full rounded-md border bg-background px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-brand-blue">
                <option value="">Select certification provider</option>
                <option>DNV</option>
                <option>SGS</option>
                <option>Bureau Veritas</option>
                <option>TÜV SÜD</option>
              </select>
            </div>
            <FileField label="Production Logs" id="prodLogs" hint="Upload historical production data and logs" />
          </SectionCard>

          <SectionCard icon={<Wallet className="h-4 w-4 text-brand-blue" />} title="Financial and Subsidy Model" subtitle="Select your preferred subsidy model and provide banking details">
            <fieldset className="space-y-2">
              <legend className="text-sm font-medium">Subsidy Model Selection</legend>
              <label className="mt-1 flex items-center gap-2 text-sm">
                <input type="radio" name="model" value="loan" className="accent-brand-blue" />
                <span>Loan-based Subsidy</span>
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" name="model" value="production" className="accent-brand-blue" />
                <span>Production-based Subsidy</span>
              </label>
            </fieldset>
            <div className="grid gap-3 md:grid-cols-3">
              <Field label="Bank Account Number" id="bankAccount" placeholder="Enter account number" />
              <Field label="Bank Name" id="bankName" placeholder="Enter bank name" />
              <Field label="IFSC Code" id="ifsc" placeholder="ABCD0123456" />
            </div>
          </SectionCard>

          <div className="rounded-xl border bg-card p-4">
            <Button type="submit" className="w-full bg-gradient-to-r from-brand-green to-brand-blue text-white">Submit Registration</Button>
            <p className="mt-2 text-center text-xs text-muted-foreground">By submitting this form, you agree to our terms and conditions and privacy policy.</p>
          </div>
        </form>
      </div>
    </main>
  );
}

function SectionCard({ icon, title, subtitle, children }: { icon: React.ReactNode; title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border bg-card p-5 shadow-sm">
      <div className="flex items-center gap-2">
        {icon}
        <div className="font-semibold">{title}</div>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
      <div className="mt-4 space-y-4">{children}</div>
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

function FileField({ id, label, hint }: { id: string; label: string; hint?: string }) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium">{label}</label>
      <input id={id} name={id} type="file" className="mt-1 w-full rounded-md border bg-background px-3 py-2 file:mr-4 file:rounded-md file:border-0 file:bg-accent file:px-3 file:py-1 file:text-sm file:text-foreground" />
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
