"use client";

import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
  memo,
} from "react";
import {
  Card,
  CardBody,
  Image as NextUIImage,
  Input,
  ScrollShadow,
} from "@nextui-org/react";
import { Search, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import { motion, useMotionValue, animate } from "framer-motion";
import Star from "../../ui/star";
import { Send, Mic, Plus } from "lucide-react";

type BrandName =
  | "ASUS"
  | "Lenovo"
  | "Dell"
  | "Apple"
  | "HP"
  | "Samsung"
  | "Huawei"
  | "Garmin";
type Noun = "Notebook" | "Tablet" | "Smartwatch" | "สินค้า";

type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  brand: BrandName;
};
type BrandOption = { brand: BrandName; query: string };
type SimpleOption = { label: string; query: string };

const UI = {
  productHeader: "สินค้า",
  Brand: "Brand",
  Specification: "Specification",
  Category: "Category",
  noResults: (q: string) => `ไม่พบสินค้าที่ตรงกับ "${q}"`,
};

type TextPage = { noun: string; query: string };
const TEXT_PAGES: TextPage[] = [
  { noun: "Notebook", query: "Notebook" },
  { noun: "Tablet", query: "Tablet" },
  { noun: "Smartwatch", query: "Smartwatch" },
];

const PRODUCTS_SET_1: Product[] = [
  {
    id: "p-asus-zenbook-14",
    name: "Notebook ASUS ZenBook 14",
    price: 32900,
    image: "/images/Notebook 1.png",
    brand: "ASUS",
  },
  {
    id: "p-lenovo-x1",
    name: "Lenovo ThinkPad X1 Carbon",
    price: 48900,
    image: "/images/Notebook 2.png",
    brand: "Lenovo",
  },
  {
    id: "p-dell-xps-13",
    name: "Dell XPS 13",
    price: 42500,
    image: "/images/Notebook 3.png",
    brand: "Dell",
  },
  {
    id: "p-apple-air-m2",
    name: "MacBook Air M2",
    price: 39900,
    image: "/images/Notebook 4.png",
    brand: "Apple",
  },
  {
    id: "p-hp-spectre-x360",
    name: "HP Spectre x360",
    price: 45500,
    image: "/images/Notebook 5.png",
    brand: "HP",
  },
];

const PRODUCTS_SET_2: Product[] = [
  {
    id: "p-asus-rog-g14",
    name: "ASUS ROG Zephyrus G14",
    price: 56900,
    image: "/images/Tablet 1.png",
    brand: "ASUS",
  },
  {
    id: "p-lenovo-yoga-7",
    name: "Lenovo Yoga Slim 7",
    price: 38900,
    image: "/images/Tablet 2.png",
    brand: "Lenovo",
  },
  {
    id: "p-dell-inspiron-14",
    name: "Dell Inspiron 14",
    price: 29900,
    image: "/images/Tablet 3.png",
    brand: "Dell",
  },
  {
    id: "p-apple-pro-14",
    name: "MacBook Pro 14 (M3)",
    price: 69900,
    image: "/images/Tablet 4.png",
    brand: "Apple",
  },
  {
    id: "p-hp-envy-13",
    name: "HP Envy 13",
    price: 31900,
    image: "/images/Tablet 5.png",
    brand: "HP",
  },
];

const PRODUCTS_SET_3: Product[] = [
  {
    id: "p-asus-vivobook-s15",
    name: "ASUS Vivobook S15",
    price: 27900,
    image: "/images/Smartwatch 1.png",
    brand: "ASUS",
  },
  {
    id: "p-lenovo-ideapad-5",
    name: "Lenovo IdeaPad 5",
    price: 24900,
    image: "/images/Smartwatch 2.png",
    brand: "Lenovo",
  },
  {
    id: "p-dell-latitude-7440",
    name: "Dell Latitude 7440",
    price: 45900,
    image: "/images/Smartwatch 3.png",
    brand: "Dell",
  },
  {
    id: "p-apple-air-m3",
    name: "MacBook Air M3",
    price: 42900,
    image: "/images/Smartwatch 4.png",
    brand: "Apple",
  },
  {
    id: "p-hp-pavilion-15",
    name: "HP Pavilion 15",
    price: 23900,
    image: "/images/Smartwatch 5.png",
    brand: "HP",
  },
];

