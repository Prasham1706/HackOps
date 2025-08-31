import { Button } from "@/components/ui/button";
import { Bell, CheckCheck, AlertTriangle, BadgeCheck, FileText, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function Notifications() {
  const items = [
    {
      id: "n1",
      title: "Application Submitted",
      desc: "Your subsidy application was submitted successfully and is under initial review.",
      time: "Today • 2:30 PM",
      unread: true,
      icon: <BadgeCheck className="h-4 w-4" />,
    },
    {
      id: "n2",
      title: "Documents Verified",
      desc: "KYC and incorporation documents verified. Technical review scheduled.",
      time: "Today • 5:10 PM",
      unread: true,
      icon: <FileText className="h-4 w-4" />,
    },
    {
      id: "n3",
      title: "Upcoming Review",
      desc: "Your next review is expected within 15 days. Prepare production logs and IoT data feed.",
      time: "Yesterday • 11:05 AM",
      unread: false,
      icon: <AlertTriangle className="h-4 w-4" />,
    },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-brand-blue/5 to-transparent">
      <div className="container py-8 max-w-3xl">
        <div className="flex items-center justify-between gap-3">
          <Link to="/company-dashboard" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>
          <Button variant="outline" className="gap-2"><CheckCheck className="h-4 w-4" /> Mark all as read</Button>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <div className="inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-xs"><Bell className="h-4 w-4" /> Notifications</div>
        </div>
        <h1 className="mt-2 text-2xl md:text-3xl font-extrabold tracking-tight">Company Notifications</h1>
        <p className="text-sm text-muted-foreground">View updates about your applications, reviews, and system alerts.</p>

        <section className="mt-6 space-y-3">
          {items.map((n) => (
            <article key={n.id} className={`rounded-xl border bg-card p-4 shadow-sm ${n.unread ? 'ring-1 ring-brand-blue/30' : ''}`}>
              <div className="flex items-start gap-3">
                <div className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-brand-green to-brand-blue text-white">
                  {n.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {n.unread && <span className="inline-block h-2.5 w-2.5 rounded-full bg-brand-blue" aria-label="unread" />}
                    <div className="font-medium">{n.title}</div>
                    <div className="ml-auto text-xs text-muted-foreground">{n.time}</div>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{n.desc}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <Link to="/application-dashboard"><Button size="sm" variant="outline">View</Button></Link>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
