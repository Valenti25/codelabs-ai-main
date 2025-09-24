"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Props = {
  lineHref?: string;      
  messengerHref?: string;  
};

export default function FloatingChatButton({
  lineHref = "#",
  messengerHref = "#",
}: Props) {
  const [open, setOpen] = useState(false);

  // ปิดเมื่อคลิกนอก
  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);
  const items: Array<{
    key: "line" | "messenger";
    href: string;
    defaultSrc: string;
    hoverSrc: string;
    alt: string;
  }> = [
    {
      key: "line",
      href: lineHref,
      defaultSrc: "/svg/line.svg",
      hoverSrc: "/svg/line-hover.svg",
      alt: "LINE",
    },
    {
      key: "messenger",
      href: messengerHref,
      defaultSrc: "/images/messenger.png",
      hoverSrc: "/images/messenger-hover.png",
      alt: "messenger",
    },
  ];

  return (
    <div
      ref={rootRef}
      className={`fixed z-[9999] md:left-[10%] left-[5%] bottom-[max(16px,env(safe-area-inset-bottom))] md:bottom-[max(24px,env(safe-area-inset-bottom))]`}
    >
      {/* เมนูที่ 'ยืดขึ้น' แกน Y (ไอคอน 2 วง) */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scaleY: 0.6, y: 8 }}
            animate={{ opacity: 1, scaleY: 1, y: 0 }}
            exit={{ opacity: 0, scaleY: 0.6, y: 8 }}
            transition={{ type: "spring", stiffness: 520, damping: 32 }}
            className="absolute bottom-full mb-3 origin-bottom"
          >
            <div className="flex flex-col items-start gap-2">
              {items.map((it, idx) => (
                <motion.a
                  key={it.key}
                  href={it.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * idx }}
                  aria-label={it.alt}
                  className="group relative overflow-hidden rounded-full p-[1px] card-outer-bg card-outer-shadow"
                >
                  {/* วงกลมด้านใน (UI เดิม) */}
                  <span className="relative z-10 rounded-full card-inner-bg card-inner-blur border border-white/10 p-3 md:p-3.5 flex items-center justify-center hover:bg-white/5 transition">
                    <IconSwap
                      defaultSrc={it.defaultSrc}
                      hoverSrc={it.hoverSrc}
                      alt={it.alt}
                      size={20}
                    />
                  </span>
                </motion.a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ปุ่มลอยหลัก */}
      <div className="group relative overflow-hidden rounded-full p-[1px] card-outer-bg card-outer-shadow">
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label="Contact options"
          className="relative z-10 rounded-full card-inner-bg card-inner-blur md:p-5 p-4 text-white shadow-lg hover:bg-white/5 active:scale-95 transition"
        >
          <MessageCircle className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

/** ไอคอนที่ "แทนที่รูป" ตอน hover (ไม่ซ้อนรูป) */
function IconSwap({
  defaultSrc,
  hoverSrc,
  alt,
  size = 20,
}: {
  defaultSrc: string;
  hoverSrc: string;
  alt: string;
  size?: number;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <img
      src={hovered ? hoverSrc : defaultSrc}
      alt={alt}
      width={size}
      height={size}
      className="h-5 w-5 object-contain"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      onTouchStart={() => setHovered(true)}
      onTouchEnd={() => setHovered(false)}
    />
  );
}
