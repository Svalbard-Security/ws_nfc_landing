import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase env vars not set");
  return createClient(url, key);
}

export async function POST(req: Request) {
  let body: {
    fullName?: string;
    email?: string;
    phone?: string;
    services?: string[];
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ ok: false, error: "invalid_email" }, { status: 400 });
  }

  const fullName =
    typeof body.fullName === "string" ? body.fullName.trim().slice(0, 200) : "";
  const phone =
    typeof body.phone === "string" ? body.phone.trim().slice(0, 50) : "";
  const services = Array.isArray(body.services)
    ? body.services.filter((s) => typeof s === "string").slice(0, 10)
    : [];

  const row = {
    full_name: fullName || null,
    email,
    phone: phone || null,
    services,
    source: "websummit_qr",
    credit_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  };

  try {
    const supabase = getSupabase();
    const { error } = await supabase.from("qr_leads").insert(row);
    if (error) {
      console.error("[qr-lead] supabase error", error);
      return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
    }
  } catch (err) {
    console.error("[qr-lead] supabase init error", err);
    return NextResponse.json({ ok: false, error: "db_unavailable" }, { status: 500 });
  }

  // Optional legacy webhook
  const webhook = process.env.LEAD_WEBHOOK_URL;
  if (webhook) {
    fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...row, at: new Date().toISOString() }),
    }).catch((e) => console.error("[qr-lead] webhook failed", e));
  }

  return NextResponse.json({ ok: true });
}
