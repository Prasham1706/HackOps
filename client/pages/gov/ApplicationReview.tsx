import { Button } from "@/components/ui/button";
import { Link, useParams } from "react-router-dom";

export default function GovApplicationReview() {
  const { id = "1024" } = useParams();
  return (
    <main className="min-h-screen bg-gradient-to-b from-brand-green/10 to-transparent">
      <div className="container py-8">
        <div className="flex items-center justify-between">
          <Link to="/gov/dashboard" className="text-sm text-muted-foreground hover:text-foreground">← Back to Dashboard</Link>
          <div className="text-xs text-muted-foreground">Application ID: #{id}</div>
        </div>
        <h1 className="mt-2 text-2xl md:text-3xl font-extrabold tracking-tight">Application Review & Verification</h1>

        <div className="mt-6 grid gap-6 lg:grid-cols-[0.4fr_0.6fr]">
          {/* Left column: applicant details */}
          <section className="rounded-xl border bg-card p-5 shadow-sm">
            <div className="font-semibold">Applicant Company Details</div>
            <dl className="mt-3 space-y-3 text-sm">
              <Row t="Company Name" v="Green Energy Solutions Pvt. Ltd." />
              <Row t="Registration Proof" v={<a className='text-brand-blue underline' href='#'>View document</a>} />
              <Row t="IoT Sensor Data Feed" v={<a className='text-brand-blue underline' href='#'>https://iot.greenergy.com/feed</a>} />
              <Row t="Third-Party Certifications" v={<a className='text-brand-blue underline' href='#'>Download certificate</a>} />
              <Row t="Production Logs" v={<a className='text-brand-blue underline' href='#'>View logs</a>} />
              <Row t="Subsidy Type" v="Production-based" />
              <Row t="Amount Applied For" v="₹ 25,00,000" />
            </dl>
          </section>

          {/* Right column: review tabs */}
          <section className="rounded-xl border bg-card p-5 shadow-sm">
            <Tabs />
          </section>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button className="bg-emerald-600 text-white">Approve</Button>
          <Button variant="outline" className="border-amber-300 text-amber-700">Request Additional Information</Button>
          <Button variant="outline" className="border-red-300 text-red-600">Reject</Button>
        </div>
      </div>
    </main>
  );
}

function Row({ t, v }: { t: string; v: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[160px_1fr] items-start gap-3">
      <div className="text-xs text-muted-foreground">{t}</div>
      <div>{v}</div>
    </div>
  );
}

function Tabs() {
  return (
    <div>
      <div className="flex items-center gap-2">
        {[
          { k: "doc", l: "Document Verification" },
          { k: "tech", l: "Technical Review" },
          { k: "fin", l: "Financial Assessment" },
        ].map((t, i) => (
          <button key={t.k} className={`rounded-md px-3 py-1.5 text-sm ${i===0? 'bg-foreground text-background':'border'}`}>{t.l}</button>
        ))}
      </div>
      <div className="mt-4 space-y-4">
        <Checklist title="Required Documents" items={["Company Registration Proof","KYC Documents","Production Logs","Third-Party Certification"]} />
        <StatusRemarks />
      </div>
    </div>
  );
}

function Checklist({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-lg border p-4">
      <div className="text-sm font-medium">{title}</div>
      <div className="mt-3 grid gap-2 md:grid-cols-2">
        {items.map((it) => (
          <label key={it} className="flex items-center gap-2 text-sm">
            <input type="checkbox" className="accent-brand-blue" />
            <span>{it}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

function StatusRemarks() {
  return (
    <div className="rounded-lg border p-4">
      <div className="grid gap-3 md:grid-cols-3 items-end">
        <div>
          <label className="text-sm font-medium">Status</label>
          <select className="mt-1 w-full rounded-md border bg-background px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-brand-blue">
            <option>Pending</option>
            <option>Verified</option>
            <option>Rejected</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="text-sm font-medium">Remarks</label>
          <textarea rows={3} className="mt-1 w-full rounded-md border bg-background p-2 outline-none focus-visible:ring-2 focus-visible:ring-brand-blue" placeholder="Enter remarks" />
        </div>
      </div>
    </div>
  );
}
