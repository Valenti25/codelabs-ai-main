'use client';

import { useLayoutEffect, useRef, useState } from 'react';

type RibbonProps = {
  text: string;
  bg: string;
  textCls: string;
  angle: number;
  top: string;
  height?: string;
  speedSec?: number;
  dashWidth?: string;
};

function RowContent({
  text,
  dashWidth,
}: {
  text: string;
  dashWidth: string;
}) {
  return (
    <div className="flex items-center gap-10 pr-10 text-[13px] font-semibold uppercase tracking-wider">
      {Array.from({ length: 35 }).map((_, i) => (
        <span key={i} className="flex items-center mt-2 gap-8">
          {text}
          <span className={`inline-block ${dashWidth} h-0.5 bg-current opacity-80`} />
        </span>
      ))}
    </div>
  );
}

function Ribbon({
  text,
  bg,
  textCls,
  angle,
  top,
  height = 'h-10',
  speedSec = 22,
  dashWidth = 'w-8',
}: RibbonProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const groupRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useLayoutEffect(() => {
    const wrap = wrapRef.current;
    const grp = groupRef.current;
    if (!wrap || !grp) return;

    const compute = () => {
      // ปัดขึ้นป้องกันเศษพิกเซลที่ทำให้เห็นรอยต่อ
      const w = Math.ceil(grp.getBoundingClientRect().width);
      if (w > 0) {
        wrap.style.setProperty('--loopW', `${w}px`);
        setReady(true);
      }
    };

    // รอฟอนต์เพื่อให้การวัดไม่เพี้ยน
    if ((document as Document).fonts?.ready) {
      (document as Document).fonts.ready.then(compute);
    }
    compute();

    const ro = new ResizeObserver(compute);
    ro.observe(grp);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      className={`absolute ${top} ${height} ${bg} ${textCls} z-[5] pointer-events-none select-none w-screen`}
      style={{ left: '50%', transform: `translateX(-50%) rotate(${angle}deg)` }}
    >
      <div ref={wrapRef} className="relative w-full overflow-hidden">
        <div className="absolute inset-0 [mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)]" />

        {/* แกนที่ขยับ: วาง 2 ชุดติดกัน แล้วเลื่อนเท่าความกว้างจริงของ 1 ชุด */}
        <div
          className={`flex items-center whitespace-nowrap will-change-transform ${ready ? 'animate-ribbon' : ''}`}
          style={{ ['--spd' as string]: `${speedSec}s` }}
        >
          <div ref={groupRef} className="flex items-center">
            <RowContent text={text} dashWidth={dashWidth} />
          </div>
          {/* ชุดที่สองสำหรับทำรอยต่อให้เนียน */}
          <div aria-hidden="true" className="flex items-center">
            <RowContent text={text} dashWidth={dashWidth} />
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes ribbon-move {
          0%   { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(calc(-1 * var(--loopW)), 0, 0); }
        }
        .animate-ribbon {
          animation: ribbon-move var(--spd) linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-ribbon { animation: none; }
        }
      `}</style>
    </div>
  );
}

export default function PromoRibbons() {
  const msg = 'SIGN UP FOR 10% OFF YOUR FIRST ORDER';

  return (
    <div className="relative w-full h-32 overflow-visible">
      <Ribbon
        text={msg}
        bg="bg-[#D7FF00]"
        textCls="text-black"
        angle={5}
        top="top-[30%]"
        height="h-8"
        speedSec={150}
        dashWidth="w-7"
      />
      <Ribbon
        text={msg}
        bg="bg-black"
        textCls="text-white"
        angle={-5}
        top="top-[85%]"
        height="h-8"
        speedSec={150}
        dashWidth="w-7"
      />
    </div>
  );
}
