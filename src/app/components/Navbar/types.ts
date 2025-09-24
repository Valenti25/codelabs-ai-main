// types.ts

export type ProductSubItem = {
  name: string;
  description: string;
  logo?: string;
};

export type ProductCategory = {
  description: string;
  logo?: string;
  subItems: ProductSubItem[];
};

export type DropdownData = {
  products: Record<string, ProductCategory>;
  resources: { name: string; logo?: string }[];
};

export type NavbarContentData = {
  menuItems: string[];
  buttonText: string;
};
