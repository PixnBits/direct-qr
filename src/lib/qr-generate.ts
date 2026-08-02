import QRCode from "qrcode";

export type ErrorCorrectionLevel = "L" | "M" | "Q" | "H";

export type QrGenerateOptions = {
  payload: string;
  errorCorrectionLevel: ErrorCorrectionLevel;
  foreground: string;
  background: string;
  /** Modules of quiet zone (margin). */
  margin: number;
  /** Output pixel size (width = height). */
  size: number;
  /** Optional centre logo data URL. */
  logoDataUrl?: string | null;
  /** Logo as fraction of QR size (0.12–0.28 typical). */
  logoScale?: number;
};

export async function generateQrDataUrl(opts: QrGenerateOptions): Promise<string> {
  const {
    payload,
    errorCorrectionLevel,
    foreground,
    background,
    margin,
    size,
    logoDataUrl,
    logoScale = 0.22,
  } = opts;

  if (!payload) {
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = background;
      ctx.fillRect(0, 0, size, size);
    }
    return canvas.toDataURL("image/png");
  }

  const canvas = document.createElement("canvas");
  await QRCode.toCanvas(canvas, payload, {
    errorCorrectionLevel,
    margin,
    width: size,
    color: {
      dark: foreground,
      light: background,
    },
  });

  if (logoDataUrl) {
    await drawCentreLogo(canvas, logoDataUrl, logoScale, background);
  }

  return canvas.toDataURL("image/png");
}

export async function generateQrSvg(opts: QrGenerateOptions): Promise<string> {
  const {
    payload,
    errorCorrectionLevel,
    foreground,
    background,
    margin,
    size,
    logoDataUrl,
  } = opts;

  if (!payload) {
    return [
      `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">`,
      `<rect width="100%" height="100%" fill="${escapeXml(background)}"/>`,
      `</svg>`,
    ].join("");
  }

  // With a logo, embed the composed raster in an SVG shell for fidelity.
  if (logoDataUrl) {
    const png = await generateQrDataUrl(opts);
    return [
      `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">`,
      `<image href="${png}" width="${size}" height="${size}" />`,
      `</svg>`,
    ].join("\n");
  }

  const svg = await QRCode.toString(payload, {
    type: "svg",
    errorCorrectionLevel,
    margin,
    width: size,
    color: {
      dark: foreground,
      light: background,
    },
  });

  if (!svg.includes("width=")) {
    return svg.replace("<svg", `<svg width="${size}" height="${size}"`);
  }
  return svg;
}

async function drawCentreLogo(
  canvas: HTMLCanvasElement,
  logoDataUrl: string,
  logoScale: number,
  background: string,
): Promise<void> {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const img = await loadImage(logoDataUrl);
  const size = canvas.width;
  const logoSize = Math.round(size * clamp(logoScale, 0.1, 0.32));
  const pad = Math.round(logoSize * 0.12);
  const box = logoSize + pad * 2;
  const x = Math.round((size - box) / 2);
  const y = Math.round((size - box) / 2);

  ctx.fillStyle = background;
  roundRect(ctx, x, y, box, box, Math.max(4, box * 0.08));
  ctx.fill();

  ctx.drawImage(img, x + pad, y + pad, logoSize, logoSize);
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load logo image"));
    img.src = src;
  });
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function escapeXml(s: string) {
  return s
    .replace(/&/g, "\u0026amp;")
    .replace(/"/g, "\u0026quot;")
    .replace(/</g, "\u0026lt;");
}

export function downloadDataUrl(dataUrl: string, filename: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export function downloadText(text: string, filename: string, mime: string) {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  downloadDataUrl(url, filename);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
