"use client";

import { useState } from "react";
import {
  INQUIRY_TYPES,
  LEAD_SOURCES,
  BUSINESS_STAGES,
  WHY_NOW,
  MEDIA_SUBTYPES,
} from "@/lib/constants";

type Status = "idle" | "submitting" | "success" | "error";

const inputClass =
  "w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-[15px] text-ink placeholder-black/30 outline-none transition focus:border-mint focus:ring-2 focus:ring-mint/40";
const labelClass = "block text-[13px] font-medium text-charcoal mb-1.5";

export default function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string>("");
  const [type, setType] = useState<string>("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setError("");

    const form = e.currentTarget;
    const data = new FormData(form);
    const payload = Object.fromEntries(data.entries());

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.error || "Something went wrong. Please try again.");
      }
      setStatus("success");
      form.reset();
      setType("");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-mint/50 bg-mint/10 p-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-mint">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#111111"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-ink">Thank you — we&apos;ve got it.</h3>
        <p className="mt-2 text-[15px] text-charcoal/70">
          Your enquiry has landed with the team. We&apos;ll be in touch shortly.
        </p>
        <button
          onClick={() => setStatus("idle")}
          className="mt-6 text-[14px] font-medium text-charcoal underline underline-offset-4 hover:text-ink"
        >
          Send another enquiry
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="name">
            Your name <span className="text-mint">*</span>
          </label>
          <input id="name" name="name" required className={inputClass} placeholder="Jane Founder" />
        </div>
        <div>
          <label className={labelClass} htmlFor="email">
            Email <span className="text-mint">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className={inputClass}
            placeholder="jane@company.com"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="company">
            Company
          </label>
          <input id="company" name="company" className={inputClass} placeholder="Company name" />
        </div>
        <div>
          <label className={labelClass} htmlFor="phone">
            Phone
          </label>
          <input id="phone" name="phone" className={inputClass} placeholder="Optional" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="type">
            What can we help with? <span className="text-mint">*</span>
          </label>
          <select
            id="type"
            name="type"
            required
            value={type}
            onChange={(e) => setType(e.target.value)}
            className={inputClass}
          >
            <option value="" disabled>
              Select one…
            </option>
            {INQUIRY_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass} htmlFor="source">
            How did you hear about us?
          </label>
          <select id="source" name="source" defaultValue="website" className={inputClass}>
            {LEAD_SOURCES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {type === "media_other" && (
        <div>
          <label className={labelClass} htmlFor="media_subtype">
            What kind of enquiry?
          </label>
          <select id="media_subtype" name="media_subtype" className={inputClass} defaultValue="">
            <option value="" disabled>
              Select one…
            </option>
            {MEDIA_SUBTYPES.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="business_stage">
            Where is your business today?
          </label>
          <select id="business_stage" name="business_stage" className={inputClass} defaultValue="">
            <option value="">Prefer not to say</option>
            {BUSINESS_STAGES.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass} htmlFor="why_now">
            What&apos;s driving this now?
          </label>
          <select id="why_now" name="why_now" className={inputClass} defaultValue="">
            <option value="">Prefer not to say</option>
            {WHY_NOW.map((w) => (
              <option key={w} value={w}>
                {w}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="subject">
          Subject
        </label>
        <input
          id="subject"
          name="subject"
          className={inputClass}
          placeholder="A line on what you're exploring"
        />
      </div>

      <div>
        <label className={labelClass} htmlFor="message">
          Your message <span className="text-mint">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          className={`${inputClass} resize-y`}
          placeholder="Tell us a little about your business and what you're hoping to achieve."
        />
      </div>

      <label className="flex items-start gap-3 text-[14px] text-charcoal/80">
        <input
          type="checkbox"
          name="ok_to_contact"
          value="true"
          className="mt-0.5 h-4 w-4 rounded border-black/20 text-mint focus:ring-mint"
        />
        <span>Keep me updated with occasional insights from The PR Hub.</span>
      </label>

      {status === "error" && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[14px] text-red-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="inline-flex w-full items-center justify-center rounded-xl bg-ink px-6 py-3.5 text-[15px] font-medium text-white transition hover:bg-charcoal disabled:opacity-60 sm:w-auto"
      >
        {status === "submitting" ? "Sending…" : "Send enquiry"}
      </button>
    </form>
  );
}
