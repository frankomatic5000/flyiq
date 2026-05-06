"use client";

import { FormEvent, useMemo, useState } from "react";
import type { AgentChatResponse } from "@/lib/agent/types";

type Message = {
  role: "user" | "assistant";
  content: string;
  result?: AgentChatResponse;
};

const starters = [
  "Find me the cheapest flight to Paris next month",
  "When should I book NYC to LA?",
  "Compare nearby airports for Boston to Rome in June"
];

export function AgentChat() {
  const [input, setInput] = useState(starters[0]);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Tell me where you want to go, roughly when, and what matters most. I can search, compare cheaper dates, estimate booking windows, and set alerts."
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const latestResult = useMemo(
    () => [...messages].reverse().find((message) => message.result)?.result,
    [messages]
  );

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = input.trim();
    if (!message || isLoading) return;

    setMessages((current) => [...current, { role: "user", content: message }]);
    setInput("");
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/agent/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, userId: "demo-user" })
      });
      const payload = (await response.json()) as AgentChatResponse & { error?: string };

      if (!response.ok) {
        throw new Error(payload.error || "The agent could not process that request.");
      }

      setMessages((current) => [
        ...current,
        { role: "assistant", content: payload.assistantMessage, result: payload }
      ]);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unexpected agent error.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="mx-auto grid max-w-6xl gap-5 px-4 py-8 lg:grid-cols-[1fr_360px] lg:py-12">
      <div className="rounded-lg border border-slate-200 bg-white shadow-cockpit">
        <div className="border-b border-slate-200 px-5 py-4">
          <p className="text-sm font-medium uppercase tracking-wide text-primary">Flight intelligence agent</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Ask FlyIQ to plan the move.
          </h1>
        </div>

        <div className="min-h-[430px] space-y-4 px-4 py-5 sm:px-5" aria-live="polite">
          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[88%] rounded-lg px-4 py-3 text-sm leading-6 ${
                  message.role === "user"
                    ? "bg-primary text-white"
                    : "border border-slate-200 bg-slate-50 text-slate-800"
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
          {isLoading ? (
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              FlyIQ is checking routes, timing, and savings signals.
            </div>
          ) : null}
          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}
        </div>

        <form onSubmit={submit} className="border-t border-slate-200 p-4">
          <label htmlFor="agent-message" className="sr-only">
            Ask FlyIQ
          </label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              id="agent-message"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              maxLength={500}
              placeholder="Ask for dates, routes, alerts, or savings"
              className="min-h-12 flex-1 rounded-lg border border-slate-300 px-4 text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="min-h-12 rounded-lg bg-primary px-5 font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Send
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {starters.map((starter) => (
              <button
                key={starter}
                type="button"
                onClick={() => setInput(starter)}
                className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 hover:border-primary hover:text-primary"
              >
                {starter}
              </button>
            ))}
          </div>
        </form>
      </div>

      <aside className="space-y-4">
        <AgentResultCards result={latestResult} />
      </aside>
    </section>
  );
}

function AgentResultCards({ result }: { result?: AgentChatResponse }) {
  if (!result) {
    return (
      <>
        <InfoCard title="Reasoning summary" tone="blue">
          FlyIQ turns natural language into travel intent, calls flight tools, and explains the next best action.
        </InfoCard>
        <InfoCard title="Intelligence signals" tone="amber">
          Best windows: 21-30 days domestic and 31-45 days international. Monday departures and Wednesday returns often price better.
        </InfoCard>
        <InfoCard title="Action layer" tone="green">
          Ask to monitor a route, save a route, or compare nearby airports when flexibility matters.
        </InfoCard>
      </>
    );
  }

  return (
    <>
      <InfoCard title="Reasoning summary" tone="blue">
        {result.reasoningSummary}
      </InfoCard>
      {result.cards.map((card) => (
        <InfoCard key={card.title} title={card.title} tone={card.tone}>
          {card.body}
        </InfoCard>
      ))}
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Actions</h2>
        <div className="mt-3 space-y-2">
          {result.actions.map((action) => (
            <button
              key={action.label}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-left text-sm font-medium text-slate-800 hover:border-primary hover:text-primary"
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

function InfoCard({
  title,
  tone,
  children
}: {
  title: string;
  tone: "blue" | "amber" | "green";
  children: React.ReactNode;
}) {
  const toneClasses = {
    blue: "border-blue-200 bg-blue-50 text-blue-800",
    amber: "border-amber-200 bg-amber-50 text-amber-800",
    green: "border-green-200 bg-green-50 text-green-800"
  };

  return (
    <article className={`rounded-lg border p-4 ${toneClasses[tone]}`}>
      <h2 className="text-sm font-semibold uppercase tracking-wide">{title}</h2>
      <div className="mt-2 text-sm leading-6">{children}</div>
    </article>
  );
}
