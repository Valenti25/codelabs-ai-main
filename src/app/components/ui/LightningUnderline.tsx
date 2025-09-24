"use client";
import * as React from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

type Dir = "left" | "right";

export default function LightningUnderline({
  dir,
  idleWidth = 48,
  movingWidth = 150,
}: {
  dir: Dir;
  idleWidth?: number;
  movingWidth?: number;
}) {
  const ref = React.useRef<HTMLSpanElement | null>(null);
  const prevX = React.useRef<number | null>(null);

  const [moving, setMoving] = React.useState(false);
  const [liveDir, setLiveDir] = React.useState<Dir>(dir);

  // ===== physics bases (raw) =====
  const baseScaleX = useMotionValue(1);
  const baseScaleY = useMotionValue(1);

  // ===== springs =====
  const scaleX = useSpring(baseScaleX, { stiffness: 140, damping: 24, mass: 1.2 });
  const scaleY = useSpring(baseScaleY, { stiffness: 160, damping: 26, mass: 1.2 });
  const shear = useSpring(0, { stiffness: 220, damping: 20, mass: 0.9 });

  // ใช้ spring + target สำหรับ offset (impulse)
  const offsetXTarget = useMotionValue(0);
  const offsetX = useSpring(offsetXTarget, { stiffness: 180, damping: 16, mass: 0.9 });

  const ratio = Math.max(1, movingWidth / idleWidth);

  // ===== tuning constants =====
  const SPEED_NORM = 22;
  const STRETCH_GAIN = 0.55;
  const Y_SQUASH = 0.44;
  const SHEAR_GAIN = 8.5;
  const OFFSET_GAIN = 0.9;

  // ===== Idle fallback: กันค้างนานเกินไป =====
  const idleTimer = React.useRef<number | null>(null);
  const armIdleTimer = React.useCallback(() => {
    if (idleTimer.current) window.clearTimeout(idleTimer.current);
    // 380ms หลังเริ่มวิ่ง ให้บังคับจบเป็นเส้นขาว (พอดีๆ)
    idleTimer.current = window.setTimeout(() => setMoving(false), 380);
  }, []);

  // ===== tracking movement =====
  React.useEffect(() => {
    if (!moving) return;

    armIdleTimer(); // เริ่มจับเวลาเมื่อเริ่มวิ่ง

    let raf = 0;
    const tick = () => {
      const el = ref.current;
      if (el) {
        const x = el.getBoundingClientRect().left;
        const p = prevX.current;

        if (p !== null) {
          const dx = x - p;
          const sign = dx >= 0 ? 1 : -1;
          const speed = Math.min(1, Math.abs(dx) / SPEED_NORM);

          if (Math.abs(dx) > 0.25) setLiveDir(sign > 0 ? "right" : "left");

          // ปั้นหุ่นไฟตอนกำลังวิ่ง
          const targetX = ratio * (1 + STRETCH_GAIN * speed);
          const squash = 1 + Y_SQUASH * (targetX / ratio - 1);
          baseScaleX.set(targetX);
          baseScaleY.set(1 / squash);
          shear.set(SHEAR_GAIN * speed * sign);

          // impulse สั้นๆ แล้วรีเซ็ต เพื่อไม่ให้แอนิเมชันยาวเกิน
          const impulse = dx * OFFSET_GAIN;
          offsetX.stop?.();
          offsetXTarget.set(impulse);
          requestAnimationFrame(() => {
            offsetXTarget.set(0);
          });

          // ถ้า dx เล็กมากๆ ต่อเนื่อง ให้นับเป็น "เข้า idle" เร็วขึ้น
          if (Math.abs(dx) < 0.2) armIdleTimer();
        }

        prevX.current = x;
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      if (idleTimer.current) window.clearTimeout(idleTimer.current);
    };
  }, [moving, ratio, armIdleTimer, baseScaleX, baseScaleY, shear, offsetX, offsetXTarget]);

  // ===== reset เมื่อหยุดเคลื่อน =====
  React.useLayoutEffect(() => {
    if (ref.current) prevX.current = ref.current.getBoundingClientRect().left ?? null;

    if (!moving) {
      baseScaleX.set(1);
      baseScaleY.set(1);
      shear.set(0);
      offsetXTarget.set(0);
    }
  }, [moving, baseScaleX, baseScaleY, shear, offsetXTarget]);

  const d: Dir = moving ? liveDir : dir;
  const origin = d === "right" ? "right" : "left";

  return (
    <motion.span
      ref={ref}
      layoutId="tab-underline"
      className="pointer-events-none absolute -bottom-1 left-1/2 -translate-x-1/2"
      style={{ width: idleWidth, height: 22, willChange: "transform" }}
      // ► เปลี่ยน shared-layout ให้เป็น tween จบชัดๆ ไม่รอ rest/settle ของ spring
      transition={{ type: "tween", ease: [0.22, 1, 0.36, 1], duration: 0.32 }}
      onLayoutAnimationStart={() => {
        setMoving(true);
        armIdleTimer(); // กันยืดเยื้อ
      }}
      onLayoutAnimationComplete={() => {
        if (idleTimer.current) window.clearTimeout(idleTimer.current);
        setMoving(false);
      }}
    >
      {/* Static state - simple white line */}
      {!moving && (
        <div
          className="absolute left-0 right-0 top-1/2 -translate-y-1/2 rounded-full"
          style={{ height: 2, background: "#ffffff", opacity: 0.8 }}
        />
      )}

      {/* Moving state - lightning bolt */}
      {moving && (
        <motion.div
          className="absolute left-0 right-0 top-1/2 -translate-y-1/2 overflow-visible"
          style={{ transformOrigin: `${origin} center`, scaleX, scaleY, x: offsetX, skewX: shear, willChange: "transform" }}
        >
          {/* Main lightning beam */}
          <div
            className="absolute inset-0"
            style={{
              height: 3,
              background:
                "linear-gradient(90deg, #1e3a8a 0%, #1e40af 25%, #3b82f6 50%, #60a5fa 75%, #93c5fd 100%)",
              boxShadow:
                "0 0 8px rgba(59, 130, 246, 0.8), 0 0 20px rgba(59, 130, 246, 0.5), 0 0 32px rgba(59, 130, 246, 0.3)",
              WebkitMaskImage:
                d === "right"
                  ? "linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.1) 5%, rgba(0,0,0,0.4) 20%, rgba(0,0,0,0.8) 40%, rgba(0,0,0,1) 100%)"
                  : "linear-gradient(90deg, rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 60%, rgba(0,0,0,0.4) 80%, rgba(0,0,0,0.1) 95%, rgba(0,0,0,0) 100%)",
              maskImage:
                d === "right"
                  ? "linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.1) 5%, rgba(0,0,0,0.4) 20%, rgba(0,0,0,0.8) 40%, rgba(0,0,0,1) 100%)"
                  : "linear-gradient(90deg, rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 60%, rgba(0,0,0,0.4) 80%, rgba(0,0,0,0.1) 95%, rgba(0,0,0,0) 100%)",
            }}
          />

          {/* Bright core */}
          <div
            className="absolute left-0 right-0 top-1/2 -translate-y-1/2"
            style={{
              height: 1.2,
              background:
                "linear-gradient(90deg, rgba(255,255,255,0.8) 0%, rgba(147,197,253,0.9) 30%, rgba(255,255,255,1) 70%, rgba(147,197,253,0.8) 100%)",
              boxShadow: "0 0 4px rgba(255, 255, 255, 0.9)",
              WebkitMaskImage:
                d === "right"
                  ? "linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.3) 15%, rgba(0,0,0,0.8) 40%, rgba(0,0,0,1) 100%)"
                  : "linear-gradient(90deg, rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 60%, rgba(0,0,0,0.3) 85%, rgba(0,0,0,0) 100%)",
              maskImage:
                d === "right"
                  ? "linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.3) 15%, rgba(0,0,0,0.8) 40%, rgba(0,0,0,1) 100%)"
                  : "linear-gradient(90deg, rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 60%, rgba(0,0,0,0.3) 85%, rgba(0,0,0,0) 100%)",
            }}
          />

          {/* Electric crackling */}
          <div className="absolute inset-0 overflow-hidden" style={{ mixBlendMode: "screen", opacity: 0.6 }}>
            <div
              className="absolute inset-0 animate-electric-pulse"
              style={{
                background:
                  "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 30%, rgba(147,197,253,0.6) 50%, rgba(255,255,255,0.4) 70%, transparent 100%)",
                height: 4,
                top: "50%",
                transform: "translateY(-50%)",
              }}
            />
          </div>

          {/* Moving sweep */}
          <div className="absolute inset-0 overflow-hidden" style={{ mixBlendMode: "screen", opacity: 0.3 }}>
            <div className="absolute -inset-x-32 inset-y-[1px] animate-lightning-sweep bg-gradient-to-r from-transparent via-white/80 to-transparent" />
          </div>
        </motion.div>
      )}

      <style jsx>{`
        @keyframes lightning-sweep {
          0%   { transform: translateX(-100%); opacity: 0; }
          20%  { opacity: 0.8; }
          80%  { opacity: 0.8; }
          100% { transform: translateX(100%); opacity: 0; }
        }
        @keyframes electric-pulse {
          0%, 100% { opacity: 0.4; filter: blur(0px); }
          50% { opacity: 0.8; filter: blur(0.5px); }
        }
        .animate-lightning-sweep { animation: lightning-sweep 1.2s cubic-bezier(0.22,1,0.36,1) infinite; }
        .animate-electric-pulse { animation: electric-pulse 0.15s ease-in-out infinite alternate; }
      `}</style>
    </motion.span>
  );
}
