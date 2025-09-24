"use client";

import React, {
  useState,
  useEffect,
  useRef,
  memo,
  useCallback,
  type ReactElement,
} from "react";
import { Input, Image as NextUIImage } from "@nextui-org/react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Send, Mic, Plus } from "lucide-react";

import ModelCanvas from "../../ModelsObject/ModelStar";
import content from "@/locales/en/home.json";
import Meteors from "../../ui/meteors";
import { SparklesCore } from "../../ui/SparklesCore";
import Star from "../../ui/star";

/** ================== Config: avatar 2 รูป ================== */
const USER_AVATAR = "/images/user.png";
const ASSISTANT_AVATAR = "/images/starai.png";

/** ================== Types & Utils ================== */
type ChatMsg = { id: string; role: "user" | "assistant"; text: string };
interface Logo {
  src: string;
  hoverSrc?: string;
  alt: string;
}
interface InfiniteMarqueeProps {
  children: React.ReactNode;
  speed?: number;
  className?: string;
}
const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}_${Math.random().toString(36).slice(2)}`;

/** ================== iOS zoom guard (วิธีเดียวตามที่ขอ) ================== */
const isiOS =
  typeof navigator !== "undefined" &&
  ((/iP(hone|ad|od)/i.test(navigator.userAgent)) ||
    (/Macintosh/i.test(navigator.userAgent) &&
      typeof document !== "undefined" &&
      "ontouchend" in document));

function ensureViewportMeta(): HTMLMetaElement | null {
  if (typeof document === "undefined") return null;
  let meta = document.querySelector<HTMLMetaElement>('meta[name="viewport"]');
  if (!meta) {
    meta = document.createElement("meta");
    meta.name = "viewport";
    meta.content = "width=device-width, initial-scale=1, viewport-fit=cover";
    document.head.appendChild(meta);
  }
  return meta;
}
function disableZoom() {
  if (!isiOS) return;
  const meta = ensureViewportMeta();
  if (!meta) return;
  meta.setAttribute(
    "content",
    "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover"
  );
}
function enableZoom() {
  if (!isiOS) return;
  const meta = ensureViewportMeta();
  if (!meta) return;
  meta.setAttribute(
    "content",
    "width=device-width, initial-scale=1, viewport-fit=cover"
  );
}

/** ================== Logos (เดิม) ================== */
const LOGO_DATA: Logo[] = [
  { src: "/images/chatgpt-logo.png", hoverSrc: "/images/chatgpt-hover.png", alt: "ChatGPT" },
  { src: "/images/gemini-logo.png", hoverSrc: "/images/gemini-hover.png", alt: "Google Gemini" },
  { src: "/images/poe-logo.png", hoverSrc: "/images/poe-hover.png", alt: "Poe" },
  { src: "/images/apple-intelligent-logo.png", hoverSrc: "/images/apple_intelligence-hover.png", alt: "Apple Intelligence" },
  { src: "/images/mistral-ai-logo.png", hoverSrc: "/images/mistral-hover.png", alt: "Mistral AI" },
  { src: "/images/qwen-logo.png", hoverSrc: "/images/qwen-hover.png", alt: "Qwen" },
  { src: "/images/union-logo.png", hoverSrc: "/images/grok-hover.png", alt: "Union" },
  { src: "/images/deepseek-logo.png", hoverSrc: "/images/deepseek-hover.png", alt: "DeepSeek" },
  { src: "/images/claude-logo.png", hoverSrc: "/images/claude-hover.png", alt: "Claude" },
  { src: "/images/perplexity-logo.png", hoverSrc: "/images/perplexity-hover.png", alt: "Perplexity" },
  { src: "/images/microsoft-copilot-logo.png", hoverSrc: "/images/copilot-hover.png", alt: "Microsoft Copilot" },
];
const DUPLICATE_COUNT = 2;
const DEFAULT_SPEED = 0.4;

/** ================== ปุ่มส่ง (มือถือเท่านั้น) ================== */
function SendButton({
  disabled,
  type = "submit",
  className = "",
  label = "Send",
}: {
  disabled?: boolean;
  type?: "button" | "submit";
  className?: string;
  label?: string;
}) {
  return (
    <button
      type={type}
      aria-label={label}
      disabled={disabled}
      className={[
        "md:hidden p-0 bg-transparent text-white",
        "disabled:opacity-40 disabled:cursor-not-allowed",
        "hover:opacity-90 transition",
        className,
      ].join(" ")}
      title="Send"
    >
      <Send aria-hidden className="text-white w-4 h-4" />
      <span className="sr-only">{label}</span>
    </button>
  );
}

/** ================== ปุ่มไมค์ (มือถือ/PC) — PC ใหญ่ขึ้น ================== */
function MicButton({
  listening,
  onToggle,
  className = "",
}: {
  listening: boolean;
  onToggle: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-label={listening ? "Stop voice input" : "Start voice input"}
      aria-pressed={listening}
      onClick={onToggle}
      className={[
        "grid place-items-center p-0 bg-transparent text-white hover:opacity-90 transition focus:outline-none",
        "w-6 h-6 md:w-8 md:h-8 lg:w-9 lg:h-9",
        className,
      ].join(" ")}
      title={listening ? "Stop voice input" : "Start voice input"}
    >
      <Mic aria-hidden className="text-[#676767] w-5 h-5 md:w-6 md:h-6" />
      <span className="sr-only">
        {listening ? "Stop voice input" : "Start voice input"}
      </span>
    </button>
  );
}

/** ================== ปุ่ม + (มือถือ/PC) — PC ใหญ่ขึ้น ================== */
function PlusButton({
  onClick,
  className = "",
}: {
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-label="Add"
      onClick={onClick}
      className={[
        "grid place-items-center p-0 border border-[#676767] rounded-full bg-transparent text-white hover:opacity-90 transition focus:outline-none",
        className,
      ].join(" ")}
      title="Add"
    >
      <Plus aria-hidden className="text-[#676767] w-4 h-4 md:w-5 md:h-5" />
      <span className="sr-only">Add</span>
    </button>
  );
}

const InfiniteMarquee = memo(function InfiniteMarquee({
  children,
  speed = DEFAULT_SPEED,
  className = "",
}: InfiniteMarqueeProps) {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <div
      className={`relative overflow-visible ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className="marquee-track flex"
        style={{
          animationDuration: `${30 / speed}s`,
          animationPlayState: isHovered ? "paused" : "running",
        }}
      >
        {Array.from({ length: DUPLICATE_COUNT }, (_, i) => (
          <React.Fragment key={i}>{children}</React.Fragment>
        ))}
      </div>

      <style jsx global>{`
        @keyframes hero-marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee-track {
          width: max-content;
          will-change: transform;
          animation-name: hero-marquee;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
          overflow: visible;
          padding-block: 6px;
          gap: 1rem;
        }
        .logo-item { position: relative; }
        @media (prefers-reduced-motion: reduce) {
          .marquee-track { animation: none !important; transform: none !important; }
        }
      `}</style>
    </div>
  );
});

