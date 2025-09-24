"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { NextUIProvider, Card, CardBody, Chip } from "@nextui-org/react";
import { CheckCircle2 } from "lucide-react";
import {
  motion,
  useMotionValue,
  useTransform,
  animate,
  useMotionValueEvent,
  AnimatePresence,
} from "framer-motion";
import Image from "next/image";

/* ----- Dynamic viewers ----- */
const ShowRoom = dynamic(() => import("./Home-Three/ShowRoom"), { ssr: false });
const ShowRoom2 = dynamic(() => import("./Home-Three/ShowRoom2"), {
  ssr: false,
});

/* ---------------------------------------- */
/*                ScanPhone                 */
/* ---------------------------------------- */
type ScanPhoneProps = {
  heading?: string | null;
  caption?: string;
  imgSrc?: string;
  imgAlt?: string;
  durationMs?: number;
  imgPct?: number;
  modelUrl?: string;
  modelScale?: number;
  /** เลือกคอมโพเนนต์โชว์รูม: "head" = ShowRoom, "card" = ShowRoom2 */
  showroom?: "head" | "card";
  /** เพิ่มคลาสสำหรับตัวการ์ด (ใช้กับสแน็ป/กว้าง) */
  className?: string;
};

function ScanPhone({
  heading = "Face ID",
  caption,
  imgSrc,
  imgAlt = "",
  durationMs = 2600,
  imgPct = 65,
  modelUrl,
  modelScale = 1,
  showroom = "head",
  className = "",
}: ScanPhoneProps) {
  const progress = useMotionValue(0);

  useEffect(() => {
    const controls = animate(progress, 1, {
      duration: durationMs / 1000,
      ease: [0.42, 0, 0.2, 1],
      repeat: Infinity,
      repeatType: "reverse",
    });
    return () => controls.stop();
  }, [durationMs, progress]);

  const fillHeight = useTransform(progress, (v) => `${v * 100}%`);
  const washOpacity = useTransform(progress, [0, 1], [0.9, 0.18]);
  const barWidth = useTransform(progress, (v) => `${v * 100}%`);
  const [percent, setPercent] = useState(0);
  useMotionValueEvent(progress, "change", (v) => setPercent(Math.round(v * 100)));

  // เลือก viewer ตามพร็อพ
  const Viewer = showroom === "card" ? ShowRoom2 : ShowRoom;

  return (
    <Card
      className={
        `relative mx-auto h-[460px] w-[250px] min-w-[250px] shrink-0 flex-none overflow-hidden rounded-[34px] border-4 border-white/10 bg-neutral-900/60 shadow-xl ${className}`
      }
    >
      <CardBody className="relative h-full p-4 pt-16 text-center">
        {heading ? (
          <p className="mb-1 text-sm font-semibold text-white">{heading}</p>
        ) : (
          <div className="mb-1 h-5" aria-hidden />
        )}

        {/* notch */}
        <div className="absolute top-2 left-1/2 h-1.5 w-20 -translate-x-1/2 rounded-full bg-white/15" />

        <div className="relative mt-8 h-[230px] overflow-hidden rounded-2xl border border-white/10 bg-black/40">
          <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.06),transparent_60%)]" />
          <div className="pointer-events-none absolute inset-0 [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:24px_24px]" />
          <span className="pointer-events-none absolute top-3 left-3 h-5 w-5 rounded-tl-lg border-t-2 border-l-2 border-white/95" />
          <span className="pointer-events-none absolute top-3 right-3 h-5 w-5 rounded-tr-lg border-t-2 border-r-2 border-white/95" />
          <span className="pointer-events-none absolute bottom-3 left-3 h-5 w-5 rounded-bl-lg border-b-2 border-l-2 border-white/95" />
          <span className="pointer-events-none absolute right-3 bottom-3 h-5 w-5 rounded-br-lg border-r-2 border-b-2 border-white/95" />

          {modelUrl ? (
            <div className="relative z-[1] h-full">
              {/* ใช้ viewer ตามที่เลือก */}
              <Viewer url={modelUrl} height={230} scale={modelScale} />
            </div>
          ) : (
            <div className="relative z-[1] flex h-full items-center justify-center">
              {imgSrc ? (
                <Image
                  src={imgSrc}
                  alt={imgAlt}
                  width={250}
                  height={250}
                  style={{ height: `${imgPct}%` }}
                  className="w-auto object-contain opacity-90 select-none"
                  draggable={false}
                />
              ) : null}
            </div>
          )}

          {/* ===== Scan overlay + ปลายคลื่นหนา/เข้ม ===== */}
          <motion.div
            aria-hidden
            className="pointer-events-none absolute top-0 right-0 left-0 z-[2]"
            style={{ height: fillHeight, opacity: washOpacity }}
          >
            {/* ตัวเนื้อแถบสแกน */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to bottom, rgba(60,145,134,1) 0%, rgba(60,145,134,.48) 45%, rgba(60,145,134,.12) 100%)",
              }}
            />
            {/* หางหนาที่ก้นคลื่น (glow + core + highlight) */}
            <div className="pointer-events-none absolute right-0 -bottom-1 left-0 h-12 mix-blend-screen">
              {/* ก้อนเรืองแสงหนา */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "radial-gradient(120% 200% at 50% 100%, rgba(138,255,239,1) 0%, rgba(138,255,239,.75) 34%, rgba(138,255,239,.38) 60%, transparent 78%)",
                  filter: "blur(4px)",
                }}
              />
              {/* แกนสว่างตรงกลาง เพิ่ม punch */}
              <div
                className="absolute right-6 bottom-[10px] left-6 h-[6px] rounded-full opacity-90"
                style={{
                  background:
                    "linear-gradient(to right, transparent, rgba(180,255,247,.95), transparent)",
                }}
              />
              {/* เส้นคมที่ขอบก้นคลื่น */}
              <div className="absolute right-3 bottom-2 left-3 h-[3px] rounded-full bg-white/95" />
            </div>
          </motion.div>
        </div>

        <div className="mt-4">
          <p className="mb-1 text-xs text-white/70">{percent}% Verification</p>
          <div className="h-3 w-full overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="h-full rounded-full bg-[linear-gradient(70deg,#6aa6ff,#b26dff,#ff6ad5)]"
              style={{ width: barWidth }}
            />
          </div>
        </div>

        {caption && (
          <Chip
            size="sm"
            variant="bordered"
            className="absolute top-10 right-3 max-w-[70%] truncate"
          >
            {caption}
          </Chip>
        )}
      </CardBody>
    </Card>
  );
}

