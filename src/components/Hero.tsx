import { ArrowRight, Ban, Link2Off } from "lucide-react";

export function Hero() {
  return (
    <section className="border-b border-border bg-bg" id="top">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:py-20">
        <div>
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.14em] text-fg-subtle">
            Free · Open source · No account
          </p>
          <h1 className="font-display text-[2rem] font-semibold leading-[1.15] tracking-tight text-fg sm:text-4xl lg:text-[2.75rem]">
            QR codes that encode your content — not someone else’s domain
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-fg-muted sm:text-lg">
            Many free generators create codes that point at{" "}
            <strong className="font-medium text-fg">their</strong> intermediate
            links. Later those links can demand accounts, show ads, force app
            downloads, or simply break. Direct QR only ever builds{" "}
            <strong className="font-medium text-fg">true static</strong> codes
            where the full payload lives in the image.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a
              href="#generate"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-medium text-primary-fg no-underline transition-opacity hover:opacity-90"
            >
              Create a static code
              <ArrowRight className="h-4 w-4" aria-hidden />
            </a>
            <a
              href="#validate"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-border bg-bg-elevated px-5 text-sm font-medium text-fg no-underline transition-colors hover:bg-bg-subtle"
            >
              Check an existing code
            </a>
          </div>
        </div>

        <aside className="rounded-2xl border border-border bg-bg-elevated p-5 shadow-panel sm:p-6">
          <h2 className="text-sm font-semibold text-fg">What “static” means</h2>
          <ul className="mt-4 space-y-3 text-sm text-fg-muted">
            <li className="flex gap-3">
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-ok-soft text-ok">
                <Link2Off className="h-3.5 w-3.5" aria-hidden />
              </span>
              <span>
                <strong className="font-medium text-fg">Direct payload.</strong>{" "}
                Your URL or text is written into the black-and-white modules.
                Scanners open it without a middle hop.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-danger-soft text-danger">
                <Ban className="h-3.5 w-3.5" aria-hidden />
              </span>
              <span>
                <strong className="font-medium text-fg">Not dynamic QR.</strong>{" "}
                Dynamic codes encode a vendor short link. The vendor can change
                the destination — or take it away.
              </span>
            </li>
          </ul>
          <p className="mt-5 border-t border-border pt-4 text-xs leading-relaxed text-fg-subtle">
            Everything on this page runs in your browser. Your payload is never
            uploaded to a server.
          </p>
        </aside>
      </div>
    </section>
  );
}
