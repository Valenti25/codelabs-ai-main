"use client";

import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Avatar, Image as NextUIImage } from "@nextui-org/react";
import {
  motion,
  type Variants,
  useMotionValue,
  useSpring,
  MotionConfig,
  useReducedMotion,
} from "framer-motion";
import type { PanInfo } from "framer-motion";
import LightningUnderline  from "@/app/components/ui/LightningUnderline";
import { ArrowDown, ShoppingCart, UserRound, Briefcase, LineChart } from "lucide-react";
import { LayoutGroup } from "framer-motion";
const CARD_W = 400;
const CARD_MEDIA_H = 180;
const CARD_PLACEHOLDER_H = 230;

function CardWrap({
  width = CARD_W,
  radius = 22,
  children,
  className = "",
}: {
  width?: number;
  radius?: number;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={["p-2", className].join(" ")} style={{ width, borderRadius: radius }}>
      <div style={{ borderRadius: radius - 1, overflow: "hidden" }}>{children}</div>
    </div>
  );
}

/* ---------- Motion settings ---------- */
const easeOutCubic = [0.33, 1, 0.68, 1] as const;
const SPRING_BUBBLE = { type: "spring", stiffness: 280, damping: 30, mass: 0.9 } as const;
const SPRING_LAYOUT = { type: "spring", stiffness: 220, damping: 26, mass: 1 } as const;
const SPRING_SCROLL = { stiffness: 180, damping: 24, mass: 0.9 } as const;

const bubbleVariants: Variants = {
  hidden: { opacity: 0, y: 12, scale: 0.985, filter: "blur(3px)" },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: { ...SPRING_BUBBLE, ease: easeOutCubic },
  },
};

/* ---------- Types ---------- */
type Msg = { id: string; role: "user" | "assistant"; text: string };
type ProductInfo = {
  image: string;
  title: string;
  price?: number;
  originalPrice?: number;
  stock?: number;
  specs?: string[];
  category?: string;
};
type Scenario = {
  userMsgs: Msg[];
  assistantText: string;
  product: ProductInfo;
  products?: ProductInfo[];
};

type CSSVarStyles = React.CSSProperties & Record<`--${string}`, string | number>;

type ChatGroupKey = "customers" | "executives" | "consultants";

/* ---------- Demo data ---------- */
const GROUPS: Record<ChatGroupKey, Scenario[]> = {
  customers: [
    {
      userMsgs: [
        {
          id: "c1-u1",
          role: "user",
          text:
            "I'm looking for wireless earbuds — mostly for listening to music while working.\nI'd like something comfortable for long hours.",
        },
      ],
      assistantText:
        "Got it ✨ The AirPods Pro 2 are lightweight, with excellent noise cancelling and seamless pairing.",
      products: [
        { image: "/images/airpods-pro.png", title: "Pods Pro 2 (M2)", price: 8990 },
        { image: "/images/airpods-pro.png", title: "Pods Lite", price: 4990 },
        { image: "/images/airpods-pro.png", title: "Pods Max Mini", price: 6990 },
      ],
      product: { image: "/images/airpods-pro.png", title: "Pods Pro 2 (M2)" },
    },
  ],
  executives: [
    {
      userMsgs: [
        { id: "e1-u1", role: "user", text: "Perfect, that helps me understand the trend 🙌" },
        {
          id: "e1-u2",
          role: "user",
          text:
            "Could you show me a simple market share summary for this year? I'd like to see it in rows and columns instead of a chart.",
        },
      ],
      assistantText:
        "Sure ✨ Here's a Market Share Overview for this year. It's a compact view so you can quickly compare key regions side by side.",
      product: { image: "/images/imgchat4.png", title: "Market Share Overview" },
    },
    {
      userMsgs: [{ id: "e2-u1", role: "user", text: "Great, that gives me a clear overview" }],
      assistantText:
        "If you'd like, we can also drill down by segment or timeframe later to spot anomalies even faster.",
      product: { image: "", title: "Executive Summary Table" },
    },
  ],
  consultants: [
    {
      userMsgs: [
        {
          id: "s4-u1",
          role: "user",
          text:
            "I'm reviewing some business data and I'd like to see it in a simple chart. Could you show me a bar chart that summarizes this year's performance overall?",
        },
      ],
      assistantText:
        "Got it ✨ Here's the Client Retention chart for 2025. This gives you a clear view of both growth from new customers and loyalty from existing ones.",
      product: { image: "/images/chart1.png", title: "Client Retention" },
    },
    {
      userMsgs: [
        { id: "s4-tail", role: "user", text: "Perfect, thanks! That's exactly what I needed✨" },
        {
          id: "s5-u1",
          role: "user",
          text:
            "I'd like to see how our revenue has been changing throughout the year. Could you provide me with a simple line chart that shows the quarterly trend?",
        },
      ],
      assistantText:
        "Got it ✨ Here's a line chart that illustrates the revenue pattern for 2025. This lets you track the ups and downs across each quarter at a glance.",
      product: { image: "/images/imgchat5.png", title: "Revenue Trend 2025" },
    },
  ],
};

