"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { Mail, Phone, MapPin } from "lucide-react";
import ModelRot from "../../ModelsObject/ModelRobot";
import SplashCursor from "@/app/components/ui/SplashCursor";
import Footer from "./Home-Footer";
/* ---------- Capsule + Hover Light ---------- */
function HoverPill({
  children,
  className = "",
  rounded = "rounded-full",
  glowRadius = 240,
  overflow = "hidden", 
}: {
  children: React.ReactNode;
  className?: string;
  rounded?: string;
  glowRadius?: number;
  overflow?: "hidden" | "visible";
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    setPos({ x: e.clientX - r.left, y: e.clientY - r.top });
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      className={[
        "group card-outer-bg card-outer-shadow relative p-[1.5px]",
        overflow === "visible" ? "overflow-visible" : "overflow-hidden",
        rounded,
        className,
      ].join(" ")}
    >
      <div
        className={[
          "pointer-events-none absolute inset-0 z-0 opacity-0",
          "transition-opacity duration-300 group-hover:opacity-100",
        ].join(" ")}
        style={{
          background: `radial-gradient(
            circle ${glowRadius}px at ${pos.x}px ${pos.y}px,
            rgba(255,255,255,0.14),
            transparent 55%
          )`,
        }}
      />
      <div
        className={[
          "card-inner-bg card-inner-blur relative z-10",
          "h-full w-full",
          rounded,
        ].join(" ")}
      >
        {children}
      </div>
    </div>
  );
}

/* ---------- Field shells ---------- */
function FieldShell({
  children,
  small = false,
  className = "",
}: {
  children: React.ReactNode;
  small?: boolean;
  className?: string;
}) {
  return (
    <div
      className={[
        small
          ? "px-4 py-[10px] md:px-5 md:py-3.5"
          : "px-5 py-4 md:px-6 md:py-5",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}

/* ---------- inputs ---------- */
function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={[
        "w-full bg-transparent text-sm md:text-lg leading-relaxed outline-none",
        "text-white placeholder:text-white/35",
        props.className || "",
      ].join(" ")}
    />
  );
}

function PhoneInput(
  props: Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "onChange" | "value"
  >,
) {
  const [val, setVal] = useState("");
  const digitsOnly = (s: string) => s.replace(/\D+/g, "");
  return (
    <TextInput
      {...props}
      value={val}
      inputMode="numeric"
      pattern="[0-9]*"
      maxLength={15}
      onChange={(e) => setVal(digitsOnly(e.target.value))}
    />
  );
}

/* ---------- Textarea ใหญ่แบบคอมเมนต์ (auto-resize) ---------- */
function BigTextarea({
  name = "message",
  placeholder = "Write your comment…",
  minRows = 10,
  maxRows = 20,
  className = "",
}: {
  name?: string;
  placeholder?: string;
  minRows?: number;
  maxRows?: number;
  className?: string;
}) {
  const ref = useRef<HTMLTextAreaElement | null>(null);

  const autosize = () => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    const lineHeight = parseFloat(getComputedStyle(el).lineHeight || "24");
    const minH = lineHeight * minRows;
    const maxH = lineHeight * maxRows;
    const next = Math.min(Math.max(el.scrollHeight, minH), maxH);
    el.style.height = `${next}px`;
    el.style.overflowY = next < el.scrollHeight ? "auto" : "hidden";
  };

  return (
    <textarea
      ref={ref}
      name={name}
      placeholder={placeholder}
      onInput={autosize}
      rows={minRows}
      className={[
        "w-full resize-none bg-transparent text-sm md:text-lg leading-relaxed outline-none",
        "text-white placeholder:text-white/35",
        "px-5 py-4 md:px-6 md:py-5",
        className,
      ].join(" ")}
    />
  );
}

