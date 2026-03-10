// src/pages/HomePage.jsx
import { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";

import homepageImg from "../assets/homepage.png";
import problemsImg from "../assets/problempage.png";
import contestsImg from "../assets/author.png";

import "../styles/styles.css";

export default function HomePage() {
  const [idx, setIdx] = useState(0);
  const timerRef = useRef(null);
  const hoverRef = useRef(false);

  const slides = [
    { id: 1, label: "Homepage Preview", img: homepageImg },
    { id: 2, label: "Problems Page", img: problemsImg },
    { id: 3, label: "Author Page", img: contestsImg },
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

  const onKeyDown = (e) => {
    if (e.key === "ArrowLeft") { e.preventDefault(); go(idx - 1); }
    else if (e.key === "ArrowRight") { e.preventDefault(); go(idx + 1); }
  };

  const featureTiles = [
    { to: "/author/contests?action=create", emoji: "🏆", label: "Organize a Contest" },
    { to: "/problems", emoji: "🧩", label: "Solve Problems" },
    { to: "/author/problems?action=create", emoji: "🛠️", label: "Create Problem" },
    { to: "/leaderboard", emoji: "📊", label: "Leaderboard" },
    { to: "/recommendations", emoji: "💡", label: "Recommendations" },
    { to: "/dashboard", emoji: "📈", label: "Dashboard" },
  ];

  return (
    <div className="max-w-6xl mx-auto w-full animate-fadeIn">
      {/* Carousel */}
      <section className="mt-8 md:mt-10">
        <div
          className="relative overflow-hidden rounded-xl focus:outline-none"
          style={{
            border: "1px solid var(--card-border)",
            background: "var(--card-bg)",
          }}
          role="region"
          aria-roledescription="carousel"
          aria-label="Feature previews"
          tabIndex={0}
          onKeyDown={onKeyDown}
          onMouseEnter={() => { hoverRef.current = true; stop(); }}
          onMouseLeave={() => { hoverRef.current = false; start(); }}
        >
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${idx * 100}%)` }}
          >
            {slides.map((s, i) => (
              <div
                key={s.id}
                className="min-w-full aspect-[16/9] relative"
                style={{ background: "var(--bg-tertiary)" }}
                aria-roledescription="slide"
                aria-label={`${s.label} (${i + 1} of ${total})`}
              >
                <img
                  src={s.img}
                  alt={s.label}
                  className="w-full h-full object-cover object-bottom select-none pointer-events-none"
                  draggable={false}
                />
                <div className="absolute inset-x-0 bottom-0 p-4 md:p-5 bg-gradient-to-t from-black/60 via-black/20 to-transparent text-white">
                  <div className="text-xs opacity-80 uppercase tracking-wider mb-1">Preview</div>
                  <div className="text-lg md:text-xl font-semibold">{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Controls */}
          <button
            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center text-white text-xl font-bold"
            style={{ background: "rgba(0,0,0,.4)", backdropFilter: "blur(4px)" }}
            onClick={() => go(idx - 1)}
            aria-label="Previous slide"
          >
            ‹
          </button>
          <button
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center text-white text-xl font-bold"
            style={{ background: "rgba(0,0,0,.4)", backdropFilter: "blur(4px)" }}
            onClick={() => go(idx + 1)}
            aria-label="Next slide"
          >
            ›
          </button>

          {/* Indicators */}
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
            {slides.map((s, i) => (
              <button
                key={s.id}
                onClick={() => go(i)}
                className="rounded-full transition-all duration-200"
                style={{
                  width: i === idx ? 24 : 8,
                  height: 8,
                  background: i === idx ? "white" : "rgba(255,255,255,.5)",
                }}
                aria-label={`Go to slide ${i + 1}`}
                aria-current={i === idx ? "true" : "false"}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Feature tiles */}
      <section className="mt-10 md:mt-12 mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {featureTiles.map((tile) => (
            <Link
              key={tile.to}
              to={tile.to}
              className="panel text-center group"
              style={{
                transition: "all 250ms cubic-bezier(.4,0,.2,1)",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "var(--shadow-md)";
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.borderColor = "var(--accent-400)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "var(--shadow-xs)";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.borderColor = "var(--card-border)";
              }}
            >
              <div className="text-4xl mb-3">{tile.emoji}</div>
              <div className="font-semibold" style={{ color: "var(--text-primary)" }}>{tile.label}</div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