/* ---------------------------------------- */
/*               Result Phone               */
/* ---------------------------------------- */
type ResultPhoneProps = {
  successSrc?: string;
  failedSrc?: string;
  successTitle?: string;
  successDesc?: string;
  failedTitle?: string;
  failedDesc?: string;
  cycleMs?: number; // ระยะเวลาสลับ (มิลลิวินาที)
  startWith?: "success" | "failed";
  className?: string;
};

function SuccessPhone({
  successSrc = "/images/reslut.png",
  failedSrc = "/images/fail.png",
  successTitle = "Success!",
  successDesc = "Your identity is confirmed",
  failedTitle = "Failed!",
  failedDesc = "Your identity could not be verified",
  cycleMs = 2600,
  startWith = "success",
  className = "",
}: ResultPhoneProps) {
  const [mode, setMode] = useState<"success" | "failed">(startWith);

  useEffect(() => {
    const id = setInterval(() => {
      setMode((m) => (m === "success" ? "failed" : "success"));
    }, cycleMs);
    return () => clearInterval(id);
  }, [cycleMs]);

  return (
    <Card
      className={`relative mx-auto h-[460px] w-[250px] min-w-[250px] shrink-0 flex-none overflow-hidden rounded-[34px] border-4 border-white/10 bg-neutral-900/60 shadow-xl ${className}`}
    >
      <CardBody className="relative h-full p-4 pt-16 text-center">
        <div className="mb-1 h-5" aria-hidden />
        <div className="absolute top-2 left-1/2 h-1.5 w-20 -translate-x-1/2 rounded-full bg-white/15" />

        <div className="relative z-[1] mb-16 flex h-full flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            {mode === "success" ? (
              <motion.div
                key="success"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="flex flex-col items-center"
              >
                <Image
                  src={successSrc}
                  alt="Success"
                  width={96}
                  height={96}
                  className="h-24 w-24 object-contain select-none"
                  draggable={false}
                  priority
                />
                <h3 className="mt-6 text-lg font-semibold text-white">{successTitle}</h3>
                <p className="mt-1 text-xs text-white/70">{successDesc}</p>
              </motion.div>
            ) : (
              <motion.div
                key="failed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="flex flex-col items-center"
              >
                <Image
                  src={failedSrc}
                  alt="Failed"
                  width={96}
                  height={96}
                  className="h-24 w-24 object-contain select-none"
                  draggable={false}
                  priority
                />
                <h3 className="mt-6 text-lg font-semibold text-white">{failedTitle}</h3>
                <p className="mt-1 text-xs text-white/70">{failedDesc}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </CardBody>
    </Card>
  );
}