type ChatGroup = {
  key: ChatGroupKey;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  getScenarios: () => Scenario[];
};

const CHAT_GROUPS: ChatGroup[] = [
  { key: "customers", label: "For Customers", icon: UserRound, getScenarios: () => GROUPS.customers },
  { key: "executives", label: "For Executives", icon: Briefcase, getScenarios: () => GROUPS.executives },
  { key: "consultants", label: "For Consultants", icon: LineChart, getScenarios: () => GROUPS.consultants },
];

/* ---------- Utils ---------- */
const currencyTHB = (n: number) =>
  n.toLocaleString("th-TH", { style: "currency", currency: "THB", maximumFractionDigits: 0 });

const AVATAR_RAIL_W = "w-9 sm:w-10";
const RailAvatarRight = ({ src, name }: { src: string; name: string }) => (
  <div className={`${AVATAR_RAIL_W} justify-self-end hidden sm:block`}>
    <Avatar className="shadow-lg border rounded-full border-white/20 p-0.5 w-10 h-10" radius="lg" src={src} name={name} />
  </div>
);
const RailAvatarLeft = ({ src, name }: { src: string; name: string }) => (
  <div className={`${AVATAR_RAIL_W} hidden sm:block`}>
    <Avatar className="shadow-lg border rounded-full border-white/20 p-0.5 w-10 h-10" radius="lg" src={src} name={name} />
  </div>
);

