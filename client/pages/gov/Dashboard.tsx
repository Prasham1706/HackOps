import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Bell, FileText, CheckCircle2, Clock, IndianRupee, Users, AlertCircle, BarChart3, ListChecks } from "lucide-react";
import { Link } from "react-router-dom";

function SummaryCard({ icon, title, value }: { icon: React.ReactNode; title: string; value: string }) {
  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div>{title}</div>
        <div className="text-muted-foreground">{icon}</div>
      </div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
    </div>
  );
}

function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const onDoc = (e: MouseEvent) => { if (!ref.current) return; if (!ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);
  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen((v) => !v)} aria-label="Notifications" className="relative inline-flex h-10 w-10 items-center justify-center rounded-md border">
        <Bell className="h-5 w-5" />
        <span className="absolute right-1 top-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">3</span>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 rounded-xl border bg-card p-3 shadow-xl">
          <div className="text-sm font-semibold">Alerts</div>
          <ul className="mt-2 space-y-2 text-sm">
            <li className="flex items-start gap-2"><AlertCircle className="mt-0.5 h-4 w-4 text-amber-500" /> New application submitted by Green Energy Solutions</li>
            <li className="flex items-start gap-2"><ListChecks className="mt-0.5 h-4 w-4 text-brand-blue" /> 5 applications pending technical review</li>
            <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" /> Disbursement batch #220 processed</li>
          </ul>
        </div>
      )}
    </div>
  );
}

export default function GovDashboard() {
  const activities = Array.from({ length: 12 }).map((_, i) => ({
    id: i,
    text: i % 3 === 0 ? `Company 'HydroNext' submitted a new application` : i % 3 === 1 ? `Application #10${i} approved by J. Singh` : `Disbursement tranche executed for #10${i}`,
    time: `${i + 3} mins ago`,
  }));
  return (
    <main className="min-h-screen bg-gradient-to-b from-brand-blue/5 to-transparent">
      <div className="container py-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Government Dashboard</h1>
          <div className="flex items-center gap-2">
            <NotificationBell />
          </div>
        </div>
        <p className="text-sm text-muted-foreground">Overview of subsidies and platform operations</p>

        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <SummaryCard icon={<FileText className='h-4 w-4'/>} title="Applications Received" value="1,248" />
          <SummaryCard icon={<Clock className='h-4 w-4'/>} title="Under Review" value="312" />
          <SummaryCard icon={<IndianRupee className='h-4 w-4'/>} title="Amount Disbursed" value="₹ 82.4 Cr" />
          <SummaryCard icon={<IndianRupee className='h-4 w-4'/>} title="Pending Amount" value="₹ 21.9 Cr" />
          <SummaryCard icon={<Users className='h-4 w-4'/>} title="Companies Registered" value="487" />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <section className="rounded-xl border bg-card p-5 shadow-sm lg:col-span-2">
            <div className="font-semibold">Recent Activity</div>
            <div className="mt-3 max-h-80 overflow-auto divide-y">
              {activities.map((a) => (
                <div key={a.id} className="py-3 text-sm flex items-center justify-between">
                  <div>{a.text}</div>
                  <div className="text-xs text-muted-foreground">{a.time}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-xl border bg-card p-5 shadow-sm">
            <div className="font-semibold">Quick Actions</div>
            <div className="mt-4 space-y-3">
              <Link to="/gov/review/1024"><Button className="w-full">View All Applications</Button></Link>
              <Link to="/gov/disbursements"><Button className="w-full" variant="outline">Review Pending Subsidies</Button></Link>
              <Link to="/gov/reports"><Button className="w-full" variant="outline">Generate Reports</Button></Link>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
