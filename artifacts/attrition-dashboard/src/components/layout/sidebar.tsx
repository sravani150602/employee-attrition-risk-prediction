import { Link, useLocation } from "wouter";
import { LayoutDashboard, Users, Calculator, BrainCircuit } from "lucide-react";
import { useHealthCheck } from "@workspace/api-client-react";

export function Sidebar() {
  const [location] = useLocation();
  const { data: health } = useHealthCheck();

  const links = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/employees", label: "Employees", icon: Users },
    { href: "/predict", label: "Risk Predictor", icon: Calculator },
  ];

  return (
    <div className="w-64 border-r border-border bg-card h-screen flex flex-col fixed left-0 top-0">
      <div className="p-6 border-b border-border">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="bg-primary/20 text-primary p-2 rounded-lg group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
            <BrainCircuit size={24} />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight text-foreground leading-none">Aura</h1>
            <span className="text-xs text-muted-foreground font-mono tracking-wider uppercase">Risk Cockpit</span>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {links.map((link) => {
          const isActive = location === link.href || (link.href !== "/" && location.startsWith(link.href));
          const Icon = link.icon;
          
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <Icon size={18} className={isActive ? "text-primary-foreground" : "text-muted-foreground"} />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border text-xs font-mono text-muted-foreground flex items-center justify-between">
        <span>System Status</span>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${health?.status === "ok" ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "bg-destructive"}`}></span>
          {health?.status === "ok" ? "Online" : "Offline"}
        </div>
      </div>
    </div>
  );
}