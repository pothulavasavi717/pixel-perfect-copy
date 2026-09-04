import { Link, useRouterState } from "@tanstack/react-router";
import {
  ClipboardList,
  FileText,
  Gauge,
  Images,
  LayoutDashboard,
  Menu,
  Package,
  ScanLine,
  Settings,
  ShieldAlert,
  UserRound,
  X,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { currentUser } from "@/services/mock-data";

const navGroups = [
  {
    label: "Overview",
    items: [
      { to: "/", label: "Dashboard", icon: LayoutDashboard },
      { to: "/inspections/new", label: "New inspection", icon: ScanLine },
      { to: "/inspections", label: "Inspection history", icon: ClipboardList },
      { to: "/products", label: "Product repository", icon: Package },
    ],
  },
  {
    label: "Case files",
    items: [
      { to: "/declarations", label: "Declarations", icon: FileText },
      { to: "/violations/vio-1", label: "Violations", icon: ShieldAlert },
      { to: "/evidence", label: "Evidence gallery", icon: Images },
      { to: "/upload", label: "Image upload", icon: Gauge },
    ],
  },
  {
    label: "Account",
    items: [
      { to: "/reports/ins-8842", label: "Report preview", icon: FileText },
      { to: "/profile", label: "User profile", icon: UserRound },
      { to: "/settings", label: "Settings", icon: Settings },
    ],
  },
] as const;

function SidebarBody({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <>
      <div className="flex h-14 items-center gap-2 border-b border-border px-4">
        <div className="grid size-7 place-items-center rounded-md bg-primary text-[10px] font-bold tracking-wider text-primary-foreground">
          LM
        </div>
        <div className="leading-tight">
          <div className="font-display text-sm font-bold">LegalMetriCheck</div>
          <div className="text-[10px] text-muted-foreground">Legal Metrology Enforcement</div>
        </div>
      </div>
      <nav className="flex-1 overflow-auto p-2 text-sm">
        {navGroups.map((group) => (
          <div key={group.label}>
            <div className="label-caps px-3 py-1.5">{group.label}</div>
            {group.items.map((item) => {
              const active =
                item.to === "/" ? pathname === "/" : pathname.startsWith(item.to.split("/")[1] ? `/${item.to.split("/")[1]}` : item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={onNavigate}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2",
                    active
                      ? "bg-primary-soft font-medium text-primary"
                      : "text-foreground/80 hover:bg-muted",
                  )}
                >
                  <item.icon className="size-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
      <div className="border-t border-border p-3">
        <Link to="/profile" onClick={onNavigate} className="flex items-center gap-3">
          <div className="grid size-9 place-items-center rounded-full bg-primary-soft text-xs font-bold text-primary">
            {currentUser.initials}
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold">{currentUser.name}</div>
            <div className="text-[10px] text-muted-foreground">
              {currentUser.designation} · {currentUser.zone}
            </div>
          </div>
        </Link>
      </div>
    </>
  );
}

export function AppShell({
  children,
  contextLabel,
  contextValue,
  contextMeta,
}: {
  children: ReactNode;
  contextLabel?: string;
  contextValue?: string;
  contextMeta?: string;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full bg-background font-sans text-foreground">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-sidebar lg:flex">
        <SidebarBody pathname={pathname} />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Close navigation"
            className="absolute inset-0 bg-foreground/40"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 flex w-64 flex-col border-r border-border bg-sidebar">
            <SidebarBody pathname={pathname} onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-surface px-4 sm:px-6">
          <button
            className="rounded-md p-2 hover:bg-muted lg:hidden"
            aria-label="Open navigation"
            onClick={() => setMobileOpen(true)}
          >
            {mobileOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
          <div className="truncate text-sm">
            <span className="text-muted-foreground">{contextLabel ?? "Workspace"}</span>{" "}
            <span className="font-semibold">{contextValue ?? "Enforcement console"}</span>
            {contextMeta && (
              <>
                <span className="text-muted-foreground"> · </span>
                <span className="font-medium">{contextMeta}</span>
              </>
            )}
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden rounded-md bg-muted px-3 py-1.5 text-xs text-muted-foreground sm:block">
              Search record ID or product…
            </div>
            <Link
              to="/profile"
              className="grid size-8 place-items-center rounded-md bg-muted text-sm font-medium"
            >
              {currentUser.initials.charAt(0)}
            </Link>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Panel({
  title,
  meta,
  children,
  className,
  bodyClassName,
}: {
  title?: string;
  meta?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section className={cn("panel overflow-hidden", className)}>
      {title && (
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold">{title}</h2>
          {meta && <div className="text-[11px] text-muted-foreground">{meta}</div>}
        </div>
      )}
      <div className={cn("p-4", bodyClassName)}>{children}</div>
    </section>
  );
}

export function StatCard({
  label,
  value,
  hint,
  tone = "default",
  progress,
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "default" | "success" | "danger" | "warning";
  progress?: number;
}) {
  return (
    <div className="panel p-4">
      <div className="label-caps">{label}</div>
      <div
        className={cn(
          "mt-2 font-display text-3xl font-bold",
          tone === "success" && "text-success",
          tone === "danger" && "text-danger",
          tone === "warning" && "text-warning",
        )}
      >
        {value}
      </div>
      {hint && <div className="mt-1 text-[11px] text-muted-foreground">{hint}</div>}
      {typeof progress === "number" && (
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary" style={{ width: `${progress}%` }} />
        </div>
      )}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-12 text-center">
      <div className="grid size-10 place-items-center rounded-full bg-muted text-muted-foreground">
        <ClipboardList className="size-4" />
      </div>
      <p className="text-sm font-semibold">{title}</p>
      <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      {action}
    </div>
  );
}

export function Disclaimer({ text }: { text: string }) {
  return (
    <p className="mt-4 rounded-md border border-border bg-muted px-3 py-2 text-[11px] text-muted-foreground">
      {text}
    </p>
  );
}