/* ---------- Product cards ---------- */
function ProductMiniCard({ p }: { p: ProductInfo }) {
  return (
    <motion.div layout="position" whileHover={{ y: -1 }} transition={{ layout: SPRING_LAYOUT }} className="w-full">
      <div className="relative rounded-lg p-1.5">
        <NextUIImage alt={p.title} src={p.image} className="h-full w-full" />
      </div>
      <div className="mt-2 space-y-1 text-[11px]">
        <div className="line-clamp-2 text-[12px] font-medium text-white">{p.title}</div>
        {p.specs?.length ? (
          <ul className="space-y-0.5 pl-4 text-[10px] text-white/70">
            {p.specs.slice(0, 2).map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        ) : null}
      </div>
      <div className="mt-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <button className="grid h-7 w-7 place-items-center rounded-lg bg-white/5">
            <ShoppingCart className="h-3.5 w-3.5 text-white/85" />
          </button>
        </div>
        <div className="text-right">
          {typeof p.originalPrice === "number" && (
            <div className="text-[10px] text-white/45 line-through">{currencyTHB(p.originalPrice)}</div>
          )}
          {typeof p.price === "number" && (
            <div className="text-[14px] font-semibold gradient-text-animated">{currencyTHB(p.price)}</div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function FirstScenarioProductsStrip({ products }: { products: ProductInfo[] }) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const x = useMotionValue(0);
  const [minX, setMinX] = useState(0);

  useLayoutEffect(() => {
    const calc = () => {
      const track = trackRef.current;
      const wrap = wrapRef.current;
      if (!track || !wrap) return;
      const trackW = track.scrollWidth;
      const wrapW = wrap.clientWidth;
      setMinX(Math.min(0, wrapW - trackW - 8));
      const cur = x.get();
      if (cur < wrapW - trackW - 8) x.set(wrapW - trackW - 8);
      if (cur > 0) x.set(0);
    };
    calc();
    const ro = new ResizeObserver(calc);
    if (wrapRef.current) ro.observe(wrapRef.current);
    if (trackRef.current) ro.observe(trackRef.current);
    return () => ro.disconnect();
  }, [x]);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) < Math.abs(e.deltaY)) return;
      e.preventDefault();
      const next = Math.max(Math.min(x.get() - e.deltaX, 0), minX);
      x.set(next);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [x, minX]);

  return (
    <CardWrap>
      <div ref={wrapRef} className="relative rounded-2xl overflow-hidden" style={{ height: CARD_MEDIA_H + 40 }}>
        <motion.div
          ref={trackRef}
          layout="position"
          className="flex gap-2"
          style={{ x }}
          drag="x"
          dragConstraints={{ left: minX, right: 0 }}
          dragElastic={0.02}
          transition={{ layout: SPRING_LAYOUT }}
        >
          {products.map((p, i) => (
            <ProductMiniCard key={i} p={p} />
          ))}
        </motion.div>
      </div>
    </CardWrap>
  );
}

function ChartCard({ src, title, onLoad }: { src: string; title?: string; onLoad?: () => void }) {
  return (
    <CardWrap>
      <div className="flex items-center justify-center overflow-hidden rounded-xl w-full mx-auto" style={{ height: CARD_MEDIA_H }}>
        <NextUIImage alt={title ?? "chart"} src={src} className="h-full w-full object-contain" loading="lazy" onLoad={onLoad} />
      </div>
      {title ? <div className="mt-2 text-center text-[10px] text-white/70">{title}</div> : null}
    </CardWrap>
  );
}

function SummaryTableCard({}: { title?: string }) {
  return <CardWrap />;
}

/* ---------- Typing / bubble swap ---------- */
function TypingDots({
  className = "",
  size = 6,
  gap = 6,
  duration = 7000,
}: {
  className?: string;
  size?: number;
  gap?: number;
  duration?: number;
}) {
  const style: CSSVarStyles = {
    "--dot": `${size}px`,
    "--gap": `${gap}px`,
    "--dur": `${duration}ms`,
  };

  return (
    <span role="status" aria-label="Typing…" className={`inline-flex items-center ${className}`} style={style}>
      <span className="dot" />
      <span className="dot" />
      <span className="dot" />
      <style jsx>{`
        .dot {
          width: var(--dot);
          height: var(--dot);
          border-radius: 9999px;
          background: currentColor;
          opacity: 0.6;
          display: inline-block;
          margin-right: var(--gap);
          animation: updown var(--dur) ease-in-out infinite;
        }
        .dot:nth-child(2) { animation-delay: calc(var(--dur) * 0.15); }
        .dot:nth-child(3) { animation-delay: calc(var(--dur) * 0.3); margin-right: 0; }
        @keyframes updown {
          0%, 100% { transform: translateY(0); opacity: 0.6; }
          50% { transform: translateY(-28%); opacity: 1; }
        }
      `}</style>
    </span>
  );
}

function BubbleTextSwap({
  text,
  delay = 7000,
  align = "left",
  colorClass = "text-white",
}: {
  text: string;
  delay?: number;
  align?: "left" | "right";
  colorClass?: string;
}) {
  const [showText, setShowText] = useState(false);
  useEffect(() => {
    const id = window.setTimeout(() => setShowText(true), Math.max(120, delay));
    return () => window.clearTimeout(id);
  }, [delay]);
  if (!showText)
    return (
      <div className={`flex ${align === "right" ? "justify-end" : "justify-start"}`}>
        <TypingDots className="text-white/80" />
      </div>
    );
  return <span className={`${colorClass} ${align === "right" ? "text-right" : "text-left"}`}>{text}</span>;
}

function BubbleSwap({ children, delay = 7000 }: { children: React.ReactNode; delay?: number }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const id = window.setTimeout(() => setShow(true), Math.max(120, delay));
    return () => window.clearTimeout(id);
  }, [delay]);
  if (!show) {
    return (
      <div className="grid place-items-center" style={{ width: CARD_W, height: CARD_PLACEHOLDER_H }}>
        <TypingDots className="text-white/80" />
      </div>
    );
  }
  return <>{children}</>;
}

/* ---------- Timeline ---------- */
type TimelineUser = { kind: "user"; key: string; text: string };
type TimelineAssistant = { kind: "assistant"; key: string; text: string };
type TimelineCard = { kind: "card"; key: string; idx: number; scenario: Scenario };
type TimelineTail = { kind: "tail"; key: string };
type TimelineDivider = { kind: "divider"; key: string };
type TimelineItem = TimelineUser | TimelineAssistant | TimelineCard | TimelineTail | TimelineDivider;

