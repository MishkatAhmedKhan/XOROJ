// src/pages/HomePage.jsx
import { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";

import homepageImg from "../assets/homepage.png";
import problemsImg from "../assets/problempage.png";
import contestsImg from "../assets/author.png";

export default function HomePage() {
  const [idx, setIdx] = useState(0);
  const timerRef = useRef(null);
  const hoverRef = useRef(false);

  // === Configure your slides here ===
  const slides = [
    // Local assets version:
    { id: 1, label: "Homepage Preview", img: homepageImg },
    { id: 2, label: "Problems Page",   img: problemsImg },
    { id: 3, label: "Author Page",   img: contestsImg },

    // External URL version (placeholder demo):
    // {
    //   id: 1,
    //   label: "Homepage Preview",
    //   img: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=1200&auto=format&fit=crop",
    // },
    // {
    //   id: 2,
    //   label: "Problems Page",
    //   img: "https://images.unsplash.com/photo-1551281044-8af6ce36aa88?q=80&w=1200&auto=format&fit=crop",
    // },
    // {
    //   id: 3,
    //   label: "Contests Page",
    //   img: "https://images.unsplash.com/photo-1526378722484-bd91ca387e72?q=80&w=1200&auto=format&fit=crop",
    // },
  ];

  const total = slides.length;
  const intervalMs = 3500;

  const safeIndex = useCallback(
    (to) => ((to % total) + total) % total,
    [total]
  );

  const go = useCallback(
    (to) => setIdx((cur) => safeIndex(typeof to === "number" ? to : cur + 1)),
    [safeIndex]
  );

  const start = useCallback(() => {
    // Respect prefers-reduced-motion
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    if (timerRef.current) return;
    timerRef.current = setInterval(() => go(idx + 1), intervalMs);
  }, [go, idx]);

  const stop = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  }, []);

  useEffect(() => {
    if (!hoverRef.current) start();
    return () => stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, start, stop]);

  // Keyboard navigation for carousel container
  const onKeyDown = (e) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(idx - 1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      go(idx + 1);
    }
  };

  return (
    <div className="max-w-6xl mx-auto w-full">
      {/* Carousel */}
      <section className="mt-8 md:mt-10">
        <div
          className="relative overflow-hidden rounded-xl focus:outline-none"
          style={{
            border: `2px solid var(--colour-5)`,
            backgroundColor: "var(--colour-1)",
          }}
          role="region"
          aria-roledescription="carousel"
          aria-label="Feature previews"
          tabIndex={0}
          onKeyDown={onKeyDown}
          onMouseEnter={() => {
            hoverRef.current = true;
            stop();
          }}
          onMouseLeave={() => {
            hoverRef.current = false;
            start();
          }}
        >
          {/* Slide track */}
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${idx * 100}%)` }}
          >
            {slides.map((s, i) => (
              <div
                key={s.id}
                className="min-w-full aspect-[16/9] relative bg-base-200"
                aria-roledescription="slide"
                aria-label={`${s.label} (${i + 1} of ${total})`}
              >
                {/* Image */}
                <img
                  src={s.img}
                  alt={s.label}
                  className="w-full h-full object-cover select-none pointer-events-none"
                  draggable={false}
                />

                {/* Overlay label (optional) */}
                <div className="absolute inset-x-0 bottom-0 p-4 md:p-5 bg-gradient-to-t from-black/50 via-black/20 to-transparent text-white">
                  <div className="text-sm opacity-90">Carousel</div>
                  <div className="text-lg md:text-xl font-semibold">{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* controls */}
          <button
            className="btn btn-sm btn-ghost absolute left-2 top-1/2 -translate-y-1/2"
            onClick={() => go(idx - 1)}
            aria-label="Previous slide"
          >
            ‹
          </button>
          <button
            className="btn btn-sm btn-ghost absolute right-2 top-1/2 -translate-y-1/2"
            onClick={() => go(idx + 1)}
            aria-label="Next slide"
          >
            ›
          </button>

          {/* indicators */}
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
            {slides.map((s, i) => (
              <button
                key={s.id}
                onClick={() => go(i)}
                className={`h-2 w-2 rounded-full transition-opacity ${
                  i === idx ? "opacity-100" : "opacity-40"
                }`}
                style={{ backgroundColor: "var(--colour-2)" }}
                aria-label={`Go to slide ${i + 1}`}
                aria-current={i === idx ? "true" : "false"}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Feature tiles */}
      <section className="mt-10 md:mt-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Organize a Contest -> deep-link to auto-create */}
          <Link
            to="/author/contests?action=create"
            className="panel hover:shadow-md transition-shadow text-center"
            style={{ borderColor: "var(--colour-5)" }}
          >
            <div className="text-5xl mb-3">🏆</div>
            <div className="font-semibold">Organize a Contest</div>
          </Link>

          <Link
            to="/problems"
            className="panel hover:shadow-md transition-shadow text-center"
            style={{ borderColor: "var(--colour-5)" }}
          >
            <div className="text-5xl mb-3">🧩</div>
            <div className="font-semibold">Solve Problem</div>
          </Link>

          {/* Create Problem -> deep-link to Author: My Problems -> Create */}
          <Link
            to="/author/problems?action=create"
            className="panel hover:shadow-md transition-shadow text-center"
            style={{ borderColor: "var(--colour-5)" }}
          >
            <div className="text-5xl mb-3">🛠️</div>
            <div className="font-semibold">Create Problem</div>
          </Link>
        </div>
      </section>
    </div>
  );
}
