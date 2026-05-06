import { SiteShell } from "@/components/SiteShell";

const insights = [
  ["NYC to LA", "Prices often soften on Tuesdays. Monitor flexible Monday departures for better odds."],
  ["Europe trips", "International routes should be watched 31-45 days before departure."],
  ["Booking behavior", "Incognito mode is not a reliable price lever; timing and flexibility matter more."]
];

export default function InsightsPage() {
  return (
    <SiteShell>
      <section className="mx-auto max-w-6xl px-4 py-10">
        <p className="text-sm font-medium uppercase tracking-wide text-insight">Travel intelligence</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink">Patterns FlyIQ is watching</h1>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {insights.map(([title, body]) => (
            <article key={title} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="font-semibold text-slate-900">{title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">{body}</p>
            </article>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
