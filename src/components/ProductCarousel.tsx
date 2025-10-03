"use client";

import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState } from "react";

type Img = { url: string; alt?: string; width?: number; height?: number };

function preload(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
}

export function ProductCarousel({ candidateUrls, alt }: { candidateUrls: string[]; alt?: string }) {
  const [viewportRef, embla] = useEmblaCarousel({ loop: true, align: "start" });
  const [index, setIndex] = useState(0);
  const [images, setImages] = useState<Img[]>([]);

  // preload and keep only existing images
  useEffect(() => {
    let alive = true;
    (async () => {
      const hits = await Promise.all(candidateUrls.map(preload));
      if (!alive) return;
      const ok = candidateUrls.filter((_, i) => hits[i]).map((url) => ({ url, alt }));
      setImages(ok);
    })();
    return () => {
      alive = false;
    };
  }, [candidateUrls, alt]);

  const onSelect = useCallback(() => {
    if (!embla) return;
    setIndex(embla.selectedScrollSnap());
  }, [embla]);

  useEffect(() => {
    if (!embla) return;
    onSelect();
    embla.on("select", onSelect);
  }, [embla, onSelect]);

  if (!images.length) return null;

  return (
    <div className="space-y-3">
      <div ref={viewportRef} className="overflow-hidden rounded-xl border">
        <div className="flex">
          {images.map((img, i) => (
            <div key={img.url} className="min-w-0 flex-[0_0_100%]">
              <Image
                src={img.url}
                alt={img.alt ?? ""}
                width={1600}
                height={1200}
                className="h-80 w-full object-cover md:h-[28rem]"
                priority={i === 0}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => embla?.scrollTo(i)}
              className={`h-2 w-2 rounded-full transition ${i === index ? "bg-black" : "bg-gray-300 hover:bg-gray-400"}`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
        <div className="flex gap-2">
          <button className="rounded-lg border px-3 py-1 text-sm" onClick={() => embla?.scrollPrev()}>
            Prev
          </button>
          <button className="rounded-lg border px-3 py-1 text-sm" onClick={() => embla?.scrollNext()}>
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
