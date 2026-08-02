import type { ErrorCorrectionLevel } from "./qr-generate";

/**
 * Approximate alphanumeric capacity by error-correction level (QR version 40 max).
 * Used only for soft warnings, not hard limits — the library will still try to encode.
 */
const MAX_ALPHANUMERIC: Record<ErrorCorrectionLevel, number> = {
  L: 4296,
  M: 3391,
  Q: 2420,
  H: 1852,
};

/** Byte-mode capacity is lower; use conservative byte limits for mixed/UTF-8 text. */
const MAX_BYTE: Record<ErrorCorrectionLevel, number> = {
  L: 2953,
  M: 2331,
  Q: 1663,
  H: 1273,
};

export type CapacityWarning = {
  level: "ok" | "dense" | "very-dense" | "likely-too-long";
  message: string;
  byteLength: number;
  maxBytes: number;
};

export function assessCapacity(
  payload: string,
  ecLevel: ErrorCorrectionLevel,
): CapacityWarning {
  const byteLength = new TextEncoder().encode(payload).length;
  const maxBytes = MAX_BYTE[ecLevel];
  const ratio = byteLength / maxBytes;

  if (byteLength === 0) {
    return {
      level: "ok",
      message: "",
      byteLength,
      maxBytes,
    };
  }

  if (ratio > 1) {
    return {
      level: "likely-too-long",
      message: `This payload is about ${byteLength} bytes. At error correction ${ecLevel}, QR codes top out near ${maxBytes} bytes. Shorten the text or lower the error-correction level.`,
      byteLength,
      maxBytes,
    };
  }

  if (ratio > 0.65) {
    return {
      level: "very-dense",
      message: `Long payload (${byteLength} bytes). The code will be dense and harder to scan — prefer a shorter URL, higher print resolution, and larger physical size.`,
      byteLength,
      maxBytes,
    };
  }

  if (ratio > 0.35 || byteLength > 120) {
    return {
      level: "dense",
      message: `Moderate payload (${byteLength} bytes). Print large enough and test on a real phone before a print run.`,
      byteLength,
      maxBytes,
    };
  }

  return {
    level: "ok",
    message: "",
    byteLength,
    maxBytes,
  };
}

export { MAX_ALPHANUMERIC };
