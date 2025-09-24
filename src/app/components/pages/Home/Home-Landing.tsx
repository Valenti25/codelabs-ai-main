"use client";
import { Card, CardBody, Image } from "@nextui-org/react";
import { useState, useRef } from "react";
import content from "@/locales/en/home.json";

const data = {
  landing: {
    cards: [
      {
        alt: "money",
        defaultSrc: "/images/3dicons-money-iso-gradient.png",
        hoverSrc: "/images/money-iso-gradient.png",
      },
      {
        alt: "computer",
        defaultSrc: "/images/3dicons-computer-iso-gradient.png",
        hoverSrc: "/images/computer-iso-gradient.png",
      },
      {
        alt: "mobile",
        defaultSrc: "/images/3dicons-mobile-iso-gradient.png",
        hoverSrc: "/images/mobile-iso-gradient.png",
      },
    ],
  },
};

const CardComponent = ({ title, description, image }) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setMousePos({ x, y });
  };

  return (
    <div
      ref={cardRef}
      className="group card-outer-bg  card-outer-shadow md:mx-20 lg:mx-0 relative overflow-hidden rounded-[25px] p-[1px] transition-all"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setMousePos({ x: 0, y: 0 });
      }}
    >
      {/* แสงตามเมาส์ - แก้ไขแล้ว */}
      <div 
        className="pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity group-hover:opacity-100"
        style={{
          background: `radial-gradient(
            circle 180px at ${mousePos.x}px ${mousePos.y}px,
            rgba(255, 255, 255, 0.15),
            transparent 50%
          )`
        }}
      />
      
      <Card className="card-inner-bg card-inner-blur relative z-10 h-full rounded-[24px] border-0">
        <CardBody className="flex h-full flex-col justify-between p-6 text-center lg:p-8 lg:text-left">
          <div>
            <div className="mb-3 lg:mb-6 flex justify-center">
              <Image
                src={isHovered ? image.hoverSrc : image.defaultSrc}
                alt={image.alt}
                className="h-[100px] w-[100px] md:h-[170px] md:w-[170px] transition-transform group-hover:scale-105"
              />
            </div>
            <h3 className="mb-3 text-sm md:text-2xl group-hover:text-white">
              {title}
            </h3>
          </div>
          <p className="text-xs text-[#676767] md:text-sm font-semibold group-hover:text-white/90">
            {description}
          </p>
        </CardBody>
      </Card>
    </div>
  );
};

export default function LandingPage() {
  const landingContent = content.landing;
  const imageData = data.landing.cards;

  return (
    <section className="mx-auto max-w-[1270px] px-8 lg:px-4 py-16 text-white lg:py-24">
      {/* Landing Heading */}
      <div className="mb-12 text-center">
        <p className="mb-3 text-lg font-semibold text-[#676767] lg:text-xl">
          {landingContent.heading.smallTitle}
        </p>
        <h2 className="text-xl md:text-3xl lg:text-[40px]">
          {landingContent.heading.mainTitle}
        </h2>
        <div className="mx-auto font-semibold mt-4 max-w-4xl lg:px-2 text-xs text-[#676767] md:text-lg">
          <p>{landingContent.heading.description1}</p>
          <p className="md:max-w-lg lg:max-w-7xl text-center mx-auto">{landingContent.heading.description2}</p>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 gap-8 lg:px-6 pt-8 lg:grid-cols-3 lg:pt-12">
        {landingContent.cards.map(({ title, description }, i) => (
          <CardComponent
            key={i}
            title={title}
            description={description}
            image={imageData[i]}
          />
        ))}
      </div>
    </section>
  );
}