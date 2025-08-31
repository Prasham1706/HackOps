import { Button } from "@/components/ui/button";
import { ArrowRight, Cog, ShieldCheck, PlugZap, Radar, LayoutDashboard, Scale, CheckCircle2 } from "lucide-react";

export default function Index() {
  return (
    <main id="home" className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img
            src="https://images.pexels.com/photos/14824352/pexels-photo-14824352.jpeg?auto=compress&cs=tinysrgb&w=1600"
            alt="A cinematic, photorealistic image of a futuristic green hydrogen production facility at dusk with holographic blockchain overlay."
            className="h-[70vh] w-full object-cover object-center md:h-[80vh]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/20 to-background" />
          <div className="pointer-events-none absolute inset-0 opacity-60 mix-blend-screen">
            <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="g1" x1="0" x2="1" y1="0" y2="1">
                  <stop stopColor="hsl(var(--brand-blue))" stopOpacity="0.7" offset="0%" />
                  <stop stopColor="hsl(var(--brand-green))" stopOpacity="0.7" offset="100%" />
                </linearGradient>
              </defs>
              <g stroke="url(#g1)" strokeWidth="0.8">
                {Array.from({ length: 28 }).map((_, r) => (
                  <line key={`r-${r}`} x1="0" y1={r * 28} x2="2000" y2={r * 28} />
                ))}
                {Array.from({ length: 28 }).map((_, c) => (
                  <line key={`c-${c}`} x1={c * 72} y1="0" x2={c * 72} y2="2000" />
                ))}
              </g>
            </svg>
          </div>
        </div>
        <div className="container relative z-10 flex min-h-[60vh] md:min-h-[70vh] flex-col items-start justify-center py-20">
          <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight md:text-6xl bg-gradient-to-r from-brand-green to-brand-blue bg-clip-text text-transparent">
            Automating Green Hydrogen Subsidies with Blockchain
          </h1>
          <p className="mt-5 max-w-2xl text-base md:text-lg text-muted-foreground">
            A transparent, secure, and efficient platform for disbursing government subsidies, accelerating the future of clean energy.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a href="#our-solution"><Button size="lg" className="bg-gradient-to-r from-brand-green to-brand-blue text-white shadow-lg shadow-brand-blue/20">Learn How It Works</Button></a>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="container py-20" id="problem">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Inefficiencies are Slowing Down the Green Revolution</h2>
        <p className="mt-4 max-w-3xl text-muted-foreground">The transition to green hydrogen is critical, but the subsidy disbursement process is holding it back.</p>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <div className="text-sm font-semibold text-brand-blue">Manual & Opaque Processes</div>
            <p className="mt-2 text-sm text-muted-foreground">Current systems are vulnerable to significant delays, potential fraud, and misuse of funds.</p>
          </div>
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <div className="text-sm font-semibold text-brand-blue">Lack of Automation</div>
            <p className="mt-2 text-sm text-muted-foreground">Without automation, verifying milestones is slow, hindering rapid adoption of green hydrogen technologies.</p>
          </div>
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <div className="text-sm font-semibold text-brand-blue">Verification Gaps</div>
            <p className="mt-2 text-sm text-muted-foreground">Government bodies need a reliable way to ensure subsidies are released only when verified milestones are met.</p>
          </div>
        </div>
      </section>

      {/* Our Solution */}
      <section className="bg-gradient-to-b from-brand-blue/5 to-transparent" id="our-solution">
        <div className="container py-20">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">A Dual-Model Approach for Secure & Transparent Disbursement</h2>
          <p className="mt-4 max-w-3xl text-muted-foreground">We leverage blockchain-based smart contracts to automate and secure every transaction. Our platform provides a common digital interface for the government, financial institutions, and energy companies.</p>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border bg-card p-8 shadow-[0_0_40px_-20px_rgba(56,189,248,0.6)]">
              <h3 className="text-xl font-semibold">Loan-Based Subsidy</h3>
              <p className="mt-2 text-sm text-muted-foreground">For companies opting for loans, banks act as a trusted mediator to verify the business. The government subsidy is directly linked to loan repayment and awarded in parts based on verified hydrogen production, minimizing misuse.</p>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2"><CheckCircle2 className="text-brand-green" /> Bank-mediated verification</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="text-brand-green" /> Linked to loan repayment</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="text-brand-green" /> Tranche-based subsidy awards</li>
              </ul>
            </div>
            <div className="rounded-2xl border bg-card p-8 shadow-[0_0_40px_-20px_rgba(16,185,129,0.6)]">
              <h3 className="text-xl font-semibold">Production-Based Subsidy</h3>
              <p className="mt-2 text-sm text-muted-foreground">For companies not taking loans, subsidies are directly linked to measurable milestones. IoT sensors and trusted data providers feed verified production data into smart contracts, triggering automated and transparent subsidy payments.</p>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2"><CheckCircle2 className="text-brand-green" /> IoT and oracle-driven validation</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="text-brand-green" /> Smart contract automation</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="text-brand-green" /> Transparent, auditable payouts</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="container py-20" id="features">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Built for Trust, Efficiency, and Compliance</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <FeatureCard icon={<Cog />} title="Smart Contracts" desc="Automatically verifies milestones like production volume and project completion to trigger payments." />
          <FeatureCard icon={<PlugZap />} title="Seamless Banking Integration" desc="Uses secure APIs to connect with legacy government and financial platforms for smooth payments (UPI/NEFT/RTGS)." />
          <FeatureCard icon={<ShieldCheck />} title="Immutable Audit Trail" desc="Creates unchangeable transaction records on the blockchain for ultimate transparency and compliance." />
          <FeatureCard icon={<Radar />} title="Data-Driven Validation" desc="Employs IoT sensor data and third-party oracles to ensure all production claims are authentic." />
          <FeatureCard icon={<LayoutDashboard />} title="Secure Interface" desc="A user-friendly dashboard for companies, government bodies, and auditors to track progress and transactions." />
          <FeatureCard icon={<Scale />} title="Proportional Subsidies" desc="Periodic evaluations of performance ensure that subsidy amounts are fair and proportional to a company's audited progress." />
        </div>
      </section>

      {/* Impact */}
      <section className="bg-gradient-to-b from-transparent to-brand-green/5" id="impact">
        <div className="container py-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Accelerating the Shift to a Cleaner Tomorrow</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              { t: "Faster Subsidy Release", d: "Automation eliminates bureaucratic delays, getting funds to innovators faster." },
              { t: "Prevents Fraud", d: "Robust verification through banks and IoT data drastically reduces the risk of false claims." },
              { t: "Drives Innovation", d: "Linking subsidies to cost-reduction targets incentivizes vital research and development in green hydrogen." },
              { t: "Boosts Transparency", d: "Immutable records build trust between the government and private sector companies." },
              { t: "Global Potential", d: "This model can be adapted to revolutionize subsidy distribution in other clean energy sectors worldwide." },
            ].map((item) => (
              <div key={item.t} className="rounded-xl border bg-card p-6 shadow-sm">
                <div className="font-semibold">{item.t}</div>
                <p className="mt-2 text-sm text-muted-foreground">{item.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Us */}
      <section className="container pt-0 pb-16" id="about-us">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Meet Team HackOps</h2>
        <p className="mt-4 max-w-3xl text-muted-foreground">We are a team of innovators passionate about leveraging technology to solve critical environmental challenges. Our team members, Prasham Doshi, Prachi Mishra, Darshil Mendapara, and Nidhi Pujara, developed this solution for the HackOut '25 Ideation Round.</p>
        <div className="mt-8 flex flex-wrap gap-3 text-sm">
          {['Prasham Doshi','Prachi Mishra','Darshil Mendapara','Nidhi Pujara'].map((name) => (
            <span key={name} className="rounded-full border px-4 py-2 bg-secondary/40">{name}</span>
          ))}
        </div>
      </section>


      {/* Privacy placeholder to avoid dead link */}
      <section id="privacy" className="container py-14">
        <div className="rounded-xl border bg-card p-6 text-sm text-muted-foreground">
          This is a placeholder for the Privacy Policy.
        </div>
      </section>
    </main>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm">
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
