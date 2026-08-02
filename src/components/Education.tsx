import { BookOpen, Printer, Shield } from "lucide-react";
import { Panel, SectionHeading } from "./ui";

export function Education() {
  return (
    <div className="space-y-6">
      <Panel id="learn">
        <SectionHeading
          eyebrow="Why this exists"
          title="Static vs dynamic QR codes"
          description="Plain language for publishers who have already been burned by codes that later demanded accounts or apps."
        />

        <div className="grid gap-4 md:grid-cols-2">
          <article className="rounded-xl border border-border bg-bg-subtle p-5">
            <div className="flex items-center gap-2 text-accent">
              <Shield className="h-4 w-4" aria-hidden />
              <h3 className="text-sm font-semibold text-fg">Static (what you want)</h3>
            </div>
            <ul className="mt-3 space-y-2 text-sm leading-relaxed text-fg-muted">
              <li>The QR image itself contains the full URL or text.</li>
              <li>No account, subscription, or vendor needed after you generate it.</li>
              <li>Works forever as long as the destination still exists.</li>
              <li>You can verify the payload by decoding the image offline.</li>
            </ul>
          </article>

          <article className="rounded-xl border border-border bg-bg-subtle p-5">
            <div className="flex items-center gap-2 text-danger">
              <BookOpen className="h-4 w-4" aria-hidden />
              <h3 className="text-sm font-semibold text-fg">Dynamic (the common trap)</h3>
            </div>
            <ul className="mt-3 space-y-2 text-sm leading-relaxed text-fg-muted">
              <li>The QR encodes a short link on the generator’s domain.</li>
              <li>That company can change the destination, insert ads, or require login.</li>
              <li>If they shut down or paywall the service, printed materials break.</li>
              <li>“Free” tiers often expire; analytics dashboards are the product.</li>
            </ul>
          </article>
        </div>

        <div className="mt-6 rounded-xl border border-border bg-bg p-5">
          <h3 className="text-sm font-semibold text-fg">Who this is for</h3>
          <p className="mt-2 text-sm leading-relaxed text-fg-muted">
            Non-technical publishers — café menus, event posters, museum labels, packaging,
            church bulletins, classroom handouts — anyone who needs a code that still works next
            year without renewing a SaaS plan. If you need click analytics, use a short link you
            control (your own domain) and encode <em>that</em> as a static QR.
          </p>
        </div>
      </Panel>

      <Panel id="print">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border bg-bg-subtle text-fg">
            <Printer className="h-4 w-4" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <SectionHeading
              eyebrow="Print guidance"
              title="Make codes that phones can actually scan"
              description="A beautiful poster is useless if the camera cannot lock onto the modules."
            />
          </div>
        </div>

        <dl className="grid gap-4 sm:grid-cols-2">
          {[
            {
              t: "Minimum physical size",
              d: "For short URLs, aim for at least 2 × 2 cm (about 0.8 in) of code, not counting quiet zone. Longer payloads need larger codes. Outdoor or distance scanning: 5 cm+ is safer.",
            },
            {
              t: "Quiet zone",
              d: "Keep a clear margin of empty background around the code — at least four modules, more if the design is busy. Never crop to the edge of the black squares.",
            },
            {
              t: "Contrast",
              d: "Dark modules on a light, solid background. Avoid photos, gradients, or low-contrast greys behind the code. Do not invert unless you have tested thoroughly.",
            },
            {
              t: "Scanning distance",
              d: "Rule of thumb: code width ≈ scanning distance ÷ 10. A 3 cm code is comfortable at arm’s length; wall posters viewed from a metre need larger codes.",
            },
            {
              t: "Test on real phones",
              d: "Before a print run, scan with at least two devices (iOS and Android if you can). Test the printed proof, not only the screen preview.",
            },
            {
              t: "Material & finish",
              d: "Glossy laminate can glare under lights. Prefer matte finishes for menus and window stickers. Keep codes flat — wrinkles and curves break finder patterns.",
            },
          ].map((item) => (
            <div
              key={item.t}
              className="rounded-lg border border-border bg-bg-subtle px-4 py-3"
            >
              <dt className="text-sm font-medium text-fg">{item.t}</dt>
              <dd className="mt-1.5 text-sm leading-relaxed text-fg-muted">{item.d}</dd>
            </div>
          ))}
        </dl>
      </Panel>

      <Panel id="privacy">
        <SectionHeading
          eyebrow="Privacy"
          title="Everything stays in your browser"
          description="Direct QR is a static website. Generation and decoding use client-side libraries only."
        />
        <ul className="space-y-2 text-sm leading-relaxed text-fg-muted">
          <li>
            <strong className="font-medium text-fg">No server storage of payloads.</strong> Your
            URLs and text are not sent to an API to create the code.
          </li>
          <li>
            <strong className="font-medium text-fg">No accounts.</strong> There is nothing to sign
            up for, and nothing that can later paywall your codes.
          </li>
          <li>
            <strong className="font-medium text-fg">Downloads are local.</strong> PNG and SVG files
            are produced on your device.
          </li>
          <li>
            <strong className="font-medium text-fg">Validator images stay local.</strong> Uploaded
            or pasted images are read in memory for decoding and are not uploaded.
          </li>
          <li>
            <strong className="font-medium text-fg">Open source.</strong> Inspect the code, run it
            offline, or host your own copy on GitHub Pages.
          </li>
        </ul>
        <p className="mt-4 text-xs leading-relaxed text-fg-subtle">
          Note: if you host this site behind a typical web server, standard access logs may record
          that someone loaded the page — but not the QR payloads they type. Self-host or open the
          built files offline for maximum privacy.
        </p>
      </Panel>
    </div>
  );
}
