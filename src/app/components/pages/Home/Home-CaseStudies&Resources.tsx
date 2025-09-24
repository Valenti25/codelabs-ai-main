"use client";

import React, { useRef } from "react";
import { Card, CardBody } from "@nextui-org/react";
import Image from "next/image";

const data = [
  {
    category: "Partner",
    title: "Codelabs AI Partners with Industry Leaders to Accelerate AI Innovation",
    image: "/images/codelabs-logo.png",
  },
  {
    category: "Case studies",
    title: "Customer Case Study: Transforming Businesses with Codelabs AI Solutions",
    image: "/images/codelabs-logo.png",
  },
  {
    category: "Blog",
    title: "Codelabs AI Research Team Unveils Next-Gen AI Performance Benchmarks",
    image: "/images/codelabs-logo.png",
  },
  {
    category: "Partner",
    title: "Codelabs AI Partners with Industry Leaders to Accelerate AI Innovation",
    image: "/images/codelabs-logo.png",
  },
  {
    category: "Partner",
    title: "Codelabs AI Partners with Industry Leaders to Accelerate AI Innovation",
    image: "/images/codelabs-logo.png",
  },
];

export default function ChatsalebyAI() {
  const scrollerRef = useRef<HTMLDivElement>(null);

  return (
    <section className="text-white flex flex-col items-center m-auto py-20 max-w-7xl">
      <div className="text-center mb-14 px-4">
        <p className="mb-3 text-lg text-[#676767]">AI-Driven Success Stories</p>
        <h2 className="text-xl lg:text-[40px]">Case Studies & Resources</h2>
      </div>

      <div
        ref={scrollerRef}
        className="w-full px-4 pb-2 overflow-x-auto snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        aria-label="Case studies scroller"
        role="region"
      >
        <ul className="flex items-stretch gap-4 justify-start pr-6">
          {data.map((item, idx) => (
            <li
              key={idx}
              className="snap-start shrink-0 w-[260px] md:w-[400px]"
            >
              <Card
                isHoverable
                className="bg-black rounded-xl md:rounded-3xl shadow-lg overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                role="article"
              >
                <CardBody className="p-0">
                  <div className="relative bg-[#0B0B0B] w-full h-[200px] md:h-[264px]">
                    <Image
                      fill
                      src={item.image}
                      alt={item.title}
                      className="object-contain pointer-events-none p-10 select-none"
                      draggable={false}
                      priority={idx < 2}
                    />
                  </div>
                  <div className="p-6">
                    <p className="text-sm gradient-text-animated mb-2">
                      {item.category}
                    </p>
                    <p className="md:text-sm text-xs">{item.title}</p>
                  </div>
                </CardBody>
              </Card>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
