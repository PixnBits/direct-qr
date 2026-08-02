import { useCallback, useEffect, useId, useMemo, useState } from "react";
import {
  AlertTriangle,
  Check,
  Copy,
  Download,
  ImagePlus,
  Info,
  Trash2,
} from "lucide-react";
import { assessCapacity } from "@/lib/capacity";
import { contrastRatio, isLowContrast, normalizeHex } from "@/lib/contrast";
import {
  downloadDataUrl,
  downloadText,
  generateQrDataUrl,
  generateQrSvg,
  type ErrorCorrectionLevel,
} from "@/lib/qr-generate";
import { Button, Callout, Input, Label, Panel, SectionHeading, Select, Textarea } from "./ui";

const EC_LEVELS: { value: ErrorCorrectionLevel; label: string; hint: string }[] = [
  { value: "L", label: "L (~7%)", hint: "Smallest code; least damage tolerance" },
  { value: "M", label: "M (~15%)", hint: "Balanced default for print" },
  { value: "Q", label: "Q (~25%)", hint: "Safer when codes get scuffed" },
  { value: "H", label: "H (~30%)", hint: "Best with logos or rough surfaces" },
];

const SIZES = [
  { value: 256, label: "256 px — screen preview" },
  { value: 512, label: "512 px — web / slides" },
  { value: 1024, label: "1024 px — general print" },
  { value: 2048, label: "2048 px — large print / posters" },
];

