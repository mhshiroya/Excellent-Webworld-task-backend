import { describe } from "node:test";
import { ICategories } from "../models/Categories"; // your user interface

// ProductResource.ts
export const CategoryResource = (category: ICategories | ICategories[]) => {
  if (Array.isArray(category)) {
    return category.map((p) => singleCategory(p));
  }
  return singleCategory(category);
};

const singleCategory = (category: ICategories) => ({
  id: category._id,
  title: category.title,
  description: category.description,
});
