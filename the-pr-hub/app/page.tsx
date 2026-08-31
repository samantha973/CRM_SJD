import ContactForm from "@/components/ContactForm";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Nav */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2.5">
          <span className="inline-block h-3 w-3 rounded-full bg-mint" />
          <span className="text-[17px] font-semibold tracking-tight text-ink">
            The PR Hub
          </span>
        </div>
        <a
          href="#enquire"
          className="rounded-full border border-black/10 px-4 py-2 text-[14px] font-medium text-charcoal transition hover:border-black/25"
        >
          Enquire
        </a>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-3xl px-6 pb-8 pt-16 text-center sm:pt-24">
        <p className="mb-5 inline-block rounded-full bg-mint/15 px-3.5 py-1.5 text-[13px] font-medium text-charcoal">
          Strategic PR & corporate communications
        </p>
        <h1 className="text-4xl font-semibold leading-[1.1] tracking-tight text-ink sm:text-6xl">
          We make founders and their businesses{" "}
          <span className="text-charcoal">famous</span>.
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-[17px] leading-relaxed text-charcoal/70">
          For founder-led, high-growth technology-enabled businesses. We turn
          commercial performance, leadership expertise and company milestones into
          external credibility — the kind that wins confidence from customers,
          partners, talent and investors.
        </p>
      </section>

      {/* Enquiry */}
      <section id="enquire" className="mx-auto max-w-2xl px-6 pb-24 pt-10">
        <div className="rounded-3xl border border-black/[0.07] bg-white p-8 shadow-[0_1px_40px_-12px_rgba(0,0,0,0.12)] sm:p-10">
          <h2 className="text-2xl font-semibold tracking-tight text-ink">
            Start a conversation
          </h2>
          <p className="mt-2 text-[15px] leading-relaxed text-charcoal/70">
            Tell us a little about your business. Every enquiry reaches the team
            directly — we&apos;ll get back to you shortly.
          </p>
          <div className="mt-8">
            <ContactForm />
          </div>
        </div>
      </section>

      <footer className="border-t border-black/5 py-8">
        <p className="text-center text-[13px] text-charcoal/50">
          © {new Date().getFullYear()} The PR Hub · theprhub.com.au
        </p>
      </footer>
    </main>
  );
}
