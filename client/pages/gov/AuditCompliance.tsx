import { Button } from "@/components/ui/button";

export default function GovAuditCompliance() {
  function exportCSV() {
    const rows = [
      ["Timestamp","Officer","Action","Application ID","Details","Txn ID"],
      [new Date().toISOString(),"J.Singh","Approved","1024","All checks passed","TXN-2342"],
      [new Date().toISOString(),"A.Khan","Disbursed","1024","Tranche-1 released","PAY-5567"],
    ];
    const csv = rows.map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'audit-trail.csv'; a.click(); URL.revokeObjectURL(url);
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-brand-green/10 to-transparent">
      <div className="container py-8">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Audit & Compliance</h1>

        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <select className="rounded-md border bg-background px-3 py-2 text-sm"><option>All Companies</option></select>
          <div>
            <label className="text-xs text-muted-foreground">Date Range</label>
            <input type="date" className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm" />
          </div>
          <select className="rounded-md border bg-background px-3 py-2 text-sm"><option>All Subsidy Types</option><option>Loan-based</option><option>Production-based</option></select>
          <input placeholder="Search keyword" className="rounded-md border bg-background px-3 py-2 text-sm" />
        </div>

        <div className="mt-4 flex items-center gap-2">
          <Button variant="outline" onClick={exportCSV}>Export as CSV</Button>
          <Button onClick={()=>window.print()}>Export as PDF</Button>
        </div>

        <div className="mt-4 overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <Th>Timestamp</Th>
                <Th>Officer</Th>
                <Th>Action</Th>
                <Th>Application ID</Th>
                <Th>Details / Remarks</Th>
                <Th>Disbursement Txn ID</Th>
              </tr>
            </thead>
            <tbody>
              {[1,2,3,4,5,6,7,8,9,10].map((i)=> (
                <tr key={i} className="border-t">
                  <Td>{new Date().toLocaleString()}</Td>
                  <Td>Officer #{i}</Td>
                  <Td>{i%3===0?'Submitted':i%3===1?'Approved':'Disbursed'}</Td>
                  <Td>10{i}</Td>
                  <Td>Auto-generated entry for demonstration</Td>
                  <Td>{i%3===2?`PAY-55${i}`:''}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}

function Th({ children }: { children: React.ReactNode }) { return <th className="px-4 py-3 text-left font-medium">{children}</th>; }
function Td({ children }: { children: React.ReactNode }) { return <td className="px-4 py-3">{children}</td>; }
