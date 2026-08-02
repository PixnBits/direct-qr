import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors duration-150 disabled:pointer-events-none disabled:opacity-45",
        size === "sm" && "min-h-9 px-3 text-sm",
        size === "md" && "min-h-11 px-4 text-sm",
        size === "lg" && "min-h-12 px-5 text-base",
        variant === "primary" && "bg-primary text-primary-fg hover:bg-fg/90",
        variant === "secondary" &&
          "border border-border bg-bg-elevated text-fg hover:bg-bg-subtle",
        variant === "ghost" && "text-fg-muted hover:bg-bg-subtle hover:text-fg",
        variant === "danger" && "bg-danger text-primary-fg hover:opacity-90",
        className,
      )}
      {...props}
    />
  );
}

export function Label({
  className,
  children,
  htmlFor,
}: {
  className?: string;
  children: ReactNode;
  htmlFor?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn("block text-sm font-medium text-fg", className)}
    >
      {children}
    </label>
  );
}

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "min-h-11 w-full rounded-md border border-border bg-bg-elevated px-3 text-sm text-fg placeholder:text-fg-subtle transition-colors focus:border-border-strong",
        className,
      )}
      {...props}
    />
  );
}

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-28 w-full resize-y rounded-md border border-border bg-bg-elevated px-3 py-2.5 text-sm text-fg placeholder:text-fg-subtle transition-colors focus:border-border-strong",
        className,
      )}
      {...props}
    />
  );
}

export function Select({
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "min-h-11 w-full appearance-none rounded-md border border-border bg-bg-elevated px-3 text-sm text-fg transition-colors focus:border-border-strong",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export function Panel({
  className,
  children,
  id,
}: {
  className?: string;
  children: ReactNode;
  id?: string;
}) {
  return (
    <section
      id={id}
      className={cn(
        "rounded-2xl border border-border bg-bg-elevated p-5 shadow-panel sm:p-6 md:p-8",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function Callout({
  tone = "neutral",
  title,
  children,
  className,
}: {
  tone?: "neutral" | "ok" | "warn" | "danger" | "accent";
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      role="status"
      className={cn(
        "rounded-lg border px-3.5 py-3 text-sm leading-relaxed",
        tone === "neutral" && "border-border bg-bg-subtle text-fg-muted",
        tone === "ok" && "border-accent/25 bg-ok-soft text-ok",
        tone === "warn" && "border-warn/30 bg-warn-soft text-warn",
        tone === "danger" && "border-danger/30 bg-danger-soft text-danger",
        tone === "accent" && "border-accent/25 bg-accent-soft text-accent",
        className,
      )}
    >
      {title ? <p className="mb-1 font-medium text-inherit">{title}</p> : null}
      <div className="text-inherit/95">{children}</div>
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-6 max-w-2xl">
      {eyebrow ? (
        <p className="mb-2 text-xs font-medium uppercase tracking-[0.12em] text-fg-subtle">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="font-display text-2xl font-semibold tracking-tight text-fg sm:text-[1.75rem]">
        {title}
      </h2>
      {description ? (
        <p className="mt-2 text-sm leading-relaxed text-fg-muted sm:text-[0.95rem]">
          {description}
        </p>
      ) : null}
    </div>
  );
}
