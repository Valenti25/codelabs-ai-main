"use client";

import { cn } from "@/lib/utils";
import React, { useEffect, useState } from "react";

const Meteors = ({
  number,
  className,
}: {
  number?: number;
  className?: string;
}) => {
  const meteors = new Array(number || 20).fill(true);

  const [isClient, setIsClient] = useState<boolean>(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return <></>;

  return (
    <>
      {meteors.map((_, idx) => (
        <span
          key={"meteor-" + idx}
          className={cn(
            "animate-meteorEffect absolute top-0 left-1/2 h-0.5 w-0.5 rounded-[9999px] bg-neutral-500/30 shadow-[0_0_0_1px_#ffffff10]",
            "before:absolute before:top-1/2 before:h-[1px] before:w-[50px] before:-translate-y-[50%] before:transform before:bg-gradient-to-r before:from-neutral-500/30 before:to-transparent before:content-['']",
            className,
          )}
          style={{
            top: 0,
            left: Math.floor(Math.random() * (400 - -400) + -300) + "px",
            animationDelay: Math.random() * (0.8 - 0.2) + 0.2 + "s",
            animationDuration: Math.floor(Math.random() * (10 - 2) + 2) + "s",
          }}
        ></span>
      ))}
    </>
  );
};

export default Meteors;
