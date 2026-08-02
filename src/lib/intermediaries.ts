/**
 * Hardcoded list of common dynamic-QR, tracking-QR, and shortener domains.
 * Not exhaustive — flags known offenders and generic shortener patterns so
 * non-technical users can spot intermediate hops.
 *
 * Detection layers (any match raises concern):
 *  1. Exact host / subdomain of a known intermediary
 *  2. Known tracking / deep-link suffixes
 *  3. Hostname patterns typical of free/dynamic QR SaaS
 *  4. Opaque short-code paths on short or QR-related hosts
 */
const EXACT_HOSTS = new Set(
  [
    // Generic URL shorteners
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
    "tiny.one",
    "shorturl.com",
    "short.link",
    "shorturl.io",
    "urlzs.com",
    "clck.ru",
    "vk.cc",
    "wa.me",
    "fb.me",
    "pin.it",
    "spoti.fi",
    "sptfy.com",
    "apple.co",
    "go.microsoft.com",
    "aka.ms",
    "msft.it",
    "g.co",
    "maps.app.goo.gl",

    // Dynamic / marketing QR platforms (common intermediate domains)
    "qrco.de",
    "me-qr.com",
    "meqr.net",
    "me-qr.net",
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
    "uniqode.com",
    "flowcode.com",
    "qrstuff.com",
    "the-qrcode-generator.com",
    "qr-code-generator.com",
    "qrcode-generator.com",
    "qrcode-monkey.com",
    "qrcode.tec-it.com",
    "tec-it.com",
    "scanova.io",
    "scanova.com",
    "visualead.com",
    "kaywa.com",
    "qrly.io",
    "qrly.com",
    "qrd.by",
    "goqr.me",
    "api.qrserver.com",
    "chart.googleapis.com",
    "quickchart.io",
    "generatorqr.com",
    "qr.generatorqr.com",
    "qrcode-tiger.com",
    "qrtiger.com",
    "qrcode-tiger.io",
    "qrplanet.com",
    "qr-planet.com",
    "qrlynx.com",
    "qrlynx.io",
    "delivr.com",
    "hov.to",
    "hovercode.com",
    "flyn.to",
    "qrcake.com",
    "qrforever.com",
    "qrcodenova.com",
    "qr-code-generator.online",
    "free-qr.com",
    "freeqrcode.com",
    "qr-code.org",
    "qrcode.com",
    "createqr.com",
    "create-qr-code.com",
    "online-qrcode.com",
    "qrcodegenerator.com",
    "qrcode-generator.org",
    "qrgenerator.org",
    "qr-generator.com",
    "qrgenerator.net",
    "qrgen.app",
    "qrgen.com",
    "scan.me",
    "scannable.com",
    "scanyourqr.com",
    "mobile-qr.com",
    "qrapp.com",
    "qrapp.net",
    "qrstudio.com",
    "qrstudio.net",
    "qrsource.com",
    "qr-source.com",
    "qr-code-generator.us",
    "qrcodez.com",
    "qrstuff.co.uk",
    "qrdroid.com",
    "zxing.org",
    "zxing.appspot.com",
    "goqr.org",
    "qr-online.com",
    "qrcoder.ru",
    "qr-code.ru",
    "li.sten.to",
    "linktr.ee",
    "bio.link",
    "campsite.bio",
    "beacons.ai",
    "tap.bio",
    "lnk.bio",
    "carrd.co",
    "solo.to",
    "snipfeed.co",

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
    "linksynergy.com",
    "pjatr.com",
    "pjtra.com",
    "pntra.com",
    "pntrac.com",
    "anrdoezrs.net",
    "jdoqocy.com",
    "tkqlhce.com",
    "dpbolvw.net",
    "kqzyfj.com",
    "ftjcfx.com",
    "lduhtrp.net",
    "tqlkg.com",
    "r.style",
    "rstyle.me",
    "shop-links.co",
    "howl.me",
    "rfrl.pw",
    "track.effiliation.com",
    "click.linksynergy.com",
    "shareasale.com",
    "awin1.com",
    "zenaps.com",
    "prf.hn",
    "sjv.io",
    "pxf.io",
    "imp.i114863.net",
    "go.redirectingat.com",
    "skimresources.com",
    "go.skimresources.com",
  ].map((h) => h.toLowerCase()),
);

/** Host suffixes that almost always indicate a shortener / tracking hop. */
const SUSPICIOUS_SUFFIXES = [
  ".page.link",
  ".app.link",
  ".adj.st",
  ".sng.link",
  ".onelink.me",
  ".branch.link",
  ".appboy-image.com",
  ".braze.com",
];

/**
 * Hostname patterns typical of free / dynamic QR SaaS (even when not
 * explicitly listed). Matched against the full host without www.
 */
