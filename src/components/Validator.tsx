import { useCallback, useId, useState } from "react";
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  ClipboardPaste,
  ExternalLink,
  FileUp,
  ImageIcon,
  ShieldAlert,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { analysePayload, type UrlAnalysis } from "@/lib/intermediaries";
import { decodeQrFromBlob, decodeQrFromFile } from "@/lib/qr-decode";
import { Button, Callout, Panel, SectionHeading } from "./ui";
import { cn } from "@/lib/cn";

type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | {
      status: "done";
      payload: string;
      analysis: UrlAnalysis;
      imageName?: string;
    };

export function Validator() {
  const libraryId = useId();
  const cameraId = useId();
  const [dragOver, setDragOver] = useState(false);
  const [state, setState] = useState<State>({ status: "idle" });
  const [preview, setPreview] = useState<string | null>(null);

  const processFile = useCallback(async (file: File) => {
    setState({ status: "loading" });
    setPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });

    try {
      const result = await decodeQrFromFile(file);
      if (!result.ok) {
        setState({ status: "error", message: result.error });
        return;
      }
      setState({
        status: "done",
        payload: result.data,
        analysis: analysePayload(result.data),
        imageName: file.name,
      });
    } catch (e) {
      setState({
        status: "error",
        message: e instanceof Error ? e.message : "Decode failed.",
      });
    }
  }, []);

  const onFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      // Reset so the same file can be re-selected after a failed decode
      e.target.value = "";
      if (f) void processFile(f);
    },
    [processFile],
  );

  const onPaste = useCallback(async () => {
    setState({ status: "loading" });
    try {
      if (!navigator.clipboard?.read) {
        setState({
          status: "error",
          message:
            "Clipboard image paste is not available in this browser. Use Take photo or Choose image instead.",
        });
        return;
      }
      const items = await navigator.clipboard.read();
      for (const item of items) {
        const type = item.types.find((t) => t.startsWith("image/"));
        if (!type) continue;
        const blob = await item.getType(type);
        const file = new File([blob], "clipboard-image.png", { type: blob.type });
        await processFile(file);
        return;
      }
      setState({
        status: "error",
        message: "No image found on the clipboard. Copy a QR screenshot first, then try again.",
      });
    } catch {
      setState({
        status: "error",
        message:
          "Could not read the clipboard. Your browser may require a secure context or an explicit permission grant.",
      });
    }
  }, [processFile]);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file) void processFile(file);
    },
    [processFile],
  );

  return (
    <Panel id="validate">
      <SectionHeading
        eyebrow="Validator"
        title="Decode a QR and inspect the real payload"
        description="Upload, photograph, or paste a QR image. Decoding happens entirely in your browser. If the payload is a URL, we check it against a list of common intermediary and shortener domains."
      />

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={cn(
          "rounded-xl border border-dashed p-6 transition-colors sm:p-8",
          dragOver
            ? "border-accent bg-accent-soft/60"
            : "border-border-strong bg-bg-subtle",
        )}
      >
        <div className="flex flex-col items-center text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-lg border border-border bg-bg-elevated text-fg">
            <FileUp className="h-5 w-5" aria-hidden />
          </span>
          <p className="mt-3 text-sm font-medium text-fg">
            Drop a QR image, take a photo, or choose a file
          </p>
          <p className="mt-1 max-w-md text-xs text-fg-muted">
            PNG, JPEG, or WebP. On a phone, use Take photo to open the camera, or Choose image for
            your library. Crop tightly around the code for best results.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {/*
              Two separate inputs: capture=environment nudges Android/iOS to open the
              rear camera; the library input omits capture so the full system picker
              (Photos / Files / sometimes Camera) still appears.
            */}
            <label
              htmlFor={cameraId}
              className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-fg transition-opacity hover:opacity-90"
            >
              <Camera className="h-4 w-4" aria-hidden />
              Take photo
              <input
                id={cameraId}
                type="file"
                accept="image/*"
                capture="environment"
                className="sr-only"
                onChange={onFileChange}
              />
            </label>
            <label
              htmlFor={libraryId}
              className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-md border border-border bg-bg-elevated px-4 text-sm font-medium text-fg transition-colors hover:bg-bg-subtle"
            >
              <ImageIcon className="h-4 w-4" aria-hidden />
              Choose image
              <input
                id={libraryId}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={onFileChange}
              />
            </label>
            <Button type="button" variant="secondary" onClick={() => void onPaste()}>
              <ClipboardPaste className="h-4 w-4" />
              Paste from clipboard
            </Button>
          </div>
          <p className="mt-3 max-w-md text-xs leading-relaxed text-fg-subtle">
            Phones: <strong className="font-medium text-fg-muted">Take photo</strong> prefers the
            rear camera. <strong className="font-medium text-fg-muted">Choose image</strong> opens
            Photos or Files (many devices also list Camera there). Desktop browsers may offer a
            webcam when you use Take photo.
          </p>
        </div>
      </div>

      {state.status === "loading" ? (
        <p className="mt-4 text-sm text-fg-muted" role="status">
          Decoding in your browser…
        </p>
      ) : null}

      {state.status === "error" ? (
        <Callout tone="danger" className="mt-4" title="Could not decode">
          {state.message}
        </Callout>
      ) : null}

      {state.status === "done" ? (
        <div className="mt-6 grid gap-4 lg:grid-cols-[160px_1fr]">
          {preview ? (
            <div className="overflow-hidden rounded-lg border border-border bg-bg-elevated p-2">
              <img
                src={preview}
                alt={state.imageName ? `Uploaded: ${state.imageName}` : "Uploaded QR image"}
                className="h-auto w-full object-contain"
              />
            </div>
          ) : (
            <div />
          )}

          <div className="space-y-4">
            <VerdictCard analysis={state.analysis} />

            <div className="rounded-lg border border-border bg-bg-subtle p-3">
              <p className="text-xs font-medium uppercase tracking-[0.1em] text-fg-subtle">
                Raw payload
              </p>
              <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap break-all font-mono text-sm leading-relaxed text-fg">
                {state.payload}
              </pre>
            </div>

            {state.analysis.reasons.length > 0 ? (
              <ul className="list-disc space-y-1 pl-5 text-sm text-fg-muted">
                {state.analysis.reasons.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            ) : null}

            {state.analysis.href ? (
              <div className="flex flex-wrap items-center gap-3">
                <a
                  href={state.analysis.href}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-border bg-bg-elevated px-4 text-sm font-medium text-fg no-underline transition-colors hover:bg-bg-subtle"
                >
                  <ExternalLink className="h-4 w-4" aria-hidden />
                  Open link carefully
                </a>
                <p className="max-w-sm text-xs text-fg-subtle">
                  Opens in a new tab. Review the address bar before entering any information.
                </p>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {state.status === "idle" ? (
        <Callout tone="neutral" className="mt-4">
          Tip: if a free generator gave you a code, validate it here before printing posters or
          packaging. If the payload is a short link you do not control, treat it as a temporary
          rental — not a permanent asset.
        </Callout>
      ) : null}
    </Panel>
  );
}

function VerdictCard({ analysis }: { analysis: UrlAnalysis }) {
  const config = {
    direct: {
      tone: "ok" as const,
      icon: ShieldCheck,
      title: analysis.label,
    },
    redirector: {
      tone: "danger" as const,
      icon: XCircle,
      title: analysis.label,
    },
    suspicious: {
      tone: "warn" as const,
      icon: ShieldAlert,
      title: analysis.label,
    },
    "not-url": {
      tone: "accent" as const,
      icon: CheckCircle2,
      title: analysis.label,
    },
  }[analysis.verdict];

  const Icon = config.icon;

  return (
    <Callout tone={config.tone} title={config.title}>
      <div className="flex gap-2">
        <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
        <div>
          <p>{analysis.detail}</p>
          {analysis.host ? (
            <p className="mt-2 font-mono text-xs opacity-90">Host: {analysis.host}</p>
          ) : null}
          {analysis.verdict === "redirector" || analysis.verdict === "suspicious" ? (
            <p className="mt-2 flex items-start gap-1.5 text-xs">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
              Prefer regenerating with Direct QR using your final destination URL.
            </p>
          ) : null}
        </div>
      </div>
    </Callout>
  );
}