const PRODUCT_SETS: Product[][] = [
  PRODUCTS_SET_1,
  PRODUCTS_SET_2,
  PRODUCTS_SET_3,
];
const ALL_PRODUCTS: Product[] = [
  ...PRODUCT_SETS[0],
  ...PRODUCT_SETS[1],
  ...PRODUCT_SETS[2],
];

const CATEGORY_BRANDS: Record<Exclude<Noun, "สินค้า">, BrandName[]> = {
  Notebook: ["ASUS", "Lenovo", "Dell"],
  Tablet: ["Apple", "Samsung", "Huawei"],
  Smartwatch: ["Apple", "Samsung", "Garmin"],
};

const BRAND_KEYWORDS: Record<BrandName, string[]> = {
  ASUS: ["asus"],
  Lenovo: ["lenovo"],
  Dell: ["dell"],
  Apple: ["apple", "ipad"],
  HP: ["hp", "hewlett"],
  Samsung: ["samsung", "galaxy"],
  Huawei: ["huawei", "matepad"],
  Garmin: ["Garmin"],
};

const CATEGORY_BASES: Record<Exclude<Noun, "สินค้า">, string[]> = {
  Notebook: ["Performance", "Productivity"],
  Tablet: ["Performance", "Productivity"],
  Smartwatch: ["Performance", "Productivity"],
};
const SPEC_BASES: Record<Exclude<Noun, "สินค้า">, string[]> = {
  Notebook: ["CPU Intel", "CPU AMD"],
  Tablet: ["CPU Apple", "CPU Qualcomm"],
  Smartwatch: ["OS watchOS", "OS Wear OS"],
};

const MAX_BRANDS = 3;
const MAX_PRODUCTS = 5;
const MAX_CATEGORY = 2;
const MAX_SPEC = 2;

const currencyTHB = (n: number) =>
  n.toLocaleString("th-TH", {
    style: "currency",
    currency: "THB",
    maximumFractionDigits: 0,
  });

/* ===================== Utils ===================== */
const normalize = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim();
const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const clamp = (n: number, min: number, max: number) =>
  Math.min(Math.max(n, min), max);

function isBaseNoun(n: Noun): n is Exclude<Noun, "สินค้า"> {
  return n !== "สินค้า";
}

const NOUN_INDEX: Record<Exclude<Noun, "สินค้า">, number> = {
  Notebook: 0,
  Tablet: 1,
  Smartwatch: 2,
};

/* ===================== Noun detector ===================== */
function deriveNoun(raw: string): Noun {
  const q = raw.toLowerCase().trim();
  if (!q) return "สินค้า";
  if (/^(n|no|nb|โน|โน๊|โน้|โน๊ต|โน้ต)/.test(q)) return "Notebook";
  if (/^(t|ta|tab|แท|แทบ|ip|ipa|ipad|galaxy ?tab)/.test(q)) return "Tablet";
  if (/^(s|sm|sw|wa|wat|watch|นาฬ|สมาร์ท)/.test(q)) return "Smartwatch";
  if (/(smart ?watch|apple ?watch|galaxy ?watch|watch)/.test(q))
    return "Smartwatch";
  if (/(tablet|ipad|galaxy ?tab|\btab\b)/.test(q)) return "Tablet";
  if (
    /(notebook|laptop|macbook|zenbook|xps|thinkpad|pavilion|inspiron|vivobook)/.test(
      q,
    )
  )
    return "Notebook";
  if (/(asus|lenovo|dell|hp|apple|samsung|huawei)/.test(q)) return "สินค้า";
  return "สินค้า";
}

/* ===================== Helpers ===================== */
function stripNounPrefix(input: string, noun: Exclude<Noun, "สินค้า">) {
  const q = normalize(input);
  const n = normalize(noun);
  return q.replace(new RegExp(`^${escapeRegExp(n)}\\b\\s*`), "");
}

function rankBrands(input: string, brands: BrandName[]): BrandName[] {
  const q = normalize(input);
  if (!q) return brands;
  const starts = brands.filter((b) =>
    BRAND_KEYWORDS[b].some((k) => k.startsWith(q)),
  );
  const contains = brands.filter(
    (b) => !starts.includes(b) && BRAND_KEYWORDS[b].some((k) => k.includes(q)),
  );
  return [...starts, ...contains];
}

