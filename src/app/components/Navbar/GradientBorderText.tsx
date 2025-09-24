"use client";

import Image from "next/image";
import React from "react";

const GradientBorderText = ({
  children,
  logo,
}: {
  children: React.ReactNode;
  logo?: string;
}) => (
  <div className="gradient relative inline-block ">
    <div className="flex items-center gap-1.5 p-2">
      {logo && (
        <Image
          src={logo}
          alt="Category logo"
          width={35}
          height={35}
          className="flex-shrink-0 object-contain"
        />
      )}
      {children}
    </div>
  </div>
);

export default GradientBorderText;
