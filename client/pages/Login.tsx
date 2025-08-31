import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

type Role = "company" | "government";

export default function Login() {
  const [role, setRole] = useState<Role>("company");
  const [mode, setMode] = useState<"login" | "register">("login");

  return (
    <main className="min-h-[80vh] flex items-center justify-center bg-gradient-to-b from-brand-blue/5 to-transparent py-16 px-4">
      <div className="w-full max-w-xl rounded-2xl border bg-card p-8 shadow-xl">
        <div className="flex flex-col items-center text-center">
          <img
            src="https://cdn.builder.io/api/v1/image/assets%2F346875910c484bff9701e5e5cf6b22e8%2Faf9f1d3fb0344ed792f2b5ba2c9da401?format=webp&width=240"
            alt="HackOps logo"
            className="h-14 w-auto object-contain"
          />
          <p className="mt-2 text-sm text-muted-foreground max-w-md">
            Transparent Subsidy Disbursement for the Green Hydrogen Economy.
          </p>
        </div>

        {/* Role Tabs */}
        <div className="mt-6 grid grid-cols-2 rounded-lg border p-1 bg-muted/40">
          <TabButton active={role === "company"} onClick={() => setRole("company")}>Company Portal</TabButton>
          <TabButton active={role === "government"} onClick={() => setRole("government")}>Government Portal</TabButton>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <h1 className="text-xl font-semibold">
            {mode === "login" ? "Secure Login" : "Create your account"}
          </h1>
          <button
            onClick={() => setMode(mode === "login" ? "register" : "login")}
            className="text-sm text-brand-blue hover:underline"
          >
            {mode === "login" ? "Don't have an account? Register" : "Have an account? Login"}
          </button>
        </div>

        {mode === "login" ? (
          <LoginForm role={role} />
        ) : (
          <RegisterForm onRegistered={() => setMode("login")} />
        )}
      </div>
    </main>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={
        "inline-flex h-10 w-full items-center justify-center rounded-md text-sm font-medium transition-colors " +
        (active
          ? "bg-gradient-to-r from-brand-green to-brand-blue text-white shadow"
          : "text-muted-foreground hover:bg-white/50")
      }
    >
      {children}
    </button>
  );
}

function Field({ id, label, type = "text", autoComplete }: { id: string; label: string; type?: string; autoComplete?: string }) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        autoComplete={autoComplete}
        className="mt-1 w-full rounded-md border bg-background px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
        required
      />
    </div>
  );
}

function LoginForm({ role }: { role: Role }) {
  const navigate = useNavigate();
  return (
    <form
      className="mt-6 space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (role === "government") navigate("/gov/dashboard");
        else navigate("/company-dashboard");
      }}
    >
      <div className="text-xs text-muted-foreground">Signing in to: <span className="font-medium text-foreground capitalize">{role} portal</span></div>
      <Field id="email" label="Email Address" type="email" autoComplete="email" />
      <Field id="password" label="Password" type="password" autoComplete="current-password" />
      <Button type="submit" className="w-full bg-gradient-to-r from-brand-green to-brand-blue text-white">Secure Login</Button>
      <div className="flex items-center justify-between text-xs">
        <a href="#" className="text-brand-blue hover:underline">Forgot Password?</a>
        <a href="#" className="text-muted-foreground hover:text-foreground">Need help?</a>
      </div>
    </form>
  );
}

function RegisterForm({ onRegistered }: { onRegistered: () => void }) {
  return (
    <form
      className="mt-6 space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        onRegistered();
      }}
    >
      <Field id="name" label="Full Name" autoComplete="name" />
      <Field id="email" label="Email Address" type="email" autoComplete="email" />
      <Field id="password" label="Password" type="password" autoComplete="new-password" />
      <Button type="submit" className="w-full bg-gradient-to-r from-brand-green to-brand-blue text-white">Create account</Button>
    </form>
  );
}