/* ---------- Subject Select (portal + blur + slide-down) ---------- */
function SubjectSelect({
  options,
  value,
  onChange,
  placeholder = "Subject",
}: {
  options: { key: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement | null>(null);
  const [rect, setRect] = useState<DOMRect | null>(null);

  const label = value ? options.find((o) => o.key === value)?.label : "";

  const updateRect = React.useCallback(() => {
    if (!triggerRef.current) return;
    setRect(triggerRef.current.getBoundingClientRect());
  }, []);

  useEffect(() => {
    if (!open) return;
    updateRect();
    const onScroll = () => updateRect();
    const onResize = () => updateRect();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, updateRect]);

  return (
    <>
      {/* trigger (วางในกรอบการ์ด) */}
      <div
        ref={triggerRef}
        className="relative w-full"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        <FieldShell small>
          <div
            className={[
              "w-full text-sm md:text-lg leading-relaxed",
              value ? "text-white" : "text-white/35",
            ].join(" ")}
          >
            {value ? label : placeholder}
          </div>
        </FieldShell>
      </div>

      {typeof window !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {open && rect && (
              <motion.div
                key="dropdown"
                initial={{ opacity: 0, y: -6, scaleY: 0.96 }}
                animate={{ opacity: 1, y: 0, scaleY: 1 }}
                exit={{ opacity: 0, y: -6, scaleY: 0.96 }}
                transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  position: "fixed",
                  left: rect.left,
                  top: rect.bottom + 8,
                  width: rect.width,
                  transformOrigin: "top center",
                  zIndex: 60,
                }}
                className={[
                  "rounded-2xl ring-1 ring-white/12",
                  "bg-black/70 backdrop-blur-md",
                  "shadow-[0_12px_40px_rgba(0,0,0,0.55)]",
                  "pointer-events-auto",
                ].join(" ")}
                onMouseEnter={() => setOpen(true)}
                onMouseLeave={() => setOpen(false)}
              >
                <ul className="max-h-[320px] overflow-auto py-1">
                  {options.map((opt) => (
                    <li key={opt.key}>
                      <button
                        type="button"
                        onClick={() => {
                          onChange(opt.key);
                          setOpen(false);
                        }}
                        className="w-full px-4 py-3 text-left text-[16px] text-[#606367] hover:bg-white/10 hover:text-white/90 focus:outline-none"
                      >
                        {opt.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}

/* ---------- หน้าเต็ม ---------- */
export default function Page() {
  const [subject, setSubject] = useState<string>("");

  const SUBJECT_OPTIONS = [
    { key: "general", label: "General Inquiry" },
    { key: "quote", label: "Project Quote" },
    { key: "partnership", label: "Partnership" },
    { key: "support", label: "Support" },
    { key: "careers", label: "Careers" },
    { key: "other", label: "Other" },
  ];

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const message = String(data.get("message") || "").trim();
    const subjectValue = String(data.get("subject") || "").trim();
    const phoneNum = String(data.get("phone") || "").trim();

    if (!name || !email || !message || !subjectValue) {
      alert("Please fill in your name, email, subject, and message.");
      return;
    }

    console.log({
      name,
      email,
      phone: phoneNum,
      subject: subjectValue,
      message,
    });
    alert("Message sent!");
  };

  return (
    <main className="relative z-10 flex w-full items-center justify-center bg-black px-4 text-white sm:px-8">
      <div className="pointer-events-none">
        <SplashCursor />
      </div>
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative isolate mx-auto w-full max-w-7xl overflow-visible" 
      >
        <div className="pointer-events-none mx-auto items-center justify-center flex max-w-3xl">
          <ModelRot />
        </div>

        <h1 className="text-center text-xl font-semibold uppercase md:text-[40px]">
          GET IN TOUCH
        </h1>
        <p className="mt-4 text-center text-base text-white/70 sm:text-lg">
          Empower your business with Codelabs AI. Let’s transform the way you
          work.
        </p>

        <form onSubmit={handleSubmit} className="mt-12">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
            {/* Name */}
            <HoverPill rounded="rounded-full">
              <FieldShell small>
                <TextInput
                  name="name"
                  aria-label="Your Name"
                  placeholder="Your Name"
                  required
                />
              </FieldShell>
            </HoverPill>

            {/* Phone */}
            <HoverPill rounded="rounded-full">
              <FieldShell small>
                <PhoneInput
                  name="phone"
                  aria-label="Phone Number"
                  placeholder="Phone Number"
                />
              </FieldShell>
            </HoverPill>

            {/* Email */}
            <HoverPill rounded="rounded-full">
              <FieldShell small>
                <TextInput
                  name="email"
                  type="email"
                  aria-label="Email Address"
                  placeholder="Email Address"
                  required
                />
              </FieldShell>
            </HoverPill>

            {/* Subject (ใช้ portal dropdown) */}
            <HoverPill rounded="rounded-full">
              <SubjectSelect
                options={SUBJECT_OPTIONS}
                value={subject}
                onChange={setSubject}
                placeholder="Subject"
              />
              <input type="hidden" name="subject" value={subject} />
            </HoverPill>

            {/* Message */}
            <HoverPill
              className="md:col-span-2"
              rounded="rounded-3xl"
              glowRadius={300}
            >
              <BigTextarea
                name="message"
                placeholder="Your Message"
                minRows={10}
                maxRows={20}
                className="min-h-[220px]"
              />
            </HoverPill>
          </div>

          {/* Send button */}
          <div className="mt-10 flex justify-center">
            <HoverPill
              className="px-[2px] py-[2px]"
              rounded="rounded-full"
              glowRadius={180}
            >
              <button
                type="submit"
                className="relative z-10 px-12 py-3.5 text-sm md:text-lg font-medium"
              >
                Send
              </button>
            </HoverPill>
          </div>
        </form>

        {/* Contact info row */}
        <section aria-label="contact info" className="mt-14 md:mt-18">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-7">
            {[
              {
                href: "mailto:admin@codelabsdev.co",
                title: "Email us",
                subtitle: "admin@codelabsdev.co",
                Icon: Mail,
              },
              {
                href: "tel:+66984243228",
                title: "Call us",
                subtitle: "(+66) 098 424 3228",
                Icon: Phone,
              },
              {
                href: "https://maps.google.com/?q=99/8%20Nue%20Connex%20House%20Don%20Mueang%20Village",
                title: "Our location",
                subtitle: "99/8 Nue Connex House Don Mueang Village",
                Icon: MapPin,
                external: true,
              },
            ].map(({ href, title, subtitle, Icon, external }, i) => (
              <HoverPill
                key={i}
                rounded="rounded-3xl"
                className="md:min-h-[140px] min-h-[50px]"
              >
                <a
                  href={href}
                  {...(external
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                  className="block h-full w-full"
                >
                  <div className="flex h-full items-center gap-5 p-6 md:p-7">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/15 bg-white/5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]">
                      <Icon className="h-5 w-5 text-white/90" />
                    </div>

                    <div className="min-w-0">
                      <div className="text-sm font-medium text-white/90">
                        {title}
                      </div>
                      <div className="mt-1 text-xs leading-relaxed break-words text-white/65">
                        {subtitle}
                      </div>
                    </div>
                  </div>
                </a>
              </HoverPill>
            ))}
          </div>
          <Footer />
        </section>
      </motion.section>
    </main>
  );
}
