"use client";

import Image from "next/image";
import { useState, useCallback } from "react";

type Step = "services" | "contact" | "success";

const SVALBARD = {
  name: "Svalbard Security",
  home: "https://svalbard.ca",
  logo: "https://svalbard.ca/images/logo.svg",
} as const;

const SERVICES = [
  {
    id: "pentest",
    label: "Penetration Testing",
    desc: "CREST-accredited offensive testing for web, API, network & cloud",
  },
  {
    id: "soc",
    label: "SOC as a Service",
    desc: "24/7 monitoring powered by Heimdall — median triage 42 seconds",
  },
  {
    id: "assessment",
    label: "Security Assessment",
    desc: "Deep-dive audit of your security posture with actionable findings",
  },
  {
    id: "awareness",
    label: "Security Awareness",
    desc: "Phishing simulations and training to harden your human layer",
  },
  {
    id: "vciso",
    label: "Virtual CISO",
    desc: "Fractional CISO leadership — strategy, compliance & board reporting",
  },
] as const;

export default function QRPage() {
  const [step, setStep] = useState<Step>("services");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitErr, setSubmitErr] = useState<string | null>(null);

  const toggleService = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const submitLead = useCallback(async () => {
    setSubmitErr(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/qr-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email,
          phone,
          services: Array.from(selected),
        }),
      });
      const data = (await res.json()) as { ok?: boolean };
      if (!res.ok || !data.ok) {
        setSubmitErr("Something went wrong. Please try again.");
        return;
      }
      setStep("success");
    } catch {
      setSubmitErr("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }, [fullName, email, phone, selected]);

  return (
    <main className="grid-bg relative flex min-h-dvh w-full flex-col overflow-hidden text-[#e8eaed]">
      <div className="scanlines pointer-events-none absolute inset-0 z-20 opacity-30" />

      <div className="relative z-10 flex flex-1 flex-col px-4">
        {/* Header */}
        <header className="flex shrink-0 items-center justify-between border-b border-[#1a1d20] py-3">
          <a
            href={SVALBARD.home}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={SVALBARD.name}
          >
            <Image
              src={SVALBARD.logo}
              alt=""
              width={100}
              height={28}
              unoptimized
              className="h-5 w-auto object-contain object-left brightness-0 invert opacity-80"
            />
          </a>
          <span className="flex items-center gap-1.5 font-mono text-[10px] tracking-widest text-green-500">
            <span className="size-1.5 animate-pulse rounded-full bg-green-500" />
            LIVE
          </span>
        </header>

        {/* Credit banner */}
        <div className="mt-4 border border-green-500/40 bg-green-500/8 px-4 py-3">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[10px] tracking-[0.2em] text-green-500">
              {"// EXCLUSIVE OFFER"}
            </p>
            <span className="rounded border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 font-mono text-[9px] tracking-wider text-amber-400">
              WEB SUMMIT GUESTS ONLY
            </span>
          </div>
          <p className="mt-1 text-[22px] font-black leading-tight tracking-tight text-[#f0f0f0]">
            <span className="text-green-400">CAD $2,500</span> credit
          </p>
          <p className="mt-0.5 text-[12px] leading-snug text-[#6b7280]">
            Redeemable on any Svalbard service. Tell us what you need and
            we&apos;ll apply the credit to your first engagement.
          </p>
          <p className="mt-2 font-mono text-[10px] text-[#4b5563]">
            &gt; Valid for 30 days from scan date
          </p>
        </div>

        {/* Step content */}
        <div key={step} className="step-enter flex flex-1 flex-col py-4">

          {/* ── SERVICES ── */}
          {step === "services" && (
            <div className="flex flex-1 flex-col justify-between">
              <div className="space-y-4">
                <div>
                  <p className="font-mono text-[10px] tracking-[0.25em] text-[#4b5563]">
                    {"// STEP 1 OF 2 · SELECT SERVICES"}
                  </p>
                  <p className="mt-2 text-[15px] font-semibold leading-snug text-[#f0f0f0]">
                    What does your team need?
                  </p>
                  <p className="mt-1 text-[12px] text-[#4b5563]">
                    Select all that apply.
                  </p>
                </div>

                <div className="space-y-2">
                  {SERVICES.map((svc) => {
                    const active = selected.has(svc.id);
                    return (
                      <button
                        key={svc.id}
                        type="button"
                        onClick={() => toggleService(svc.id)}
                        className={`w-full border px-3 py-3 text-left transition active:brightness-90 ${
                          active
                            ? "border-green-500/60 bg-green-500/10"
                            : "border-[#1a1d20] bg-[#0d0f10]"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span
                            className={`mt-0.5 shrink-0 font-mono text-sm ${
                              active ? "text-green-400" : "text-[#2a2d31]"
                            }`}
                          >
                            {active ? "■" : "□"}
                          </span>
                          <div>
                            <p
                              className={`font-mono text-[12px] font-bold tracking-wider ${
                                active ? "text-green-300" : "text-[#9ca3af]"
                              }`}
                            >
                              {svc.label.toUpperCase()}
                            </p>
                            <p className="mt-0.5 text-[11px] leading-snug text-[#4b5563]">
                              {svc.desc}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="button"
                disabled={selected.size === 0}
                onClick={() => setStep("contact")}
                className="mt-4 w-full bg-green-500 py-4 font-mono text-sm font-bold tracking-widest text-black transition active:brightness-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                CONTINUE →
              </button>
            </div>
          )}

          {/* ── CONTACT ── */}
          {step === "contact" && (
            <div className="flex flex-1 flex-col justify-between">
              <div className="space-y-5">
                <div>
                  <p className="font-mono text-[10px] tracking-[0.25em] text-[#4b5563]">
                    {"// STEP 2 OF 2 · YOUR DETAILS"}
                  </p>
                  <p className="mt-2 text-[15px] font-semibold leading-snug text-[#f0f0f0]">
                    Where should we send your credit?
                  </p>
                </div>

                {/* Selected services summary */}
                <div className="border border-[#1a1d20] bg-[#0d0f10] px-3 py-2.5">
                  <p className="font-mono text-[10px] tracking-[0.15em] text-[#4b5563]">
                    SELECTED SERVICES
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {Array.from(selected).map((id) => {
                      const svc = SERVICES.find((s) => s.id === id);
                      return (
                        <span
                          key={id}
                          className="rounded border border-green-500/30 bg-green-500/10 px-2 py-0.5 font-mono text-[10px] tracking-wider text-green-400"
                        >
                          {svc?.label.toUpperCase()}
                        </span>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block font-mono text-[10px] tracking-[0.15em] text-[#4b5563]">
                      FULL NAME *
                    </label>
                    <input
                      type="text"
                      autoComplete="name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Jane Smith"
                      className="mt-1.5 w-full border border-[#1a1d20] bg-[#0d0f10] px-3 py-3 font-mono text-sm text-[#e8eaed] outline-none placeholder:text-[#374151] focus:border-green-500/60 focus:ring-1 focus:ring-green-500/20"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] tracking-[0.15em] text-[#4b5563]">
                      EMAIL *
                    </label>
                    <input
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      className="mt-1.5 w-full border border-[#1a1d20] bg-[#0d0f10] px-3 py-3 font-mono text-sm text-[#e8eaed] outline-none placeholder:text-[#374151] focus:border-green-500/60 focus:ring-1 focus:ring-green-500/20"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] tracking-[0.15em] text-[#4b5563]">
                      PHONE
                    </label>
                    <input
                      type="tel"
                      autoComplete="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (416) 000-0000"
                      className="mt-1.5 w-full border border-[#1a1d20] bg-[#0d0f10] px-3 py-3 font-mono text-sm text-[#e8eaed] outline-none placeholder:text-[#374151] focus:border-green-500/60 focus:ring-1 focus:ring-green-500/20"
                    />
                  </div>
                </div>

                {submitErr && (
                  <p className="font-mono text-[11px] text-red-400">
                    &gt; ERROR: {submitErr}
                  </p>
                )}
              </div>

              <div className="mt-4 space-y-2">
                <button
                  type="button"
                  disabled={submitting || !fullName.trim() || !email.trim()}
                  onClick={submitLead}
                  className="w-full bg-green-500 py-4 font-mono text-sm font-bold tracking-widest text-black transition active:brightness-90 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {submitting ? "SENDING..." : "CLAIM CAD $2,500 CREDIT →"}
                </button>
                <button
                  type="button"
                  onClick={() => setStep("services")}
                  className="w-full py-2 font-mono text-[11px] tracking-widest text-[#4b5563]"
                >
                  ← BACK
                </button>
              </div>
            </div>
          )}

          {/* ── SUCCESS ── */}
          {step === "success" && (
            <div className="flex flex-1 flex-col justify-between">
              <div className="space-y-4">
                <div>
                  <p className="font-mono text-[10px] tracking-[0.25em] text-green-500">
                    {"// SUBMISSION COMPLETE"}
                  </p>
                  <p className="mt-2 font-mono text-5xl font-black text-green-400">
                    OK
                  </p>
                  <p className="mt-2 text-[15px] font-semibold text-[#f0f0f0]">
                    Your CAD $2,500 credit is reserved.
                  </p>
                  <p className="mt-1 text-[13px] text-[#6b7280]">
                    A Svalbard analyst will reach out within one business day to
                    get you started.
                  </p>
                </div>

                <div className="border border-[#1a1d20] bg-[#0d0f10] px-3 py-3 space-y-1">
                  <p className="font-mono text-[10px] tracking-[0.15em] text-[#4b5563]">
                    WHAT HAPPENS NEXT
                  </p>
                  {[
                    "We review your service selection",
                    "We prepare a scoped proposal",
                    "CAD $2,500 credit applied at signing",
                  ].map((line, i) => (
                    <p key={i} className="font-mono text-[11px] text-[#4b5563]">
                      &gt; {line}
                    </p>
                  ))}
                </div>
              </div>

              <a
                href={SVALBARD.home}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 block w-full border border-[#2a2d31] py-3.5 text-center font-mono text-xs font-bold tracking-widest text-[#6b7280] transition active:brightness-90"
              >
                VISIT SVALBARD.CA →
              </a>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
