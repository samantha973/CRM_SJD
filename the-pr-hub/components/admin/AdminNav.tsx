"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/app/admin/actions";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/inbox", label: "Inbox" },
  { href: "/admin/people", label: "People" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/newsletter", label: "Newsletter" },
];

export default function AdminNav({ email }: { email: string }) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/admin"
      ? pathname === "/admin"
      : pathname === href || pathname.startsWith(href + "/");

  return (
    <header className="sticky top-0 z-20 border-b border-black/[0.06] bg-white/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
        <div className="flex items-center gap-7">
          <Link href="/admin" className="flex items-center gap-2.5">
            <span className="inline-block h-3 w-3 rounded-full bg-mint" />
            <span className="text-[15px] font-semibold tracking-tight text-ink">
              The PR Hub
            </span>
          </Link>
          <nav className="flex items-center gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-full px-3.5 py-1.5 text-[13.5px] font-medium transition ${
                  isActive(l.href)
                    ? "bg-ink text-white"
                    : "text-charcoal/70 hover:bg-black/[0.04] hover:text-ink"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden text-[13px] text-charcoal/50 sm:inline">{email}</span>
          <form action={signOut}>
            <button className="rounded-full border border-black/10 px-3.5 py-1.5 text-[13px] font-medium text-charcoal transition hover:border-black/25">
              Sign out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