export function Generator() {
  const baseId = useId();
  const [payload, setPayload] = useState("https://example.com/your-real-page");
  const [ecLevel, setEcLevel] = useState<ErrorCorrectionLevel>("M");
  const [fg, setFg] = useState("#1a1c1e");
  const [bg, setBg] = useState("#ffffff");
  const [margin, setMargin] = useState(4);
  const [size, setSize] = useState(512);
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);
  const [logoName, setLogoName] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const exactPayload = payload; // what is encoded — shown verbatim
  const capacity = useMemo(() => assessCapacity(exactPayload, ecLevel), [exactPayload, ecLevel]);
  const contrast = useMemo(() => contrastRatio(fg, bg), [fg, bg]);
  const lowContrast = isLowContrast(fg, bg, 4.5);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setBusy(true);
      setError(null);
      try {
        const url = await generateQrDataUrl({
          payload: exactPayload,
          errorCorrectionLevel: logoDataUrl && ecLevel === "L" ? "M" : ecLevel,
          foreground: normalizeHex(fg),
          background: normalizeHex(bg),
          margin,
          size: Math.min(size, 640), // live preview capped for speed
          logoDataUrl,
        });
        if (!cancelled) setPreviewUrl(url);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Could not generate QR code.");
          setPreviewUrl("");
        }
      } finally {
        if (!cancelled) setBusy(false);
      }
    };
    const t = window.setTimeout(run, 80);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [exactPayload, ecLevel, fg, bg, margin, size, logoDataUrl]);

  const onLogo = useCallback((file: File | null) => {
    if (!file) {
      setLogoDataUrl(null);
      setLogoName(null);
      return;
    }
    if (!file.type.startsWith("image/")) {
      setError("Logo must be an image file (PNG or SVG preferred).");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setLogoDataUrl(String(reader.result));
      setLogoName(file.name);
      if (ecLevel === "L") setEcLevel("H");
    };
    reader.readAsDataURL(file);
  }, [ecLevel]);

  const downloadPng = async () => {
    if (!exactPayload) return;
    try {
      const url = await generateQrDataUrl({
        payload: exactPayload,
        errorCorrectionLevel: ecLevel,
        foreground: normalizeHex(fg),
        background: normalizeHex(bg),
        margin,
        size,
        logoDataUrl,
      });
      downloadDataUrl(url, "direct-qr.png");
    } catch (e) {
      setError(e instanceof Error ? e.message : "PNG export failed.");
    }
  };

  const downloadSvg = async () => {
    if (!exactPayload) return;
    try {
      const svg = await generateQrSvg({
        payload: exactPayload,
        errorCorrectionLevel: ecLevel,
        foreground: normalizeHex(fg),
        background: normalizeHex(bg),
        margin,
        size,
        logoDataUrl,
      });
      downloadText(svg, "direct-qr.svg", "image/svg+xml");
    } catch (e) {
      setError(e instanceof Error ? e.message : "SVG export failed.");
    }
  };

  const copyPayload = async () => {
    try {
      await navigator.clipboard.writeText(exactPayload);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setError("Could not copy to clipboard.");
    }
  };

  return (
    <Panel id="generate">
      <SectionHeading
        eyebrow="Generator"
        title="Create a true static QR code"
        description="Type a URL or any text. The live preview encodes exactly what you see below — nothing is shortened, stored, or redirected."
      />

      <div className="grid gap-8 lg:grid-cols-[1fr_minmax(240px,320px)]">
        <div className="space-y-5">
          <div>
            <Label htmlFor={`${baseId}-payload`}>Payload (URL or text)</Label>
            <Textarea
              id={`${baseId}-payload`}
              value={payload}
              onChange={(e) => setPayload(e.target.value)}
              spellCheck={false}
              placeholder="https://yoursite.com/page"
              className="mt-1.5 font-mono text-[0.8125rem] leading-relaxed"
              aria-describedby={`${baseId}-payload-help`}
            />
            <p id={`${baseId}-payload-help`} className="mt-1.5 text-xs text-fg-subtle">
              Use your real, final URL. Do not paste a short link from another QR service.
            </p>
          </div>

          <div className="rounded-lg border border-border bg-bg-subtle p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-medium uppercase tracking-[0.1em] text-fg-subtle">
                Exact string encoded
              </p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={copyPayload}
                disabled={!exactPayload}
                aria-label="Copy exact payload"
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
            <pre className="mt-2 max-h-28 overflow-auto whitespace-pre-wrap break-all font-mono text-xs leading-relaxed text-fg">
              {exactPayload || <span className="text-fg-subtle">(empty)</span>}
            </pre>
            <p className="mt-2 text-xs text-fg-muted">
              {exactPayload
                ? `${new TextEncoder().encode(exactPayload).length} bytes · ${exactPayload.length} characters`
                : "Enter content to generate a code."}
            </p>
          </div>

          {capacity.level !== "ok" && capacity.message ? (
            <Callout
              tone={capacity.level === "likely-too-long" ? "danger" : "warn"}
              title={
                capacity.level === "likely-too-long"
                  ? "Payload may be too long"
                  : "Dense code warning"
              }
            >
              {capacity.message}
            </Callout>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor={`${baseId}-ec`}>Error correction</Label>
              <Select
                id={`${baseId}-ec`}
                className="mt-1.5"
                value={ecLevel}
                onChange={(e) => setEcLevel(e.target.value as ErrorCorrectionLevel)}
              >
                {EC_LEVELS.map((l) => (
                  <option key={l.value} value={l.value}>
                    {l.label}
                  </option>
                ))}
              </Select>
              <p className="mt-1.5 text-xs text-fg-subtle">
                {EC_LEVELS.find((l) => l.value === ecLevel)?.hint}
              </p>
            </div>

            <div>
              <Label htmlFor={`${baseId}-size`}>Export resolution</Label>
              <Select
                id={`${baseId}-size`}
                className="mt-1.5"
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
              >
                {SIZES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </Select>
              <p className="mt-1.5 text-xs text-fg-subtle">
                Higher resolution for print. Vector SVG is resolution-independent when no logo is used.
              </p>
            </div>

            <div>
              <Label htmlFor={`${baseId}-fg`}>Foreground</Label>
              <div className="mt-1.5 flex gap-2">
                <input
                  type="color"
                  id={`${baseId}-fg`}
                  value={normalizeHex(fg)}
                  onChange={(e) => setFg(e.target.value)}
                  className="h-11 w-12 shrink-0 cursor-pointer rounded-md border border-border bg-bg-elevated p-1"
                  aria-label="Foreground colour"
                />
                <Input
                  value={fg}
                  onChange={(e) => setFg(e.target.value)}
                  spellCheck={false}
                  className="font-mono"
                  aria-label="Foreground colour hex"
                />
              </div>
            </div>

            <div>
              <Label htmlFor={`${baseId}-bg`}>Background</Label>
              <div className="mt-1.5 flex gap-2">
                <input
                  type="color"
                  id={`${baseId}-bg`}
                  value={normalizeHex(bg)}
                  onChange={(e) => setBg(e.target.value)}
                  className="h-11 w-12 shrink-0 cursor-pointer rounded-md border border-border bg-bg-elevated p-1"
                  aria-label="Background colour"
                />
                <Input
                  value={bg}
                  onChange={(e) => setBg(e.target.value)}
                  spellCheck={false}
                  className="font-mono"
                  aria-label="Background colour hex"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <Label htmlFor={`${baseId}-margin`}>
                Quiet zone (margin): {margin} modules
              </Label>
              <input
                id={`${baseId}-margin`}
                type="range"
                min={2}
                max={8}
                step={1}
                value={margin}
                onChange={(e) => setMargin(Number(e.target.value))}
                className="mt-2 w-full accent-fg"
              />
              <p className="mt-1.5 text-xs text-fg-subtle">
                Leave empty space around the code. Four modules is a safe print default.
              </p>
            </div>
          </div>

          {lowContrast ? (
            <Callout tone="warn" title="Low contrast">
              Contrast ratio is about {contrast.toFixed(1)}:1. Aim for at least 4.5:1 (dark on light
              works best). Light-grey codes on white paper often fail on phone cameras.
            </Callout>
          ) : (
            <p className="text-xs text-fg-subtle">
              Contrast ratio ≈ {contrast.toFixed(1)}:1 — good for most scanners.
            </p>
          )}

          <div className="rounded-lg border border-border p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-fg">Centre logo (optional)</p>
                <p className="mt-1 text-xs leading-relaxed text-fg-muted">
                  Logos cover modules and reduce effective error correction. Prefer error
                  correction H, keep the logo small, and always test on real phones.
                </p>
              </div>
              {logoDataUrl ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onLogo(null)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Remove
                </Button>
              ) : null}
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-md border border-border bg-bg-elevated px-3 text-sm font-medium text-fg transition-colors hover:bg-bg-subtle">
                <ImagePlus className="h-4 w-4" aria-hidden />
                {logoName ?? "Choose image"}
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(e) => onLogo(e.target.files?.[0] ?? null)}
                />
              </label>
              {logoDataUrl ? (
                <img
                  src={logoDataUrl}
                  alt="Logo preview"
                  className="h-10 w-10 rounded-md border border-border object-contain bg-bg"
                />
              ) : null}
            </div>
            {logoDataUrl ? (
              <Callout tone="warn" className="mt-3" title="Test before you print">
                A centre logo is a deliberate trade-off. Scan this code with several phones after
                you download it. If scans fail, remove the logo or raise error correction to H.
              </Callout>
            ) : null}
          </div>

          {error ? (
            <Callout tone="danger" title="Generation error">
              {error}
            </Callout>
          ) : null}
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-border bg-bg-subtle p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-medium uppercase tracking-[0.1em] text-fg-subtle">
                Live preview
              </p>
              {busy ? (
                <span className="text-xs text-fg-subtle">Updating…</span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs text-accent">
                  <Info className="h-3 w-3" aria-hidden />
                  Static
                </span>
              )}
            </div>
            <div className="mt-3 flex aspect-square items-center justify-center rounded-lg border border-border bg-bg-elevated p-3">
              {previewUrl && exactPayload ? (
                <img
                  src={previewUrl}
                  alt="QR code preview of the exact payload"
                  className="max-h-full max-w-full"
                  width={280}
                  height={280}
                />
              ) : (
                <p className="px-4 text-center text-sm text-fg-subtle">
                  Enter a payload to see a live static QR preview.
                </p>
              )}
            </div>
            <div className="mt-4 grid gap-2">
              <Button
                type="button"
                onClick={downloadPng}
                disabled={!exactPayload}
                className="w-full"
              >
                <Download className="h-4 w-4" />
                Download PNG ({size}px)
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={downloadSvg}
                disabled={!exactPayload}
                className="w-full"
              >
                <Download className="h-4 w-4" />
                Download SVG
              </Button>
            </div>
            <p className="mt-3 flex gap-2 text-xs leading-relaxed text-fg-muted">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warn" aria-hidden />
              After download, open the file and scan it yourself. Never print a code you have not
              tested on a phone.
            </p>
          </div>
        </div>
      </div>
    </Panel>
  );
}
