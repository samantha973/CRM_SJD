"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { addOrder, type ActionState } from "@/app/admin/actions";
import { ORDER_STATUSES, CURRENCIES, orderStatusLabel } from "@/lib/constants";

const initial: ActionState = {};

export default function AddOrderForm({ personId }: { personId: string }) {
  const [state, formAction, pending] = useActionState(addOrder, initial);
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  // Collapse + reset after a successful save.
  useEffect(() => {
    if (state.ok && !pending) {
      formRef.current?.reset();
      setOpen(false);
    }
  }, [state.ok, pending]);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg border border-black/10 px-3.5 py-1.5 text-[13px] font-medium text-charcoal transition hover:border-black/25"
      >
        + Add order
      </button>
    );
  }

  const inputClass =
    "w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-[13.5px] text-ink placeholder-black/30 outline-none focus:border-mint focus:ring-2 focus:ring-mint/40";

  return (
    <form
      ref={formRef}
      action={formAction}
      className="rounded-xl border border-black/10 bg-[#FAFAFA] p-4"
    >
      <input type="hidden" name="person_id" value={personId} />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="mb-1 block text-[12px] font-medium text-charcoal">
            What they bought
          </label>
          <input
            name="product_name"
            required
            className={inputClass}
            placeholder="e.g. 3-month PR retainer"
          />
        </div>
        <div>
          <label className="mb-1 block text-[12px] font-medium text-charcoal">Amount</label>
          <input
            name="amount"
            type="number"
            min="0"
            step="0.01"
            required
            className={inputClass}
            placeholder="0.00"
          />
        </div>
        <div>
          <label className="mb-1 block text-[12px] font-medium text-charcoal">Currency</label>
          <select name="currency" defaultValue="AUD" className={inputClass}>
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-[12px] font-medium text-charcoal">Status</label>
          <select name="status" defaultValue="pending" className={inputClass}>
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {orderStatusLabel(s)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {state.error && (
        <p className="mt-3 text-[12.5px] font-medium text-red-600">{state.error}</p>
      )}

      <div className="mt-4 flex items-center gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-ink px-3.5 py-1.5 text-[13px] font-medium text-white transition hover:bg-charcoal disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save order"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-lg px-3 py-1.5 text-[13px] font-medium text-charcoal/60 transition hover:text-ink"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
