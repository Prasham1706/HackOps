import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, FileText, Gauge, Leaf, LineChart, Link as LinkIcon, Upload, Droplets, Zap, Coins } from "lucide-react";

export default function MonthlyReport() {
  const navigate = useNavigate();
  const [month, setMonth] = useState<string>(() => new Date().toISOString().slice(0,7));
  const [productionKg, setProductionKg] = useState<number>(0);
  const [emissionPerKg, setEmissionPerKg] = useState<number>(0.0);

  const totalEmissions = Number((productionKg * emissionPerKg).toFixed(2));

  return (
    <main className="min-h-screen bg-gradient-to-b from-brand-green/10 to-transparent">
      <div className="container max-w-4xl py-8">
        <div className="flex items-center justify-between">
          <Link to="/company-dashboard" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4"/> Back to Dashboard</Link>
        </div>
        <h1 className="mt-3 text-2xl md:text-3xl font-extrabold tracking-tight">Submit Monthly Report</h1>
        <p className="text-sm text-muted-foreground">Provide production, efficiency, financials, and environmental impact for the selected period. These details will be used to analyze annual performance and verify subsidy eligibility.</p>

        <form className="mt-8 space-y-6" onSubmit={(e)=>{ e.preventDefault(); navigate('/application-dashboard'); }}>
          <Section title="Reporting Period & Production Summary" icon={<Calendar className="h-4 w-4 text-brand-blue" />}> 
            <div className="grid gap-3 md:grid-cols-3">
              <Field id="period" label="Reporting Month" type="month" value={month} onChange={(v)=>setMonth(v)} />
              <NumberField id="operatingDays" label="Operating Days" placeholder="e.g. 26" />
              <NumberField id="downtimeHours" label="Downtime (hours)" placeholder="e.g. 10" />
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <NumberField id="productionKg" label="Hydrogen Produced (kg)" value={productionKg} onChange={(n)=>setProductionKg(n)} placeholder="e.g. 12000" />
              <NumberField id="capacityFactor" label="Capacity Factor (%)" placeholder="e.g. 68" />
              <NumberField id="uptime" label="Plant Uptime (%)" placeholder="e.g. 92" />
            </div>
          </Section>

          <Section title="Sales & Revenue" icon={<LineChart className="h-4 w-4 text-brand-blue" />}> 
            <div className="grid gap-3 md:grid-cols-3">
              <NumberField id="monthlySales" label="Monthly Sales Revenue (₹)" placeholder="e.g. 850000" />
              <NumberField id="ytdSales" label="YTD Sales Revenue (₹)" placeholder="e.g. 5400000" />
              <FileField id="annualSalesReport" label="Upload Annual Sales Report (PDF/XLS)" />
            </div>
          </Section>

          <Section title="Cost of Production" icon={<Coins className="h-4 w-4 text-brand-blue" />}> 
            <div className="grid gap-3 md:grid-cols-4">
              <NumberField id="costPerKg" label="Cost per kg (₹/kg)" placeholder="e.g. 320" />
              <NumberField id="electricityCost" label="Electricity Cost (₹)" placeholder="e.g. 450000" />
              <NumberField id="waterCost" label="Water Cost (₹)" placeholder="e.g. 35000" />
              <NumberField id="omCost" label="O&M Cost (₹)" placeholder="e.g. 120000" />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <NumberField id="otherCost" label="Other Costs (₹)" placeholder="e.g. 20000" />
              <FileField id="costProofs" label="Upload Cost Proofs (bills/invoices)" />
            </div>
          </Section>

          <Section title="Efficiency Metrics" icon={<Zap className="h-4 w-4 text-brand-blue" />}> 
            <div className="grid gap-3 md:grid-cols-3">
              <NumberField id="energyPerKg" label="Energy Consumption (kWh/kg)" placeholder="e.g. 48" />
              <NumberField id="electrolyzerEff" label="Electrolyzer Efficiency (%)" placeholder="e.g. 72" />
              <NumberField id="waterPerKg" label="Water Use (L/kg)" placeholder="e.g. 9" />
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <Field id="iotFeedUrl" label="IoT Data Feed URL" placeholder="https://data.example.com/h2/monthly.csv" leftIcon={<LinkIcon className="h-4 w-4 text-muted-foreground"/>} />
              <FileField id="meterLogs" label="Upload Meter Logs (CSV/PDF)" />
              <FileField id="performanceReports" label="Performance Reports" />
            </div>
          </Section>

          <Section title="Environmental Impact" icon={<Leaf className="h-4 w-4 text-brand-blue" />}> 
            <div className="grid gap-3 md:grid-cols-3">
              <NumberField id="emissionPerKg" label="Emissions Intensity (kgCO₂e/kgH₂)" value={emissionPerKg} onChange={(n)=>setEmissionPerKg(n)} placeholder="e.g. 0.5" step="0.01" />
              <ReadOnlyField label="Estimated Total Emissions (kgCO₂e)" value={String(totalEmissions)} />
              <NumberField id="offsets" label="Offsets Purchased (kgCO₂e)" placeholder="e.g. 500" />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <FileField id="envProofs" label="Upload Environmental Proofs" />
              <Field id="measures" label="Pollution Reduction Measures" placeholder="Briefly describe steps taken this month" />
            </div>
          </Section>

          <div className="rounded-xl border bg-card p-4">
            <div className="text-xs text-muted-foreground">By submitting, you certify that all information is accurate and can be audited.</div>
            <Button type="submit" className="mt-3 w-full bg-gradient-to-r from-brand-green to-brand-blue text-white">Submit Monthly Report</Button>
          </div>
        </form>
      </div>
    </main>
  );
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border bg-card p-5 shadow-sm">
      <div className="flex items-center gap-2">{icon}<div className="font-semibold">{title}</div></div>
      <div className="mt-4 space-y-3">{children}</div>
    </section>
  );
}

function Field({ id, label, placeholder, type = "text", value, onChange, leftIcon }: { id: string; label: string; placeholder?: string; type?: string; value?: string; onChange?: (v:string)=>void; leftIcon?: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium">{label}</label>
      <div className="relative mt-1">
        {leftIcon && <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">{leftIcon}</div>}
        <input id={id} name={id} type={type} value={value} onChange={(e)=>onChange?.(e.target.value)} placeholder={placeholder} className={`w-full rounded-md border bg-background px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-brand-blue ${leftIcon ? 'pl-9' : ''}`} />
      </div>
    </div>
  );
}

function NumberField({ id, label, placeholder, step = "any", value, onChange }: { id: string; label: string; placeholder?: string; step?: string; value?: number; onChange?: (n:number)=>void }) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium">{label}</label>
      <input id={id} name={id} type="number" step={step} value={value ?? undefined} onChange={(e)=>onChange?.(Number(e.target.value))} placeholder={placeholder} className="mt-1 w-full rounded-md border bg-background px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-brand-blue" />
    </div>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <div className="mt-1 w-full rounded-md border bg-muted px-3 py-2 text-sm">{value}</div>
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
