// src/lib/images.ts

/**
 * Given "/images/assets/captain-black.png" -> [
 *   "/images/assets/captain-black.png",
 *   "/images/assets/captain-black-2.png",
 *   "/images/assets/captain-black-3.png"
 * ]
 *
 * If the input is already "/.../captain-black-2.png", we still normalize
 * to the base ("captain-black") and return the three canonical variants.
 */
export function expandImageVariants(url: string): string[] {
  // Split into dir / file
  const slash = url.lastIndexOf("/");
  const dir = slash >= 0 ? url.slice(0, slash) : "";
  const file = slash >= 0 ? url.slice(slash + 1) : url;

  // Split into name / ext
  const dot = file.lastIndexOf(".");
  const name = dot >= 0 ? file.slice(0, dot) : file;
  const ext = dot >= 0 ? file.slice(dot) : "";

  // Normalize: strip trailing "-<digits>" if present
  const base = name.replace(/-\d+$/, "");

  // Helper to build a filename with optional numeric suffix
  const make = (n: 1 | 2 | 3) =>
    `${dir ? dir : ""}/${base}${n === 1 ? "" : `-${n}`}${ext}`.replace(/\/{2,}/g, "/");

  // Always return at most 3 candidates, de-duped
  const out = [make(1), make(2), make(3)];
  return Array.from(new Set(out));
}