function CircleAvatar({
  className = "p-2",
  src,
  alt,
  initials = "AI",
  size = 32,
}: {
  src?: string;
  alt?: string;
  initials?: string;
  size?: number;
  className?: string;
}) {
  return (
    <div
      className={
        "relative rounded-full overflow-hidden bg-white/10 ring-1 ring-white/15 grid place-items-center text-[11px] text-white/80 flex-shrink-0"
      }
      style={{ width: size, height: size }}
      aria-label={alt}
      role="img"
    >
      {src ? (
        <Image
          src={src}
          alt={alt ?? ""}
          fill
          sizes={`${size}px`}
          className="object-cover select-none p-1"
          draggable={false}
        />
      ) : (
        <span className="select-none">{initials}</span>
      )}
    </div>
  );
}

/** ================== โลโก้เดิม ================== */
const LogoItem: React.FC<Logo> = ({ src, hoverSrc, alt }) => {
  const [hovered, setHovered] = useState(false);
  useEffect(() => {
    if (!hoverSrc) return;
    const img = new globalThis.Image();
    img.src = hoverSrc;
  }, [hoverSrc]);

  const displaySrc = hovered && hoverSrc ? hoverSrc : src;
  return (
    <motion.div
      className="logo-item select-none"
      whileHover={{ scale: 1.25 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onTouchStart={() => setHovered(true)}
      onTouchEnd={() => setHovered(false)}
      aria-label={alt}
      role="img"
    >
      <NextUIImage
        src={displaySrc}
        alt={alt}
        className="pointer-events-auto h-9 w-9 flex-shrink-0 object-contain transition-transform duration-150 will-change-transform lg:h-[50px] lg:w-[50px]"
        loading="lazy"
        radius="none"
      />
    </motion.div>
  );
};

const LogoGrid = memo(function LogoGrid() {
  return (
    <div className="mt-8 flex items-center justify-center gap-4 pr-4 lg:gap-12 lg:pr-12">
      {LOGO_DATA.map((logo, index) => (
        <LogoItem key={`${logo.alt}-${index}`} {...logo} />
      ))}
    </div>
  );
});

/** ================== หน้ากากไล่โทน (เดิม) ================== */
const GradientMask: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    className="overflow-visible"
    style={{
      maskImage:
        "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)",
      WebkitMaskImage:
        "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)",
    }}
  >
    {children}
  </div>
);

/** ================== GlowFrame (เดิม) ================== */
function GlowFrame({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMouseMove}
      className={[
        "group card-outer-bg card-outer-shadow relative overflow-hidden p-[1px] transition-all duration-300",
        "rounded-full",
        className,
      ].join(" ")}
    >
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(circle 180px at ${mousePos.x}px ${mousePos.y}px, rgba(255,255,255,0.15), transparent 50%)`,
          mixBlendMode: "screen",
        }}
        aria-hidden
      />
      <div className="card-inner-bg card-inner-blur relative z-10 rounded-full">{children}</div>
    </div>
  );
}

/** ================== ส่วนข้อความหัว (เดิม) ================== */
interface HeroContentProps {
  subtitle: string;
  line1: string;
  line2: string;
}
const HeroContent = memo(function HeroContentBase({ subtitle, line1, line2 }: HeroContentProps) {
  return (
    <div className="relative z-10 mx-auto mt-6 md:mt-16 w-full px-4 md:py-20 lg:px-28">
      <section className="grid place-items-center px-6">
        <h1 className="max-w-5xl min-w-6xl text-center text-xl font-semibold text-white md:text-4xl lg:text-6xl">
          <span className="block">
            <span className="gradient-text-animated2">AI Innovation</span> at the core.
          </span>
          <span className="block lg:mt-4">
            Turning <span className="gradient-text-animated2">Data → Insight</span>, instantly.
          </span>
        </h1>
      </section>

      <h1 className="mb-3 pt-3 text-xl leading-tight text-white md:pt-6 md:text-2xl lg:mt-6 lg:text-4xl">{subtitle}</h1>

      <div className="mx-auto text-xs font-semibold text-[#676767] md:text-lg">
        <p>{line1}</p>
        <p>{line2}</p>
      </div>
    </div>
  );
});

/** ================== แชท ================== */
function ChatBubble({
  role,
  text,
  name,
}: {
  role: "user" | "assistant";
  text: string;
  name?: string;
}) {
  const isUser = role === "user";

  return (
    <div
      className={[
        "flex w-full items-end",
        "px-2 md:px-3",
        isUser ? "justify-end gap-3 md:gap-4" : "justify-start gap-3 md:gap-4",
      ].join(" ")}
    >
      {!isUser && (
        <CircleAvatar
          src={ASSISTANT_AVATAR}
          alt={name || "Assistant"}
          initials={(name?.[0] ?? "A").toUpperCase()}
          size={26}
        />
      )}

      <div
        className={[
          "max-w-[85%] px-4 py-2 text-sm md:text-base leading-relaxed",
          "rounded-2xl",
          isUser ? "bg-white/90 text-black shadow" : "bg-white/8 text-white/90 ring-1 ring-white/10 backdrop-blur",
          isUser ? "rounded-br-none" : "rounded-bl-none",
          isUser ? "mr-1" : "ml-1",
        ].join(" ")}
      >
        {text}
      </div>

      {isUser && (
        <CircleAvatar
          src={USER_AVATAR}
          alt={name || "You"}
          initials={(name?.[0] ?? "Y").toUpperCase()}
          size={32}
        />
      )}
    </div>
  );
}

function ChatPanel({
  open,
  messages,
  scrollRef,
  variant = "inline",
  children,
}: {
  open: boolean;
  messages: ChatMsg[];
  scrollRef: React.RefObject<HTMLDivElement>;
  variant?: "inline" | "floating";
  children?: React.ReactNode;
}) {
  if (!open) return null;

  const ChatBody = (
    <div className="rounded-3xl backdrop-blur-md ring-1 ring-white/12 shadow-[0_12px_40px_rgba(0,0,0,0.55)]">
      <div
        ref={scrollRef}
        className="max-h-[50vh] overflow-y-auto py-3 md:py-4 space-y-2 md:space-y-3 scroll-smooth"
      >
        {messages.length === 0 ? (
          <div className="text-center text-white/60 text-sm py-8 px-4">เริ่มพิมพ์คำถามด้านบนเพื่อเริ่มแชท</div>
        ) : (
          messages.map((m) => <ChatBubble key={m.id} role={m.role} text={m.text} />)
        )}
      </div>

      {children && <div className="border-t border-white/10 p-2 md:p-3">{children}</div>}
    </div>
  );

  if (variant === "inline") return <div className="mt-3">{ChatBody}</div>;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8, scaleY: 0.96 }}
        animate={{ opacity: 1, y: 0, scaleY: 1 }}
        exit={{ opacity: 0, y: -8, scaleY: 0.96 }}
        transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
        className="absolute left-0 right-0 top-full z-50 mt-3"
      >
        {ChatBody}
      </motion.div>
    </AnimatePresence>
  );
}

/** ================== Memo ของเอฟเฟกต์พื้นหลัง ================== */
const SparklesCoreMemo = memo(SparklesCore);
const MeteorsMemo = memo(Meteors);
const ModelCanvasMemo = memo(ModelCanvas);

/** ================== Hero ================== */
export default function Hero(): ReactElement {
  const heroText = content.hero;

  // === แชท: state แบบย่อ ===
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([
    { id: "welcome", role: "assistant", text: "สวัสดี! พิมพ์ถามอะไรก็ได้ 🙂" },
  ]);
  const [inputText, setInputText] = useState("");

  const chatWrapRef = useRef<HTMLDivElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  const [isModelLoaded, setIsModelLoaded] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setIsModelLoaded(true), 1500);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!chatOpen) return;
    chatScrollRef.current?.scrollTo({
      top: chatScrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, chatOpen]);

  const [isRecording, setIsRecording] = useState(false);
  const toggleMic = useCallback(() => setIsRecording((s) => !s), []);

  const onSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const text = inputText.trim();
      if (!text) return;

      setChatOpen(true);
      const userMsg: ChatMsg = { id: uid(), role: "user", text };
      setMessages((prev) => [...prev, userMsg]);
      setInputText("");

      const botMsg: ChatMsg = {
        id: uid(),
        role: "assistant",
        text: "นี่คือข้อความตอบกลับตัวอย่าง (demo).",
      };
      setTimeout(() => setMessages((prev) => [...prev, botMsg]), 200);
    },
    [inputText]
  );

  const inputSharedProps = {
    radius: "full" as const,
    variant: "flat" as const,
    placeholder: "Ask me anything",
    "aria-label": "Ask me anything",
    autoComplete: "off",
    spellCheck: false,
    classNames: {
      base: "w-full",
      inputWrapper:
        "rounded-full shadow-none border-none bg-transparent " +
        "h-10 lg:h-13 md:h-13 px-2 md:px-3 " +
        "data-[hover=true]:bg-transparent group-hover:bg-transparent",
      input: " md:text-base text-white",
      innerWrapper: "gap-2",
    },
    startContent: (
      <div className="mx-auto mr-1 ml-2 flex items-center justify-between gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-full">
          <Star />
        </span>
        <span className="mr-2 ml-4 h-5 w-px bg-white/10" />
      </div>
    ),
  };

  return (
    <section className="relative flex flex-col items-center justify-center px-4 text-center">
      <div className="absolute inset-0 z-0">
        <SparklesCoreMemo
          background="transparent"
          minSize={0.2}
          maxSize={0.6}
          particleDensity={1}
          speed={0.15}
          className="h-full w-full"
          particleColor="#FFFFFF"
        />
      </div>
      <div className="pointer-events-none absolute top-0 left-0 z-10 h-full w-full">
        <MeteorsMemo number={1} className="opacity-40" />
      </div>
      {isModelLoaded && (
        <div className="pointer-events-none absolute inset-0 z-20 select-none">
          <ModelCanvasMemo />
        </div>
      )}

      <div className="relative z-20">
        <HeroContent subtitle={heroText.subtitle} line1={heroText.line1} line2={heroText.line2} />
      </div>

      {/* ====== Input + Chat ====== */}
      <div
        ref={chatWrapRef}
        className="pointer-events-auto relative z-40 px-4 md:px-0 mx-auto mt-8 mb-10 w-full max-w-full md:mt-3 md:max-w-lg md:min-w-xl lg:max-w-xl lg:min-w-2xl"
      >
        {chatOpen && (
          <ChatPanel open variant="inline" messages={messages} scrollRef={chatScrollRef}>
            <form onSubmit={onSubmit}>
              <GlowFrame className="rounded-full">
                <Input
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      (e.currentTarget.form as HTMLFormElement | null)?.requestSubmit();
                    }
                  }}
                  onFocus={disableZoom}    
                  onBlur={enableZoom}      
                  {...inputSharedProps}
                  endContent={
                    <div className="mr-2 flex items-center gap-3">
                      <PlusButton />
                      <MicButton listening={isRecording} onToggle={toggleMic} />
                      <SendButton disabled={!inputText.trim()} />
                    </div>
                  }
                />
              </GlowFrame>
            </form>
          </ChatPanel>
        )}

        {!chatOpen && (
          <form onSubmit={onSubmit} className="relative">
            <GlowFrame className="rounded-full">
              <Input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onFocus={() => {
                  disableZoom();          
                  setChatOpen(true);       
                }}
                onClick={() => setChatOpen(true)}
                onBlur={enableZoom}       
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    (e.currentTarget.form as HTMLFormElement | null)?.requestSubmit();
                  }
                }}
                {...inputSharedProps}
                endContent={
                  <div className="mr-2 flex items-center gap-1">
                    <PlusButton />
                    <MicButton listening={isRecording} onToggle={toggleMic} />
                    <SendButton disabled={!inputText.trim()} />
                  </div>
                }
              />
            </GlowFrame>
          </form>
        )}
      </div>

      <div className="relative z-30 md:pt-20 mx-auto md:w-[60%] lg:mb-20 lg:w-[80%] lg:max-w-5xl">
        <GradientMask>
          <InfiniteMarquee speed={0.7}>
            <LogoGrid />
          </InfiniteMarquee>
        </GradientMask>
      </div>
    </section>
  );
}
