"use client";

import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Link,
  Button,
} from "@nextui-org/react";
import Image from "next/image";
import React, { useState, useEffect, useRef } from "react";
import content from "@/locales/en/home.json";
import ProductsDropdown from "./ProductsDropdown";
import ResourcesDropdown from "./ResourcesDropdown";
import MobileMenu from "./MobileMenu";

/* ================= Framed CTA ================= */
function FramedCTA({
  children,
  className = "",
  size = "md",
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  size?: "sm" | "md";
  onClick?: () => void;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = wrapRef.current?.getBoundingClientRect();
    if (!r) return;
    setPos({ x: e.clientX - r.left, y: e.clientY - r.top });
  };

  const sizing =
    size === "sm" ? "px-5 py-2 text-xs" : "px-8 py-2 text-sm md:text-base";

  return (
    <div
      ref={wrapRef}
      onMouseMove={onMove}
      className="group relative inline-flex overflow-hidden rounded-[14px] md:p-[1px] border-0 card-outer-bg card-outer-shadow"
    >
      <span
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(120px circle at ${pos.x}px ${pos.y}px, rgba(255,255,255,0.18), transparent 45%)`,
        }}
      />
      <Button
        onClick={onClick}
        radius="lg"
        className={`relative z-10 rounded-[13px] card-inner-bg card-inner-blur font-semibold text-white ${sizing} ${className}`}
      >
        {children}
      </Button>
    </div>
  );
}
/* ============================================================== */

export default function AppNavbar() {
  const [isMobile, setIsMobile] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);

  // fixed header + spacer
  const fixedWrapRef = useRef<HTMLDivElement>(null);
  const [headerH, setHeaderH] = useState(0);

  const menuRef = useRef<HTMLDivElement>(null);
  const dropdownContainerRef = useRef<HTMLDivElement>(null);
  const dropdownMenuRef = useRef<HTMLDivElement>(null);
  const resourcesDropdownRef = useRef<HTMLDivElement>(null);
  const resourcesMenuRef = useRef<HTMLDivElement>(null);
  const leaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const measureHeader = () => {
    if (!fixedWrapRef.current) return;
    const h = fixedWrapRef.current.getBoundingClientRect().height;
    setHeaderH(Math.ceil(h));
  };

  useEffect(() => {
    const onResize = () => {
      setIsMobile(window.innerWidth < 1024);
      measureHeader();
    };
    const onScroll = () => {
      setScrolled((window.scrollY || document.documentElement.scrollTop) > 16);
      measureHeader();
    };
    const onClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node))
        setIsMenuOpen(false);
      if (
        dropdownContainerRef.current &&
        !dropdownContainerRef.current.contains(e.target as Node) &&
        dropdownMenuRef.current &&
        !dropdownMenuRef.current.parentElement?.contains(e.target as Node) &&
        resourcesDropdownRef.current &&
        !resourcesDropdownRef.current.contains(e.target as Node) &&
        resourcesMenuRef.current &&
        !resourcesMenuRef.current.parentElement?.contains(e.target as Node)
      ) {
        setActiveDropdown(null);
      }
    };

    // init
    onResize();
    onScroll();

    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("mousedown", onClickOutside);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("mousedown", onClickOutside);
    };
  }, []);

  useEffect(() => {
    if (isMobile) setActiveDropdown(null);
    if (!isMobile) setIsMenuOpen(false);
  }, [isMobile]);

  const handleMouseEnter = (dropdown: string) => {
    if (leaveTimeoutRef.current) clearTimeout(leaveTimeoutRef.current);
    if (!isMobile) setActiveDropdown(dropdown);
  };
  const handleMouseLeave = () => {
    leaveTimeoutRef.current = setTimeout(() => setActiveDropdown(null), 200);
  };

  return (
    <div className="relative md:rounded-lg no-focus-ring">
      {/* spacer กันกระโดด */}
      <div style={{ height: headerH }} aria-hidden />

      {/* header fixed ติดจอ */}
      <div ref={fixedWrapRef} className="fixed left-0 right-0 top-0 z-[60]">
        <Navbar
          maxWidth="full"
          classNames={{
            base:
              "relative z-50 backdrop-blur-none py-4 px-1 md:px-12 lg:py-10 transition-all duration-300",
            wrapper: [
              "!px-0 sm:!px-2 md:!px-4 lg:!px-6",
              "transition-all duration-300",
              // ⬇️ หุบเฉพาะคอนเทนเนอร์ (เดสก์ท็อปแคบลง, มือถือยังเกือบเต็ม)
              scrolled
                ? "max-w-[calc(100%-12px)] mx-auto lg:max-w-7xl"
                : "max-w-full mx-auto lg:max-w-[88rem]",
            ].join(" "),
          }}
        >
          {/* ซ้าย: โลโก้ (เดสก์ท็อป) */}
          <NavbarContent justify="start" className="hidden lg:flex text-white">
            <NavbarBrand>
              <Image
                src="/images/codelabs-logo.png"
                alt="codelabs-logo"
                width={210}
                height={67}
                priority
              />
            </NavbarBrand>
          </NavbarContent>

          {/* กลาง: เมนูเดสก์ท็อป (คงเดิม) */}
          {!isMobile && (
            <NavbarContent
              justify="center"
              className="mx-auto flex items-center justify-center lg:flex flex-1"
            >
              <div className="flex items-center gap-10 text-base font-bold text-white rounded-full px-8 py-3 bg-white/5 backdrop-blur-md ring-1 ring-white/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                <div
                  ref={dropdownContainerRef}
                  className="relative rounded-lg"
                  onMouseEnter={() => handleMouseEnter("products")}
                  onMouseLeave={handleMouseLeave}
                >
                  <NavbarItem className="relative">
                    <div className="relative z-10 flex cursor-pointer items-center gap-1 text-white/90 transition-colors">
                      Product
                    </div>
                  </NavbarItem>
                </div>

                {content.navbar.menuItems
                  .filter((item) => item !== "Product" && item !== "Resources")
                  .map((label) => (
                    <NavbarItem key={label}>
                      <Link href="#" className="text-white/90">
                        {label}
                      </Link>
                    </NavbarItem>
                  ))}

                <div
                  ref={resourcesDropdownRef}
                  className="relative rounded-lg"
                  onMouseEnter={() => handleMouseEnter("resources")}
                  onMouseLeave={handleMouseLeave}
                >
                  <NavbarItem className="relative">
                    <div className="flex cursor-pointer items-center gap-1 leading-tight text-white/90 transition-colors">
                      Resources
                    </div>
                  </NavbarItem>
                </div>
              </div>
            </NavbarContent>
          )}

          {/* ขวา: CTA — มือถือให้อยู่ "กลางจอและกว้างๆ" */}
          <NavbarContent
            justify="end"
            className="text-sm flex items-center justify-center mx-auto lg:mt-0 lg:h-auto lg:justify-end lg:bg-transparent lg:rounded-none lg:backdrop-blur-0"
          >
            {isMobile ? (
              <div
                ref={menuRef}
                className={[
                  // อยู่กลางจอ + กว้างๆ (แทบเต็ม) + เว้นขอบข้างเล็กน้อย
                  "relative w-full max-w-[calc(100%-12px)] mx-auto px-2",
                  "flex items-center justify-center gap-3 w-full ",
                  "transition-all duration-300",
                  // เริ่มต้น: โปร่งใสไม่เบลอ → เมื่อเลื่อน: มีพื้นหลังจาง + เบลอ + เส้นขอบ
                  scrolled
                    ? "h-14 rounded-full bg-white/10 backdrop-blur-md ring-1 ring-white/10 shadow-[0_4px_12px_rgba(0,0,0,0.12)]"
                    : "h-14 rounded-full bg-transparent backdrop-blur-0 ring-0"
                ].join(" ")}
              >
                <Image
                  src="/images/codelabs-logo.png"
                  alt="codelabs-logo"
                  width={160}
                  height={45}
                  className="shrink-0"
                />
                <FramedCTA className="h-8 w-10 px-16 py-2 text-xs">
                  {content.navbar.buttonText}
                </FramedCTA>
                <Button
                  onClick={() => {
                    setActiveDropdown(null);
                    setIsMenuOpen(true);
                  }}
                  isIconOnly
                  className="bg-transparent p-2 mr-1 text-white shrink-0"
                >
                  <Image
                    width={28}
                    height={28}
                    src="./svg/hamberger.svg"
                    alt="Open menu"
                    className="object-contain"
                  />
                </Button>

                <MobileMenu
                  isMenuOpen={isMenuOpen}
                  setIsMenuOpen={setIsMenuOpen}
                  activeDropdown={activeDropdown}
                  setActiveDropdown={setActiveDropdown}
                  content={content}
                />
              </div>
            ) : (
              <NavbarItem className="relative">
                <FramedCTA>{content.navbar.buttonText}</FramedCTA>
              </NavbarItem>
            )}
          </NavbarContent>
        </Navbar>
      </div>

      {/* dropdown overlays เฉพาะเดสก์ท็อป */}
      {!isMobile && !isMenuOpen && activeDropdown === "products" && (
        <ProductsDropdown
          dropdownData={content.dropdown.products}
          dropdownMenuRef={dropdownMenuRef}
          handleMouseEnter={handleMouseEnter}
          handleMouseLeave={handleMouseLeave}
          top={headerH}
        />
      )}

      {!isMobile && !isMenuOpen && activeDropdown === "resources" && (
        <ResourcesDropdown
          dropdownData={content.dropdown.resources}
          resourcesMenuRef={resourcesMenuRef}
          handleMouseEnter={handleMouseEnter}
          handleMouseLeave={handleMouseLeave}
        />
      )}
    </div>
  );
}
