/**
 * Hardcoded list of common dynamic-QR, tracking-QR, and shortener domains.
 * Not exhaustive — flags known offenders and generic shortener patterns so
 * non-technical users can spot intermediate hops.
 */
const EXACT_HOSTS = new Set(
  [
    // Generic shorteners
    "bit.ly",
    "bitly.com",
    "tinyurl.com",
    "t.co",
    "goo.gl",
    "ow.ly",
    "buff.ly",
    "is.gd",
    "v.gd",
    "tiny.cc",
    "cutt.ly",
    "rebrand.ly",
    "shorturl.at",
    "rb.gy",
    "t.ly",
    "bl.ink",
    "short.io",
    "short.cm",
    "s.id",
    "lnkd.in",
    "amzn.to",
    "youtu.be",
    "trib.al",
    "soo.gd",
    "clicky.me",
    "bc.vc",
    "adf.ly",
    "shorte.st",
    "clk.ink",
    // Dynamic / marketing QR platforms (common intermediate domains)
    "qrco.de",
    "me-qr.com",
    "meqr.net",
    "uqr.to",
    "qr1.be",
    "qrs.ly",
    "q-r.to",
    "qr.io",
    "qrlink.to",
    "qr.codes",
    "qrcode.tw",
    "qr-code-styling.com",
    "unitag.io",
    "beaconstac.com",
    "flowcode.com",
    "qrstuff.com",
    "the-qrcode-generator.com",
    "qr-code-generator.com",
    "qrcode-monkey.com",
    "qrcode.tec-it.com",
    "scanova.io",
    "scanova.com",
    "visualead.com",
    "kaywa.com",
    "qrly.io",
    "qrly.com",
    "qrd.by",
    "qrd.by.com",
    "goqr.me",
    "api.qrserver.com",
    "chart.googleapis.com",
    "quickchart.io",
    "li.sten.to",
    "linktr.ee",
    "bio.link",
    "campsite.bio",
    "beacons.ai",
    "tap.bio",
    // Tracking / marketing redirectors often used with QR
    "onelink.me",
    "app.link",
    "smart.link",
    "adjust.com",
    "adj.st",
    "branch.io",
    "app.adjust.com",
    "clickmeter.com",
    "geni.us",
    "smarturl.it",
    "lnk.to",
    "ffm.to",
  ].map((h) => h.toLowerCase()),
);

/** Host suffixes that almost always indicate a shortener / tracking hop. */
const SUSPICIOUS_SUFFIXES = [
  ".page.link",
  ".app.link",
  ".adj.st",
  ".sng.link",
  ".onelink.me",
];

/** Path patterns that look like opaque short codes on otherwise unknown hosts. */
const SHORT_PATH = /^\/[A-Za-z0-9_-]{1,12}\/?$/;

export type UrlAnalysis = {
  isUrl: boolean;
  href: string | null;
  host: string | null;
  verdict: "direct" | "redirector" | "suspicious" | "not-url";
  reasons: string[];
  label: string;
  detail: string;
};

function stripWww(host: string): string {
  return host.replace(/^www\./i, "").toLowerCase();
}

function hostMatchesKnown(host: string): string | null {
  const h = stripWww(host);
  if (EXACT_HOSTS.has(h)) return h;
  // match subdomains of known hosts (e.g. m.bit.ly)
  for (const known of EXACT_HOSTS) {
    if (h.endsWith(`.${known}`)) return known;
  }
  return null;
}

export function looksLikeUrl(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  if (/^https?:\/\//i.test(t)) return true;
  if (/^[a-z0-9.-]+\.[a-z]{2,}([/:?#].*)?$/i.test(t) && !/\s/.test(t)) return true;
  return false;
}

export function parseAsUrl(text: string): URL | null {
  const t = text.trim();
  if (!t || /\s/.test(t)) return null;
  try {
    if (/^https?:\/\//i.test(t)) return new URL(t);
    if (/^[a-z0-9.-]+\.[a-z]{2,}([/:?#].*)?$/i.test(t)) return new URL(`https://${t}`);
  } catch {
    return null;
  }
  return null;
}

export function analysePayload(payload: string): UrlAnalysis {
  const trimmed = payload.trim();
  if (!trimmed) {
    return {
      isUrl: false,
      href: null,
      host: null,
      verdict: "not-url",
      reasons: [],
      label: "Empty",
      detail: "No payload was decoded.",
    };
  }

  const url = parseAsUrl(trimmed);
  if (!url) {
    return {
      isUrl: false,
      href: null,
      host: null,
      verdict: "not-url",
      reasons: ["Payload is plain text, not a URL."],
      label: "Direct text content",
      detail:
        "This QR encodes text directly (not a web link). That is a true static code — the full content is in the image.",
    };
  }

  const host = stripWww(url.hostname);
  const reasons: string[] = [];
  const known = hostMatchesKnown(host);

  if (known) {
    reasons.push(`Host “${host}” matches a known shortener or dynamic-QR / tracking domain (“${known}”).`);
  }

  for (const suffix of SUSPICIOUS_SUFFIXES) {
    if (host.endsWith(suffix) || host === suffix.slice(1)) {
      reasons.push(`Host ends with “${suffix}”, commonly used for mobile deep-link / tracking redirects.`);
    }
  }

  // Very short opaque paths on short hostnames often indicate redirectors
  if (
    !known &&
    host.split(".").length <= 3 &&
    host.length <= 14 &&
    SHORT_PATH.test(url.pathname) &&
    !url.search &&
    !url.hash
  ) {
    reasons.push(
      `Short hostname with an opaque path (“${url.pathname}”) often indicates a third-party redirector — verify the final destination before printing.`,
    );
  }

  if (reasons.length > 0 && known) {
    return {
      isUrl: true,
      href: url.href,
      host,
      verdict: "redirector",
      reasons,
      label: "Third-party redirector",
      detail:
        "This QR does not encode your final content directly. It points at an intermediate domain that can change the destination, show ads, require an app, or break later. Prefer a static code that encodes the real URL.",
    };
  }

  if (reasons.length > 0) {
    return {
      isUrl: true,
      href: url.href,
      host,
      verdict: "suspicious",
      reasons,
      label: "Possibly indirect",
      detail:
        "This looks like it may hop through a shortener or tracking layer. Open carefully and confirm the final page before trusting a print run.",
    };
  }

  return {
    isUrl: true,
    href: url.href,
    host,
    verdict: "direct",
    reasons: ["URL host is not on the known intermediary list."],
    label: "Likely direct URL",
    detail:
      "The payload appears to be a normal URL encoded directly in the code. Still open and confirm the page before a large print run — new redirector domains appear often.",
  };
}