/* ---------------------------------------- */
/*                  Page                    */
/* ---------------------------------------- */
export default function Page() {
  return (
    <NextUIProvider>
      <main className="overflow-x-hidden bg-black text-white">
        <section className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
          <div className="mx-auto my-16 text-center">
            <p className="text-lg text-[#676767]">Instant, secure identity check</p>
            <h1 className="mt-2 text-xl md:text-[40px]">AI Face Recognition</h1>
          </div>

          {/* ================= Mobile: 3 การ์ดเรียงในแถวเดียว เลื่อนแนวนอน ================= */}
          <div
            className="md:hidden px-4 pb-2 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            aria-label="Face recognition cards scroller"
          >
            <div className="flex items-stretch gap-4 justify-start pr-4">
              <ScanPhone
                heading="Face ID"
                imgSrc="/images/face.png"
                imgAlt="Face ID scanning"
                imgPct={65}
                durationMs={2600}
                className="snap-start"
              />
              <ScanPhone
                heading="Card ID"
                showroom="head"
                modelUrl="/models/id_card.glb"
                modelScale={0.25}
                durationMs={2600}
                className="snap-start"
              />
              <SuccessPhone
                successSrc="/images/reslut.png"
                failedSrc="/images/fail.png"
                cycleMs={2600}
                startWith="success"
                className="snap-start"
              />
            </div>
          </div>

          {/* ================= Desktop / Tablet ขนาด md+: เลย์เอาต์เดิม ================= */}
          <div className="hidden md:block">
            <div className="mx-auto max-w-full gap-12 md:flex-row lg:flex lg:flex-nowrap lg:items-start lg:justify-center">
              {/* ซ้าย: ข้อความ */}
              <div className="w-full max-w-md md:justify-self-end">
                <div className="mt-8 sm:mt-10">
                  <h2 className="text-lg font-semibold">Secure access in one glance</h2>
                  <p className="mt-2 max-w-sm text-xs font-semibold text-[#676767]">
                    An AI-powered identity system that verifies, secures and grants access — instantly.
                  </p>

                  <div className="mt-8 max-w-xs">
                    <ul className="space-y-6">
                      <li className="flex items-start gap-3">
                        <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full">
                          <CheckCircle2 className="h-4 w-4 opacity-80" />
                        </span>
                        <div>
                          <div className="text-sm font-semibold text-white">Liveness Detection</div>
                          <p className="mt-1 text-xs font-semibold text-[#676767]">
                            prevents spoofing by detecting real faces vs. photos or videos
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full">
                          <CheckCircle2 className="h-4 w-4 opacity-80" />
                        </span>
                        <div>
                          <div className="text-sm font-semibold text-white">Fast Verification</div>
                          <p className="mt-1 text-xs font-semibold text-[#676767]">
                            instant recognition within milliseconds for smooth user experience
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full">
                          <CheckCircle2 className="h-4 w-4 opacity-80" />
                        </span>
                        <div>
                          <div className="text-sm font-semibold text-white">Adaptive Accuracy</div>
                          <p className="mt-1 text-xs font-semibold text-[#676767]">
                            improves over time with AI learning, adapting to different lighting and angles
                          </p>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* ขวา: การ์ด */}
              <div className="md:flex mt-20 md:mt-0 md:w-full flex-row">
                {/* แถวบน: 1–2 */}
                <div className="mx-auto flex flex-wrap items-center justify-center gap-8 overflow-visible pb-2 lg:flex-nowrap lg:justify-start">
                  <ScanPhone
                    heading="Face ID"
                    imgSrc="/images/face.png"
                    imgAlt="Face ID scanning"
                    imgPct={65}
                    durationMs={2600}
                  />
                  <ScanPhone
                    heading="Card ID"
                    showroom="head"
                    modelUrl="/models/id_card.glb"
                    modelScale={0.25}
                    durationMs={2600}
                  />
                </div>

                {/* คั่น */}
                <div className="mx-auto md:my-10 my-3 flex max-w-3xl items-center gap-3 px-4">
                  <div className="h-px w-full" />
                  <div className="h-px w-full" />
                </div>

                {/* แถวล่าง: การ์ดผลลัพธ์ */}
                <div className="mx-auto flex max-w-7xl items-center justify-center">
                  <SuccessPhone
                    successSrc="/images/reslut.png"
                    failedSrc="/images/fail.png"
                    cycleMs={2600}
                    startWith="success"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </NextUIProvider>
  );
}
