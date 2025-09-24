// ProductsDropdown.tsx
import React from "react";
import Image from "next/image";
import { Link } from "@nextui-org/react";
import GradientBorderText from "./GradientBorderText";
import { ProductCategory} from "./types";

type Props = {
  dropdownData: Record<string, ProductCategory>;
  dropdownMenuRef: React.RefObject<HTMLDivElement>;
  handleMouseEnter: (dropdown: string) => void;
  handleMouseLeave: () => void;
  top?: number; // เพิ่ม prop top สำหรับกำหนดตำแหน่ง
};

export default function ProductsDropdown({
  dropdownData,
  dropdownMenuRef,
  handleMouseEnter,
  handleMouseLeave,
  top = 0, // ค่า default 80px (navbar สูงประมาณนี้)
}: Props) {
  return (
    <div
      className="pointer-events-none fixed left-0 right-0 z-[70] flex justify-center"
      style={{ top }}
    >
  <div className="pointer-events-auto relative rounded-lg backdrop-blur-lg">
        <div
          ref={dropdownMenuRef}
          onMouseEnter={() => handleMouseEnter("products")}
          onMouseLeave={handleMouseLeave}
          className="relative h-full max-h-[80vh] w-[70vw] max-w-5xl rounded-[inherit] "
        >
          <div className="grid grid-cols-2 items-start gap-8 px-6 py-8 lg:gap-12">
            {Object.entries(dropdownData).map(([category, data]) => (
              <div key={category} className="space-y-4 ">
                <div className="border-b  border-[#676767]/30 pb-3">
                  <h3 className="mb-2 text-lg leading-tight font-bold text-white">
                    {category}
                  </h3>
                  <GradientBorderText logo={data.logo}>
                    <div className="ml-2 flex flex-col">
                      <h4 className="gradient-text-animated flex-col text-sm font-bold">
                        {data.description}
                      </h4>
                      <div className="text-sm leading-tight text-[#676767]">
                        {category === "Build AI"
                          ? "Custom AI development services"
                          : "Ready-to-deploy AI solutions"}
                      </div>
                    </div>
                  </GradientBorderText>
                </div>
                <div className="grid grid-cols-2 gap-y-2">
                  {data.subItems.map((item, idx) => (
                    <Link
                      key={idx}
                      href="#"
                      className="group block rounded-md p-2 transition-colors"
                    >
                      <div className="flex flex-col items-start">
                        <div className="mb-2 flex items-center gap-1.5">
                          {item.logo && (
                            <Image
                              src={item.logo}
                              alt={`${item.name} logo`}
                              width={25}
                              height={25}
                              className="flex-shrink-0 object-contain"
                            />
                          )}
                          <span className="text-xs leading-tight font-semibold text-white transition-colors">
                            {item.name}
                          </span>
                        </div>
                        <span className="mt-1 ml-0 self-start text-xs leading-tight text-gray-400">
                          {item.description}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
