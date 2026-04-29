"use client";

import Image from "next/image";
import { useCallback, useMemo, useState } from "react";
import { GmailPhishMock } from "@/app/components/GmailPhishMock";

type Step =
  | "start"
  | "phishing"
  | "feedback"
  | "assessment"
  | "result"
  | "cta"
  | "email"
  | "success";

type Tri = 0 | 1 | 2;
type Severity = "CRITICAL" | "HIGH" | "LOW";

const ASSESSMENT_Q = [
  { q: "Do you use MFA on all accounts?", domain: "IDENTITY" },
  { q: "Do you run phishing simulations?", domain: "AWARENESS" },
  { q: "Would you detect a breach in under 24 hours?", domain: "DETECTION" },
] as const;

const CALENDLY =
  process.env.NEXT_PUBLIC_CALENDLY_URL ?? "https://calendly.com";

const SVALBARD = {
  name: "Svalbard Security",
  home: "https://svalbard.ca",
  logo: "https://svalbard.ca/images/logo.svg",
} as const;

function triLabel(v: Tri): "Yes" | "Not sure" | "No" {
  if (v === 2) return "Yes";
  if (v === 1) return "Not sure";
  return "No";
}

function severityFromTri(v: Tri): Severity {
  if (v === 2) return "LOW";
  if (v === 1) return "HIGH";
  return "CRITICAL";
}

function getAwarenessSev(wouldClick: boolean | null, simAnswer: Tri): Severity {
  const base = severityFromTri(simAnswer);
  if (!wouldClick) return base;
  if (base === "LOW") return "HIGH";
  return "CRITICAL";
}

function riskFromAnswers(maturity: number): number {
  return Math.round((1 - maturity / 6) * 100);
}

function overallSeverity(score: number): Severity {
  if (score >= 70) return "CRITICAL";
  if (score >= 40) return "HIGH";
  return "LOW";
}

const SEV_CLS: Record<Severity, string> = {
  CRITICAL: "border-red-500/50 bg-red-500/10 text-red-400",
  HIGH: "border-amber-500/50 bg-amber-500/10 text-amber-400",
  LOW: "border-green-500/50 bg-green-500/10 text-green-400",
};

function SevTag({ s }: { s: Severity }) {
  return (
    <span
      className={`rounded border px-1.5 py-0.5 font-mono text-[10px] font-bold tracking-widest ${SEV_CLS[s]}`}
    >
      {s}
    </span>
  );
}

