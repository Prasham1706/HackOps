import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import { BadgeCheck, Factory, Scale, ShieldCheck, FileCheck2, HelpCircle, CheckCircle2, ListChecks, Eye, Bell, RefreshCw, BarChart3, Palette, KeyRound, LogOut, UserRoundCog, UserCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function CompanyDashboard() {
  const navigate = useNavigate();
  return (
    <main className="min-h-screen">
      <UserDropdown />
      {/* Hero */}
      <section className="bg-gradient-to-b from-brand-green/10 via-transparent to-transparent">
        <div className="container py-12 md:py-16">
          <div className="flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-xs text-muted-foreground">
              GreenH2 Platform
            </div>
            <h1 className="mt-3 text-3xl md:text-5xl font-extrabold tracking-tight">
              <span className="bg-gradient-to-r from-brand-green to-brand-blue bg-clip-text text-transparent">Green Hydrogen</span> Subsidy Platform
            </h1>
            <p className="mt-3 max-w-2xl text-sm md:text-base text-muted-foreground">
              Accelerate the green hydrogen revolution with government subsidies. Register your production facility and unlock financial support for sustainable energy.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <Button size="lg" className="bg-gradient-to-r from-brand-green to-brand-blue text-white" onClick={() => navigate('/subsidy-registration')}>Apply for Subsidy</Button>
              <a href="#terms" className="text-sm text-muted-foreground hover:text-foreground">See the step-by-step application flow</a>
            </div>
          </div>
        </div>
      </section>

      {/* Features (three cards) */}
      <section className="container py-6 md:py-10">
        <h2 className="sr-only">Our Features</h2>
        <div className="grid gap-6 md:grid-cols-3">
          <FeatureCard
            icon={<Factory className="h-5 w-5" />}
            title="Production Support"
            desc="Get disbursements linked to verified hydrogen production using trusted oracles and IoT sensors, ensuring transparent, milestone-based payouts."
          />
          <FeatureCard
            icon={<Scale className="h-5 w-5" />}
            title="Flexible Models"
            desc="Choose production-based or loan-linked models. Smart contracts automate payments as you meet certified targets and repayment milestones."
          />
          <FeatureCard
            icon={<BadgeCheck className="h-5 w-5" />}
            title="Certified Process"
            desc="Tamper-proof audit trails and government-grade verification ensure compliance and build trust across all stakeholders."
          />
        </div>
        <div className="mt-6 rounded-xl border bg-card p-3 text-xs text-muted-foreground">
          <span className="mr-2 rounded-md bg-brand-blue/10 px-2 py-1 font-medium text-brand-blue">Latest Update</span>
          New PLI scheme for Green Hydrogen – ₹19,744 crore allocation announced. National Green Hydrogen Mission launched with phased rollout.
        </div>
      </section>

      {/* Terms & Conditions */}
      <section id="terms" className="bg-gradient-to-b from-brand-blue/5 to-transparent">
        <div className="container py-10 md:py-14">
          <div className="text-center">
            <h3 className="text-2xl md:text-3xl font-bold tracking-tight">Terms & Conditions</h3>
            <p className="mt-2 text-sm text-muted-foreground">Understanding our subsidy disbursement process and requirements</p>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <InfoCard
              title="Eligibility Criteria"
              items={[
                "Maintain production capacity for minimum required period",
                "Achieve policy-defined performance targets",
                "Valid KYC and factory registration certificates",
                "Documented target regions where green H2 is supplied",
              ]}
              icon={<ShieldCheck className="h-5 w-5 text-brand-blue" />}
            />
            <InfoCard
              title="Disbursement Process"
              items={[
                "Milestone-based verification using oracles/IoT",
                "Automatic payouts via secure banking rails",
                "Loan-linked tranches for repayment-aligned models",
                "Quarterly statements with verified production data",
              ]}
              icon={<ListChecks className="h-5 w-5 text-brand-blue" />}
            />
            <InfoCard
              title="Compliance Requirements"
              items={[
                "Periodic submission of audited production reports",
                "Environmental clearances and emission disclosures",
                "On-site inspections (when required)",
                "Financial records and tax filings as per policy",
              ]}
              icon={<FileCheck2 className="h-5 w-5 text-brand-blue" />}
            />
            <InfoCard
              title="Support & Benefits"
              items={[
                "Dedicated helpdesk for onboarding and queries",
                "Guidance on model selection and documentation",
                "Access to learning resources and templates",
                "Incentives for meeting energy efficiency targets",
              ]}
              icon={<HelpCircle className="h-5 w-5 text-brand-blue" />}
            />
          </div>
          <div className="mt-10 flex flex-col items-center gap-3">
            <Button size="lg" className="bg-gradient-to-r from-brand-green to-brand-blue text-white" onClick={() => navigate('/subsidy-registration')}>Start Your Application</Button>
            <div className="text-xs text-muted-foreground">By applying, you agree to the program terms and data usage policies.</div>
          </div>
        </div>
      </section>

      {/* Footer note mimic */}
      <section className="border-t">
        <div className="container py-4 text-center text-xs text-muted-foreground">
          © 2025 Green Hydrogen Subsidy Platform. All rights reserved. Powered by Ministry of New and Renewable Energy, Government of India.
        </div>
      </section>
    </main>
  );
}

function UserDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div ref={ref} className="fixed right-4 top-20 z-50">
      <div className="flex items-center gap-2">
        <div className="hidden sm:block text-right">
          <div className="text-sm font-medium">Green Energy Solutions Pvt. Ltd.</div>
          <div className="text-xs text-muted-foreground">contact@greenenergy.com</div>
        </div>
        <button
          aria-label="User menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border bg-background hover:bg-accent"
        >
          <UserCircle className="h-5 w-5" />
        </button>
      </div>
      {open && (
        <div className="mt-2 w-72 rounded-xl border bg-card p-3 shadow-xl">
          <div className="flex items-center gap-3 border-b pb-3">
            <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-green to-brand-blue text-white">
              <UserCircle className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-semibold">Green Energy Solutions</div>
              <div className="text-xs text-muted-foreground">contact@greenenergy.com</div>
            </div>
          </div>

          <nav className="mt-2 text-sm">
            <MenuItem icon={<Eye className="h-4 w-4" />} label="View Application Status" onClick={() => { setOpen(false); navigate('/application-dashboard'); }} />
            <MenuItem icon={<UserRoundCog className="h-4 w-4" />} label="Update Profile" onClick={() => { setOpen(false); navigate('/company-profile'); }} />
            <MenuItem icon={<Bell className="h-4 w-4" />} label="Notifications" onClick={() => { setOpen(false); navigate('/notifications'); }} />
            <MenuItem icon={<RefreshCw className="h-4 w-4" />} label="Update Monthly Report" onClick={() => { setOpen(false); navigate('/monthly-report'); }} />
            <MenuItem icon={<BarChart3 className="h-4 w-4" />} label="Previous Reports Stats" onClick={() => { setOpen(false); navigate('/reports-stats'); }} />
            <div className="my-2 border-t" />
            <MenuItem icon={<Palette className="h-4 w-4" />} label="Change Theme" />
            <MenuItem icon={<KeyRound className="h-4 w-4" />} label="Change Password" />
            <button
              onClick={() => navigate("/login")}
              className="mt-2 flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-red-600 hover:bg-accent/60"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}

function MenuItem({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="flex w-full items-center gap-3 rounded-md px-3 py-2 hover:bg-accent/60">
      <span className="text-muted-foreground">{icon}</span>
      <span>{label}</span>
    </button>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-brand-green to-brand-blue text-white">
          {icon}
        </div>
        <div className="font-semibold">{title}</div>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}

function InfoCard({ title, items, icon }: { title: string; items: string[]; icon: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <div className="flex items-center gap-2">
        {icon}
        <div className="font-semibold">{title}</div>
      </div>
      <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
        {items.map((t) => (
          <li key={t} className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 text-brand-green" />
            <span>{t}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
