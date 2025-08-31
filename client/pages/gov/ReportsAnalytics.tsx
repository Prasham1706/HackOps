import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, BarChart, Bar, PieChart, Pie, Cell } from "recharts";

const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const data = months.map((m,i)=>({ month: m, disbursed: [2,4,5,6,7,8,10,12,13,14,16,18][i], production: [12,14,15,16,17,18,19,20,22,23,24,26][i] }));
const typeShare = [{ name: 'Loan-based', value: 54 }, { name: 'Production-based', value: 46 }];
const colors = ['#38bdf8', '#10b981'];
const topCompanies = [
  { name: 'Green Energy Solutions', production: 1240, reduction: 22 },
  { name: 'HydroNext Labs', production: 1090, reduction: 18 },
  { name: 'EcoVolt H2', production: 980, reduction: 15 },
];

export default function GovReportsAnalytics() {
  const [range, setRange] = useState({ from: '2025-01-01', to: '2025-12-31' });
  return (
    <main className="min-h-screen bg-gradient-to-b from-brand-blue/5 to-transparent">
      <div className="container py-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Reports & Analytics</h1>
          <Button onClick={()=>window.print()}>Export Reports</Button>
        </div>

        <div className="mt-4 flex flex-wrap items-end gap-3 text-sm">
          <div>
            <label className="text-xs text-muted-foreground">From</label>
            <input type="date" value={range.from} onChange={(e)=>setRange(r=>({...r,from:e.target.value}))} className="mt-1 rounded-md border bg-background px-3 py-2" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">To</label>
            <input type="date" value={range.to} onChange={(e)=>setRange(r=>({...r,to:e.target.value}))} className="mt-1 rounded-md border bg-background px-3 py-2" />
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <section className="rounded-xl border bg-card p-5 shadow-sm">
            <div className="font-semibold">Subsidy Disbursement Trends (Cr)</div>
            <div className="mt-3 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="disbursed" name="Disbursed" stroke="#38bdf8" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="rounded-xl border bg-card p-5 shadow-sm">
            <div className="font-semibold">Production vs Subsidy Analysis</div>
            <div className="mt-3 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="production" name="Production (x100kg)" fill="#10b981" />
                  <Bar dataKey="disbursed" name="Disbursed (Cr)" fill="#38bdf8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="rounded-xl border bg-card p-5 shadow-sm">
            <div className="font-semibold">Subsidy Type Share</div>
            <div className="mt-3 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={typeShare} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} label>
                    {typeShare.map((_,i)=> <Cell key={i} fill={colors[i]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="rounded-xl border bg-card p-5 shadow-sm">
            <div className="font-semibold">Top Performing Companies</div>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr><th className="px-4 py-2 text-left">Company</th><th className="px-4 py-2 text-left">Production (kg)</th><th className="px-4 py-2 text-left">Cost Reduction (%)</th></tr>
                </thead>
                <tbody>
                  {topCompanies.map(c=> (
                    <tr key={c.name} className="border-t"><td className="px-4 py-2">{c.name}</td><td className="px-4 py-2">{c.production}</td><td className="px-4 py-2">{c.reduction}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
