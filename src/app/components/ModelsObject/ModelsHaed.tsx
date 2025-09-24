"use client";

import React, { useRef } from "react";
import { Group } from "three";
import { useGLTF, Center } from "@react-three/drei";
import type { ThreeElements } from "@react-three/fiber"; 
type ModelProps = ThreeElements["group"] & {
  url?: string;
  scale?: number;
};

export default function Modelscard({
  url = "/models/wireframehead.glb",
  scale = 1,
  ...props
}: ModelProps) {
  const root = useRef<Group>(null);
  const { scene } = useGLTF(url);

  return (
    <group ref={root} {...props} dispose={null}>
      <Center>
        <primitive object={scene} scale={scale} />
      </Center>
    </group>
  );
}

useGLTF.preload("/models/wireframehead.glb");
