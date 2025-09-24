"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Link } from "@nextui-org/react";
import GradientBorderText from "./GradientBorderText";
import { containerVariants, itemVariants } from "./animations";

type ProductSubItem = {
  name: string;
  description: string;
  logo?: string;
  href?: string;
};
type ProductCategory = {
  description: string;
  logo?: string;
  subItems: ProductSubItem[];
};
type DropdownData = {
  products: Record<string, ProductCategory>;
  resources: { name: string; logo?: string; href?: string }[];
};
type NavbarContentData = { menuItems: string[] };

type MobileMenuProps = {
  isMenuOpen: boolean;
  setIsMenuOpen: (open: boolean) => void;
  activeDropdown: string | null;
  setActiveDropdown: (dropdown: string | null) => void;
  content: {
    navbar: NavbarContentData;
    dropdown: DropdownData;
  };
};

export default function MobileMenu({
  isMenuOpen,
  setIsMenuOpen,
  activeDropdown,
  setActiveDropdown,
  content,
}: MobileMenuProps) {
  // ล็อกการสกรอลล์พื้นหลังเมื่อเมนูเปิด
  // ล็อกสกอลล์พื้นหลังโดยไม่รีเซ็ตตำแหน่ง (iOS/ทุกเบราว์เซอร์โอเค)
  useEffect(() => {
    if (!isMenuOpen) return;

    const body = document.body;
    const html = document.documentElement;
    const scrollY = window.scrollY;

    // เก็บค่าเดิมไว้
    const prev = {
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
      overflow: body.style.overflow,
      htmlOverflowY: html.style.overflowY,
    };

    // ล็อกให้อยู่กับที่ โดยรักษาตำแหน่งสกอลล์ปัจจุบัน
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";
    body.style.overflow = "hidden";
    html.style.overflowY = "scroll";

    return () => {
      // คืนค่าเหมือนเดิม แล้วเลื่อนกลับไปตำแหน่งก่อนเปิด
      body.style.position = prev.position;
      body.style.top = prev.top;
      body.style.width = prev.width;
      body.style.overflow = prev.overflow;
      html.style.overflowY = prev.htmlOverflowY;

      const y = -parseInt(body.style.top || "0", 10) || scrollY;
      window.scrollTo(0, y);
    };
  }, [isMenuOpen]);


  return (
    <AnimatePresence initial={false} mode="wait">
      {isMenuOpen && (
        <motion.div
          key="mobile-menu-overlay"
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[9999] h-screen w-screen mobileMenuOverlay"
          initial={{ opacity: 0, clipPath: "circle(0% at calc(100% - 50px) 50px)" }}
          animate={{ opacity: 1, clipPath: "circle(150% at calc(100% - 50px) 50px)" }}
          exit={{ opacity: 0, clipPath: "circle(0% at calc(100% - 50px) 50px)" }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          style={{ willChange: "clip-path, opacity", WebkitClipPath: "circle(150% at calc(100% - 50px) 50px)" }}
        >
          <style jsx global>{`
            @supports not (clip-path: circle(100% at 50% 50%)) {
              .mobileMenuOverlay {
                clip-path: none !important;
              }
            }
          `}</style>

          <div className="absolute inset-0 " />

          <div className="relative z-10 bg-black backdrop-blur-md h-full w-full p-5 mt-4">
            <button
              onClick={() => {
                setIsMenuOpen(false);
                setActiveDropdown(null);
              }}
              aria-label="Close menu"
              className="absolute text-white"
              style={{
                top: "calc(env(safe-area-inset-top, 0px) + 16px)",
                right: "calc(env(safe-area-inset-right, 0px) + 16px)",
              }}
            >
              <Image
                width={20}
                height={20}
                src="/svg/x-symbol.svg"
                alt="close icon"
                priority   // กันกระพริบ/โหลดช้า
              />
            </button>

            <motion.div
              className="no-scrollbar mt-10 flex-1 overflow-y-auto text-white"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {/* Product */}
              <motion.div key="product-menu" variants={itemVariants}>
                <button
                  onClick={() =>
                    setActiveDropdown(activeDropdown === "products" ? null : "products")
                  }
                  className="flex w-full items-center justify-between text-left text-lg font-bold"
                  aria-expanded={activeDropdown === "products"}
                  aria-controls="products-panel"
                >
                  <span>Product</span>
                  <span
                    className={`transform transition-transform duration-200 ${activeDropdown === "products" ? "rotate-180" : ""
                      }`}
                  >
                    <Image width={20} height={20} src="/svg/dropdown-arrow.svg" alt="dropdown-arrow" className="object-contain" />
                  </span>
                </button>

                <AnimatePresence initial={false} mode="wait">
                  {activeDropdown === "products" && (
                    <motion.div
                      id="products-panel"
                      key="products-panel"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="mt-4 grid grid-cols-2 gap-x-3 pl-2"
                    >
                      {Object.entries(content.dropdown.products).map(([category, data]) => (
                        <div key={category} className="space-y-3">
                          <GradientBorderText logo={data.logo}>
                            <div className="ml-1 flex flex-col">
                              <h4 className="gradient-text-animated text-xs font-bold">
                                {data.description}
                              </h4>
                              <div className="mt-1 text-xs leading-tight text-[#676767]">
                                {category}
                              </div>
                            </div>
                          </GradientBorderText>

                          <div className="flex flex-col gap-7 pl-1">
                            {data.subItems.map((subItem) => (
                              <Link
                                key={`${category}-${subItem.name}`}
                                href={subItem.href ?? "#"}
                                onClick={() => setIsMenuOpen(false)}
                                className="group block rounded-md p-1"
                              >
                                <div className="flex items-center gap-2">
                                  {subItem.logo && (
                                    <Image
                                      src={subItem.logo}
                                      alt={`${subItem.name} logo`}
                                      width={20}
                                      height={20}
                                      className="flex-shrink-0 object-contain"
                                    />
                                  )}
                                  <div className="flex flex-col">
                                    <span className="text-[12px] font-semibold text-white">
                                      {subItem.name}
                                    </span>
                                  </div>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Items อื่น (ยกเว้น Product/Resources) */}
              {content.navbar.menuItems
                .filter((item) => item !== "Product" && item !== "Resources")
                .map((label) => (
                  <motion.div key={`menu-${label}`} variants={itemVariants} className="mt-6">
                    <Link href="#" onClick={() => setIsMenuOpen(false)} className="text-lg font-bold">
                      {label}
                    </Link>
                  </motion.div>
                ))}

              {/* Resources */}
              <motion.div key="resources-menu" variants={itemVariants}>
                <button
                  onClick={() =>
                    setActiveDropdown(activeDropdown === "resources" ? null : "resources")
                  }
                  className="mt-6 flex w-full items-center justify-between text-left text-lg font-bold"
                  aria-expanded={activeDropdown === "resources"}
                  aria-controls="resources-panel"
                >
                  <span>Resources</span>
                  <span
                    className={`transform transition-transform duration-200 ${activeDropdown === "resources" ? "rotate-180" : ""
                      }`}
                  >
                    <Image width={20} height={20} src="/svg/dropdown-arrow.svg" alt="dropdown-arrow" className="object-contain" />
                  </span>
                </button>

                <AnimatePresence initial={false} mode="wait">
                  {activeDropdown === "resources" && (
                    <motion.div
                      id="resources-panel"
                      key="resources-panel"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="mt-3 ml-3 flex flex-col gap-2"
                    >
                      {content.dropdown.resources.map((item) => (
                        <Link
                          key={`res-${item.name}`}
                          href={item.href ?? "#"}
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-3 text-sm text-white"
                        >
                          {item.logo && (
                            <Image
                              src={item.logo}
                              alt={`${item.name} logo`}
                              width={22}
                              height={22}
                              className="flex-shrink-0 object-contain"
                            />
                          )}
                          {item.name}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