const QR_PLATFORM_HOST_PATTERNS: RegExp[] = [
  /\bgeneratorqr\b/i,
  /\bqr[-.]?generator\b/i,
  /\bgenerator[-.]?qr\b/i,
  /\bqr[-.]?code[-.]?gen(erator)?\b/i,
  /\bqrcode[-.]?(monkey|tiger|planet|stuff|studio|source|nova)\b/i,
  /\b(free|online|create|make|build)[-.]?qr(code)?s?\b/i,
  /\bqr[-.]?(lynx|link|scan|stuff|cake|forever|planet|tiger)\b/i,
  /\b(me[-.]?qr|uqr|qrco|qrs)\b/i,
  /\b(hovercode|beaconstac|uniqode|flowcode|scanova|unitag|delivr)\b/i,
  /\bgoqr\b/i,
  /\bqrd\.by\b/i,
];

/**
 * Decide whether a single path segment looks like an opaque short-code
 * (random id) rather than a readable site path like /about or /pricing.
 */
function looksLikeOpaqueToken(pathname: string): boolean {
  const t = pathname.replace(/^\/|\/$/g, "");
  if (t.length < 3 || t.length > 24) return false;
  if (!/^[A-Za-z0-9_-]+$/.test(t)) return false;
  // Readable multi-word paths (static-only, get-started) — not opaque ids
  if (t.includes("-") && !/\d/.test(t) && t === t.toLowerCase()) return false;
  // Mixed case is a strong short-code signal (e.g. 4GElHx1BZ)
  if (/[A-Z]/.test(t) && /[a-z]/.test(t)) return true;
  // Digits mixed into a short token
  if (/\d/.test(t) && t.length <= 16) return true;
  // Short vowel-less tokens (xyz, qwr) — common auto ids
  if (t.length <= 10 && !/[aeiou]/i.test(t)) return true;
  // Hex-ish
  if (/^[0-9a-f]+$/i.test(t) && t.length >= 6) return true;
  return false;
}

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
  // match subdomains of known hosts (e.g. m.bit.ly, qr.generatorqr.com)
  for (const known of EXACT_HOSTS) {
    if (h.endsWith(`.${known}`)) return known;
  }
  return null;
}

function hostLooksLikeQrPlatform(host: string): string | null {
  const h = stripWww(host);
  for (const re of QR_PLATFORM_HOST_PATTERNS) {
    if (re.test(h)) {
      return h;
    }
  }
  // Subdomain "qr." on a multi-label host is a very common dynamic-QR pattern
  // (qr.example-saas.com/abc123) — flag when the path is also opaque.
  if (/^qr\./i.test(h) && h.split(".").length >= 3) {
    return h;
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
  let knownMatch = false;

  const known = hostMatchesKnown(host);
  if (known) {
    knownMatch = true;
    reasons.push(
      `Host “${host}” matches a known shortener or dynamic-QR / tracking domain (“${known}”).`,
    );
  }

  for (const suffix of SUSPICIOUS_SUFFIXES) {
    if (host.endsWith(suffix) || host === suffix.slice(1)) {
      knownMatch = true;
      reasons.push(
        `Host ends with “${suffix}”, commonly used for mobile deep-link / tracking redirects.`,
      );
    }
  }

  const qrPlatform = hostLooksLikeQrPlatform(host);
  if (qrPlatform && !known) {
    // Pattern match without an exact list entry → treat as known-style redirector
    // when the path also looks like an opaque short code; otherwise suspicious.
    if (looksLikeOpaqueToken(url.pathname) && !url.search && !url.hash) {
      knownMatch = true;
      reasons.push(
        `Host “${host}” matches naming patterns used by free/dynamic QR generators, and the path (“${url.pathname}”) looks like an opaque short code.`,
      );
    } else {
      reasons.push(
        `Host “${host}” matches naming patterns used by free/dynamic QR generators — verify this is a destination you control.`,
      );
    }
  }

  // Opaque short paths on short hosts, or on QR-related hosts of any length
  if (
    !knownMatch &&
    looksLikeOpaqueToken(url.pathname) &&
    !url.search &&
    !url.hash
  ) {
    const labels = host.split(".");
    const shortHost = host.length <= 18 && labels.length <= 3;
    const qrRelated =
      /\bqr\b/i.test(host) ||
      /\bscan\b/i.test(host) ||
      /\blink\b/i.test(host) ||
      /^qr\./i.test(host);

    if (shortHost || qrRelated) {
      reasons.push(
        `Opaque short path (“${url.pathname}”) on “${host}” often indicates a third-party redirector — verify the final destination before printing.`,
      );
    }
  }

  if (reasons.length > 0 && knownMatch) {
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
