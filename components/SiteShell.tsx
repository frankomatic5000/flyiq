import Link from "next/link";

const navItems = [
  { href: "/", label: "Agent" },
  { href: "/search", label: "Search" },
  { href: "/insights", label: "Insights" },
  { href: "/alerts", label: "Alerts" }
];

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-lg font-semibold tracking-tight text-ink">
            FlyIQ
          </Link>
          <nav aria-label="Primary navigation" className="flex gap-1 rounded-full bg-slate-100 p-1 text-sm">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full px-3 py-2 text-slate-700 transition hover:bg-white hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
