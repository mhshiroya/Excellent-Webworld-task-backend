import { IBrands } from "../models/Brands"; // your user interface

// ProductResource.ts
export const BrandResource = (category: IBrands | IBrands[]) => {
  if (Array.isArray(category)) {
    return category.map((p) => singleCategory(p));
  }
  return singleCategory(category);
};

const singleCategory = (category: IBrands) => ({
  id: category._id,
  title: category.title,
  description: category.description,
});
