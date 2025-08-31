import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export default function GovDisbursements() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-brand-blue/5 to-transparent">
      <div className="container py-8">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Subsidy Disbursement Management</h1>

        <div className="mt-4 grid gap-3 md:grid-cols-[200px_1fr] items-center">
          <select className="rounded-md border bg-background px-3 py-2 text-sm">
            <option>Pending Disbursement</option>
            <option>Disbursed</option>
          </select>
          <div className="relative">
            <input placeholder="Search Company Name" className="w-full rounded-md border bg-background pl-9 pr-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-brand-blue" />
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>

        <div className="mt-4 overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <Th>Company Name</Th>
                <Th>Amount Approved</Th>
                <Th>Disbursement Stage</Th>
                <Th>Bank/IFSC</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {[1,2,3,4,5].map((i)=> (
                <tr key={i} className="border-t">
                  <Td>Green Energy Solutions</Td>
                  <Td>₹ 25,00,000</Td>
                  <Td>Part {i%2?1:2}</Td>
                  <Td>XXXX2345 / HDFC0001234</Td>
                  <Td>{i%2? 'Pending':'Ready'}</Td>
                  <Td>
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" className="bg-emerald-600 text-white">Approve Disbursement</Button>
                      <Button size="sm" variant="outline">Hold for Review</Button>
                      <Button size="sm" variant="outline" className="text-red-600">Reject</Button>
                    </div>
                  </Td>
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
