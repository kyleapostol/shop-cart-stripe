// src/components/SizePicker.tsx
"use client";

type Props = { value: number | null; onChange: (size: number) => void };

const SIZES: number[] = Array.from(
  { length: ((12 - 7) / 0.5) + 1 },
  (_, i) => Number((7 + i * 0.5).toFixed(1))
);

export function SizePicker({ value, onChange }: Props) {
  return (
    <div className="space-y-2">
      <div className="text-sm text-gray-700">Size</div>

      {/* FLEX + WRAP + GAP for tight packing */}
      <div className="flex flex-wrap gap-2">
        {SIZES.map((s) => {
          const selected = value === s;
          return (
            <button
              key={s}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(s)}
              className={[
                "h-12 w-12",                     // square
                "flex items-center justify-center",
                "rounded-md border text-sm font-medium",
                "transition focus:outline-none focus:ring-2 focus:ring-black/15",
                selected
                  ? "border-black bg-white"
                  : "border-gray-300 bg-gray-50 hover:bg-gray-100",
              ].join(" ")}
            >
              {Number.isInteger(s) ? s : s.toFixed(1)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