function buildBrandAutocomplete(input: string, noun: Noun): BrandOption[] {
  const baseNoun = isBaseNoun(noun) ? noun : "Notebook";
  const brands = CATEGORY_BRANDS[baseNoun];
  const afterNoun = stripNounPrefix(input, baseNoun);
  const ordered = rankBrands(afterNoun, brands);
  return ordered
    .slice(0, MAX_BRANDS)
    .map((b) => ({ brand: b, query: BRAND_KEYWORDS[b][0] }));
}

function rankTextOptions(input: string, options: string[]): string[] {
  const q = normalize(input);
  if (!q) return options;
  const starts = options.filter((o) => normalize(o).startsWith(q));
  const contains = options.filter(
    (o) => !starts.includes(o) && normalize(o).includes(q),
  );
  return [...starts, ...contains];
}
function buildCategorySuggestions(input: string, noun: Noun): SimpleOption[] {
  const baseNoun = isBaseNoun(noun) ? noun : "Notebook";
  const bases = CATEGORY_BASES[baseNoun].map((b) => `${b} ${baseNoun}`);
  const ranked = rankTextOptions(stripNounPrefix(input, baseNoun), bases);
  return ranked
    .slice(0, MAX_CATEGORY)
    .map((label) => ({ label, query: label }));
}
function buildSpecSuggestions(input: string, noun: Noun): SimpleOption[] {
  const baseNoun = isBaseNoun(noun) ? noun : "Notebook";
  const bases = SPEC_BASES[baseNoun].map((b) => `${baseNoun} ${b}`);
  const ranked = rankTextOptions(stripNounPrefix(input, baseNoun), bases);
  return ranked.slice(0, MAX_SPEC).map((label) => ({ label, query: label }));
}

/* ===================== Fake prediction highlighter ===================== */
function highlightMatch(label: string, query: string) {
  const q = query.trim();
  if (!q) return <span className="text-white/80">{label}</span>;

  const li = label.toLowerCase();
  const qi = q.toLowerCase();
  const idx = li.indexOf(qi);
  if (idx === -1) return <span className="text-white/80">{label}</span>;

  const pre = label.slice(0, idx);
  const mid = label.slice(idx, idx + q.length);
  const suf = label.slice(idx + q.length);

  return (
    <>
      {pre && <span className="text-white/60">{pre}</span>}
      <span className="font-semibold text-white">{mid}</span>
      {suf && <span className="text-white/60">{suf}</span>}
    </>
  );
}

/* ===================== Product Card ===================== */
const ProductCard = memo(({ product }: { product: Product }) => (
  <div className="card-outer-bg card-outer-shadow w-[220px] max-w-[220px] shrink-0 snap-start rounded-[25px] p-[1px]">
    <div className="card-inner-bg card-inner-blur rounded-[24px]">
      <Card
        isHoverable
        shadow="sm"
        className="rounded-[24px] border-0 bg-transparent shadow-none"
      >
        <CardBody className="p-0">
          <div className="p-4 pt-4">
            <div className="relative overflow-hidden rounded-[18px] p-[1px]">
              <div className="mx-auto flex items-center justify-center">
                <NextUIImage
                  removeWrapper
                  alt={product.name}
                  src={product.image}
                  className="h-[140px] w-[140px] rounded-[17px] object-cover"
                  loading="lazy"
                  style={{ willChange: "transform" }}
                />
              </div>
            </div>
          </div>
          <div className="min-h-[64px] space-y-1 px-4 pt-1 pb-4">
            <div className="line-clamp-2 text-xs text-white/80">
              {product.name}
            </div>
            <div className="text-[11px] font-semibold text-white/90">
              {currencyTHB(product.price)}
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  </div>
));
ProductCard.displayName = "ProductCard";

