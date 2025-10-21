"use client";
import { useEffect, useRef } from "react";

export default function PrinciplesCarouselIt() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current!;
    const list = listRef.current!;
    let pointerX = 0.5;
    let isDown = false;
    let startX = 0;
    let startScroll = 0;
    let pointerId: number | null = null;

    // performance: on-demand RAF
    let rid = 0;
    let running = false;
    let lastActive = 0;
    const ACTIVITY_TIMEOUT = 300;

    const items = Array.from(list.children) as HTMLElement[];
    const reduceMotion = typeof window !== "undefined" && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const onPointer = (e: PointerEvent) => {
      const r = wrap.getBoundingClientRect();
      pointerX = (e.clientX - r.left) / Math.max(1, r.width);
      startLoop();
    };
    window.addEventListener("pointermove", onPointer);

    const onDown = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      isDown = true;
      startX = e.clientX;
      startScroll = wrap.scrollLeft;
      wrap.style.cursor = "grabbing";
      try { wrap.setPointerCapture?.(e.pointerId); pointerId = e.pointerId; } catch {}
      startLoop();
    };
    const onUp = () => {
      isDown = false; wrap.style.cursor = "auto";
      if (pointerId != null) { try { wrap.releasePointerCapture?.(pointerId); } catch {}; pointerId = null; }
    };
    const onDrag = (e: PointerEvent) => {
      if (!isDown) return;
      const dx = e.clientX - startX;
      wrap.scrollLeft = startScroll - dx;
      startLoop();
    };
    wrap.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    window.addEventListener("pointermove", onDrag);

    const onWheel = (e: WheelEvent) => {
      if (!e.shiftKey) {
        const before = wrap.scrollLeft;
        const factor = 1.2;
        wrap.scrollLeft += (e.deltaY * factor) + (e.deltaX || 0);
        if (wrap.scrollLeft !== before) { e.preventDefault(); startLoop(); }
      }
    };
    wrap.addEventListener("wheel", onWheel as EventListener, { passive: false });

    const onKey = (e: KeyboardEvent) => {
      if (document.activeElement !== wrap) return;
      if (e.key === "ArrowRight" || e.key === "PageDown") {
        wrap.scrollBy({ left: wrap.clientWidth * 0.8, behavior: "smooth" });
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        wrap.scrollBy({ left: -wrap.clientWidth * 0.8, behavior: "smooth" });
      }
      startLoop();
    };
    window.addEventListener("keydown", onKey);

    const update = () => {
      const scrollX = wrap.scrollLeft;
      const w = Math.max(1, wrap.clientWidth);
      const max = Math.max(1, list.scrollWidth - w);
      const t = Math.min(1, Math.max(0, scrollX / max));
      wrap.style.setProperty("--progress", String(t));
      wrap.style.setProperty("--px", String(pointerX));

      if (!reduceMotion) {
        for (let i = 0; i < items.length; i++) {
          const it = items[i];
          const basis = it.offsetLeft + it.offsetWidth * 0.5;
          const dx = (basis - (scrollX + w * 0.5)) / w;
          const skew = Math.max(-6, Math.min(6, -dx * 10));
          const scale = 1 + Math.max(-0.02, Math.min(0.04, (0.5 - Math.abs(dx)) * 0.05));
          const ty = Math.sin((t + i * 0.13) * Math.PI * 2) * 6;
          const tilt = (pointerX - 0.5) * 2;
          it.style.willChange = "transform";
          it.style.transform = `translate3d(0, ${ty.toFixed(2)}px, 0) skewX(${skew.toFixed(2)}deg) scale(${scale.toFixed(3)}) rotateZ(${(tilt*0.5).toFixed(2)}deg)`;
        }
      }

      if (performance.now() - lastActive > ACTIVITY_TIMEOUT) {
        running = false; rid = 0; return;
      }
      rid = requestAnimationFrame(update);
    };

    const startLoop = () => {
      lastActive = performance.now();
      if (!running) { running = true; rid = requestAnimationFrame(update); }
    };
    const onScroll = () => { startLoop(); };
    wrap.addEventListener("scroll", onScroll, { passive: true });

    const onClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest("li");
      if (!target || !(target instanceof HTMLElement)) return;
      try { target.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" }); } catch {}
    };
    list.addEventListener("click", onClick);

    return () => {
      if (rid) cancelAnimationFrame(rid);
      window.removeEventListener("pointermove", onPointer);
      wrap.removeEventListener("scroll", onScroll);
      wrap.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      window.removeEventListener("pointermove", onDrag);
      wrap.removeEventListener("wheel", onWheel as EventListener);
      window.removeEventListener("keydown", onKey);
      list.removeEventListener("click", onClick);
    };
  }, []);

  return (
    <section id="principles" className="relative py-24">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-white/40 backdrop-blur-md"
        style={{
          background:
            "radial-gradient(900px 600px at 15% 30%, rgba(16,185,129,0.10), rgba(250,250,250,0) 60%), radial-gradient(1000px 700px at 85% 70%, rgba(20,184,166,0.10), rgba(250,250,250,0) 55%), rgba(255,255,255,0.40)",
          WebkitBackdropFilter: "blur(12px)",
          backdropFilter: "blur(12px)",
          willChange: "backdrop-filter"
        }}
      />

      <div className="container mx-auto px-6 sm:px-8">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight">Principi</h2>
        <p className="mt-4 max-w-2xl text-[color-mix(in oklab,var(--foreground) 70%, transparent)]">Ciò che guida ogni decisione.</p>

        <div
          ref={wrapRef}
          className="mt-12 overflow-x-auto no-scrollbar snap-x snap-mandatory focus:outline-none"
          tabIndex={0}
          aria-label="Carosello dei principi. Usa la rotella del mouse, trascina o i tasti freccia per navigare."
          role="region"
        >
          <ul ref={listRef} className="flex gap-6 pb-2">
            {[
              {title: "Umano al primo posto", body: "Le interfacce dovrebbero catturare l’attenzione con naturalezza, non con il rumore."},
              {title: "Chiarezza", body: "Ridurre il rumore. Valorizzare il segnale. Dare nomi chiari alle cose."},
              {title: "Cura", body: "Tipografia, ritmo e movimento calibrati con attenzione."},
              {title: "Scopo", body: "Ogni elemento deve giustificare la propria presenza — altrimenti va rimosso."},
            ].map((p, i) => (
              <li key={i} className="snap-center shrink-0 basis-[85%] sm:basis-[60%] md:basis-[45%] lg:basis-[38%] border rounded-xl p-6 transition-transform duration-300 ease-out bg-white/60 backdrop-blur-[1px]" style={{ borderColor: "color-mix(in oklab,var(--foreground) 10%, transparent)" }}>
                <h3 className="text-xl sm:text-2xl font-medium">{p.title}</h3>
                <p className="mt-2 text-[color-mix(in oklab,var(--foreground) 80%, transparent)]">{p.body}</p>
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-4 text-xs text-[color-mix(in oklab,var(--foreground) 50%, transparent)]">Scorri / trascina per esplorare</div>
      </div>
    </section>
  );
}
