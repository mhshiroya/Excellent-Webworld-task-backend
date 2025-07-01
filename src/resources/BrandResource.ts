import fs from "fs";
import { IBrands } from "../models/Brands"; // your user interface
import path from "path";

// ProductResource.ts
export const BrandResource = (brand: IBrands | IBrands[]) => {
  if (Array.isArray(brand)) {
    return brand.map((p) => singleCategory(p));
  }
  return singleCategory(brand);
};

const singleCategory = (brand: IBrands) => ({
  id: brand._id,
  title: brand.title,
  description: brand.description,
  image:
    brand.image && fs.existsSync(path.resolve(brand.image))
      ? `${process.env.BASE_URL}${brand.image}`.replace(/\\/g, "/")
      : null,
  thumbnail:
    brand.thumbnail && fs.existsSync(path.resolve(brand.thumbnail))
      ? `${process.env.BASE_URL}${brand.thumbnail}`.replace(/\\/g, "/")
      : null,
});