export default function Page() {
  const [step, setStep] = useState<Step>("start");
  const [wouldClickPhish, setWouldClickPhish] = useState<boolean | null>(null);
  const [aqIndex, setAqIndex] = useState(0);
  const [answers, setAnswers] = useState<Tri[]>([]);
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitErr, setSubmitErr] = useState<string | null>(null);

  const maturity = useMemo(
    () => answers.reduce<number>((s, a) => s + a, 0),
    [answers],
  );
  const riskScore = riskFromAnswers(maturity);
  const breachProb = Math.min(95, Math.round(40 + (riskScore / 100) * 40));

  const identitySev: Severity =
    answers[0] !== undefined ? severityFromTri(answers[0]) : "CRITICAL";
  const awarenessSev: Severity =
    answers[1] !== undefined
      ? getAwarenessSev(wouldClickPhish, answers[1])
      : getAwarenessSev(wouldClickPhish, 0 as Tri);
  const detectionSev: Severity =
    answers[2] !== undefined ? severityFromTri(answers[2]) : "CRITICAL";

  const onPhishing = useCallback((wouldClick: boolean) => {
    setWouldClickPhish(wouldClick);
    setStep("feedback");
  }, []);

  const onAssessmentPick = useCallback(
    (v: Tri) => {
      const next = [...answers, v];
      setAnswers(next);
      if (aqIndex >= ASSESSMENT_Q.length - 1) {
        setStep("result");
      } else {
        setAqIndex((i) => i + 1);
      }
    },
    [answers, aqIndex],
  );

  const openCalendly = useCallback(() => {
    window.open(CALENDLY, "_blank", "noopener,noreferrer");
  }, []);

  const submitLead = useCallback(async () => {
    setSubmitErr(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          company,
          meta: {
            wouldClickPhish,
            assessment: answers.map(triLabel),
            riskScore,
          },
        }),
      });
      const data = (await res.json()) as { ok?: boolean };
      if (!res.ok || !data.ok) {
        setSubmitErr("Try again.");
        return;
      }
      setStep("success");
    } catch {
      setSubmitErr("Network error.");
    } finally {
      setSubmitting(false);
    }
  }, [email, company, wouldClickPhish, answers, riskScore]);

  const today = new Date().toISOString().slice(0, 10);

  return (
    <main className="grid-bg relative flex h-dvh min-h-dvh w-full flex-col overflow-hidden text-[#e8eaed]">
      <div className="scanlines pointer-events-none absolute inset-0 z-20 opacity-30" />

      <div className="relative z-10 flex h-full min-h-0 flex-1 flex-col px-4">
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

        {/* Step content — key causes remount → triggers step-enter animation */}
        <div key={step} className="step-enter flex min-h-0 flex-1 flex-col py-4">

          {/* ── START ── */}
          {step === "start" && (
            <div className="flex flex-1 flex-col justify-between">
              <div className="space-y-5">
                <div>
                  <p className="font-mono text-[10px] tracking-[0.25em] text-green-500">
                    {"// THREAT ASSESSMENT PROTOCOL"}
                  </p>
                  <h1 className="mt-2 text-2xl font-bold leading-tight tracking-tight text-[#f0f0f0]">
                    Can your team stop<br />a targeted attack?
                  </h1>
                </div>

                <div className="border border-[#1a1d20] bg-[#0d0f10]">
                  {(
                    [
                      ["60%", "of breached SMBs close within 6 months"],
                      ["$3.31M", "average cost of a breach for small businesses"],
                      ["73%", "of employees click phishing emails on first exposure"],
                    ] as const
                  ).map(([stat, label]) => (
                    <div
                      key={stat}
                      className="flex items-baseline gap-3 border-b border-[#1a1d20] px-3 py-2.5 last:border-b-0"
                    >
                      <span className="shrink-0 font-mono text-lg font-bold text-red-400">
                        {stat}
                      </span>
                      <span className="text-[13px] leading-snug text-[#6b7280]">
                        {label}
                      </span>
                    </div>
                  ))}
                </div>

                <p className="font-mono text-[11px] text-[#4b5563]">
                  &gt; 30 seconds · no signup required
                </p>
              </div>

              <button
                type="button"
                onClick={() => setStep("phishing")}
                className="w-full bg-green-500 py-4 font-mono text-sm font-bold tracking-widest text-black transition active:brightness-90"
              >
                INITIATE ASSESSMENT →
              </button>
            </div>
          )}

          {/* ── PHISHING ── */}
          {step === "phishing" && (
            <div className="flex min-h-0 flex-1 flex-col gap-3">
              <div className="shrink-0">
                <p className="font-mono text-[10px] tracking-[0.2em] text-red-400">
                  {"// SCENARIO_001 · SOCIAL ENGINEERING"}
                </p>
                <p className="mt-1 text-[12px] text-[#4b5563]">
                  A threat has landed in your inbox.
                </p>
              </div>

              <GmailPhishMock />

              <div className="shrink-0 border-t border-[#1a1d20] pt-3">
                <p className="font-mono text-[11px] tracking-[0.15em] text-[#9ca3af]">
                  WHAT WOULD YOU DO?
                </p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => onPhishing(true)}
                    className="border border-red-500/40 bg-red-500/10 py-3.5 font-mono text-xs font-bold tracking-widest text-red-300 transition active:brightness-90"
                  >
                    CLICK IT
                  </button>
                  <button
                    type="button"
                    onClick={() => onPhishing(false)}
                    className="border border-green-500/40 bg-green-500/10 py-3.5 font-mono text-xs font-bold tracking-widest text-green-300 transition active:brightness-90"
                  >
                    IGNORE IT
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── FEEDBACK ── */}
          {step === "feedback" && wouldClickPhish !== null && (
            <div className="flex flex-1 flex-col justify-between">
              <div className="space-y-4">
                <div>
                  <p className="font-mono text-[10px] tracking-[0.2em] text-[#4b5563]">
                    {"// SCENARIO_001 · ANALYSIS COMPLETE"}
                  </p>
                  <div className="mt-2 flex items-baseline gap-3">
                    <span
                      className={`font-mono text-3xl font-black tracking-tight ${wouldClickPhish ? "text-red-400" : "text-green-400"}`}
                    >
                      {wouldClickPhish ? "FAIL" : "PASS"}
                    </span>
                    <span className="font-mono text-[11px] text-[#4b5563]">
                      · PHISHING DETECTION
                    </span>
                  </div>
                </div>

                <div className="border border-[#1a1d20] bg-[#0d0f10]">
                  <div className="border-b border-[#1a1d20] px-3 py-2">
                    <p className="font-mono text-[10px] tracking-[0.15em] text-[#4b5563]">
                      INDUSTRY DATA
                    </p>
                  </div>
                  {wouldClickPhish ? (
                    <>
                      {(
                        [
                          ["73%", "of employees click emails like this"],
                          ["1m 22s", "average time-to-click"],
                          ["1 click", "is all it takes to breach your network"],
                        ] as const
                      ).map(([k, v]) => (
                        <div
                          key={k}
                          className="flex items-baseline justify-between border-b border-[#1a1d20] px-3 py-2.5 last:border-b-0"
                        >
                          <span className="font-mono text-sm font-bold text-red-400">
                            {k}
                          </span>
                          <span className="text-right text-[12px] text-[#6b7280]">
                            {v}
                          </span>
                        </div>
                      ))}
                    </>
                  ) : (
                    <div className="space-y-1.5 px-3 py-3">
                      <p className="text-[13px] text-[#e8eaed]">
                        You caught it. Most teams don&apos;t.
                      </p>
                      <p className="text-[12px] text-[#6b7280]">
                        But one person clicking is all it takes to compromise
                        your entire network.
                      </p>
                    </div>
                  )}
                </div>

                <p className="font-mono text-[11px] text-[#4b5563]">
                  &gt; Now let&apos;s audit your defenses.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setAqIndex(0);
                  setAnswers([]);
                  setStep("assessment");
                }}
                className="w-full bg-green-500 py-4 font-mono text-sm font-bold tracking-widest text-black transition active:brightness-90"
              >
                RUN SECURITY AUDIT →
              </button>
            </div>
          )}

          {/* ── ASSESSMENT ── */}
          {step === "assessment" && (
            <div className="flex flex-1 flex-col justify-between">
              <div className="space-y-5">
                <div>
                  <p className="font-mono text-[10px] tracking-[0.2em] text-[#4b5563]">
                    {"// SECURITY AUDIT"}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    {ASSESSMENT_Q.map((_, i) => (
                      <span
                        key={i}
                        className={`font-mono text-base ${
                          i < aqIndex
                            ? "text-green-500"
                            : i === aqIndex
                              ? "text-[#e8eaed]"
                              : "text-[#2a2d31]"
                        }`}
                      >
                        {i > aqIndex ? "□" : "■"}
                      </span>
                    ))}
                    <span className="ml-1 font-mono text-[11px] text-[#4b5563]">
                      CHECK {aqIndex + 1}/{ASSESSMENT_Q.length} ·{" "}
                      {ASSESSMENT_Q[aqIndex].domain}
                    </span>
                  </div>
                </div>

                <div className="border border-[#1a1d20] bg-[#0d0f10] px-4 py-5">
                  <p className="font-mono text-[10px] tracking-[0.2em] text-[#4b5563]">
                    CHECKING {ASSESSMENT_Q[aqIndex].domain}
                  </p>
                  <p className="mt-3 text-base font-medium leading-snug text-[#f0f0f0]">
                    {ASSESSMENT_Q[aqIndex].q}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => onAssessmentPick(2)}
                  className="border border-green-500/40 bg-green-500/10 py-4 font-mono text-[11px] font-bold tracking-widest text-green-400 transition active:brightness-90"
                >
                  YES
                </button>
                <button
                  type="button"
                  onClick={() => onAssessmentPick(1)}
                  className="border border-amber-500/40 bg-amber-500/10 py-4 font-mono text-[11px] font-bold tracking-widest text-amber-400 transition active:brightness-90"
                >
                  UNSURE
                </button>
                <button
                  type="button"
                  onClick={() => onAssessmentPick(0)}
                  className="border border-red-500/40 bg-red-500/10 py-4 font-mono text-[11px] font-bold tracking-widest text-red-400 transition active:brightness-90"
                >
                  NO
                </button>
              </div>
            </div>
          )}

          {/* ── RESULT ── */}
          {step === "result" && (
            <div className="flex flex-1 flex-col justify-between">
              <div className="space-y-4">
                <div>
                  <p className="font-mono text-[10px] tracking-[0.2em] text-[#4b5563]">
                    {"// RISK REPORT · "}{today}
                  </p>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span
                      className={`font-mono text-5xl font-black tabular-nums ${
                        riskScore >= 70
                          ? "text-red-400"
                          : riskScore >= 40
                            ? "text-amber-400"
                            : "text-green-400"
                      }`}
                    >
                      {riskScore}
                    </span>
                    <span className="font-mono text-lg text-[#4b5563]">/100</span>
                    <SevTag s={overallSeverity(riskScore)} />
                  </div>
                  <p className="mt-1 font-mono text-[10px] tracking-[0.15em] text-[#4b5563]">
                    OVERALL CYBER RISK SCORE
                  </p>
                </div>

                <div className="border border-[#1a1d20] bg-[#0d0f10]">
                  <div className="border-b border-[#1a1d20] px-3 py-2">
                    <p className="font-mono text-[10px] tracking-[0.15em] text-[#4b5563]">
                      VECTOR BREAKDOWN
                    </p>
                  </div>
                  {(
                    [
                      ["IDENTITY", identitySev],
                      ["AWARENESS", awarenessSev],
                      ["DETECTION", detectionSev],
                    ] as [string, Severity][]
                  ).map(([label, sev]) => (
                    <div
                      key={label}
                      className="flex items-center justify-between border-b border-[#1a1d20] px-3 py-2.5 last:border-b-0"
                    >
                      <span className="font-mono text-[12px] text-[#9ca3af]">
                        {label}
                      </span>
                      <SevTag s={sev} />
                    </div>
                  ))}
                </div>

                <div className="border-l-2 border-red-500/50 pl-3">
                  <p className="text-[13px] leading-relaxed text-[#6b7280]">
                    Companies at this risk level are breached every{" "}
                    <span className="font-mono font-bold text-red-400">
                      11 months
                    </span>{" "}
                    on average. The next attack may already be in progress.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setStep("cta")}
                className="w-full bg-green-500 py-4 font-mono text-sm font-bold tracking-widest text-black transition active:brightness-90"
              >
                VIEW REMEDIATION PLAN →
              </button>
            </div>
          )}

          {/* ── CTA ── */}
          {step === "cta" && (
            <div className="flex flex-1 flex-col justify-between">
              <div className="space-y-4">
                <p className="font-mono text-[10px] tracking-[0.25em] text-[#4b5563]">
                  {"// RECOMMENDED ACTION"}
                </p>

                <div className="border border-red-500/30 bg-red-500/5">
                  <div className="border-b border-red-500/20 px-3 py-2">
                    <p className="font-mono text-[10px] tracking-[0.15em] text-red-400">
                      BREACH PROBABILITY · NEXT 12 MONTHS
                    </p>
                  </div>
                  <div className="px-3 py-4">
                    <p className="font-mono text-5xl font-black tabular-nums text-red-400">
                      {breachProb}%
                    </p>
                    <p className="mt-1.5 text-[12px] text-[#6b7280]">
                      Calculated from your risk profile. Industry baseline is 40%.
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  {[
                    "Most breaches are preventable with basic controls.",
                    "A 30-minute call is all it takes to start.",
                    "Svalbard fixes this in 30 days.",
                  ].map((line) => (
                    <p key={line} className="font-mono text-[11px] text-[#4b5563]">
                      &gt; {line}
                    </p>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={openCalendly}
                  className="w-full bg-green-500 py-4 font-mono text-sm font-bold tracking-widest text-black transition active:brightness-90"
                >
                  BOOK FREE THREAT REVIEW →
                </button>
                <button
                  type="button"
                  onClick={() => setStep("email")}
                  className="w-full border border-[#2a2d31] py-3.5 font-mono text-xs font-bold tracking-widest text-[#6b7280] transition active:brightness-90"
                >
                  GET 3-MIN SECURITY CHECKLIST
                </button>
              </div>
            </div>
          )}

          {/* ── EMAIL ── */}
          {step === "email" && (
            <div className="flex flex-1 flex-col justify-between">
              <div className="space-y-5">
                <div>
                  <p className="font-mono text-[10px] tracking-[0.25em] text-[#4b5563]">
                    {"// SECURITY CHECKLIST"}
                  </p>
                  <p className="mt-2 text-[13px] text-[#6b7280]">
                    3-minute read. Actionable steps. No fluff.
                  </p>
                </div>

                <div className="space-y-3">
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
                      COMPANY
                    </label>
                    <input
                      type="text"
                      autoComplete="organization"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="Acme Corp"
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

              <div className="space-y-2">
                <button
                  type="button"
                  disabled={submitting || !email}
                  onClick={submitLead}
                  className="w-full bg-green-500 py-4 font-mono text-sm font-bold tracking-widest text-black transition active:brightness-90 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {submitting ? "SENDING..." : "SEND CHECKLIST →"}
                </button>
                <button
                  type="button"
                  onClick={() => setStep("cta")}
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
                    {"// TRANSMISSION COMPLETE"}
                  </p>
                  <p className="mt-2 font-mono text-5xl font-black text-green-400">
                    OK
                  </p>
                  <p className="mt-2 text-[13px] text-[#6b7280]">
                    Your security briefing is on its way. Check your inbox.
                  </p>
                </div>

                <div className="border border-[#1a1d20] bg-[#0d0f10] px-3 py-3">
                  <p className="font-mono text-[11px] text-[#4b5563]">
                    &gt; Want to go further? Book a free 30-min threat review
                    with a Svalbard analyst.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={openCalendly}
                  className="w-full bg-green-500 py-4 font-mono text-sm font-bold tracking-widest text-black transition active:brightness-90"
                >
                  BOOK THREAT REVIEW →
                </button>
                <button
                  type="button"
                  onClick={() => setStep("cta")}
                  className="w-full py-2 font-mono text-[11px] tracking-widest text-[#4b5563]"
                >
                  ← BACK
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
