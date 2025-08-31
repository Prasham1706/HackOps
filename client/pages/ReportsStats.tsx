import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BarChart3, TrendingUp, Coins, Leaf } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

// Example time-series derived from submitted monthly reports
const data = months.map((m, i) => ({
  month: m,
  productionKg: [420, 480, 520, 560, 600, 680, 720, 760, 820, 880, 940, 1000][i],
  costPerKg: [360, 352, 345, 338, 332, 326, 320, 315, 309, 304, 300, 296][i],
  subsidyPct: [10, 10, 12, 12, 14, 15, 16, 16, 18, 18, 20, 22][i],
  emissionKg: [0.70, 0.68, 0.66, 0.64, 0.62, 0.60, 0.58, 0.56, 0.54, 0.52, 0.50, 0.48][i],
}));

const pieData = [
  { name: "Renewable Energy Share", value: 72 },
  { name: "Efficiency Improvements", value: 18 },
  { name: "Waste Heat Recovery", value: 6 },
  { name: "Other Measures", value: 4 },
];
const pieColors = ["#10b981", "#38bdf8", "#f59e0b", "#64748b"]; // green, blue, amber, slate

export default function ReportsStats() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-brand-blue/5 to-transparent">
      <div className="container py-8">
        <div className="flex items-center justify-between">
          <Link to="/company-dashboard" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/monthly-report"><Button variant="outline">Add Monthly Report</Button></Link>
          </div>
        </div>

        <h1 className="mt-3 text-2xl md:text-3xl font-extrabold tracking-tight">Reports Statistics</h1>
        <p className="text-sm text-muted-foreground">Insights generated from submitted monthly reports: production growth, cost trends, subsidy progression, and ecosystem contributions.</p>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {/* Production Growth */}
          <section className="rounded-xl border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-2 font-semibold"><TrendingUp className="h-5 w-5 text-brand-green" /> Growth of H₂ Production (kg)</div>
            <div className="mt-3 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ left: 8, right: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="productionKg" name="Production (kg)" stroke="#10b981" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* Cost Reduction */}
          <section className="rounded-xl border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-2 font-semibold"><Coins className="h-5 w-5 text-brand-blue" /> Reduction in Cost of H₂ (₹/kg)</div>
            <div className="mt-3 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ left: 8, right: 8 }}>
                  <defs>
                    <linearGradient id="gradCost" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="costPerKg" name="Cost (₹/kg)" stroke="#38bdf8" fillOpacity={1} fill="url(#gradCost)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* Subsidy Percentage */}
          <section className="rounded-xl border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-2 font-semibold"><BarChart3 className="h-5 w-5 text-brand-green" /> Subsidy Percentage Progress</div>
            <div className="mt-3 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="subsidyPct" name="Subsidy (%)" fill="#10b981" radius={[6,6,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* Ecosystem Contribution */}
          <section className="rounded-xl border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-2 font-semibold"><Leaf className="h-5 w-5 text-brand-green" /> Contribution to Green Hydrogen Ecosystem</div>
            <div className="mt-3 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip />
                  <Legend />
                  <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={4} label>
                    {pieData.map((_, idx) => (
                      <Cell key={`c-${idx}`} fill={pieColors[idx % pieColors.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 text-xs text-muted-foreground">Emission intensity trend (kgCO₂e/kgH₂) improves from {data[0].emissionKg} to {data[data.length-1].emissionKg} across the year.</div>
          </section>
        </div>
      </div>
    </main>
  );
}
