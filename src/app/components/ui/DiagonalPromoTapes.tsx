'use client';

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
  return (
    <div
      className={`absolute ${top} ${height} ${bg} ${textCls} z-[5] pointer-events-none select-none w-screen`}
      // ทำให้เต็มจอเสมอ (100vw) และไม่โดนจำกัดด้วยความกว้างของ parent
      style={{ left: '50%', transform: `translateX(-50%) rotate(${angle}deg)` }}
    >
      <div className="relative w-full overflow-hidden">
        <div className="absolute inset-0 [mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)]" />
        <div
          className="flex items-center whitespace-nowrap will-change-transform animate-[ribbon-move_var(--spd)_linear_infinite]"
          style={{ ['--spd']: `${speedSec}s` } as React.CSSProperties}
        >
          {[0, 1].map((k) => (
            <div key={k} className="flex items-center gap-10 pr-10 text-[13px] font-semibold uppercase tracking-wider">
              {Array.from({ length: 35 }).map((_, i) => (
                <span key={`${k}-${i}`} className="flex items-center mt-2 gap-8">
                  {text}
                  <span className={`inline-block ${dashWidth} h-0.5 bg-current opacity-80`} />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes ribbon-move {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}

export default function PromoRibbons() {
  const msg = 'SIGN UP FOR 10% OFF YOUR FIRST ORDER';

  return (
    // ถ้า section/parent ตัวไหนมี overflow-hidden อาจตัดขอบริบบิ้น
    // แนะนำใส่ overflow-visible กับตัวที่จะวางริบบิ้น
    <div className="relative w-full h-32 overflow-visible">
      <Ribbon
        text={msg}
        bg="bg-[#D7FF00]"
        textCls="text-black"
        angle={5}
        top="top-[30%]"
        height="h-8"
        speedSec={15}
        dashWidth="w-7"
      />
      <Ribbon
        text={msg}
        bg="bg-black"
        textCls="text-white"
        angle={-5}
        top="top-[85%]"
        height="h-8"
        speedSec={15}
        dashWidth="w-7"
      />
    </div>
  );
}
