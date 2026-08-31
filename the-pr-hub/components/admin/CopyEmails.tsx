"use client";

import { useState } from "react";

/**
 * Copies the subscriber email list to the clipboard as a comma-separated
 * string — a lightweight way to paste into an email client until a proper
 * sending integration exists.
 */
export default function CopyEmails({ emails }: { emails: string[] }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(emails.join(", "));
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      onClick={copy}
      className="rounded-xl border border-black/10 px-4 py-2.5 text-[14px] font-medium text-charcoal transition hover:border-black/25"
    >
      {copied ? "Copied ✓" : `Copy ${emails.length} emails`}
    </button>
  );
}
