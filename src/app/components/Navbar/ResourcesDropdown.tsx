// ResourcesDropdown.tsx
import React from "react";
import Image from "next/image";
import { Link } from "@nextui-org/react";
import { DropdownData } from "./types";

type Props = {
  dropdownData: DropdownData["resources"];
  resourcesMenuRef: React.RefObject<HTMLDivElement>;
  handleMouseEnter: (dropdown: string) => void;
  handleMouseLeave: () => void;
};

export default function ResourcesDropdown({
  dropdownData,
  resourcesMenuRef,
  handleMouseEnter,
  handleMouseLeave,
}: Props) {
  return (
    <div className="pointer-events-none fixed left-0 right-0 z-[70] flex justify-center">
      <div className="pointer-events-auto relative">
        <div className="absolute mt-1 ml-28 flex items-center justify-center rounded-lg p-[2px] backdrop-blur-md">
          <div
            ref={resourcesMenuRef}
            onMouseEnter={() => handleMouseEnter("resources")}
            onMouseLeave={handleMouseLeave}
            className="relative w-48 rounded-[inherit]"
          >
            <div className="space-y-3 px-6 py-8">
              {dropdownData.map((item, idx) => (
                <Link
                  key={idx}
                  href="#"
                  className="block rounded-md p-3 transition-colors"
                >
                  <div className="flex items-center gap-3">
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
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
