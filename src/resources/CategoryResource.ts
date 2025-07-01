import fs from "fs";
import { ICategories } from "../models/Categories";
import path from "path";

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
  image:
    category.image && fs.existsSync(path.resolve(category.image))
      ? `${process.env.BASE_URL}${category.image}`.replace(/\\/g, "/")
      : null,
  thumbnail:
    category.thumbnail && fs.existsSync(path.resolve(category.thumbnail))
      ? `${process.env.BASE_URL}${category.thumbnail}`.replace(/\\/g, "/")
      : null,
});
