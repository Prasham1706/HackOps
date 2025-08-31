import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function GovAdminSettings() {
  const [tab, setTab] = useState<'officers'|'security'|'apis'>('officers');
  const [twoFA, setTwoFA] = useState(true);
  const [officers, setOfficers] = useState([
    { id: 1, name: 'J. Singh', email: 'jsingh@gov.in', role: 'Reviewer' },
    { id: 2, name: 'A. Khan', email: 'akhan@gov.in', role: 'Disbursement Officer' },
  ]);
  const [showAdd, setShowAdd] = useState(false);

  function addOfficer(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setOfficers((arr) => arr.concat({
      id: Date.now(),
      name: String(fd.get('name')||''),
      email: String(fd.get('email')||''),
      role: String(fd.get('role')||'Reviewer'),
    }));
    setShowAdd(false);
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-brand-green/10 to-transparent">
      <div className="container py-8">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Admin & Settings</h1>

        <div className="mt-4 flex flex-wrap gap-2">
          <button onClick={()=>setTab('officers')} className={`rounded-md px-3 py-1.5 text-sm ${tab==='officers'?'bg-foreground text-background':'border'}`}>Manage Officers</button>
          <button onClick={()=>setTab('security')} className={`rounded-md px-3 py-1.5 text-sm ${tab==='security'?'bg-foreground text-background':'border'}`}>Security</button>
          <button onClick={()=>setTab('apis')} className={`rounded-md px-3 py-1.5 text-sm ${tab==='apis'?'bg-foreground text-background':'border'}`}>API Integrations</button>
        </div>

        {tab === 'officers' && (
          <section className="mt-4 rounded-xl border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="font-semibold">Government Officers</div>
              <Button onClick={()=>setShowAdd(true)}>Add New Officer</Button>
            </div>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50"><tr><th className="px-4 py-2 text-left">Name</th><th className="px-4 py-2 text-left">Email</th><th className="px-4 py-2 text-left">Role</th><th className="px-4 py-2 text-left">Actions</th></tr></thead>
                <tbody>
                  {officers.map(o=> (
                    <tr key={o.id} className="border-t">
                      <td className="px-4 py-2">{o.name}</td>
                      <td className="px-4 py-2">{o.email}</td>
                      <td className="px-4 py-2">{o.role}</td>
                      <td className="px-4 py-2">
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">Edit</Button>
                          <Button size="sm" variant="outline" className="text-red-600" onClick={()=>setOfficers(officers.filter(x=>x.id!==o.id))}>Delete</Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {showAdd && (
              <form onSubmit={addOfficer} className="mt-4 grid gap-3 md:grid-cols-4 rounded-lg border p-4">
                <input name="name" placeholder="Full Name" className="rounded-md border bg-background px-3 py-2 text-sm" required />
                <input name="email" type="email" placeholder="Email" className="rounded-md border bg-background px-3 py-2 text-sm" required />
                <select name="role" className="rounded-md border bg-background px-3 py-2 text-sm">
                  <option>Reviewer</option>
                  <option>Auditor</option>
                  <option>Disbursement Officer</option>
                </select>
                <Button type="submit">Create</Button>
              </form>
            )}
          </section>
        )}

        {tab === 'security' && (
          <section className="mt-4 rounded-xl border bg-card p-5 shadow-sm">
            <div className="font-semibold">Security Settings</div>
            <div className="mt-3 flex items-center gap-2 text-sm">
              <input id="twofa" type="checkbox" className="accent-brand-blue" checked={twoFA} onChange={(e)=>setTwoFA(e.target.checked)} />
              <label htmlFor="twofa">Enable Two-Factor Authentication for all users</label>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <input placeholder="Current Password" type="password" className="rounded-md border bg-background px-3 py-2 text-sm" />
              <input placeholder="New Password" type="password" className="rounded-md border bg-background px-3 py-2 text-sm" />
              <input placeholder="Confirm New Password" type="password" className="rounded-md border bg-background px-3 py-2 text-sm" />
            </div>
            <Button className="mt-3">Change Password</Button>
          </section>
        )}

        {tab === 'apis' && (
          <section className="mt-4 rounded-xl border bg-card p-5 shadow-sm">
            <div className="font-semibold">API Integrations</div>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {[{n:'Banking APIs',s:'Connected'},{n:'IoT Oracles',s:'Disconnected'}].map((i)=> (
                <div key={i.n} className="rounded-lg border p-4 text-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{i.n}</div>
                      <div className="text-xs text-muted-foreground">Status: {i.s}</div>
                    </div>
                    <Button variant="outline">Configure</Button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