/* ===================== Main Component ===================== */
export default function SearchEngineAI() {
  const [pageIndex, setPageIndex] = useState<number>(0);
  const [demoRunning, setDemoRunning] = useState<boolean>(true);
  const [text, setText] = useState<string>("");
  const [isUserInteracting, setIsUserInteracting] = useState<boolean>(false);

  const [displayProducts, setDisplayProducts] = useState<Product[]>(
    PRODUCTS_SET_1.slice(0, MAX_PRODUCTS),
  );
  const initialBrandGuesses = useMemo<BrandOption[]>(
    () => buildBrandAutocomplete("", "Notebook"),
    [],
  );
  const [displayBrands, setDisplayBrands] = useState<BrandOption[]>(
    initialBrandGuesses.slice(0, MAX_BRANDS),
  );

  // measure left padding for ghost overlay
  const startSlotRef = useRef<HTMLDivElement | null>(null);
  const [ghostPadLeft, setGhostPadLeft] = useState<number>(72);
  useEffect(() => {
    const update = () =>
      setGhostPadLeft((startSlotRef.current?.offsetWidth ?? 56) + 16);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // drag state for product row
  const x = useMotionValue(0);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [minX, setMinX] = useState<number>(0);

  const recalcConstraints = useCallback(() => {
    const viewportW = viewportRef.current?.offsetWidth ?? 0;
    const trackW = trackRef.current?.scrollWidth ?? 0;
    const nextMin = Math.min(0, viewportW - trackW);
    setMinX(nextMin);
    const current = x.get();
    if (current < nextMin || current > 0) {
      animate(x, clamp(current, nextMin, 0), {
        type: "spring",
        bounce: 0.2,
        duration: 0.5,
      });
    }
  }, [x]);

  useEffect(() => {
    recalcConstraints();
    const onResize = () => recalcConstraints();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [displayProducts, recalcConstraints]);

  type Interval = ReturnType<typeof setInterval>;
  type Timeout = ReturnType<typeof setTimeout>;
  const timersRef = useRef<{ typing: Interval | null; pause: Timeout | null }>({
    typing: null,
    pause: null,
  });

  const clearAllTimers = useCallback(() => {
    if (timersRef.current.typing) {
      clearInterval(timersRef.current.typing);
      timersRef.current.typing = null;
    }
    if (timersRef.current.pause) {
      clearTimeout(timersRef.current.pause);
      timersRef.current.pause = null;
    }
  }, []);

  // base noun & dataset
  const currentNoun = useMemo<Noun>(
    () => (text.trim() ? deriveNoun(text) : "Notebook"),
    [text],
  );
  const baseNoun: Exclude<Noun, "สินค้า"> = isBaseNoun(currentNoun)
    ? currentNoun
    : "Notebook";
  const dataSetIndex = NOUN_INDEX[baseNoun];
  const activeProducts = PRODUCT_SETS[dataSetIndex];

  /** pool สำหรับค้นหา */
  const productPool = useMemo<Product[]>(
    () => (isBaseNoun(currentNoun) ? activeProducts : ALL_PRODUCTS),
    [currentNoun, activeProducts],
  );

  /** ผลลัพธ์กรองสินค้า */
  const filteredRaw = useMemo(() => {
    const q = text.trim().toLowerCase();
    if (!q) return productPool.slice(0, MAX_PRODUCTS);
    return productPool
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q),
      )
      .slice(0, MAX_PRODUCTS);
  }, [text, productPool]);

  /** คาดการณ์ (UI เท่านั้น) */
  const brandSuggestions = useMemo<BrandOption[]>(
    () => buildBrandAutocomplete(text, currentNoun),
    [text, currentNoun],
  );
  const categorySuggestions = useMemo<SimpleOption[]>(
    () => buildCategorySuggestions(text, currentNoun),
    [text, currentNoun],
  );
  const specSuggestions = useMemo<SimpleOption[]>(
    () => buildSpecSuggestions(text, currentNoun),
    [text, currentNoun],
  );

  /** ตรวจว่ากำลังพิมพ์คำนำหน้าหมวด เพื่อใช้กับ ghost completion เท่านั้น */
  const isTypingNounPrefix = useMemo(() => {
    const q = text.toLowerCase();
    if (!q || q.includes(" ")) return false;
    return ["notebook", "tablet", "smartwatch"].some((n) => n.startsWith(q));
  }, [text]);

  /** inline ghost completion — เดาเฉพาะชื่อหมวด */
  const inlineRemainder = useMemo(() => {
    const raw = text;
    const q = raw.trim().toLowerCase();
    if (!q) return "";
    const noun = baseNoun.toLowerCase();
    if (
      isTypingNounPrefix &&
      noun.startsWith(q) &&
      baseNoun.length > raw.length
    ) {
      return baseNoun.slice(raw.length);
    }
    return "";
  }, [text, baseNoun, isTypingNounPrefix]);

  /** Handlers */
  const handleBrandClick = useCallback(
    (brandQuery: string) => {
      const next = `${isBaseNoun(currentNoun) ? currentNoun + " " : ""}${brandQuery}`;
      setText(next.trim());
      setDemoRunning(false);
      setIsUserInteracting(true);
    },
    [currentNoun],
  );

  const handleCategoryClick = useCallback((q: string) => {
    setText(q);
    setDemoRunning(false);
    setIsUserInteracting(true);
  }, []);
  const handleSpecClick = useCallback((q: string) => {
    setText(q);
    setDemoRunning(false);
    setIsUserInteracting(true);
  }, []);
  const handleInputChange = useCallback((value: string) => {
    setText(value);
    if (value !== "") {
      setDemoRunning(false);
      setIsUserInteracting(true);
    }
  }, []);

  /** typing demo */
  useEffect(() => {
    if (!demoRunning || isUserInteracting) return;
    const target = TEXT_PAGES[pageIndex].query;
    let currentIndex = 0;
    clearAllTimers();

    timersRef.current.typing = setInterval(() => {
      currentIndex += 1;
      setText(target.slice(0, currentIndex));

      if (currentIndex >= target.length) {
        if (timersRef.current.typing) {
          clearInterval(timersRef.current.typing);
          timersRef.current.typing = null;
        }
        timersRef.current.pause = setTimeout(() => {
          const nextIndex = (pageIndex + 1) % TEXT_PAGES.length;
          const nextTarget = TEXT_PAGES[nextIndex].query;
          setPageIndex(nextIndex);
          setText(nextTarget);
        }, 1200);
      }
    }, 100);

    return clearAllTimers;
  }, [pageIndex, demoRunning, isUserInteracting, clearAllTimers]);

  /** กลับไป demo เมื่อผู้ใช้หยุดแตะต้องนาน ๆ */
  useEffect(() => {
    if (!isUserInteracting) return;
    const timeout = setTimeout(() => {
      if (text === "") {
        setIsUserInteracting(false);
        setDemoRunning(true);
      }
    }, 5000);
    return () => clearTimeout(timeout);
  }, [isUserInteracting, text]);

  /** ค้างค่าโชว์: Products */
  useEffect(() => {
    const fallback = productPool.slice(0, MAX_PRODUCTS);
    setDisplayProducts(() => {
      const basis = filteredRaw.length ? filteredRaw : fallback;
      if (basis.length < MAX_PRODUCTS) {
        const padPool = fallback.filter(
          (f) => !basis.some((b) => b.id === f.id),
        );
        const pad = padPool.slice(0, MAX_PRODUCTS - basis.length);
        return [...basis, ...pad];
      }
      return basis.slice(0, MAX_PRODUCTS);
    });
    animate(x, 0, { type: "spring", bounce: 0, duration: 0.4 });
  }, [filteredRaw, productPool, x]);

  useEffect(() => {
    const defaultGuess = buildBrandAutocomplete("", currentNoun).slice(
      0,
      MAX_BRANDS,
    );
    setDisplayBrands((prev) => {
      const next = (
        brandSuggestions.length ? brandSuggestions : defaultGuess
      ).slice(0, MAX_BRANDS);
      if (next.length < MAX_BRANDS) {
        const pad = prev
          .filter((b) => !next.find((n) => n.brand === b.brand))
          .slice(0, MAX_BRANDS - next.length);
        return [...next, ...pad];
      }
      return next;
    });
  }, [brandSuggestions, currentNoun]);

  return (
    <section className="w-full text-white" style={{ contain: "layout style" }}>
      <div className="mx-auto my-6 md:my-16 text-center">
        <p className="mb-3 text-lg font-semibold text-[#676767] lg:text-xl">
          Next-Gen AI for Business
        </p>
        <h1 className="mt-2 text-xl lg:text-[40px]">Powering Search engine</h1>
      </div>

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 py-10 md:grid-cols-1 md:gap-12 lg:grid lg:grid-cols-12">
        <div className="md:order-1 md:col-span-4">
          <h2 className="text-lg font-semibold text-white">Search engine AI</h2>
          <p className="mt-4 max-w-sm text-xs font-semibold text-[#676767]">
            An AI-powered sales assistant that chats, qualifies, recommends and
            helps close deals <span className="tabular-nums">24/7</span>.
          </p>

          <ul className="mt-6 space-y-4">
            {[
              {
                title: "Understands natural language",
                desc: "Search with questions, commands, or full sentences",
              },
              {
                title: "Semantic Search",
                desc: "Results by meaning, not just keywords",
              },
              {
                title: "Personalized Results",
                desc: "Tailored to each user's needs",
              },
              {
                title: "Multi-modal Search",
                desc: "Text, images, voice, and video",
              },
              {
                title: "Real-time & Accurate",
                desc: "Fast, precise, and scalable for massive data",
              },
              {
                title: "Secure & Private",
                desc: "Protecting user data with compliance standards",
              },
            ].map((f) => (
              <li key={f.title} className="flex min-h-[40px] items-start gap-3">
                <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full">
                  <CheckCircle2 className="h-4 w-4 opacity-80" />
                </span>
                <div>
                  <div className="text-sm font-semibold text-white">
                    {f.title}
                  </div>
                  <div className="text-xs font-semibold text-[#676767]">
                    {f.desc}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:order-2 md:col-span-8">
          <div className="relative">
            {/* Search bar */}
            <div className="card-outer-bg card-outer-shadow relative rounded-full p-[1px]">
              <div className="card-inner-bg card-inner-blur relative rounded-full">
                <Input
                  value={text}
                  onValueChange={handleInputChange}
                  size="lg"
                  radius="full"
                  variant="flat"
                  classNames={{
                    base: "w-full",
                    input:
                      "!text-transparent md:text-lg placeholder:text-white/40 caret-violet-400",
                    innerWrapper: "gap-2 relative",
                    inputWrapper:
                      "bg-transparent rounded-full shadow-none border-0 !outline-none ring-0 focus:outline-none focus:ring-0" +
                      "h-10 lg:h-13 md:h-13 px-2 md:px-3 "
                  }}
                  startContent={
                    <div
                      ref={startSlotRef}
                      className="flex items-center gap-3 pr-7"
                    >
                      <div className="flex items-center justify-center rounded-full">
                        <Star />
                      </div>
                      <span className="h-5 w-px bg-white/12" />
                    </div>
                  }
                  endContent={
                    <div className="mr-3 flex gap-3 items-center justify-center rounded-full">
                      <div className="border border-[#676767] p-0 rounded-full">
                        <Plus className="text-[#676767] w-4 h-4 md:w-5 md:h-5" />
                      </div>
                      <Mic className="text-[#676767] w-5 h-5 md:w-6 md:h-6" />
                      <Send className="w-4 h-4 md:hidden lg:hidden text-[#676767]" />
                    </div>
                  }
                  placeholder={`ค้นหา${isBaseNoun(currentNoun) ? " " + currentNoun : ""}…`}
                  aria-label="Search products"
                  spellCheck={false}
                  autoComplete="off"
                />

                {/* ghost completion overlay (เฉพาะชื่อหมวด) */}
                {(text || inlineRemainder) && (
                  <div className="pointer-events-none absolute inset-0 z-[1] flex items-center">
                    <div
                      className="w-full text-base md:text-lg"
                      style={{ paddingLeft: ghostPadLeft, paddingRight: 48 }}
                    >
                      <span className="text-white">{text}</span>
                      <span className="text-white/40">{inlineRemainder}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Dropdown */}
            <div
              className={`relative inset-x-0 top-[calc(100%+12px)] mt-4 transition-[opacity,transform] duration-200 ease-out ${
                true
                  ? "pointer-events-auto scale-100 opacity-100"
                  : "pointer-events-none scale-100 opacity-0"
              }`}
              style={{ willChange: "transform, opacity" }}
            >
              <div className="card-outer-bg card-outer-shadow rounded-[25px] p-[1px]">
                <div className="card-inner-bg card-inner-blur relative rounded-[24px]">
                  <ScrollShadow
                    orientation="vertical"
                    className="max-h-[450px] overflow-x-hidden"
                    hideScrollBar
                  >
                    <div className="grid gap-6 px-4 pt-2 pb-4 md:grid-cols-1">
                      {/* Left: fake predictions */}
                      <div className="md:order-1 md:col-span-2">
                        {/* Brand predictions — 3 รายการตลอด */}
                        <ul className="space-y-1">
                          {displayBrands.slice(0, MAX_BRANDS).map((b) => {
                            const label = `${baseNoun} ${b.brand}`;
                            return (
                              <li key={b.query}>
                                <button
                                  onClick={() => handleBrandClick(b.query)}
                                  className="group flex min-h-[40px] w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition-colors duration-150 hover:bg-white/10"
                                >
                                  <span className="inline-flex items-center gap-2">
                                    <Search className="h-4 w-4 text-white/50" />
                                    {highlightMatch(label, text)}
                                  </span>
                                </button>
                              </li>
                            );
                          })}
                        </ul>

                        {/* Category — คง 2 */}
                        <div className="mt-5 text-xs tracking-wider text-white/40">
                          {UI.Category}
                        </div>
                        <ul className="mt-2 space-y-1">
                          {categorySuggestions
                            .slice(0, MAX_CATEGORY)
                            .map((c) => (
                              <li key={c.label}>
                                <button
                                  onClick={() => handleCategoryClick(c.query)}
                                  className="group flex min-h-[32px] w-full items-center gap-2 rounded-lg px-2 py-1 text-left text-[13px] hover:bg-white/10"
                                >
                                  <span className="inline-flex items-center gap-2">
                                    <span className="inline-block h-[10px] w-[10px] rounded-sm border border-white/30" />
                                    {highlightMatch(c.label, text)}
                                  </span>
                                </button>
                              </li>
                            ))}
                        </ul>

                        <div className="mt-5 text-xs tracking-wider text-white/40">
                          {UI.productHeader}
                        </div>
                      </div>

                      {/* Right: products + logos + spec */}
                      <div className="md:order-2 md:col-span-3">
                        {/* Products row */}
                        <div className="-mx-6 px-6 md:-mx-8 md:px-8">
                          <div
                            ref={viewportRef}
                            className="relative h-[240px] w-full overflow-hidden"
                          >
                            <motion.div
                              ref={trackRef}
                              className="flex min-w-full gap-4 pr-2"
                              style={{ x, touchAction: "pan-y" }}
                              drag="x"
                              dragElastic={0.08}
                              dragMomentum
                              dragConstraints={{ left: minX, right: 0 }}
                            >
                              {displayProducts.map((p) => (
                                <ProductCard key={p.id} product={p} />
                              ))}
                            </motion.div>
                          </div>
                        </div>

                        {/* Logos */}
                        <div className="mt-5 text-xs tracking-wider text-white/40">
                          {UI.Brand}
                        </div>
                        <div className="-mx-6 px-6 md:-mx-8 md:px-8">
                          <div className="flex h-10 items-center gap-5 overflow-x-auto">
                            <Image
                              src="/svg/Frame.svg"
                              alt=""
                              width={32}
                              height={32}
                              className="h-7 w-7 object-contain opacity-90"
                            />
                            <Image
                              src="/svg/Frame-1.svg"
                              alt=""
                              width={32}
                              height={32}
                              className="h-7 w-7 object-contain opacity-90"
                            />
                            <Image
                              src="/svg/Frame-2.svg"
                              alt=""
                              width={32}
                              height={32}
                              className="h-7 w-7 object-contain opacity-90"
                            />
                            <Image
                              src="/svg/Frame-3.svg"
                              alt=""
                              width={32}
                              height={32}
                              className="h-7 w-7 object-contain opacity-90"
                            />
                            <Image
                              src="/svg/Frame-4.svg"
                              alt=""
                              width={32}
                              height={32}
                              className="h-7 w-7 object-contain opacity-90"
                            />
                            <Image
                              src="/svg/Frame-5.svg"
                              alt=""
                              width={32}
                              height={32}
                              className="h-7 w-7 object-contain opacity-90"
                            />
                          </div>
                        </div>

                        {/* Spec — คง 2 */}
                        <div className="mt-5 text-xs tracking-wider text-white/40">
                          {UI.Specification}
                        </div>
                        <ul className="mt-2 space-y-1">
                          {specSuggestions.slice(0, MAX_SPEC).map((s) => (
                            <li key={s.label}>
                              <button
                                onClick={() => handleSpecClick(s.query)}
                                className="group flex min-h-[32px] w-full items-center gap-2 rounded-lg px-2 py-1 text-left text-[13px] hover:bg-white/10"
                              >
                                <span className="inline-flex items-center gap-2">
                                  <Search className="h-3.5 w-3.5 text-white/50" />
                                  {highlightMatch(s.label, text)}
                                </span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </ScrollShadow>
                </div>
              </div>
            </div>
            {/* /dropdown */}
          </div>
        </div>
      </div>
    </section>
  );
}
