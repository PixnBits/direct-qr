export function Footer() {
  return (
    <footer className="border-t border-border bg-bg-elevated">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-fg-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <p className="font-display text-base font-semibold text-fg">Direct QR</p>
          <p className="mt-1 text-xs text-fg-subtle">
            MIT License · Client-side only · No intermediate domains
          </p>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
          <a
            href="https://github.com/PixnBits/direct-qr"
            className="text-fg-muted no-underline transition-colors hover:text-fg"
            target="_blank"
            rel="noopener noreferrer"
          >
            Source on GitHub
          </a>
          <a href="#privacy" className="text-fg-muted no-underline transition-colors hover:text-fg">
            Privacy
          </a>
          <a href="#learn" className="text-fg-muted no-underline transition-colors hover:text-fg">
            Learn
          </a>
        </div>
      </div>
    </footer>
  );
}
