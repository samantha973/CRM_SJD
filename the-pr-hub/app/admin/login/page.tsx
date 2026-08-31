"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { signIn, type LoginState } from "./actions";

const initial: LoginState = {};

function LoginForm() {
  const [state, formAction, pending] = useActionState(signIn, initial);
  const params = useSearchParams();
  const next = params.get("next") || "/admin";

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      <div>
        <label className="mb-1.5 block text-[13px] font-medium text-charcoal" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-[15px] outline-none focus:border-mint focus:ring-2 focus:ring-mint/40"
          placeholder="you@theprhub.com.au"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-[13px] font-medium text-charcoal" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-[15px] outline-none focus:border-mint focus:ring-2 focus:ring-mint/40"
          placeholder="••••••••"
        />
      </div>

      {state.error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[14px] text-red-700">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex w-full items-center justify-center rounded-xl bg-ink px-6 py-3.5 text-[15px] font-medium text-white transition hover:bg-charcoal disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex items-center justify-center gap-2.5">
            <span className="inline-block h-3 w-3 rounded-full bg-mint" />
            <span className="text-[17px] font-semibold tracking-tight text-ink">
              The PR Hub
            </span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">Admin sign in</h1>
          <p className="mt-1.5 text-[14px] text-charcoal/60">Access the leads dashboard.</p>
        </div>
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
