import { NextResponse } from "next/server";

export async function POST(req: Request) {
  let body: { email?: string; company?: string; meta?: Record<string, unknown> };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ ok: false, error: "invalid_email" }, { status: 400 });
  }

  const company =
    typeof body.company === "string" ? body.company.trim().slice(0, 200) : "";

  const payload = {
    email,
    company: company || null,
    meta: body.meta ?? {},
    at: new Date().toISOString(),
  };

  const webhook = process.env.LEAD_WEBHOOK_URL;
  if (webhook) {
    try {
      await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch {
      // still acknowledge to user; log server-side
      console.error("[lead] webhook failed", payload);
    }
  } else {
    console.info("[lead]", JSON.stringify(payload));
  }

  return NextResponse.json({ ok: true });
}
