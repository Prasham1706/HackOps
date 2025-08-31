import { Banknote, Clock, DollarSign, Download, Users } from "lucide-react";

const currency = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

export default function GovernmentFunds() {
  // Example / placeholder numbers; replace with real data fetch later
  const data = {
    applications: 1284,
    companies: 312,
    totalDisbursed: 42_500_000,
    pending: 3_750_000,
  };

  const items = [
    {
      id: "applications",
      title: "Total Number of Subsidy Applications Received",
      value: data.applications,
      icon: <Users className="h-7 w-7 text-brand-blue" />,
    },
    {
      id: "companies",
      title: "Number of Companies Subsidised",
      value: data.companies,
      icon: <Banknote className="h-7 w-7 text-brand-green" />,
    },
    {
      id: "disbursed",
      title: "Total Subsidy Amount Disbursed",
      value: currency(data.totalDisbursed),
      icon: <DollarSign className="h-7 w-7 text-amber-500" />,
    },
    {
      id: "pending",
      title: "Pending Subsidy Amount",
      value: currency(data.pending),
      icon: <Clock className="h-7 w-7 text-muted-foreground" />,
    },
  ];

  function downloadCSV() {
    const rows = [
      ["Metric", "Value"],
      [items[0].title, String(items[0].value)],
      [items[1].title, String(items[1].value)],
      [items[2].title, String(items[2].value)],
      [items[3].title, String(items[3].value)],
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "government_funds_report.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  // Tiny inline bar chart for quick visual
  const max = Math.max(data.applications, data.companies, data.totalDisbursed / 10000, data.pending / 10000);

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="container">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-extrabold">Statistics of Government Funds</h1>
            <p className="text-sm text-muted-foreground mt-1">Overview of subsidy applications, disbursements and pending amounts.</p>
          </div>
          <div>
            <button
              onClick={downloadCSV}
              className="inline-flex items-center gap-2 rounded-md bg-brand-green px-3 py-2 text-sm text-white hover:opacity-95"
            >
              <Download className="h-4 w-4" /> Export CSV
            </button>
          </div>
        </div>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {items.map((it) => (
            <div key={it.id} className="rounded-xl border bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-md bg-slate-100 p-2">{it.icon}</div>
                  <div>
                    <div className="text-xs text-muted-foreground">{it.title}</div>
                    <div className="mt-2 text-2xl font-bold">{it.value}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </section>

        <section className="mt-8 rounded-xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Reports</h2>
          <p className="mt-2 text-sm text-muted-foreground">Simple visualisation and breakdowns. Click "Export CSV" to download the numbers.</p>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-lg border p-4">
              <div className="font-medium">Bar chart (relative)</div>
              <div className="mt-3 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-40 text-sm">Applications</div>
                  <div className="flex-1 bg-slate-100 h-4 rounded overflow-hidden">
                    <div style={{ width: `${(data.applications / max) * 100}%` }} className="h-4 bg-brand-blue" />
                  </div>
                  <div className="w-20 text-right text-sm">{data.applications}</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-40 text-sm">Companies</div>
                  <div className="flex-1 bg-slate-100 h-4 rounded overflow-hidden">
                    <div style={{ width: `${(data.companies / max) * 100}%` }} className="h-4 bg-brand-green" />
                  </div>
                  <div className="w-20 text-right text-sm">{data.companies}</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-40 text-sm">Total disbursed</div>
                  <div className="flex-1 bg-slate-100 h-4 rounded overflow-hidden">
                    <div style={{ width: `${((data.totalDisbursed / 10000) / max) * 100}%` }} className="h-4 bg-amber-500" />
                  </div>
                  <div className="w-32 text-right text-sm">{currency(data.totalDisbursed)}</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-40 text-sm">Pending</div>
                  <div className="flex-1 bg-slate-100 h-4 rounded overflow-hidden">
                    <div style={{ width: `${((data.pending / 10000) / max) * 100}%` }} className="h-4 bg-gray-500" />
                  </div>
                  <div className="w-32 text-right text-sm">{currency(data.pending)}</div>
                </div>
              </div>
            </div>

            <div className="rounded-lg border p-4">
              <div className="font-medium">Quick breakdown</div>
              <table className="mt-3 w-full text-sm">
                <tbody>
                  <tr className="border-t">
                    <td className="py-2">Applications / Company (avg)</td>
                    <td className="py-2 text-right">{(data.applications / data.companies).toFixed(1)}</td>
                  </tr>
                  <tr className="border-t">
                    <td className="py-2">Avg subsidy per company</td>
                    <td className="py-2 text-right">{currency(Math.round(data.totalDisbursed / data.companies))}</td>
                  </tr>
                  <tr className="border-t">
                    <td className="py-2">% pending</td>
                    <td className="py-2 text-right">{((data.pending / data.totalDisbursed) * 100).toFixed(1)}%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
