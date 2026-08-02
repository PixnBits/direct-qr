import jsQR from "jsqr";

export type DecodeResult =
  | { ok: true; data: string; width: number; height: number }
  | { ok: false; error: string };

export async function decodeQrFromFile(file: File): Promise<DecodeResult> {
  const bitmap = await fileToImageData(file);
  if (!bitmap) {
    return { ok: false, error: "Could not read that image. Try a PNG or JPEG of the QR code." };
  }
  return decodeImageData(bitmap);
}

export async function decodeQrFromBlob(blob: Blob): Promise<DecodeResult> {
  const file = new File([blob], "clipboard.png", { type: blob.type || "image/png" });
  return decodeQrFromFile(file);
}

export function decodeImageData(imageData: ImageData): DecodeResult {
  // Try multiple orientations / inverted colours for better real-world success
  const attempts: ImageData[] = [imageData, invertImageData(imageData)];

  for (const data of attempts) {
    const code = jsQR(data.data, data.width, data.height, {
      inversionAttempts: "attemptBoth",
    });
    if (code?.data) {
      return {
        ok: true,
        data: code.data,
        width: data.width,
        height: data.height,
      };
    }
  }

  return {
    ok: false,
    error:
      "No QR code found. Use a clear, well-lit crop of the code (PNG works best). Screenshots of screens can fail if the image is blurry or skewed.",
  };
}

async function fileToImageData(file: File): Promise<ImageData | null> {
  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url);
    const maxSide = 1600;
    let { width, height } = img;
    const scale = Math.min(1, maxSide / Math.max(width, height));
    width = Math.max(1, Math.round(width * scale));
    height = Math.max(1, Math.round(height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0, width, height);
    return ctx.getImageData(0, 0, width, height);
  } catch {
    return null;
  } finally {
    URL.revokeObjectURL(url);
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("image load failed"));
    img.src = src;
  });
}

function invertImageData(source: ImageData): ImageData {
  const copy = new ImageData(source.width, source.height);
  const s = source.data;
  const d = copy.data;
  for (let i = 0; i < s.length; i += 4) {
    d[i] = 255 - s[i];
    d[i + 1] = 255 - s[i + 1];
    d[i + 2] = 255 - s[i + 2];
    d[i + 3] = s[i + 3];
  }
  return copy;
}
