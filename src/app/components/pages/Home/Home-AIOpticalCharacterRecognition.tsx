"use client";

import React, { useEffect, useRef, useState } from "react";
import { NextUIProvider, Image as NextUIImage } from "@nextui-org/react";
import { CheckCircle2 } from "lucide-react";
import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion";

/* ---------------- HoverFrame ---------------- */
function HoverFrame({
  children,
  radius = 25,
  className = "",
}: {
  children: React.ReactNode;
  radius?: number;
  className?: string;
}) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const frameRef = useRef<HTMLDivElement | null>(null);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!frameRef.current) return;
    const rect = frameRef.current.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div
      ref={frameRef}
      onMouseMove={onMove}
      onMouseLeave={() => setMousePos({ x: 0, y: 0 })}
      className={`group card-outer-bg card-outer-shadow relative overflow-hidden p-[1px] transition-all duration-300 ${className}`}
      style={{ borderRadius: radius }}
    >
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(
            circle 180px at ${mousePos.x}px ${mousePos.y}px,
            rgba(255,255,255,0.15),
            transparent 50%
          )`,
        }}
      />
      <div className="card-inner-bg card-inner-blur relative z-10" style={{ borderRadius: radius - 1 }}>
        {children}
      </div>
    </div>
  );
}

/* ===================== TypewriterChunk (แก้บั๊ก + เร็วมาก) ===================== */
type UnitMode = "word" | "sentence" | "char";

function tokenize(text: string, unit: UnitMode): string[] {
  if (unit === "sentence") {
    const re = /[^.?!…]+[.?!…]\s*|.+$/g;
    return text.match(re) ?? [text];
  }
  if (unit === "word") {
    const parts = text.split(/(\s+)/);
    const tokens: string[] = [];
    for (let i = 0; i < parts.length; i++) {
      const p = parts[i];
      if (!p) continue;
      if (!/\s+/.test(p)) {
        const next = parts[i + 1] && /\s+/.test(parts[i + 1]) ? parts[i + 1] : "";
        tokens.push(p + next);
        if (next) i++;
      } else {
        tokens.push(p);
      }
    }
    return tokens;
  }
  return text.split("");
}

function TypewriterChunk({
  text,
  start,
  unit = "char",
  speed = 4, // เร็วมาก (2–8)
  className = "",
  cursor = true,
  onDone,
}: {
  text: string;
  start: boolean;
  unit?: UnitMode;
  speed?: number;
  className?: string;
  cursor?: boolean;
  onDone?: () => void;
}) {
  const [idx, setIdx] = useState(0);
  const tokensRef = useRef<string[]>([]);
  const rafRef = useRef<number | null>(null);
  const idxRef = useRef(0);
  const doneOnceRef = useRef(false);

  // รีโทเคนเมื่อข้อความ/โหมดเปลี่ยน
  useEffect(() => {
    tokensRef.current = tokenize(text, unit);
    idxRef.current = 0;
    setIdx(0);
  }, [text, unit]);

  // รีเซ็ตเฉพาะตอน start = true (rising edge)
  useEffect(() => {
    if (start) {
      doneOnceRef.current = false;
      idxRef.current = 0;
      setIdx(0);
    }
  }, [start]);

  // ลูปพิมพ์
  useEffect(() => {
    if (!start) return;

    let last = performance.now();
    const len = tokensRef.current.length;

    const step = (now: number) => {
      const elapsed = now - last;
      if (elapsed >= speed) {
        const inc = Math.max(1, Math.floor(elapsed / speed));
        setIdx((prev) => {
          const next = Math.min(len, prev + inc);
          idxRef.current = next;
          if (next === len && onDone && !doneOnceRef.current) {
            doneOnceRef.current = true;
            queueMicrotask(onDone);
          }
          return next;
        });
        last = now;
      }
      if (idxRef.current < len) {
        rafRef.current = requestAnimationFrame(step);
      }
    };

    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [start, speed, onDone]);

  const shown = tokensRef.current.slice(0, idx).join("");
  const done = idx >= tokensRef.current.length;

  return (
    <span className={className} style={{ whiteSpace: "pre-wrap" }} aria-live="polite">
      {shown}
      {cursor && (
        <span
          className={`inline-block translate-y-[1px] ${done ? "opacity-0" : "opacity-100"}`}
          style={{ borderRight: "2px solid currentColor", width: "0.55ch", animation: "blink 1s steps(1,end) infinite" }}
        />
      )}
      <style jsx>{`
        @keyframes blink {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0; }
        }
      `}</style>
    </span>
  );
}

const SCAN_MS = 1500;
const HOLD_MS = 200;

type Phase = "idle" | "scan" | "type1" | "type2" | "hold";

export default function Page() {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const inView = useInView(sectionRef, { amount: 0.35, once: true });

  // แถบสแกน
  const progress = useMotionValue(0);
  const sweepH = useTransform(progress, [0, 1], ["0%", "100%"]);
  const sweepOpacity = useTransform(progress, [0, 1], [0.92, 0.22]);

  // state machine
  const [phase, setPhase] = useState<Phase>("idle");
  const [cycleId, setCycleId] = useState(0); // ไว้รีเซ็ต typewriter

  const p1Text =
    "In the fiscal year 2025, the company experienced steady and sustainable growth across all major product categories. Notebooks remained the cornerstone of overall revenue, supported by consistent demand from education and enterprise customers.";
  const p2Text =
    "Tablets showed remarkable improvement, largely driven by e-learning platforms and the growing adoption of hybrid work. Smartwatches gained traction among health-conscious users, valued for real-time monitoring features.";

  // เริ่มเมื่อเห็น section
  useEffect(() => {
    if (inView) setPhase("scan");
  }, [inView]);

  // phase "scan"
  useEffect(() => {
    if (phase !== "scan") return;
    let anim: ReturnType<typeof animate> | null = null;
    progress.set(0);
    anim = animate(progress, 1, { duration: SCAN_MS / 1000, ease: [0.42, 0, 0.2, 1] });
    anim.finished.then(() => setPhase("type1")).catch(() => {});
    return () => anim?.stop();
  }, [phase, progress]);

  // เมื่อพิมพ์จบแต่ละย่อหน้า
  const handleP1Done = () => setPhase("type2");
  const handleP2Done = () => setPhase("hold");

  // phase "hold" -> เริ่มรอบใหม่
  useEffect(() => {
    if (phase !== "hold") return;
    const t = setTimeout(() => {
      setCycleId((n) => n + 1); // รีเซ็ต Typewriter ใหม่ (ผ่าน key)
      setPhase("scan");
    }, HOLD_MS);
    return () => clearTimeout(t);
  }, [phase]);

  // assets
  const IMG_SRC = "/images/optical.png";
  const THUMBS = [
    { src: "/svg/copy.svg", alt: "Doc A" },
    { src: "/svg/share.svg", alt: "Doc B" },
    { src: "/svg/announce.svg", alt: "Doc C" },
  ];

  return (
    <NextUIProvider>
      <main className="text-white">
        <section ref={sectionRef} className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="text-center">
            <p className="text-lg text-[#676767]">Read, extract, and understand text instantly</p>
            <h1 className="mt-2 text-xl lg:text-[40px]">AI Optical Character Recognition</h1>
          </div>

          <div className="mt-10 grid gap-8 lg:grid-cols-[1.6fr_0.9fr] lg:items-start">
            <HoverFrame className="rounded-[28px]">
              <div className="p-4 md:p-6">
                {/* ทำให้สองคอลัมน์ยืดเท่ากัน */}
                <div className="relative grid gap-4 md:grid-cols-[1.15fr_1fr] items-stretch">
                  {/* viewer + scan */}
                  <div className="relative overflow-hidden rounded-2xl p-3 md:p-4">
                    <div className="relative overflow-hidden rounded-xl border border-white/10">
                      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:22px_22px]" />
                      <span className="pointer-events-none absolute top-3 left-3 h-4 w-4 rounded-tl-lg border-t-2 border-l-2 border-white/94" />
                      <span className="pointer-events-none absolute top-3 right-3 h-4 w-4 rounded-tr-lg border-t-2 border-r-2 border-white/94" />
                      <span className="pointer-events-none absolute bottom-3 left-3 h-4 w-4 rounded-bl-lg border-b-2 border-l-2 border-white/94" />
                      <span className="pointer-events-none absolute right-3 bottom-3 h-4 w-4 rounded-br-lg border-r-2 border-b-2 border-white/95" />

                      <div className="relative grid h-[280px] place-items-center">
                        <NextUIImage
                          src={IMG_SRC}
                          alt="Sample document for OCR"
                          radius="sm"
                          className="relative z-[1] max-h-[240px] w-auto object-contain"
                          shadow="sm"
                        />
                      </div>

                      {/* scan sweep */}
                      <motion.div
                        className="pointer-events-none absolute top-0 right-0 left-0 z-[2]"
                        style={{ height: sweepH, opacity: sweepOpacity }}
                        aria-hidden
                      >
                        <div
                          className="absolute inset-0"
                          style={{
                            background:
                              "linear-gradient(to bottom, rgba(60,145,134,.95) 0%, rgba(60,145,134,.40) 45%, rgba(60,145,134,.10) 100%)",
                          }}
                        />
                        <div className="pointer-events-none absolute -bottom-1 left-0 right-0 h-10 mix-blend-screen">
                          <div
                            className="absolute inset-0"
                            style={{
                              background:
                                "radial-gradient(120% 200% at 50% 100%, rgba(138,255,239,.95) 0%, rgba(138,255,239,.55) 35%, rgba(138,255,239,.18) 60%, transparent 75%)",
                              filter: "blur(6px)",
                            }}
                          />
                          <div className="absolute left-3 right-3 bottom-2 h-[2px] rounded-full bg-white/70 opacity-80" />
                        </div>
                      </motion.div>
                    </div>
                  </div>

                  {/* ข้อความพิมพ์ทีละตัว */}
                  {/* ทำให้คอลัมน์ข้อความเป็นคอลัมน์ + สูงขั้นต่ำเท่าฝั่งรูป */}
                  <div className="rounded-2xl p-4 flex flex-col min-h-[280px]">
                    <p className="text-[12px] leading-relaxed text-white md:text-[13px]">
                      <TypewriterChunk
                        key={`p1-${cycleId}`}
                        text={p1Text}
                        start={phase === "type1"}
                        unit="char"
                        speed={4}
                        onDone={handleP1Done}
                      />
                    </p>

                    <p className="mt-3 text-[12px] leading-relaxed text-white md:text-[13px]">
                      <TypewriterChunk
                        key={`p2-${cycleId}`}
                        text={p2Text}
                        start={phase === "type2"}
                        unit="char"
                        speed={4}
                        onDone={handleP2Done}
                      />
                    </p>

                    {/* แถบไอคอนติดก้นการ์ดเสมอ */}
                    <div className="mt-auto pt-2 flex items-center gap-10">
                      {THUMBS.map((it) => (
                        <NextUIImage key={it.src} src={it.src} alt={it.alt} width={20} height={20} loading="lazy" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </HoverFrame>

            {/* Right */}
            <div className="lg:pt-1">
              <h2 className="text-lg font-semibold">Instant Document Understanding</h2>
              <p className="mt-2 max-w-xl text-xs text-[#676767] font-semibold">
                An AI-powered system that quickly transforms scanned files into usable, structured data.
              </p>

              <ul className="mt-5 space-y-4">
                <li className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full ">
                    <CheckCircle2 className="h-4 w-4 opacity-80" />
                  </span>
                  <div>
                    <div className="text-sm font-semibold">High Precision</div>
                    <p className="text-xs mt-1 text-[#676767] font-semibold">
                      Delivers accurate extraction even from low-quality images or complex layouts.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full ">
                    <CheckCircle2 className="h-4 w-4 opacity-80" />
                  </span>
                  <div>
                    <div className="text-sm font-semibold">Multi-Language Ready</div>
                    <p className="text-xs mt-1 text-[#676767] font-semibold">
                      Supports various languages and scripts for global usability.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full ">
                    <CheckCircle2 className="h-4 w-4 opacity-80" />
                  </span>
                  <div>
                    <div className="text-sm font-semibold">Actionable Output</div>
                    <p className="text-xs mt-1 font-semibold text-[#676767]">
                      Converts raw text into editable, searchable, analytics-ready content.
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </section>
      </main>
    </NextUIProvider>
  );
}
