import { useEffect, useRef } from "react";

export default function CursorLamp() {
  const lampRef = useRef<SVGSVGElement>(null);
  const pupilsRef = useRef<SVGGElement>(null);

  useEffect(() => {
    const lamp = lampRef.current;
    const pupils = pupilsRef.current;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (!lamp || !pupils) return;

    let frame = 0;
    let x = 0;
    let y = 0;

    const moveEyes = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      const bounds = lamp.getBoundingClientRect();
      x = Math.max(-2, Math.min(2, ((event.clientX - bounds.left) / bounds.width - 0.5) * 4));
      y = Math.max(-2, Math.min(2, ((event.clientY - bounds.top) / bounds.height - 0.35) * 4));
      if (!frame) {
        frame = window.requestAnimationFrame(() => {
          pupils.setAttribute("transform", `translate(${x.toFixed(2)} ${y.toFixed(2)})`);
          frame = 0;
        });
      }
    };

    const syncPointerTracking = () => {
      if (reduceMotion.matches || !finePointer.matches) {
        window.removeEventListener("pointermove", moveEyes);
        if (frame) window.cancelAnimationFrame(frame);
        frame = 0;
        pupils.setAttribute("transform", "translate(0 0)");
      } else {
        window.addEventListener("pointermove", moveEyes, { passive: true });
      }
    };

    syncPointerTracking();
    reduceMotion.addEventListener("change", syncPointerTracking);
    finePointer.addEventListener("change", syncPointerTracking);
    return () => {
      window.removeEventListener("pointermove", moveEyes);
      reduceMotion.removeEventListener("change", syncPointerTracking);
      finePointer.removeEventListener("change", syncPointerTracking);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <svg
      ref={lampRef}
      className="cursor-lamp"
      viewBox="0 0 64 72"
      aria-hidden="true"
      focusable="false"
    >
      <path className="cursor-lamp-shade" d="M12 12h40L44 34H20z" />
      <circle className="cursor-lamp-eye" cx="25" cy="24" r="4" />
      <circle className="cursor-lamp-eye" cx="39" cy="24" r="4" />
      <g ref={pupilsRef} className="cursor-lamp-pupils">
        <circle cx="25" cy="24" r="1.5" />
        <circle cx="39" cy="24" r="1.5" />
      </g>
      <path className="cursor-lamp-frame" d="M32 34v13l-10 10" />
      <path className="cursor-lamp-frame" d="M14 59h25" />
    </svg>
  );
}
