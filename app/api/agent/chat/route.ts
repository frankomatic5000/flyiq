import { NextResponse } from "next/server";
import { runAgentChat } from "@/lib/agent/orchestrator";
import { parseChatRequest } from "@/lib/agent/validation";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message, userId } = parseChatRequest(body);

    // Rate-limit-ready boundary: add IP/user keyed limiter here before orchestration.
    const result = await runAgentChat(message, userId);
    return NextResponse.json(result);
  } catch (caught) {
    const message = caught instanceof Error ? caught.message : "Unable to process chat request.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
