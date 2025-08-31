import { Link } from "react-router-dom";

export default function PublicDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container py-12">
        <div className="rounded-2xl bg-white p-8 shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-extrabold">Subsidies for Green Hydrogen Plants</h1>
              <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
                A concise explainer of incentives, eligibility, and how governments
                design and administer support for green hydrogen—covering capital
                grants, production incentives, tax credits, and contract mechanisms.
              </p>
            </div>
            <div className="ml-4">
              <Link to="/" className="text-sm text-brand-blue hover:underline">
                Back to Home
              </Link>
            </div>
          </div>

          <section className="mt-8">
            <h2 className="text-xl font-semibold">Why green hydrogen?</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Green hydrogen is produced using renewable electricity and emits
              little-to-no CO2 at point of production. Governments fund early
              deployment to reduce costs and accelerate decarbonisation of hard-to-electrify
              sectors (fertilisers, refining, shipping, and heavy transport).
            </p>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-lg border p-4 bg-slate-50">
                <h3 className="font-medium">Cost</h3>
                <p className="mt-1 text-sm text-muted-foreground">Support to reduce capital intensity and lower offtake prices.</p>
              </div>
              <div className="rounded-lg border p-4 bg-slate-50">
                <h3 className="font-medium">Scale</h3>
                <p className="mt-1 text-sm text-muted-foreground">Grants and pilot programmes that enable projects to scale.</p>
              </div>
              <div className="rounded-lg border p-4 bg-slate-50">
                <h3 className="font-medium">Security</h3>
                <p className="mt-1 text-sm text-muted-foreground">Mechanisms to increase bankability and attract private capital.</p>
              </div>
            </div>
          </section>

          <section className="mt-8">
            <h2 className="text-xl font-semibold">Common subsidy mechanisms</h2>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-lg border p-4">
                <div className="font-semibold">Capital Grants</div>
                <div className="text-sm text-muted-foreground mt-1">One-time contributions towards electrolyser and connection costs.</div>
              </div>
              <div className="rounded-lg border p-4">
                <div className="font-semibold">Production Incentives</div>
                <div className="text-sm text-muted-foreground mt-1">Per-kilogram support to lower operating costs and de-risk offtake.</div>
              </div>
              <div className="rounded-lg border p-4">
                <div className="font-semibold">Contracts for Difference</div>
                <div className="text-sm text-muted-foreground mt-1">Price guarantees that bridge the gap between market and target prices.</div>
              </div>
            </div>
          </section>

          <section className="mt-8">
            <h2 className="text-xl font-semibold">How government support works</h2>
            <ol className="mt-4 space-y-3 list-decimal list-inside text-sm text-muted-foreground">
              <li>
                Policy & budget: Authorities set objectives, allocate funds and define eligible technologies and criteria.
              </li>
              <li>
                Call for proposals: Agencies invite applications and publish selection criteria and timelines.
              </li>
              <li>
                Evaluation & selection: Projects are evaluated on technical merit, emissions, job creation and readiness.
              </li>
              <li>
                Award & contracting: Selected projects receive grants, contracts, or guarantees and enter monitoring agreements.
              </li>
            </ol>
          </section>

          <section className="mt-8">
            <h2 className="text-xl font-semibold">Representative programmes</h2>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-lg border p-4 bg-slate-50">
                <div className="font-medium">United States</div>
                <div className="text-sm text-muted-foreground mt-1">Tax credits and production support to encourage domestic manufacturing.</div>
              </div>
              <div className="rounded-lg border p-4 bg-slate-50">
                <div className="font-medium">European Union</div>
                <div className="text-sm text-muted-foreground mt-1">Auctions and contracts-for-difference to bridge revenue gaps.</div>
              </div>
              <div className="rounded-lg border p-4 bg-slate-50">
                <div className="font-medium">India</div>
                <div className="text-sm text-muted-foreground mt-1">Targeted manufacturing and production-linked incentives.</div>
              </div>
            </div>
          </section>

          <section className="mt-8 flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Further reading & resources</h3>
              <div className="mt-2 text-sm text-muted-foreground">Links to agency guides, certification schemes and technical standards.</div>
            </div>
            <div>
              <a
                href="#"
                className="inline-block rounded-md bg-brand-green px-4 py-2 text-white hover:opacity-95"
              >
                Download policy brief (PDF)
              </a>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
