"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/**
 * Simple GET-style search box. Navigates to ?q=… so the server component
 * re-queries. Clearing the box returns to the unfiltered list.
 */
export default function SearchBar({
  action,
  initial = "",
  placeholder = "Search…",
}: {
  action: string;
  initial?: string;
  placeholder?: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState(initial);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const q = value.trim();
    router.push(q ? `${action}?q=${encodeURIComponent(q)}` : action);
  }

  return (
    <form onSubmit={submit} className="flex items-center gap-2">
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="w-full max-w-sm rounded-xl border border-black/10 bg-white px-4 py-2.5 text-[14px] text-ink placeholder-black/30 outline-none focus:border-mint focus:ring-2 focus:ring-mint/40"
      />
      <button
        type="submit"
        className="rounded-xl border border-black/10 px-4 py-2.5 text-[14px] font-medium text-charcoal transition hover:border-black/25"
      >
        Search
      </button>
    </form>
  );
}
