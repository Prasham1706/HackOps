import { Button } from "@/components/ui/button";
import { ArrowLeft, Pencil, FilePlus2, CalendarClock, Gauge, Factory, BadgeCheck, CheckCircle2, Clock3, AlertCircle, Download, Bell } from "lucide-react";
import { Link } from "react-router-dom";

export default function ApplicationDashboard() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-brand-green/10 to-transparent">
      <div className="container py-6 md:py-8">
        {/* Header Row */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/subsidy-registration"><Button variant="outline" className="gap-2"><Pencil className="h-4 w-4" /> Update Application</Button></Link>
            <Link to="/subsidy-registration"><Button className="gap-2 bg-foreground text-background hover:opacity-95"><FilePlus2 className="h-4 w-4" /> Submit New Application</Button></Link>
          </div>
        </div>

        <h1 className="mt-3 text-2xl md:text-3xl font-extrabold tracking-tight">Application Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">Track your green hydrogen subsidy application status and manage your account</p>

        {/* Top Stat Cards */}
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <StatCard title="Application Status" content={<StatusBadge />} />
          <StatCard title="Subsidy Amount" content={<div className="text-2xl font-semibold">₹2,50,000</div>} note="Estimated" />
          <StatCard title="Production Capacity" content={<div className="text-lg font-semibold">500 kg/day</div>} note="Green Hydrogen" icon={<Factory className="h-4 w-4 text-muted-foreground" />} />
          <StatCard title="Next Review" content={<div className="text-lg font-semibold">15 Days</div>} note="Estimated" icon={<CalendarClock className="h-4 w-4 text-muted-foreground" />} />
        </div>

        {/* Progress and Activity */}
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <section className="rounded-xl border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold">Application Progress</div>
                <p className="text-xs text-muted-foreground">Track the status of your subsidy application</p>
              </div>
              <div className="text-xs text-brand-blue">Complete</div>
            </div>
            <div className="mt-4 space-y-4">
              <Stage label="Document Verification" status="complete" value={100} />
              <Stage label="Technical Review" status="progress" value={45} />
              <Stage label="Financial Assessment" status="pending" value={0} />
              <Stage label="Final Approval" status="pending" value={0} />
            </div>
          </section>

          <section className="rounded-xl border bg-card p-5 shadow-sm">
            <div className="font-semibold">Recent Activity</div>
            <p className="text-xs text-muted-foreground">Latest updates on your application</p>
            <ul className="mt-4 space-y-3 text-sm">
              <ActivityItem color="bg-emerald-500" title="Application Submitted" time="Today at 2:30 PM" />
              <ActivityItem color="bg-sky-500" title="Documents Verified" time="Expected by tomorrow" />
              <ActivityItem color="bg-amber-500" title="Technical Review Scheduled" time="Within 3-5 business days" />
            </ul>
          </section>
        </div>

        {/* Quick Actions */}
        <div className="mt-6">
          <div className="font-semibold">Quick Actions</div>
          <div className="mt-3 grid gap-4 md:grid-cols-3">
            <ActionCard icon={<Pencil className="h-5 w-5" />} title="Update Application" desc="Modify your existing application details" to="/subsidy-registration" />
            <ActionCard icon={<Download className="h-5 w-5" />} title="Download Documents" desc="Get copies of your submitted documents" />
            <ActionCard icon={<Bell className="h-5 w-5" />} title="Notifications" desc="View application updates and alerts" />
          </div>
        </div>
      </div>
    </main>
  );
}

function StatusBadge() {
  return (
    <span className="inline-flex items-center gap-2 rounded-md bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-200">
      <BadgeCheck className="h-4 w-4" /> Under Review
    </span>
  );
}

function StatCard({ title, content, note, icon }: { title: string; content: React.ReactNode; note?: string; icon?: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div>{title}</div>
        {icon}
      </div>
      <div className="mt-2">{content}</div>
      {note && <div className="mt-1 text-xs text-muted-foreground">{note}</div>}
    </div>
  );
}

function Stage({ label, value, status }: { label: string; value: number; status: "complete" | "progress" | "pending" }) {
  const color = status === "complete" ? "bg-emerald-500" : status === "progress" ? "bg-brand-blue" : "bg-muted";
  const tag = status === "complete" ? (
    <span className="text-xs text-emerald-600">Complete</span>
  ) : status === "progress" ? (
    <span className="text-xs text-brand-blue">In Progress</span>
  ) : (
    <span className="text-xs text-muted-foreground">Pending</span>
  );
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <div>{label}</div>
        {tag}
      </div>
      <div className="mt-2 h-2 w-full rounded-full bg-muted">
        <div className={`h-2 rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function ActivityItem({ color, title, time }: { color: string; title: string; time: string }) {
  return (
    <li className="flex items-start gap-3">
      <span className={`mt-1 inline-block h-2.5 w-2.5 rounded-full ${color}`} />
      <div>
        <div>{title}</div>
        <div className="text-xs text-muted-foreground">{time}</div>
      </div>
    </li>
  );
}

function ActionCard({ icon, title, desc, to }: { icon: React.ReactNode; title: string; desc: string; to?: string }) {
  const inner = (
    <div className="rounded-xl border bg-card p-4 shadow-sm hover:bg-accent/50">
      <div className="flex items-center gap-3">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-brand-green to-brand-blue text-white">
          {icon}
        </div>
        <div>
          <div className="font-medium">{title}</div>
          <div className="text-xs text-muted-foreground">{desc}</div>
        </div>
      </div>
    </div>
  );
  if (to) return <Link to={to}>{inner}</Link>;
  return inner;
}
