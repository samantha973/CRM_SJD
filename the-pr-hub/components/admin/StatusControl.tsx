"use client";

import { useActionState, useEffect, useState } from "react";
import { updateContactStatus, type ActionState } from "@/app/admin/actions";
import { CONTACT_STATUSES, contactStatusLabel } from "@/lib/constants";

const initial: ActionState = {};

/**
 * Inline pipeline control for a single inquiry. Pick a new stage, optionally
 * add a note, and Update — the server action moves the stage and writes the
 * activity_log row.
 */
export default function StatusControl({
  contactId,
  current,
}: {
  contactId: string;
  current: string;
}) {
  const [state, formAction, pending] = useActionState(
    updateContactStatus,
    initial,
  );
  const [stage, setStage] = useState(current);
  const [saved, setSaved] = useState(false);

  // Flash a brief "Saved" once the action reports success.
  useEffect(() => {
    if (state.ok && !pending) {
      setSaved(true);
      const t = setTimeout(() => setSaved(false), 1800);
      return () => clearTimeout(t);
    }
  }, [state.ok, pending]);

  const dirty = stage !== current;

  return (
    <form action={formAction} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="contact_id" value={contactId} />
      <label className="sr-only" htmlFor={`stage-${contactId}`}>
        Pipeline stage
      </label>
      <select
        id={`stage-${contactId}`}
        name="to_status"
        value={stage}
        onChange={(e) => setStage(e.target.value)}
        className="rounded-lg border border-black/10 bg-white px-3 py-1.5 text-[13px] font-medium text-ink outline-none focus:border-mint focus:ring-2 focus:ring-mint/40"
      >
        {CONTACT_STATUSES.map((s) => (
          <option key={s} value={s}>
            {contactStatusLabel(s)}
          </option>
        ))}
      </select>
      <input
        type="text"
        name="note"
        placeholder="Add a note (optional)"
        className="min-w-[180px] flex-1 rounded-lg border border-black/10 bg-white px-3 py-1.5 text-[13px] text-ink placeholder-black/30 outline-none focus:border-mint focus:ring-2 focus:ring-mint/40"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-ink px-3.5 py-1.5 text-[13px] font-medium text-white transition hover:bg-charcoal disabled:opacity-50"
      >
        {pending ? "Saving…" : dirty ? "Move stage" : "Log note"}
      </button>
      {saved && <span className="text-[12px] font-medium text-green-600">Saved ✓</span>}
      {state.error && (
        <span className="text-[12px] font-medium text-red-600">{state.error}</span>
      )}
    </form>
  );
}
