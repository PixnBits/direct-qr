import { QrCode, ShieldCheck } from "lucide-react";

const links = [
  { href: "#generate", label: "Generate" },
  { href: "#validate", label: "Validate" },
  { href: "#learn", label: "Why it matters" },
  { href: "#privacy", label: "Privacy" },
];

export function Header() {
  return (
    <header className="border-b border-border bg-bg-elevated/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <a href="#top" className="group flex items-center gap-2.5 no-underline">
          <span className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-bg text-fg transition-colors group-hover:border-border-strong">
            <QrCode className="h-4 w-4" aria-hidden />
          </span>
          <span className="flex flex-col">
            <span className="font-display text-lg font-semibold leading-none tracking-tight text-fg">
              Direct QR
            </span>
            <span className="mt-0.5 text-xs text-fg-subtle">Static codes only</span>
          </span>
        </a>

        <nav aria-label="Primary" className="flex flex-wrap items-center gap-1 sm:gap-2">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-md px-2.5 py-2 text-sm font-medium text-fg-muted no-underline transition-colors hover:bg-bg-subtle hover:text-fg"
            >
              {link.label}
            </a>
          ))}
          <span className="ml-1 hidden items-center gap-1.5 rounded-full border border-accent/20 bg-accent-soft px-2.5 py-1 text-xs font-medium text-accent sm:inline-flex">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
            Runs offline in your browser
          </span>
        </nav>
      </div>
    </header>
  );
}