function useMasterTimeline(scenarios: Scenario[]) {
  return useMemo<TimelineItem[]>(() => {
    const arr: TimelineItem[] = [];
    scenarios.forEach((sc, idx) => {
      sc.userMsgs.forEach((m) => arr.push({ kind: "user", key: m.id, text: m.text }));
      arr.push({ kind: "assistant", key: `s${idx + 1}-a`, text: sc.assistantText });
      arr.push({ kind: "card", key: `s${idx + 1}-c`, idx, scenario: sc });
      arr.push({ kind: "tail", key: `s${idx + 1}-t` });
      if (idx < scenarios.length - 1) arr.push({ kind: "divider", key: `s${idx + 1}-d` });
    });
    return arr;
  }, [scenarios]);
}

const WINDOW = 28;
const BASE_DELAY = 2000;
const JITTER = 0.18;

function ScrollableChat({ scenarios }: { scenarios: Scenario[] }) {
  const MASTER = useMasterTimeline(scenarios);
  const L = MASTER.length || 1;

  const viewportRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  const y = useMotionValue(0);
  const ySmooth = useSpring(y, SPRING_SCROLL);
  const [minY, setMinY] = useState(0);
  const [autoFollow, setAutoFollow] = useState(true);

  const [seq, setSeq] = useState(1);
  const timerRef = useRef<number | null>(null);

  const items = useMemo((): Array<{ instKey: string; item: TimelineItem }> => {
    const count = Math.min(seq, WINDOW);
    const out: Array<{ instKey: string; item: TimelineItem }> = [];
    for (let i = count; i >= 1; i--) {
      const globalIndex = seq - i;
      const cycle = Math.floor(globalIndex / L);
      const idxInMaster = globalIndex % L;
      const base = MASTER[idxInMaster];
      out.push({ instKey: `${base.key}#${cycle}`, item: base });
    }
    return out;
  }, [seq, L, MASTER]);

  useEffect(() => {
    setSeq(1);
    y.set(0);
    setAutoFollow(true);
  }, [scenarios, y]);

  useEffect(() => {
    const schedule = () => {
      const jitter = 1 + (Math.random() * 2 - 1) * JITTER;
      const delay = BASE_DELAY * jitter;
      const id = window.setTimeout(() => {
        setSeq((s) => s + 1);
        schedule();
      }, delay);
      timerRef.current = id;
    };
    schedule();
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, []);

  useLayoutEffect(() => {
    const calc = () => {
      const vp = viewportRef.current;
      const ct = contentRef.current;
      if (!vp || !ct) return;
      const min = Math.min(0, vp.clientHeight - ct.scrollHeight);
      setMinY(min);
      const cur = y.get();
      if (cur < min) y.set(min);
      if (cur > 0) y.set(0);
    };
    calc();
    const ro = new ResizeObserver(calc);
    if (viewportRef.current) ro.observe(viewportRef.current);
    if (contentRef.current) ro.observe(contentRef.current);
    return () => ro.disconnect();
  }, [y, items.length]);

  // ป้องกัน scroll jump ทันทีที่ render card ที่ต้องรอรูปโหลด
  const pendingImageRef = useRef(false);
  useEffect(() => {
    // ถ้ามี card ที่เป็น chart (isChart) ใน items ล่าสุด ให้รอ onLoad ก่อน
    const lastItem = items[items.length - 1]?.item;
    const isChart = lastItem && lastItem.kind === "card" && !((lastItem.idx === 0) && lastItem.scenario.products) && !!lastItem.scenario.product.image;
    if (isChart) {
      pendingImageRef.current = true;
      return;
    }
    pendingImageRef.current = false;
    if (autoFollow) y.set(minY);
  }, [items.length, minY, autoFollow, y, items]);

  useEffect(() => {
    const vp = viewportRef.current;
    if (!vp) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const next = Math.max(Math.min(y.get() - e.deltaY, 0), minY);
      y.set(next);
      if (e.deltaY < -2) setAutoFollow(false);
    };
    vp.addEventListener("wheel", onWheel, { passive: false });
    return () => vp.removeEventListener("wheel", onWheel);
  }, [y, minY]);

  const [showToLatest, setShowToLatest] = useState(false);
  useEffect(() => {
    const unsub = y.on("change", (v: number) => setShowToLatest(Math.abs(v - minY) > 6));
    return () => unsub();
  }, [y, minY]);

  // ป้องกัน scroll jump ซ้อนกันด้วย flag
  const scrollAnimatingRef = useRef(false);
  const renderItem = (instKey: string, item: TimelineItem) => {
    switch (item.kind) {
      case "user": {
        // ...existing code...
        return (
          <motion.div
            key={instKey}
            layout="position"
            variants={bubbleVariants}
            initial="hidden"
            animate="visible"
            transition={{ layout: SPRING_LAYOUT }}
            className="relative grid grid-cols-[auto_1fr_auto] items-start gap-3"
            whileHover={{ y: -1 }}
          >
            <RailAvatarLeft src="/images/user.png" name="You" />
            <div className="justify-self-start rounded-[22px] max-w-lg rounded-bl-none border border-white/12 bg-gradient-to-b from-white/8 to-white/4 px-5 py-3 text-[15px]">
              <BubbleTextSwap key={instKey} text={item.text} delay={520} align="left" colorClass="text-white" />
            </div>
            <div className={AVATAR_RAIL_W} />
          </motion.div>
        );
      }
      case "assistant": {
        // ...existing code...
        return (
          <motion.div
            key={instKey}
            layout="position"
            variants={bubbleVariants}
            initial="hidden"
            animate="visible"
            transition={{ layout: SPRING_LAYOUT }}
            className="relative grid grid-cols-[auto_1fr_auto] items-start gap-3"
            whileHover={{ y: -1 }}
          >
            <div className={AVATAR_RAIL_W} />
            <div className="justify-self-end rounded-[22px] max-w-lg rounded-br-none border border-white/12 bg-gradient-to-b from-white/10 to-white/5 px-5 py-3 text-right text-[15px]">
              <BubbleTextSwap key={instKey} text={item.text} delay={720} align="right" colorClass="text-white" />
            </div>
            <RailAvatarRight src="/images/starai.png" name="AI" />
          </motion.div>
        );
      }
      case "card": {
        const isStrip = item.idx === 0 && !!item.scenario.products;
        const isChart = !isStrip && !!item.scenario.product.image;
        return (
          <motion.div
            key={instKey}
            layout="position"
            variants={bubbleVariants}
            initial="hidden"
            animate="visible"
            transition={{ layout: SPRING_LAYOUT }}
            className="relative grid grid-cols-[auto_1fr_auto] items-start gap-3"
            whileHover={{ y: -1 }}
          >
            <div className={AVATAR_RAIL_W} />
            <div className="justify-self-end">
              <CardWrap>
                <BubbleSwap delay={650}>
                  {isStrip ? (
                    <FirstScenarioProductsStrip products={item.scenario.products!} />
                  ) : isChart ? (
                    <ChartCard
                      src={item.scenario.product.image}
                      title={item.scenario.product.title}
                      onLoad={() => {
                        if (scrollAnimatingRef.current) return;
                        scrollAnimatingRef.current = true;
                        setAutoFollow(true);
                        // ใช้ spring animation (ySmooth) เพื่อ scroll smooth
                        ySmooth.set(minY);
                        pendingImageRef.current = false;
                        setTimeout(() => {
                          scrollAnimatingRef.current = false;
                        }, 600);
                      }}
                    />
                  ) : (
                    <SummaryTableCard title={item.scenario.product.title} />
                  )}
                </BubbleSwap>
              </CardWrap>
            </div>
            <RailAvatarRight src="/images/starai.png" name="AI" />
          </motion.div>
        );
      }
      case "tail": {
        return (
          <motion.div
            key={instKey}
            layout="position"
            variants={bubbleVariants}
            initial="hidden"
            animate="visible"
            transition={{ layout: SPRING_LAYOUT }}
            className="relative grid grid-cols-[auto_1fr_auto] items-start gap-3"
            whileHover={{ y: -1 }}
          >
            <RailAvatarLeft src="/images/user.png" name="You" />
            <div className="justify-self-start rounded-[22px] rounded-bl-none border border-white/12 bg-gradient-to-b from-white/8 to-white/4 px-5 py-3 text-[15px]">
              <BubbleTextSwap
                key={instKey}
                text={`Awesome, thanks! That's exactly what I needed 🙌`}
                delay={520}
                align="left"
                colorClass="text-white"
              />
            </div>
            <div className={AVATAR_RAIL_W} />
          </motion.div>
        );
      }
      default: {
        return (
          <motion.div key={instKey} layout="position" className="my-6 flex items-center gap-3" transition={{ layout: SPRING_LAYOUT }}>
            <div className="h-px w-full bg-white/10" />
            <span className="text-[10px] uppercase tracking-widest text-white/40">Next</span>
            <div className="h-px w-full bg-white/10" />
          </motion.div>
        );
      }
    }
  };

  return (
    <div className="group card-outer-bg card-outer-shadow relative overflow-hidden rounded-[25px] p-[1px] transition-all mx-auto max-w-6xl">
      <section className="card-inner-bg p-5 card-inner-blur relative z-10 h-full rounded-[24px] border-0">
        <div className="relative">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-10 z-10" />
          <div ref={viewportRef} className="relative h-[560px] md:h-[600px] overflow-hidden pr-1 md:pr-2">
            <motion.div
              ref={contentRef}
              layout
              className="min-h-[560px] md:min-h-[600px] pb-14 pt-2 space-y-6"
              style={{ y: ySmooth }}
              drag="y"
              dragElastic={0}
              dragMomentum
              dragTransition={{ power: 0.15, timeConstant: 280 }}
              onDrag={(e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
                const cur = y.get();
                const next = Math.max(Math.min(cur + info.delta.y, 0), minY);
                y.set(next);
                if (info.delta.y > 2) setAutoFollow(false);
              }}
              transition={{ layout: SPRING_LAYOUT }}
            >
              {items.map(({ instKey, item }) => renderItem(instKey, item))}
            </motion.div>
          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 z-10" />

          {showToLatest && (
            <button
              onClick={() => {
                setAutoFollow(true);
                y.set(minY);
              }}
              className="group absolute bottom-4 right-4 z-20 rounded-full bg-white/10 px-3 py-2 backdrop-blur transition hover:bg-white/20"
              aria-label="Scroll to latest"
            >
              <span className="flex items-center gap-2 text-xs text-white/80">
                <ArrowDown className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
                ไปข้อความล่าสุด
              </span>
            </button>
          )}
        </div>
      </section>
    </div>
  );
}

