import { SiteShell } from "@/components/SiteShell";

export default function SearchPage() {
  return (
    <SiteShell>
      <section className="mx-auto max-w-5xl px-4 py-10">
        <p className="text-sm font-medium uppercase tracking-wide text-primary">Backup search</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink">Traditional flight search</h1>
        <form className="mt-8 grid gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-2">
          {[
            ["Origin", "NYC"],
            ["Destination", "PAR"],
            ["Depart", "2026-06-10"],
            ["Return", "2026-06-17"]
          ].map(([label, value]) => (
            <label key={label} className="text-sm font-medium text-slate-700">
              {label}
              <input
                defaultValue={value}
                className="mt-2 min-h-11 w-full rounded-lg border border-slate-300 px-3 text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </label>
          ))}
          <button className="min-h-11 rounded-lg bg-primary px-5 font-semibold text-white md:col-span-2">
            Search with backup form
          </button>
        </form>
      </section>
    </SiteShell>
  );
}
