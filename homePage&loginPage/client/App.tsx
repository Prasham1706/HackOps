import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Search, Menu as MenuIcon } from "lucide-react";

const queryClient = new QueryClient();

function Navbar() {
  const [open, setOpen] = useState(false);
  const [featuresOpen, setFeaturesOpen] = useState(false);
  const navItems = [
    { href: "#home", label: "Home" },
    { href: "#our-solution", label: "Our Solution" },
    { href: "#features", label: "Features" },
    { href: "#impact", label: "Impact" },
    { href: "#about-us", label: "About Us" },
  ];
  return (
    <>
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container grid h-16 grid-cols-[auto_1fr_auto_auto_auto] items-center gap-5">
        <div className="md:hidden flex items-center gap-2">
          <button aria-label="Features" onClick={() => setFeaturesOpen((v) => !v)} className="inline-flex h-10 w-10 items-center justify-center rounded-md border">
            <MenuIcon className="h-5 w-5" />
          </button>
          <button aria-label="Toggle menu" onClick={() => setOpen((v) => !v)} className="inline-flex h-10 w-10 items-center justify-center rounded-md border">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" x2="21" y1="6" y2="6"/><line x1="3" x2="21" y1="12" y2="12"/><line x1="3" x2="21" y1="18" y2="18"/></svg>
          </button>
        </div>
        <div className="hidden md:block">
          <Button variant="outline" size="icon" aria-label="Features" aria-expanded={featuresOpen} onClick={() => setFeaturesOpen((v) => !v)}>
            <MenuIcon className="h-4 w-4" />
          </Button>
        </div>
        <form role="search" className="mx-4 hidden md:flex flex-1 max-w-xl" onSubmit={(e)=>e.preventDefault()}>
          <div className="relative w-full">
            <input type="search" placeholder="Search" aria-label="Search"
              className="w-full rounded-md border bg-background py-2 pl-10 pr-3 outline-none focus-visible:ring-2 focus-visible:ring-brand-blue" />
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>
        </form>
        <nav className="hidden md:flex items-center gap-8 text-sm justify-self-center">
          {navItems.map((item) => (
            <a key={item.href} href={item.href} className="text-muted-foreground hover:text-foreground transition-colors">
              {item.label}
            </a>
          ))}
        </nav>
        <div className="hidden md:block justify-self-end">
          <Link to="/login">
            <Button size="lg" className="bg-gradient-to-r from-brand-green to-brand-blue text-white shadow-lg shadow-brand-blue/20 hover:opacity-95">
              Login / Register
            </Button>
          </Link>
        </div>
        <Link to="/login" className="flex items-center gap-2 justify-self-end" aria-label="Go to login">
          <img
            src="https://cdn.builder.io/api/v1/image/assets%2F346875910c484bff9701e5e5cf6b22e8%2Faf9f1d3fb0344ed792f2b5ba2c9da401?format=webp&width=200"
            alt="HackOps logo"
            className="h-12 w-auto object-contain drop-shadow-sm"
          />
        </Link>
      </div>
      {open && (
        <div className="md:hidden border-t bg-background">
          <div className="container py-3 flex flex-col gap-3">
            <div className="relative">
              <input type="search" placeholder="Search" aria-label="Search"
                className="w-full rounded-md border bg-background py-2 pl-10 pr-3 outline-none focus-visible:ring-2 focus-visible:ring-brand-blue" />
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
            {navItems.map((item) => (
              <a key={item.href} href={item.href} onClick={() => setOpen(false)} className="py-1 text-muted-foreground hover:text-foreground">
                {item.label}
              </a>
            ))}
            <Link to="/login" onClick={() => setOpen(false)}>
              <Button className="w-full bg-gradient-to-r from-brand-green to-brand-blue text-white">Login / Register</Button>
            </Link>
          </div>
        </div>
      )}
    </header>
    {featuresOpen && (
      <>
        <div className="fixed inset-0 z-40" onClick={() => setFeaturesOpen(false)} />
        <div className="fixed left-0 top-16 z-50 w-full md:w-[760px] lg:w-[900px]">
          <div className="mx-0 rounded-b-xl border bg-card shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-4">
              <a href="#features" onClick={() => setFeaturesOpen(false)} className="flex items-center gap-3 rounded-md p-3 hover:bg-accent/50">
                <svg xmlns='http://www.w3.org/2000/svg' className="h-5 w-5 text-brand-blue" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="14" x="3" y="7" rx="2"/><path d="M3 7l9 6 9-6"/></svg>
                <div>
                  <div className="font-medium">Public Dashboard</div>
                  <div className="text-xs text-muted-foreground">Overview of key metrics and project status.</div>
                </div>
              </a>
              <a href="#features" onClick={() => setFeaturesOpen(false)} className="flex items-center gap-3 rounded-md p-3 hover:bg-accent/50">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-brand-green" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M19 17V9l-4 4-4-6-4 8"/></svg>
                <div>
                  <div className="font-medium">Statistics of Government Funds</div>
                  <div className="text-xs text-muted-foreground">Transparent fund flows and utilization analytics.</div>
                </div>
              </a>
              <a href="#features" onClick={() => setFeaturesOpen(false)} className="flex items-center gap-3 rounded-md p-3 hover:bg-accent/50">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-brand-blue" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 17l6-6 4 4 8-8"/></svg>
                <div>
                  <div className="font-medium">Companies Growth Statistics</div>
                  <div className="text-xs text-muted-foreground">Trends and performance metrics across companies.</div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </>
    )}
  </>
  );
}