/* ---------- Lightning underline pieces ---------- */


type GroupTabsProps = {
  value: ChatGroupKey;
  onChange: (v: ChatGroupKey) => void;
};

function GroupTabs({ value, onChange }: GroupTabsProps) {
  const order = CHAT_GROUPS.map((g) => g.key);
  const [prev, setPrev] = useState<ChatGroupKey>(value);
  const dir: "left" | "right" = order.indexOf(value) >= order.indexOf(prev) ? "right" : "left";

  useEffect(() => { setPrev(value); }, [value]);

  return (
    <LayoutGroup id="lightning-tabs">
      <div role="tablist" aria-label="Chat groups" className="mx-auto mb-6 flex w-full items-center gap-6 justify-center">
        {CHAT_GROUPS.map(({ key, label, icon: Icon }) => {
          const active = value === key;
          return (
            <button
              key={key}
              role="tab"
              aria-selected={active}
              aria-controls={`panel-${key}`}
              onClick={() => onChange(key)}
              className={[
                "relative inline-flex items-center gap-2 rounded-xl py-2 text-[11px] md:text-xs transition",
                active ? "text-white" : "text-[#676767] hover:text-white/80",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30",
              ].join(" ")}
              title={label}
            >
              <Icon className="md:h-4 md:w-4 h-3 w-3" />
              <span className="whitespace-nowrap">{label}</span>

              {active && <LightningUnderline dir={dir} idleWidth={48} movingWidth={92} />}
            </button>
          );
        })}
      </div>
    </LayoutGroup>
  );
}

