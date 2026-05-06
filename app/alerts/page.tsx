import { SiteShell } from "@/components/SiteShell";

const alerts = [
  { route: "NYC -> LAX", target: "$220", status: "Monitoring Tuesday drops" },
  { route: "BOS -> FCO", target: "$640", status: "Checking nearby airport swaps" }
];

export default function AlertsPage() {
  return (
    <SiteShell>
      <section className="mx-auto max-w-5xl px-4 py-10">
        <p className="text-sm font-medium uppercase tracking-wide text-price">Action layer</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink">Active price alerts</h1>
        <div className="mt-8 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          {alerts.map((alert) => (
            <div key={alert.route} className="grid gap-2 border-b border-slate-200 p-5 last:border-b-0 md:grid-cols-3">
              <strong>{alert.route}</strong>
              <span className="font-semibold text-price">{alert.target}</span>
              <span className="text-sm text-slate-600">{alert.status}</span>
            </div>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