function Footer() {
  return (
    <footer className="border-t bg-background" id="footer">
      <div className="container py-10 grid gap-6 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2 font-bold text-lg"><span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-brand-green to-brand-blue text-white">H</span>HackOps</div>
          <p className="mt-3 text-sm text-muted-foreground max-w-sm">A submission for HackOut '25, designed to accelerate the green hydrogen economy.</p>
        </div>
        <nav className="text-sm">
          <div className="font-semibold mb-3">Links</div>
          <ul className="space-y-2">
            <li><a href="#home" className="hover:text-foreground text-muted-foreground">Home</a></li>
            <li><a href="#our-solution" className="hover:text-foreground text-muted-foreground">Solution</a></li>
            <li><a href="#privacy" className="hover:text-foreground text-muted-foreground">Privacy Policy</a></li>
          </ul>
        </nav>
        <div className="text-sm">
          <div className="font-semibold mb-3">Contact</div>
          <p className="text-muted-foreground">contact@hackops.dev</p>
          <div className="mt-3 flex items-center gap-3">
            <a aria-label="LinkedIn" href="#" className="text-muted-foreground hover:text-foreground"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M4.98 3.5C4.98 4.88 3.86 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.5 8h4V24h-4zM8.5 8h3.8v2.2h.1c.5-.9 1.8-2.2 3.8-2.2 4.1 0 4.8 2.7 4.8 6.1V24h-4v-7.8c0-1.9 0-4.3-2.6-4.3-2.6 0-3 2-3 4.1V24h-4z"/></svg></a>
            <a aria-label="Twitter" href="#" className="text-muted-foreground hover:text-foreground"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1227" fill="currentColor" className="h-5 w-5"><path d="M714.163 0L432.104 336.38 120.326 0H0l376.67 426.015L0 874.788h120.326l311.778-366.447L714.163 874.788H840.49L449.306 426.015 840.49 0h-126.327zm285.84 0L600.4 706.76 238.19 1226.89H363.9l287.74-385.7 336.107 385.7H1200L817.576 781.705 1180.95 0h-180.95z"/></svg></a>
            <a aria-label="GitHub" href="#" className="text-muted-foreground hover:text-foreground"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.418 2.865 8.166 6.839 9.49.5.092.682-.217.682-.483 0-.237-.009-.868-.014-1.703-2.782.604-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.464-1.11-1.464-.908-.62.069-.607.069-.607 1.003.07 1.531 1.03 1.531 1.03.892 1.53 2.341 1.088 2.91.833.091-.647.35-1.088.636-1.339-2.22-.253-4.555-1.112-4.555-4.944 0-1.091.39-1.985 1.029-2.684-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.748-1.027 2.748-1.027.546 1.379.202 2.398.1 2.651.64.699 1.028 1.593 1.028 2.684 0 3.841-2.337 4.687-4.565 4.935.359.31.679.92.679 1.855 0 1.339-.012 2.419-.012 2.749 0 .268.18.58.688.481A10.019 10.019 0 0022 12.017C22 6.484 17.523 2 12 2z" clipRule="evenodd"/></svg></a>
          </div>
        </div>
      </div>
      <div className="border-t">
        <div className="container py-4 text-xs text-muted-foreground">HackOps © 2025</div>
      </div>
    </footer>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