export default function Page() {
  const prefersReducedMotion = useReducedMotion();
  const [group, setGroup] = useState<ChatGroupKey>("customers");

  const scenarios = useMemo<Scenario[]>(() => {
    const def = CHAT_GROUPS.find((g) => g.key === group) ?? CHAT_GROUPS[0];
    return def.getScenarios().map((s) => ({ ...s, userMsgs: [...s.userMsgs] }));
  }, [group]);

  return (
    <MotionConfig reducedMotion={prefersReducedMotion ? "always" : "never"} transition={SPRING_LAYOUT}>
      <main className="px-0 mt-20 md:mt-40 md:px-0">
        <div className="w-full">
          <div className="mb-8 text-center">
            <p className="mb-3 font-semibold text-sm text-[#676767] md:text-xl">The Future of Smart Sales</p>
            <h2 className="text-xl text-white md:text-[40px]">Chat sale by AI</h2>

            <div className="mx-auto mt-4 flex max-w-sm text-sm items-center justify-center text-center font-semibold">
              <p className="text-[#676767]">
                An AI-powered sales assistant that chats, qualifies, recommends, and helps close deals — 24/7.
              </p>
            </div>

            <div className="mx-auto text-xs mt-4">
              <GroupTabs value={group} onChange={setGroup} />
            </div>
          </div>

          <ScrollableChat scenarios={scenarios} />
        </div>
      </main>
    </MotionConfig>
  );
}
