import { useEffect, useRef } from "react";

let mjLoadPromise = null;

function ensureMathJax() {
  if (!mjLoadPromise) {
    mjLoadPromise = (async () => {
      // Configure BEFORE loading the bundle
      window.MathJax = {
        tex: {
          inlineMath: [["$", "$"], ["\\(", "\\)"]],
          displayMath: [["$$", "$$"], ["\\[", "\\]"]],
        },
        chtml: {
          displayAlign: "left", // left-align display math
        },
        // Don’t autostart; we’ll call typesetPromise manually
        options: { enableMenu: false },
        startup: { typeset: false },
      };

      // Load the **local** ES5 bundle (no CDN)
      await import("mathjax/es5/tex-chtml-full.js");
      // After this, window.MathJax is ready with typesetPromise
    })();
  }
  return mjLoadPromise;
}

export default function MathRenderer({ content }) {
  const containerRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      await ensureMathJax();
      if (cancelled || !containerRef.current) return;

      // Inject your combined HTML (with $$…$$ etc.)
      containerRef.current.innerHTML = content || "";

      // Typeset only this container
      try {
        await window.MathJax.typesetPromise([containerRef.current]);
      } catch (err) {
        console.error("MathJax typeset error:", err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [content]);

  return <div ref={containerRef} className="prose max-w-full text-left" />;
}
