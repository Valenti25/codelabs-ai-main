"use client";

import React, { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import Modelscard from "../../../ModelsObject/Modelscard";

type ShowRoomProps = {
  url?: string;
  height?: number;
  scale?: number;
  /** ระยะเวลาหมุน 0→π (วินาที) */
  turnDuration?: number;
  /** เวลาค้างตอน “ด้านหน้า” (วินาที) */
  holdFront?: number;
  /** เวลาค้างตอน “ด้านหลัง” (วินาที) */
  holdBack?: number;
  /** ทำ sway ซ้ายขวาก่อนเริ่มจริงกี่รอบ (ครั้ง) — 0 = ไม่ทำ */
  preSwayCycles?: number;
  /** ระยะเวลา sway ต่อหนึ่งรอบ (วินาที) */
  preSwayCycleDuration?: number;
  /** มุมแกว่งซ้ายขวาสูงสุดของ sway (องศา) */
  preSwayAmplitudeDeg?: number;
};

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/** ตัวช่วย map t 0..dur → 0..1 (clamped) */
function norm01(t: number, dur: number) {
  if (dur <= 0) return 1;
  const v = Math.max(0, Math.min(1, t / dur));
  return v;
}

/** เฟสของลูปอนิเมชัน */
type Phase = "preSway" | "toBack" | "holdBack" | "toFront" | "holdFront";

function OscillateModel({
  url,
  scale = 1,
  // ปรับท่าทาง/ความเร็วได้จากพร็อพด้านล่าง
  turnDuration = 2.4,
  holdFront = 0.6,
  holdBack = 0.8,
  preSwayCycles = 2,
  preSwayCycleDuration = 1.0,
  preSwayAmplitudeDeg = 8,
}: {
  url: string;
  scale?: number;
  turnDuration?: number;
  holdFront?: number;
  holdBack?: number;
  preSwayCycles?: number;
  preSwayCycleDuration?: number;
  preSwayAmplitudeDeg?: number;
}) {
  const g = useRef<THREE.Group>(null);
  const phaseRef = useRef<Phase>(preSwayCycles > 0 ? "preSway" : "toBack");
  const phaseStartTime = useRef(0);

  useFrame(({ clock }) => {
    if (!g.current) return;

    const t = clock.getElapsedTime();
    const phase = phaseRef.current;

    // ค่าคงที่ต่าง ๆ เป็นเรเดียน
    const FRONT = 0; // หันหน้า
    const BACK = Math.PI; // หันหลัง
    const swayAmp = THREE.MathUtils.degToRad(preSwayAmplitudeDeg);

    if (phase === "preSway") {
      // รวมเวลาทั้ง sway ทั้งหมด
      const totalSwayTime = preSwayCycles * preSwayCycleDuration;
      const elapsed = t - phaseStartTime.current;

      // ตั้งให้เริ่ม “ตรงหน้า” ก่อน
      let rot = FRONT;

      // เล่น sine ซ้าย-ขวา ขณะ elapsed อยู่ในช่วงรวม
      if (elapsed <= totalSwayTime) {
        const per = (elapsed / preSwayCycleDuration) % 1; // 0..1 ของรอบปัจจุบัน
        // easing ให้ค่อยเข้า-ค่อยออกในแต่ละรอบ
        const eased = easeInOutCubic(per);
        // sine จาก -amp..+amp (ศูนย์กลาง 0 = หันหน้าตรง)
        const sway = Math.sin(eased * Math.PI * 2) * swayAmp;
        rot += sway;
      } else {
        // จบ sway → snap กลับหน้าตรง และเข้าเฟสหมุนไปด้านหลัง
        rot = FRONT;
        phaseRef.current = "toBack";
        phaseStartTime.current = t;
      }

      g.current.rotation.y = rot;
      return;
    }

    if (phase === "toBack") {
      const elapsed = t - phaseStartTime.current;
      const u = easeInOutCubic(norm01(elapsed, turnDuration)); // 0..1
      g.current.rotation.y = FRONT + (BACK - FRONT) * u;
      if (elapsed >= turnDuration) {
        phaseRef.current = "holdBack";
        phaseStartTime.current = t;
      }
      return;
    }

    if (phase === "holdBack") {
      g.current.rotation.y = BACK;
      const elapsed = t - phaseStartTime.current;
      if (elapsed >= holdBack) {
        phaseRef.current = "toFront";
        phaseStartTime.current = t;
      }
      return;
    }

    if (phase === "toFront") {
      const elapsed = t - phaseStartTime.current;
      const u = easeInOutCubic(norm01(elapsed, turnDuration)); // 0..1
      g.current.rotation.y = BACK + (FRONT - BACK) * u;
      if (elapsed >= turnDuration) {
        phaseRef.current = "holdFront";
        phaseStartTime.current = t;
      }
      return;
    }

    // holdFront
    g.current.rotation.y = FRONT;
    const elapsed = t - phaseStartTime.current;
    if (elapsed >= holdFront) {
      // หลังจากค้างด้านหน้า → เข้าลูปหลักไปด้านหลังต่อ
      phaseRef.current = "toBack";
      phaseStartTime.current = t;
    }
  });

  return (
    <group ref={g}>
      <Modelscard url={url} scale={scale} />
    </group>
  );
}

export default function ShowRoom({
  url = "/models/id_card.glb",
  height = 420,
  scale = 1,
  // ค่าดีฟอลต์แบบ “นุ่มมือ”
  turnDuration = 2.4,
  holdFront = 0.6,
  holdBack = 0.8,
  preSwayCycles = 2,
  preSwayCycleDuration = 1.0,
  preSwayAmplitudeDeg = 8,
}: ShowRoomProps) {
  return (
    <div
      style={{
        width: "100%",
        height,
        borderRadius: 16,
        overflow: "hidden",
        background: "rgba(0,0,0,0.05)",
      }}
    >
      <Canvas camera={{ position: [2, 1, 15], fov: 11 }} shadows>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1.1} castShadow />
        <Suspense fallback={null}>
          <OscillateModel
            url={url}
            scale={scale}
            turnDuration={turnDuration}
            holdFront={holdFront}
            holdBack={holdBack}
            preSwayCycles={preSwayCycles}
            preSwayCycleDuration={preSwayCycleDuration}
            preSwayAmplitudeDeg={preSwayAmplitudeDeg}
          />
          <Environment preset="city" />
          <ContactShadows position={[0, -0.5, 0]} opacity={0.35} scale={10} blur={2.5} />
        </Suspense>

        {/* ถ้าอยากล็อกไม่ให้ผู้ใช้หมุนเอง: enableRotate={false} */}
        <OrbitControls enableDamping makeDefault />
      </Canvas>
    </div>
  );
}
